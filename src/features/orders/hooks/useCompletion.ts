import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallback, useState } from 'react';

// =====================================================
// HOOK: useRequestCompletion
// Vendor-side: send a completion request through chat
// Now uses the `orders` table (events table is deprecated)
// =====================================================

interface RequestCompletionParams {
    /** The conversation the vendor is currently in */
    conversationId: string;
    /** The customer's user ID (message receiver) */
    customerId: string;
    /** The order being completed */
    orderId: string;
}

export function useRequestCompletion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestCompletion = useCallback(
        async (params: RequestCompletionParams): Promise<{ success: boolean; error?: string }> => {
            const { conversationId, customerId, orderId } = params;
            const vendorId = useAuthStore.getState().userId;

            if (!vendorId) {
                return { success: false, error: 'Not authenticated' };
            }

            try {
                setLoading(true);
                setError(null);

                const now = new Date().toISOString();

                // 0. Guard: check if conversation is already completed
                const { data: conv } = await supabase
                    .from('conversations')
                    .select('status')
                    .eq('id', conversationId)
                    .single();

                if (conv?.status === 'COMPLETED') {
                    return { success: false, error: 'Order already completed - Chat is closed.' };
                }

                // 1. Insert completion_request message into chat
                const { error: msgError } = await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: vendorId,
                    receiver_id: customerId,
                    message_text: '📋 Completion Request',
                    message_type: 'completion_request',
                    has_attachment: false,
                });

                if (msgError) throw msgError;

                // 2. Mark order as completion_requested via the orders table
                const { error: orderError } = await supabase
                    .from('orders')
                    .update({
                        completion_requested_at: now,
                    })
                    .eq('id', orderId)
                    .eq('vendor_id', vendorId);

                if (orderError) throw orderError;

                return { success: true };
            } catch (err: any) {
                logger.error('Error requesting completion:', err);
                const msg = err.message || 'Failed to request completion';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { requestCompletion, loading, error };
}

// =====================================================
// HOOK: useConfirmCompletion
// Customer-side: confirm completion
// =====================================================

export function useConfirmCompletion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmCompletion = useCallback(
        async (orderId: string): Promise<{ success: boolean; error?: string }> => {
            try {
                setLoading(true);
                setError(null);

                const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', orderId);

                if (updateError) throw updateError;

                return { success: true };
            } catch (err: any) {
                logger.error('Error confirming completion:', err);
                const msg = err.message || 'Failed to confirm completion';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { confirmCompletion, loading, error };
}
