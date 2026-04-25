import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallback, useEffect, useRef, useState } from 'react';

// =====================================================
// TYPES
// =====================================================

interface TypingState {
    isTyping: boolean;
    otherPartyTyping: boolean;
}

// =====================================================
// HOOK: useTypingIndicator
// =====================================================

/**
 * Handles typing indicator functionality for chat
 * - Updates own typing status when typing
 * - Subscribes to other party's typing status
 * - Auto-clears typing status after 3 seconds of inactivity
 * 
 * @param conversationId - The conversation ID
 * @param isVendor - Whether the current user is the vendor
 * @param isClosed - Whether the conversation is closed
 * @returns Object with typing state and updateTyping function
 */
export function useTypingIndicator(conversationId: string | null, isVendor: boolean = true, isClosed: boolean = false) {
    const [otherPartyTyping, setOtherPartyTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const lastTypingUpdateRef = useRef<number>(0);

    // Minimum interval between typing updates (in ms)
    const TYPING_UPDATE_INTERVAL = 2000;

    // How long typing status remains active (in ms)
    const TYPING_TIMEOUT = 3000;

    // Update own typing status in database
    const updateTyping = useCallback(async () => {
        if (!conversationId || isClosed) return;

        const now = Date.now();

        // Debounce: don't update more than once every 2 seconds
        if (now - lastTypingUpdateRef.current < TYPING_UPDATE_INTERVAL) {
            return;
        }

        lastTypingUpdateRef.current = now;

        try {
            const user = useAuthStore.getState().user;
            if (!user?.id) return;

            // Update the appropriate typing column based on role
            const updateData = isVendor
                ? { vendor_typing_at: new Date().toISOString() }
                : { customer_typing_at: new Date().toISOString() };

            await supabase
                .from('conversations')
                .update(updateData)
                .eq('id', conversationId);
        } catch (error) {
            logger.error('Error updating typing status:', error);
        }
    }, [conversationId, isVendor, isClosed]);

    // Clear own typing status
    const clearTyping = useCallback(async () => {
        if (!conversationId || isClosed) return;

        try {
            const user = useAuthStore.getState().user;
            if (!user?.id) return;

            // Clear the appropriate typing column based on role
            const updateData = isVendor
                ? { vendor_typing_at: null }
                : { customer_typing_at: null };

            await supabase
                .from('conversations')
                .update(updateData)
                .eq('id', conversationId);
        } catch (error) {
            logger.error('Error clearing typing status:', error);
        }
    }, [conversationId, isVendor, isClosed]);

    // Check if a typing timestamp is still valid (within timeout)
    const isTypingActive = (typingAt: string | null): boolean => {
        if (!typingAt) return false;
        const typingTime = new Date(typingAt).getTime();
        const now = Date.now();
        return now - typingTime < TYPING_TIMEOUT;
    };

    // Subscribe to other party's typing status
    useEffect(() => {
        if (!conversationId) return;

        // Initial fetch
        const fetchTypingStatus = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select('customer_typing_at, vendor_typing_at')
                .eq('id', conversationId)
                .single();

            if (!error && data) {
                // Check the OTHER party's typing status
                const otherTypingAt = isVendor ? data.customer_typing_at : data.vendor_typing_at;
                setOtherPartyTyping(isTypingActive(otherTypingAt));
            }
        };

        fetchTypingStatus();

        // Subscribe to changes
        const channel = supabase
            .channel(`typing-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations',
                    filter: `id=eq.${conversationId}`,
                },
                (payload) => {
                    const newData = payload.new as any;
                    // Check the OTHER party's typing status
                    const otherTypingAt = isVendor ? newData.customer_typing_at : newData.vendor_typing_at;
                    setOtherPartyTyping(isTypingActive(otherTypingAt));
                }
            )
            .subscribe();

        // Poll to clear stale typing indicators
        const pollInterval = setInterval(() => {
            fetchTypingStatus();
        }, TYPING_TIMEOUT);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
            clearTyping();
        };
    }, [conversationId, isVendor, clearTyping]);

    // Auto-clear typing after timeout
    const onTextChange = useCallback((hasText: boolean) => {
        if (hasText) {
            updateTyping();

            // Reset the timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                clearTyping();
            }, TYPING_TIMEOUT);
        } else {
            // Clear immediately if text is empty
            clearTyping();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    }, [updateTyping, clearTyping]);

    return {
        otherPartyTyping,
        onTextChange,
        updateTyping,
        clearTyping,
    };
}
