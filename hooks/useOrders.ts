import logger from '@/utils/logger';
import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Order {
  id: string;
  title: string;
  customerName: string;
  packageType: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  rawEventDate: string; // Added for comparison
  amount?: number;
  notes?: string;
  isNew?: boolean; // Track if order is unseen
}

/**
 * Hook to manage vendor orders with real-time updates
 * Subscribes to new orders and order status changes
 * Tracks new unseen orders for notification badge
 */
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Transform database order to Order interface
  const transformOrder = (order: any, isNew: boolean = false): Order => ({
    id: order.id,
    title: order.title,
    customerName: order.customer_name,
    packageType: order.package_type || 'Standard Package',
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone || '',
    status: order.status,
    date: order.event_date ? new Date(order.event_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Date TBD',
    rawEventDate: order.event_date || '',
    amount: order.amount,
    notes: order.notes,
    isNew,
  });

  const getOrders = useCallback(async (): Promise<Order[]> => {
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('Authentication error');
        setLoading(false);
        return [];
      }

      setUserId(user.id);

      // Fetch orders for this vendor
      const { data: ordersData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        logger.error('Failed to fetch orders');
        setLoading(false);
        return [];
      }

      // Transform to match Order interface
      const transformedOrders: Order[] = (ordersData || []).map(o => transformOrder(o, false));

      setOrders(transformedOrders);
      setLoading(false);
      return transformedOrders;
    } catch (error) {
      logger.error('Failed to fetch orders');
      setLoading(false);
      return [];
    }
  }, []);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!userId) return;

    logger.log('Setting up orders real-time subscription');
    setSubscriptionError(null);

    const channel = supabase
      .channel(`vendor-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${userId}`,
        },
        (payload) => {
          logger.log('New order received');
          const newOrder = transformOrder(payload.new, true);
          setOrders((prev) => [newOrder, ...prev]);
          setNewOrderCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${userId}`,
        },
        (payload) => {
          logger.log('Order updated');
          const updatedOrder = transformOrder(payload.new, false);
          setOrders((prev) =>
            prev.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            )
          );
        }
      )
      .subscribe((status, err) => {
        logger.log('Orders subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          logger.error('Realtime subscription error');
          setSubscriptionError('Failed to connect to realtime updates');
        } else if (status === 'SUBSCRIBED') {
          logger.log('Successfully subscribed to orders updates');
          setSubscriptionError(null);
        }
      });

    return () => {
      logger.log('Removing orders subscription');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Mark all orders as seen (clear notification count)
  const markOrdersAsSeen = useCallback(() => {
    setNewOrderCount(0);
    setOrders((prev) => prev.map((order) => ({ ...order, isNew: false })));
  }, []);

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    setLoading(true);

    try {
      // Get current user to verify ownership
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('Authentication error in updateOrderStatus:', authError);
        setLoading(false);
        return false;
      }

      // First, get the order details (we need customer_id for conversation creation)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('vendor_id', user.id)
        .single();

      if (orderError || !orderData) {
        logger.error('Order not found or vendor mismatch:', orderError, { orderId, userId: user.id });
        setLoading(false);
        return false;
      }

      // Update order status
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('vendor_id', user.id)
        .select();

      if (error) {
        logger.error('Supabase update error:', error.message, error.code, error.details);
        setLoading(false);
        return false;
      }

      if (!data || data.length === 0) {
        logger.error('Order update returned empty — RLS may be blocking the write');
        setLoading(false);
        return false;
      }

      // If approved, create a conversation linked to this order (non-blocking)
      if (status === 'approved') {
        try {
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('order_id', orderId)
            .maybeSingle();

          if (!existingConv) {
            const { error: convError } = await supabase
              .from('conversations')
              .insert({
                customer_id: orderData.customer_id,
                vendor_id: user.id,
                order_id: orderId,
                booking_status: 'accepted',
                terms_accepted_by_customer: false,
              });

            if (convError) {
              logger.error('Failed to create conversation (non-blocking):', convError.message, convError.code);
            }
          } else {
            const { error: updateConvError } = await supabase
              .from('conversations')
              .update({ booking_status: 'accepted' })
              .eq('id', existingConv.id);

            if (updateConvError) {
              logger.error('Failed to update conversation (non-blocking):', updateConvError.message);
            }
          }
        } catch (convException) {
          // Conversation failure must NOT block the order approval
          logger.error('Conversation create exception (non-blocking):', convException);
        }
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      setLoading(false);
      return true;
    } catch (err: any) {
      logger.error('updateOrderStatus exception:', err?.message, err?.code, err);
      setLoading(false);
      return false;
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    getOrders,
    refetch: getOrders, // Alias for pull-to-refresh
    newOrderCount,
    markOrdersAsSeen,
    subscriptionError,
  };
};