import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

// =====================================================
// TYPES
// =====================================================

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    receiver_id: string;
    message_text: string;
    message_type: 'text' | 'completion_request' | 'system';
    event_id: string | null;
    has_attachment: boolean;
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_size: string | null;
    attachment_type: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

interface SendMessageParams {
    conversationId: string;
    receiverId: string;
    text: string;
    messageType?: 'text' | 'completion_request' | 'system';
    eventId?: string | null;
    attachment?: {
        url: string;
        name: string;
        type: string;
        size: string;
    };
}

// =====================================================
// CONTACT INFO DETECTION (For blocking before payment)
// =====================================================

const CONTACT_PATTERNS = {
    phone: /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\d{10}/gi,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    url: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|io|in|co)[^\s]*)/gi,
    social: /@[a-zA-Z0-9_]{3,}/gi,
    whatsapp: /whatsapp|wa\.me|watsapp/gi,
};

function containsContactInfo(text: string): { hasContact: boolean; type: string | null } {
    if (CONTACT_PATTERNS.phone.test(text)) {
        CONTACT_PATTERNS.phone.lastIndex = 0;
        return { hasContact: true, type: 'phone' };
    }
    if (CONTACT_PATTERNS.email.test(text)) {
        CONTACT_PATTERNS.email.lastIndex = 0;
        return { hasContact: true, type: 'email' };
    }
    if (CONTACT_PATTERNS.url.test(text)) {
        CONTACT_PATTERNS.url.lastIndex = 0;
        return { hasContact: true, type: 'url' };
    }
    if (CONTACT_PATTERNS.social.test(text)) {
        CONTACT_PATTERNS.social.lastIndex = 0;
        return { hasContact: true, type: 'social' };
    }
    if (CONTACT_PATTERNS.whatsapp.test(text)) {
        CONTACT_PATTERNS.whatsapp.lastIndex = 0;
        return { hasContact: true, type: 'whatsapp' };
    }
    return { hasContact: false, type: null };
}

function getContactErrorMessage(type: string): string {
    switch (type) {
        case 'phone':
            return 'Phone numbers cannot be shared until payment is completed';
        case 'email':
            return 'Email addresses cannot be shared until payment is completed';
        case 'url':
            return 'URLs and website links cannot be shared until payment is completed';
        case 'social':
            return 'Social media handles cannot be shared until payment is completed';
        case 'whatsapp':
            return 'WhatsApp/messaging app mentions cannot be shared until payment is completed';
        default:
            return 'Contact information cannot be shared until payment is completed';
    }
}

// =====================================================
// HOOK: useMessages
// =====================================================

/**
 * Fetches messages for a conversation with real-time updates
 * 
 * @param conversationId - The conversation ID
 * @param paymentCompleted - Whether payment is completed (enables contact sharing)
 * @returns Object with messages, loading state, error, and refetch function
 */
export function useMessages(conversationId: string | null, paymentCompleted: boolean = false) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setMessages(data || []);
        } catch (err: any) {
            logger.error('Error fetching messages:', err);
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    // Add new message to the list
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    // Update message (e.g., read status)
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    return { messages, loading, error, refetch: fetchMessages };
}

// =====================================================
// HOOK: useSendMessage
// =====================================================

/**
 * Sends a message in a conversation
 * Validates contact info before sending if payment not completed
 * 
 * @returns Object with sendMessage function, loading state, and error
 */
export function useSendMessage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(
        async (
            params: SendMessageParams,
            paymentCompleted: boolean = false
        ): Promise<{ success: boolean; error?: string }> => {
            const { conversationId, receiverId, text, attachment, messageType, eventId } = params;

            if (!text.trim() && !attachment) {
                return { success: false, error: 'Message cannot be empty' };
            }

            // Check for contact info if payment not completed
            if (!paymentCompleted && text.trim()) {
                const { hasContact, type } = containsContactInfo(text);
                if (hasContact && type) {
                    const errorMsg = getContactErrorMessage(type);
                    setError(errorMsg);
                    return { success: false, error: errorMsg };
                }
            }

            try {
                setLoading(true);
                setError(null);

                const user = useAuthStore.getState().user;
                if (!user?.id) {
                    throw new Error('User not authenticated');
                }

                const messageData: any = {
                    conversation_id: conversationId,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    message_text: text.trim() || (attachment ? '📎 Attachment' : ''),
                    has_attachment: !!attachment,
                    message_type: messageType || 'text',
                    event_id: eventId || null,
                };

                // Add attachment fields if present
                if (attachment) {
                    messageData.attachment_url = attachment.url;
                    messageData.attachment_name = attachment.name;
                    messageData.attachment_type = attachment.type;
                    messageData.attachment_size = attachment.size;
                }

                const { error: insertError } = await supabase.from('messages').insert(messageData);

                if (insertError) throw insertError;

                return { success: true };
            } catch (err: any) {
                logger.error('Error sending message:', err);
                const errorMsg = err.message || 'Failed to send message';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { sendMessage, loading, error };
}

// =====================================================
// HOOK: useMarkAsRead
// =====================================================

/**
 * Marks all messages in a conversation as read
 * 
 * @returns Object with markAsRead function and loading state
 */
export function useMarkAsRead() {
    const [loading, setLoading] = useState(false);

    const markAsRead = useCallback(async (conversationId: string) => {
        try {
            setLoading(true);

            const user = useAuthStore.getState().user;
            if (!user?.id) return;

            // Mark all unread messages sent to this user as read
            const { error } = await supabase
                .from('messages')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                })
                .eq('conversation_id', conversationId)
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
        } catch (err) {
            logger.error('Error marking messages as read:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { markAsRead, loading };
}
