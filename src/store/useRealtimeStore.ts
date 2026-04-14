import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';
import { Order, useVendorStore } from './useVendorStore';

let channel: any = null;

/**
 * Unified Realtime Subscription Manager
 * Replaces duplicate subscriptions in OrderNotificationContext and useOrders
 */
export function setupRealtimeSubscriptions() {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
        logger.log('Realtime setup skipped: No userId');
        return;
    }

    if (channel) {
        logger.log('Realtime setup skipped: Already subscribed');
        return;
    }

    logger.log(`Setting up unified realtime subscriptions for vendor: ${userId}`);

    channel = supabase
        .channel(`vendor-all-${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('New order received via realtime');
            const store = useVendorStore.getState();

            // Transform incoming order
            const newOrder: Order = {
                id: payload.new.id,
                title: payload.new.title,
                customerName: payload.new.customer_name,
                packageType: payload.new.package_type || 'Standard Package',
                customerEmail: payload.new.customer_email || '',
                customerPhone: payload.new.customer_phone || '',
                status: payload.new.status,
                date: payload.new.event_date ? new Date(payload.new.event_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Date TBD',
                rawEventDate: payload.new.event_date || '',
                amount: payload.new.amount,
                notes: payload.new.notes,
                isNew: true,
            };

            store.setOrders([newOrder, ...store.orders]);
            store.incrementNewOrderCount();
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('Order update received via realtime');
            useVendorStore.getState().updateOrderInStore(payload.new.id, payload.new);
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'reviews',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('New review received via realtime');
            useVendorStore.getState().fetchReviews(10);
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `vendor_id=eq.${userId}`,
        }, (payload) => {
            logger.log('Conversation update received via realtime');
            useVendorStore.getState().fetchConversations();
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
        }, (payload) => {
            // Only refresh if message is for one of the vendor's conversations
            const conversations = useVendorStore.getState().conversations;
            const isRelevant = conversations.some(c => c.id === payload.new.conversation_id);
            if (isRelevant) {
                logger.log('New relevant message received via realtime');
                useVendorStore.getState().fetchConversations();
            }
        })
        .subscribe((status) => {
            logger.log(`Unified realtime status: ${status}`);
        });
}

export function teardownRealtimeSubscriptions() {
    if (channel) {
        logger.log('Tearing down realtime subscriptions');
        supabase.removeChannel(channel);
        channel = null;
    }
}
