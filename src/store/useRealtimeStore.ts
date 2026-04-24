import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';
import { Order, useVendorStore } from './useVendorStore';

let channel: any = null;
let currentUserId: string | null = null;

/**
 * Unified Realtime Subscription Manager
 * Replaces duplicate subscriptions in OrderNotificationContext and useOrders
 */
export async function setupRealtimeSubscriptions() {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
        logger.log('Realtime setup skipped: No userId');
        return;
    }

    // ─── Eagerly set the JWT on the realtime socket before subscribing ─────────
    // onAuthStateChange fires asynchronously; without this the socket connects
    // as `anon` and RLS drops all postgres_changes payloads silently.
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            supabase.realtime.setAuth(session.access_token);
            logger.log('Realtime: auth token eagerly set');
        } else {
            logger.warn('Realtime setup: no session token available — events may not arrive');
        }
    } catch (e) {
        logger.warn('Realtime setup: could not fetch session token', e);
    }

    // If the channel exists but is for a different user or is unhealthy, tear it down.
    if (channel && (currentUserId !== userId || channel.state !== 'joined')) {
        logger.log(`Realtime: channel stale or user changed (${currentUserId} → ${userId}). Re-subscribing.`);
        supabase.removeChannel(channel);
        channel = null;
        currentUserId = null;
    }

    if (channel) {
        logger.log('Realtime setup skipped: Already subscribed');
        return;
    }

    logger.log(`Setting up unified realtime subscriptions for vendor: ${userId}`, {
        socketAccessTokenSet: !!(supabase as any).realtime?.accessToken,
    });
    currentUserId = userId;

    channel = supabase
        .channel(`vendor-all-${userId}`)
        // NOTE: We intentionally DO NOT use the `filter` option on postgres_changes.
        // Supabase Realtime's server-side filter silently drops events when the row
        // was inserted by a *different* user (e.g. customer → orders), even if RLS
        // passes. We filter client-side below instead.
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
        }, (payload) => {
            if (payload.new.vendor_id !== userId) return; // client-side guard
            logger.log('[RT] INSERT payload arrived for orders', {
                vendor_id: payload.new.vendor_id,
                expected: userId,
                match: payload.new.vendor_id === userId,
            });
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
        }, (payload) => {
            if (payload.new.vendor_id !== userId) return; // client-side guard
            logger.log('Order update received via realtime');
            useVendorStore.getState().updateOrderInStore(payload.new.id, payload.new);
        })
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'orders',
        }, (payload) => {
            const oldRow = payload.old as any;
            if (oldRow?.vendor_id && oldRow.vendor_id !== userId) return; // client-side guard
            logger.log('Order delete received via realtime');
            if (payload.old?.id) {
                useVendorStore.getState().removeOrderFromStore(payload.old.id);
            }
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'reviews',
        }, (payload) => {
            if (payload.new.vendor_id !== userId) return; // client-side guard
            logger.log('New review received via realtime');
            useVendorStore.getState().fetchReviews(10);
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations',
        }, (payload) => {
            const row = (payload.new as any)?.vendor_id ? payload.new as any : payload.old as any;
            if (!row?.vendor_id || row.vendor_id !== userId) return; // client-side guard
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

            // Propagate health status to store for UI indicator
            const store = useVendorStore.getState();
            if (
                status === 'SUBSCRIBED' ||
                status === 'CHANNEL_ERROR' ||
                status === 'TIMED_OUT' ||
                status === 'CLOSED'
            ) {
                store.setRealtimeStatus(status);
            }

            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                logger.warn(`Realtime channel unhealthy: ${status}. Scheduling recovery.`);
                // If the channel is broken, tear it down so the next check can re-establish it.
                teardownRealtimeSubscriptions();
            }
        });
}

export function teardownRealtimeSubscriptions() {
    if (channel) {
        logger.log('Tearing down realtime subscriptions');
        supabase.removeChannel(channel);
        channel = null;
        currentUserId = null;
        useVendorStore.getState().setRealtimeStatus('CLOSED');
    }
}
