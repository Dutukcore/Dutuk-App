import { ConversationWithUnread, useVendorStore } from '@/store/useVendorStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ChevronRight, MessageCircle } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

export default function ChatScreen() {
    const { conversations, loading, fetchConversations } = useVendorStore(
        useShallow((s) => ({
            conversations: s.conversations,
            loading: s.conversationsLoading,
            fetchConversations: s.fetchConversations,
        }))
    );

    const totalUnread = useMemo(() =>
        conversations.reduce((sum, conv) => sum + conv.unread_count, 0),
        [conversations]
    );

    const [refreshing, setRefreshing] = useState(false);
    const error = null; // Error handling moved to store/logger


    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchConversations();
        setRefreshing(false);
    };

    const handleConversationPress = (conversation: ConversationWithUnread) => {
        router.push({
            pathname: '/chat/conversation',
            params: {
                conversationId: conversation.id,
                customerName: conversation.customer_name || 'Customer',
                customerId: conversation.customer_id,
                paymentCompleted: conversation.payment_completed ? 'true' : 'false',
                orderId: conversation.order_id ?? '',
            },
        });
    };

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderConversationItem = ({ item }: { item: ConversationWithUnread }) => (
        <Pressable
            style={({ pressed }) => [
                styles.conversationItem,
                pressed && styles.conversationItemPressed,
            ]}
            onPress={() => handleConversationPress(item)}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {item.customer_avatar ? (
                    <Image
                        source={{ uri: item.customer_avatar }}
                        style={styles.avatar}
                        cachePolicy="disk"
                        transition={200}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {(item.customer_name || 'C').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                {/* Online indicator - optional, hardcoded for now */}
                {/* <View style={styles.onlineIndicator} /> */}
            </View>

            {/* Content */}
            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.customerName} numberOfLines={1}>
                        {item.customer_name || 'Customer'}
                    </Text>
                    <Text style={styles.timestamp}>{formatTimestamp(item.last_message_at)}</Text>
                </View>
                <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message_preview || 'No messages yet'}
                    </Text>
                    {item.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>
                                {item.unread_count > 99 ? '99+' : item.unread_count}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Arrow */}
            <ChevronRight width={20} height={20} stroke="#C0C0C0" />
        </Pressable>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MessageCircle width={48} height={48} stroke="#7C2A2A" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyDescription}>
                When customers send you messages, they'll appear here
            </Text>
        </View>
    );

    // Loading state
    if (loading && conversations.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    {totalUnread > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C2A2A" />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load conversations</Text>
                    <Pressable style={styles.retryButton} onPress={fetchConversations}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                {totalUnread > 0 && (
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{totalUnread}</Text>
                    </View>
                )}
            </View>

            {/* Conversation List */}
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversationItem}
                contentContainerStyle={conversations.length === 0 ? styles.emptyListContainer : styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#7C2A2A']}
                        tintColor="#7C2A2A"
                    />
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#800000',
        letterSpacing: -0.5,
    },
    headerBadge: {
        marginLeft: 12,
        backgroundColor: '#800000',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    headerBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    listContainer: {
        paddingVertical: 8,
    },
    emptyListContainer: {
        flex: 1,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        marginBottom: 2,
    },
    conversationItemPressed: {
        backgroundColor: 'rgba(128, 0, 0, 0.03)',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#800000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#34C759',
        borderWidth: 2,
        borderColor: '#faf8f5',
    },
    conversationContent: {
        flex: 1,
        marginRight: 8,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        flex: 1,
        marginRight: 8,
        letterSpacing: -0.2,
    },
    timestamp: {
        fontSize: 13,
        color: '#a8a29e',
        fontWeight: '500',
    },
    conversationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: '#57534e',
        flex: 1,
        marginRight: 8,
        fontWeight: '400',
    },
    unreadBadge: {
        backgroundColor: '#800000',
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 3,
        minWidth: 24,
        alignItems: 'center',
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(128, 0, 0, 0.06)',
        marginLeft: 96,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#57534e',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 28,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        marginBottom: 20,
        fontWeight: '600',
    },
    retryButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        backgroundColor: '#800000',
        borderRadius: 28,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
        paddingVertical: 80,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(128, 0, 0, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#57534e',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '400',
    },
});
