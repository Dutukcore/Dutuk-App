import { supabase } from '@/utils/supabase';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface OrderNotificationContextType {
    newOrderCount: number;
    markOrdersAsSeen: () => void;
    subscriptionError: string | null;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

export function OrderNotificationProvider({ children }: { children: ReactNode }) {
    const [newOrderCount, setNewOrderCount] = useState(0);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Get user ID on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    // Subscribe to new orders
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up order notification subscription for vendor:', userId);

        const channel = supabase
            .channel(`order-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `vendor_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('New order notification:', payload.new);
                    setNewOrderCount((prev) => prev + 1);
                }
            )
            .subscribe((status, err) => {
                console.log('Order notification subscription status:', status);
                if (status === 'CHANNEL_ERROR') {
                    console.error('Notification subscription error:', err);
                    setSubscriptionError('Failed to connect to notifications');
                } else if (status === 'SUBSCRIBED') {
                    setSubscriptionError(null);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const markOrdersAsSeen = useCallback(() => {
        setNewOrderCount(0);
    }, []);

    return (
        <OrderNotificationContext.Provider
            value={{
                newOrderCount,
                markOrdersAsSeen,
                subscriptionError,
            }}
        >
            {children}
        </OrderNotificationContext.Provider>
    );
}

export function useOrderNotifications() {
    const context = useContext(OrderNotificationContext);
    if (context === undefined) {
        throw new Error('useOrderNotifications must be used within an OrderNotificationProvider');
    }
    return context;
}
