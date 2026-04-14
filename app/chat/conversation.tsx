import { getFileIcon, isImageType, useAttachments } from '@/features/chat/hooks/useAttachments';
import { useConversation } from '@/features/chat/hooks/useConversations';
import { Message, useMarkAsRead, useMessages, useSendMessage } from '@/features/chat/hooks/useMessages';
import { useTypingIndicator } from '@/features/chat/hooks/useTypingIndicator';
import { useRequestCompletion } from '@/features/orders/hooks/useCompletion';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Paperclip, Send, X } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ConversationScreen() {
    const params = useLocalSearchParams<{
        conversationId: string;
        customerName: string;
        customerId: string;
        paymentCompleted: string;
        orderId?: string;
    }>();

    const { conversationId, customerName, customerId, paymentCompleted: paymentCompletedParam, orderId: orderIdParam } = params;
    const paymentCompleted = paymentCompletedParam === 'true';

    const [message, setMessage] = useState('');
    const [requestingCompletion, setRequestingCompletion] = useState(false);
    const [completionRequestedAt, setCompletionRequestedAt] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
    const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderIdParam || null);
    const currentUserId = useAuthStore((state) => state.userId);
    const flatListRef = useRef<FlatList>(null);

    // Hooks
    const { messages, loading: messagesLoading, error: messagesError } = useMessages(
        conversationId || null,
        paymentCompleted
    );
    const { conversation } = useConversation(conversationId || null);
    const { sendMessage, loading: sending } = useSendMessage();
    const { markAsRead } = useMarkAsRead();
    const { otherPartyTyping, onTextChange } = useTypingIndicator(conversationId || null, true);
    const { requestCompletion } = useRequestCompletion();
    const {
        attachment,
        uploading,
        pickImage,
        takePhoto,
        pickDocument,
        uploadAttachment,
        clearAttachment
    } = useAttachments();

    // Resolve orderId: use param if available, otherwise look it up from the conversation record
    useEffect(() => {
        if (orderIdParam) {
            setResolvedOrderId(orderIdParam);
            return;
        }
        // Fallback: look up order_id from the conversation data
        if (conversation?.order_id) {
            setResolvedOrderId(conversation.order_id);
            return;
        }
        // Last resort: query the conversations table directly
        if (conversationId && !resolvedOrderId) {
            supabase
                .from('conversations')
                .select('order_id')
                .eq('id', conversationId)
                .single()
                .then(({ data }) => {
                    if (data?.order_id) {
                        setResolvedOrderId(data.order_id);
                    }
                });
        }
    }, [orderIdParam, conversation?.order_id, conversationId]);

    // Load order state for completion button
    useEffect(() => {
        if (!resolvedOrderId) return;
        supabase
            .from('orders')
            .select('status, completion_requested_at')
            .eq('id', resolvedOrderId)
            .single()
            .then(({ data }) => {
                if (data) {
                    setOrderStatus(data.status);
                    setCompletionRequestedAt(data.completion_requested_at);
                }
            });
    }, [resolvedOrderId]);

    // Show button for approved orders where completion hasn't been requested yet
    const canRequestCompletion = useMemo(() =>
        !!resolvedOrderId && orderStatus === 'approved' && !completionRequestedAt,
        [resolvedOrderId, orderStatus, completionRequestedAt]
    );

    const completionAlreadyRequested = useMemo(() =>
        !!completionRequestedAt,
        [completionRequestedAt]
    );

    const isOrderCompleted = orderStatus === 'completed';
    // Mark messages as read when entering conversation
    useEffect(() => {
        if (conversationId) {
            markAsRead(conversationId);
        }
    }, [conversationId, markAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    // Handle text input change for typing indicator
    const handleTextChange = (text: string) => {
        setMessage(text);
        onTextChange(text.length > 0);
    };

    const handleAttachmentPress = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Choose Document'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        await takePhoto();
                    } else if (buttonIndex === 2) {
                        await pickImage();
                    } else if (buttonIndex === 3) {
                        await pickDocument();
                    }
                }
            );
        } else {
            Alert.alert(
                'Add Attachment',
                'Choose an option',
                [
                    { text: 'Take Photo', onPress: takePhoto },
                    { text: 'Choose from Gallery', onPress: pickImage },
                    { text: 'Choose Document', onPress: pickDocument },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }
    };

    const handleRequestCompletion = useCallback(async () => {
        if (!conversationId || !customerId || !resolvedOrderId) return;
        Alert.alert(
            'Request Event Completion',
            'This will notify the customer that you consider the event complete. They must confirm to finalise.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Request', style: 'default',
                    onPress: async () => {
                        setRequestingCompletion(true);
                        const result = await requestCompletion({ conversationId, customerId, orderId: resolvedOrderId });
                        setRequestingCompletion(false);
                        if (!result.success) {
                            Toast.show({ type: 'error', text1: 'Failed to send completion request', text2: result.error, position: 'top' });
                        } else {
                            setCompletionRequestedAt(new Date().toISOString());
                            Toast.show({ type: 'success', text1: 'Completion request sent', position: 'top' });
                        }
                    }
                },
            ]
        );
    }, [conversationId, customerId, resolvedOrderId, requestCompletion]);

    const handleSend = async () => {
        if ((!message.trim() && !attachment) || !conversationId || !customerId) return;

        let uploadedAttachment = null;

        // Upload attachment first if present
        if (attachment) {
            uploadedAttachment = await uploadAttachment();
            if (!uploadedAttachment) {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to upload attachment',
                    text2: 'Please try again',
                    position: 'top',
                });
                return;
            }
        }

        const result = await sendMessage(
            {
                conversationId,
                receiverId: customerId,
                text: message.trim() || (uploadedAttachment ? '📎 Attachment' : ''),
                attachment: uploadedAttachment || undefined,
            },
            paymentCompleted
        );

        if (result.success) {
            setMessage('');
            onTextChange(false);
        } else if (result.error) {
            Toast.show({
                type: 'error',
                text1: 'Cannot send message',
                text2: result.error,
                position: 'top',
            });
        }
    };

    const formatMessageTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderAttachment = (msg: Message) => {
        if (!msg.has_attachment || !msg.attachment_url) return null;

        const isImage = msg.attachment_type && isImageType(msg.attachment_type);
        const isOwn = msg.sender_id === currentUserId;

        if (isImage) {
            return (
                <Pressable onPress={() => {/* TODO: Open full image viewer */ }}>
                    <Image
                        source={{ uri: msg.attachment_url }}
                        style={styles.attachmentImage}
                        resizeMode="cover"
                    />
                </Pressable>
            );
        }

        return (
            <Pressable
                style={[styles.fileAttachment, isOwn ? styles.ownFileAttachment : styles.otherFileAttachment]}
                onPress={() => {/* TODO: Open/download file */ }}
            >
                <Text style={styles.fileIcon}>{getFileIcon(msg.attachment_type || '')}</Text>
                <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, isOwn && styles.ownFileName]} numberOfLines={1}>
                        {msg.attachment_name || 'File'}
                    </Text>
                    {msg.attachment_size && (
                        <Text style={[styles.fileSize, isOwn && styles.ownFileSize]}>
                            {msg.attachment_size}
                        </Text>
                    )}
                </View>
            </Pressable>
        );
    };

    const renderCompletionRequestMessage = (item: Message, isOwn: boolean) => {
        return (
            <View style={[
                styles.completionCard, 
                isOwn ? styles.completionCardOwn : styles.completionCardOther,
                isOrderCompleted ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' } : {}
            ]}>
                <View style={styles.completionCardHeader}>
                    {isOrderCompleted ? (
                        <CheckCircle width={16} height={16} stroke="#22c55e" />
                    ) : (
                        <Clock width={16} height={16} stroke={isOwn ? '#FFFFFF' : '#7C2A2A'} />
                    )}
                    <Text style={[
                        styles.completionCardTitle, 
                        isOwn && styles.completionCardTitleOwn,
                        isOrderCompleted && { color: '#166534' }
                    ]}>
                        {isOrderCompleted ? 'Completion Confirmed' : 'Completion Request'}
                    </Text>
                </View>
                <Text style={[
                    styles.completionCardBody, 
                    isOwn && styles.completionCardBodyOwn,
                    isOrderCompleted && { color: '#15803d' }
                ]}>
                    {isOwn
                        ? isOrderCompleted 
                            ? 'Customer has confirmed event completion.' 
                            : 'You requested the customer confirm event completion.'
                        : isOrderCompleted 
                            ? 'You have confirmed the event completion.' 
                            : 'Vendor has requested you confirm event completion.'}
                </Text>
                {!isOrderCompleted && !isOwn && (
                    <View style={styles.completionCardBadge}>
                        <Text style={styles.completionCardBadgeText}>Awaiting customer confirmation</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderMessage = ({ item }: { item: Message; index: number }) => {
        const isOwn = item.sender_id === currentUserId;

        // Completion request messages get a dedicated card instead of a bubble
        if (item.message_type === 'completion_request') {
            return (
                <View style={[styles.messageWrapper, isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper]}>
                    {renderCompletionRequestMessage(item, isOwn)}
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageWrapper, isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                    {renderAttachment(item)}
                    {item.message_text && item.message_text !== '📎 Attachment' && (
                        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
                            {item.message_text}
                        </Text>
                    )}
                </View>
                <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
                    {isOwn && item.is_read && (
                        <CheckCircle width={12} height={12} stroke="#22C55E" style={{ marginLeft: 4 }} />
                    )}
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (!otherPartyTyping) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                        <View style={[styles.typingDot, styles.typingDot1]} />
                        <View style={[styles.typingDot, styles.typingDot2]} />
                        <View style={[styles.typingDot, styles.typingDot3]} />
                    </View>
                </View>
                <Text style={styles.typingText}>{customerName} is typing...</Text>
            </View>
        );
    };

    const renderEmptyMessages = () => (
        <View style={styles.emptyMessagesContainer}>
            <Text style={styles.emptyMessagesText}>No messages yet. Start the conversation!</Text>
        </View>
    );

    // Loading state
    if (messagesLoading && messages.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft width={24} height={24} stroke="#1A1A1A" />
                    </Pressable>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{customerName}</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C2A2A" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft width={24} height={24} stroke="#1A1A1A" />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{customerName}</Text>
                    {paymentCompleted && (
                        <View style={styles.paymentBadge}>
                            <CheckCircle width={12} height={12} stroke="#22C55E" />
                            <Text style={styles.paymentBadgeText}>Payment Verified</Text>
                        </View>
                    )}
                </View>
                {/* Request Completion Button */}
                {(canRequestCompletion || completionAlreadyRequested || isOrderCompleted) && (
                    <Pressable
                        style={[
                            styles.completeBtn,
                            (completionAlreadyRequested || isOrderCompleted) && styles.completeBtnSent,
                            isOrderCompleted && { backgroundColor: '#f0fdf4', borderColor: '#22c55e', borderWidth: 1 }
                        ]}
                        onPress={canRequestCompletion ? handleRequestCompletion : undefined}
                        disabled={requestingCompletion || completionAlreadyRequested || isOrderCompleted}
                    >
                        {requestingCompletion ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : isOrderCompleted ? (
                            <Text style={[styles.completeBtnText, { color: '#15803d' }]}>Confirmed ✓</Text>
                        ) : completionAlreadyRequested ? (
                            <Text style={styles.completeBtnText}>Awaiting Confirm</Text>
                        ) : (
                            <Text style={styles.completeBtnText}>Request Completion</Text>
                        )}
                    </Pressable>
                )}
            </View>

            {/* Contact Info Warning */}
            {!paymentCompleted && (
                <View style={styles.warningBanner}>
                    <AlertCircle width={16} height={16} stroke="#B45309" />
                    <Text style={styles.warningText}>
                        Contact sharing is blocked until payment is completed
                    </Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[
                        styles.messagesContainer,
                        messages.length === 0 && styles.emptyListStyle,
                    ]}
                    ListEmptyComponent={renderEmptyMessages}
                    ListFooterComponent={renderTypingIndicator}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                />

                {/* Attachment Preview */}
                {attachment && (
                    <View style={styles.attachmentPreview}>
                        {isImageType(attachment.type) ? (
                            <Image source={{ uri: attachment.uri }} style={styles.attachmentPreviewImage} />
                        ) : (
                            <View style={styles.attachmentPreviewFile}>
                                <Text style={styles.attachmentPreviewIcon}>{getFileIcon(attachment.type)}</Text>
                                <Text style={styles.attachmentPreviewName} numberOfLines={1}>{attachment.name}</Text>
                            </View>
                        )}
                        <Pressable style={styles.attachmentRemove} onPress={clearAttachment}>
                            <X width={16} height={16} stroke="#FFFFFF" />
                        </Pressable>
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <Pressable
                        style={styles.attachmentButton}
                        onPress={handleAttachmentPress}
                        disabled={uploading}
                    >
                        <Paperclip width={22} height={22} stroke="#666666" />
                    </Pressable>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#999999"
                        value={message}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={1000}
                        editable={!sending && !uploading}
                    />
                    <Pressable
                        style={[
                            styles.sendButton,
                            ((!message.trim() && !attachment) || sending || uploading) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={(!message.trim() && !attachment) || sending || uploading}
                    >
                        {sending || uploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Send width={20} height={20} stroke="#FFFFFF" />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    paymentBadgeText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '500',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF3C7',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    warningText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#B45309',
    },
    keyboardContainer: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        flexGrow: 1,
    },
    emptyListStyle: {
        justifyContent: 'center',
    },
    messageWrapper: {
        marginVertical: 4,
        maxWidth: '80%',
    },
    ownMessageWrapper: {
        alignSelf: 'flex-end',
    },
    otherMessageWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        overflow: 'hidden',
    },
    ownBubble: {
        backgroundColor: '#7C2A2A',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#1A1A1A',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    messageTime: {
        fontSize: 11,
        color: '#999999',
    },
    attachmentImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 4,
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginBottom: 4,
    },
    ownFileAttachment: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    otherFileAttachment: {
        backgroundColor: '#F5F5F5',
    },
    fileIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    ownFileName: {
        color: '#FFFFFF',
    },
    fileSize: {
        fontSize: 11,
        color: '#666666',
        marginTop: 2,
    },
    ownFileSize: {
        color: 'rgba(255,255,255,0.7)',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 4,
    },
    typingBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#999999',
        marginHorizontal: 2,
    },
    typingDot1: {
        opacity: 0.4,
    },
    typingDot2: {
        opacity: 0.6,
    },
    typingDot3: {
        opacity: 0.8,
    },
    typingText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#999999',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    attachmentButton: {
        padding: 10,
        marginRight: 4,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1A1A1A',
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#7C2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#C0C0C0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessagesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMessagesText: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
    },
    attachmentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 8,
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
    },
    attachmentPreviewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    attachmentPreviewFile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    attachmentPreviewIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    attachmentPreviewName: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
    },
    attachmentRemove: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#7C2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    // ── Completion Request Button (header) ──────────────────
    completeBtn: {
        backgroundColor: '#7C2A2A',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    completeBtnSent: {
        backgroundColor: '#B45309',
    },
    completeBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    // ── Completion Request Message Card ─────────────────────
    completionCard: {
        borderRadius: 12,
        padding: 12,
        maxWidth: '80%',
        minWidth: 200,
    },
    completionCardOwn: {
        backgroundColor: '#7C2A2A',
    },
    completionCardOther: {
        backgroundColor: '#FFF1F0',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    completionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    completionCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#7C2A2A',
        marginLeft: 4,
    },
    completionCardTitleOwn: {
        color: '#FFFFFF',
    },
    completionCardBody: {
        fontSize: 12,
        color: '#7C2A2A',
        lineHeight: 18,
    },
    completionCardBodyOwn: {
        color: '#FFE4E4',
    },
    completionCardBadge: {
        marginTop: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    completionCardBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#991B1B',
    },
});
