import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { Order, useVendorStore } from '@/store/useVendorStore';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to manage vendor orders with real-time updates
 * Powered by centralized useVendorStore
 */
export const useOrders = () => {
  const {
    orders,
    ordersLoading: loading,
    fetchOrders,
    updateOrderInStore,
    incrementNewOrderCount,
    resetNewOrderCount,
    newOrderCount
  } = useVendorStore(useShallow(s => ({
    orders: s.orders,
    ordersLoading: s.ordersLoading,
    fetchOrders: s.fetchOrders,
    updateOrderInStore: s.updateOrderInStore,
    incrementNewOrderCount: s.incrementNewOrderCount,
    resetNewOrderCount: s.resetNewOrderCount,
    newOrderCount: s.newOrderCount,
  })));

  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const getOrders = useCallback(async (): Promise<Order[]> => {
    await fetchOrders();
    return useVendorStore.getState().orders;
  }, [fetchOrders]);

  // Mark all orders as seen (clear notification count)
  const markOrdersAsSeen = useCallback(() => {
    resetNewOrderCount();
    // We don't have a per-order isNew flag in VendorStore yet, 
    // but the count is what drives the UI indicator.
  }, [resetNewOrderCount]);

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      // Get current user to verify ownership
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('Authentication error in updateOrderStatus:', authError);
        return false;
      }

      // First, get the order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('vendor_id', user.id)
        .single();

      if (orderError || !orderData) {
        logger.error('Order not found or vendor mismatch:', orderError, { orderId, userId: user.id });
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
        return false;
      }

      if (!data || data.length === 0) {
        logger.error('Order update returned empty — RLS may be blocking the write');
        return false;
      }

      // Update centralized store
      updateOrderInStore(orderId, { status });

      return true;
    } catch (err: any) {
      logger.error('updateOrderStatus exception:', err?.message, err?.code, err);
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