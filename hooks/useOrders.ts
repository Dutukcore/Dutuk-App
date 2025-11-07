import { supabase } from '@/utils/supabase';
import { useState } from 'react';

export interface Order {
  id: string;
  title: string;
  customerName: string;
  packageType: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  amount?: number;
  notes?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Get current user to verify ownership
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        setLoading(false);
        return false;
      }

      // Update order status and verify vendor ownership
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
        console.error('Failed to update order status:', error);
        setLoading(false);
        return false;
      }

      // Check if order was found and updated
      if (!data || data.length === 0) {
        console.error('Order not found or you do not have permission to update it');
        setLoading(false);
        return false;
      }
      
      // Update order status in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      setLoading(false);
      return false;
    }
  };

  const getOrders = async (): Promise<Order[]> => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        setLoading(false);
        return [];
      }
      
      // Fetch orders for this vendor
      const { data: ordersData, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Failed to fetch orders:', fetchError);
        setLoading(false);
        return [];
      }
      
      // Transform to match Order interface
      const transformedOrders: Order[] = (ordersData || []).map(order => ({
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
        amount: order.amount,
        notes: order.notes
      }));
      
      setOrders(transformedOrders);
      setLoading(false);
      return transformedOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
      return [];
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    getOrders
  };
};