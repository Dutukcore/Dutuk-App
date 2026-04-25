import { useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useShallow } from "zustand/react/shallow";

const { width } = Dimensions.get('window');

const PastReviews = () => {
    const { reviews, fetchReviews, replyToReview } = useVendorStore(useShallow((state) => ({
        reviews: state.reviews,
        fetchReviews: state.fetchReviews,
        replyToReview: state.replyToReview
    })));

    const [loading, setLoading] = useState(!reviews || reviews.length === 0);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!reviews || reviews.length === 0) {
                setLoading(true);
            }
            try {
                await fetchReviews();
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            await replyToReview(reviewId, replyText.trim());
            setReplyingTo(null);
            setReplyText('');
        } catch (error) {
            console.error('Failed to reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = useCallback((dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }, []);

    const renderReviewItem = useCallback(({ item: review }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerInfo}>
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                        {review.order?.title || 'Service Review'}
                    </Text>
                    <Text style={styles.customerName}>
                        by {review.customer?.full_name || 'Verified Customer'}
                    </Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#D4AF37" />
                    <Text style={styles.ratingValue}>{review.rating}</Text>
                </View>
            </View>

            <Text style={styles.reviewText}>{review.review}</Text>

            <View style={styles.metaRow}>
                <Text style={styles.dateText}>{formatDate(review.created_at)}</Text>
            </View>

            {review.response ? (
                <View style={styles.vendorResponse}>
                    <View style={styles.responseBubble}>
                        <View style={styles.responseHeader}>
                            <Text style={styles.responseTextBold}>Your Response</Text>
                            <Text style={styles.responseDate}>{formatDate(review.response_at)}</Text>
                        </View>
                        <Text style={styles.responseText}>{review.response}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.replyAction}>
                    {replyingTo === review.id ? (
                        <View style={styles.replyForm}>
                            <TextInput
                                style={styles.replyInput}
                                placeholder="Write your response..."
                                value={replyText}
                                onChangeText={setReplyText}
                                multiline
                                autoFocus
                            />
                            <View style={styles.replyButtons}>
                                <Pressable
                                    onPress={() => { setReplyingTo(null); setReplyText(''); }}
                                    style={[styles.btn, styles.btnCancel]}
                                >
                                    <Text style={styles.btnCancelText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleReply(review.id)}
                                    disabled={isSubmitting || !replyText.trim()}
                                    style={[styles.btn, styles.btnSubmit]}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.btnSubmitText}>Reply</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            style={styles.replyBtnToggle}
                            onPress={() => setReplyingTo(review.id)}
                            hitSlop={10}
                        >
                            <Ionicons name="chatbubble-outline" size={16} color="#800000" />
                            <Text style={styles.replyBtnText}>Reply to review</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    ), [replyingTo, replyText, isSubmitting, formatDate]);

    return (
        <View style={styles.mainContainer}>
            {/* Custom Premium Header */}
            <View style={styles.customHeader}>
                <Pressable onPress={() => router.back()} style={styles.headerBackButton} hitSlop={20}>
                    <Ionicons name="arrow-back" size={24} color="#1c1917" />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerMainTitle}>Past Reviews</Text>
                    <Text style={styles.headerSubTitle}>Latest feedback first</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                    <Text style={styles.loaderText}>Syncing reviews...</Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbox-ellipses-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No reviews yet</Text>
                            <Text style={styles.emptySubTitle}>Your completed services' reviews will appear here.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50, // Safe area manual padding
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerMainTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerSubTitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 15,
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerInfo: {
        flex: 1,
        marginRight: 10,
    },
    serviceTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },
    customerName: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFCF0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#D4AF37',
        marginLeft: 4,
    },
    reviewText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    vendorResponse: {
        marginTop: 4,
    },
    responseBubble: {
        backgroundColor: '#80000008',
        borderRadius: 16,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#800000',
    },
    responseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    responseTextBold: {
        fontSize: 12,
        fontWeight: '700',
        color: '#800000',
    },
    responseDate: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    responseText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    replyAction: {
        marginTop: 8,
    },
    replyBtnToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    replyBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#800000',
    },
    replyForm: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    replyInput: {
        fontSize: 14,
        color: '#111827',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    replyButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 10,
    },
    btn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        minWidth: 70,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#E5E7EB',
    },
    btnCancelText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    btnSubmit: {
        backgroundColor: '#800000',
    },
    btnSubmitText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 20,
    },
    emptySubTitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});

export default PastReviews;