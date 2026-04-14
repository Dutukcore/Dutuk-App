import { Conversation, ConversationWithUnread } from '@/store/useVendorStore';
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type { Conversation, ConversationWithUnread };

// Types are now imported from the store

// =====================================================
// HOOK: useConversation
// =====================================================

/**
 * Fetches a single conversation by ID
 * 
 * @param conversationId - The conversation ID
 * @returns Object with conversation, loading state, and error
 */
export function useConversation(conversationId: string | null) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conversationId) {
            setConversation(null);
            setLoading(false);
            return;
        }

        const fetchConversation = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('conversations_with_users')
                    .select('*')
                    .eq('id', conversationId)
                    .single();

                if (fetchError) throw fetchError;

                setConversation(data);
            } catch (err: any) {
                logger.error('Error fetching conversation:', err);
                setError(err.message || 'Failed to load conversation');
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId]);

    return { conversation, loading, error };
}
