import { useVendorStore } from '@/store/useVendorStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ReviewProp = {
    id: string;
    vendor_id: string;
    customer_id: string;
    rating: number;
    review?: string;
    response?: string;
    response_at?: string;
    created_at: string;
    customer?: {
        full_name: string | null;
        avatar_url: string | null;
    };
    order?: {
        title: string | null;
        event_date: string | null;
    };
};

type ReviewsProp = {
    reviews: any[];
};

const DisplayReviews = ({ reviews }: ReviewsProp) => {
    const { replyToReview } = useVendorStore();
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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

    const renderItem = ({ item: review, index }: { item: any; index: number }) => (
        <View key={review.id || index} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerMain}>
                    <Text style={styles.eventName}>
                        {review.order?.title || 'Event Review'}
                    </Text>
                    <Text style={styles.reviewerName}>
                        By: {review.customer?.full_name || 'Anonymous Guest'}
                    </Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#D4AF37" />
                    <Text style={styles.ratingBadgeText}>{review.rating}</Text>
                </View>
            </View>

            <View style={styles.separator} />

            {review.review && (
                <View style={styles.reviewContent}>
                    <Text style={styles.reviewText}>{review.review}</Text>
                    <Text style={styles.reviewDate}>
                        {formatDate(review.created_at)}
                    </Text>
                </View>
            )}

            {/* Existing Response */}
            {review.response ? (
                <View style={styles.responseContainer}>
                    <View style={styles.responseConnector} />
                    <View style={styles.responseContent}>
                        <View style={styles.responseHeader}>
                            <Text style={styles.responseAuthor}>Your Response</Text>
                            <Text style={styles.responseDate}>
                                {formatDate(review.response_at!)}
                            </Text>
                        </View>
                        <Text style={styles.responseText}>{review.response}</Text>
                    </View>
                </View>
            ) : (
                /* Reply Action */
                <View style={styles.actionsContainer}>
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
                            <View style={styles.replyActions}>
                                <Pressable
                                    style={[styles.replyBtn, styles.cancelBtn]}
                                    onPress={() => {
                                        setReplyingTo(null);
                                        setReplyText('');
                                    }}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.replyBtn, styles.submitBtn]}
                                    onPress={() => handleReply(review.id)}
                                    disabled={isSubmitting || !replyText.trim()}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>Send Reply</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable
                            style={styles.replyToggleBtn}
                            onPress={() => setReplyingTo(review.id)}
                        >
                            <Ionicons name="arrow-undo-outline" size={16} color="#800000" />
                            <Text style={styles.replyToggleText}>Reply to feedback</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <FlatList
            style={styles.container}
            data={reviews}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.noReviewsText}>No past reviews to display.</Text>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F7F9FC',
    },
    listContent: {
        padding: 15,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Android shadow
        borderWidth: 1,
        borderColor: '#E8EBF2', // Subtle light border
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50', // Dark blue-grey for main titles
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 15,
        color: '#607D8B', // Medium grey for secondary info
        marginBottom: 10,
        fontStyle: 'italic',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginRight: 8,
    },
    stars: {
        fontSize: 18,
        color: '#FFD700', // Gold color for stars
    },
    separator: {
        height: 1,
        backgroundColor: '#ECEFF1', // Very light separator line
        marginVertical: 15,
    },
    reviewTextHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495E', // Slightly darker for section headers
        marginBottom: 5,
    },
    reviewText: {
        fontSize: 15,
        color: '#495057', // Regular text color
        lineHeight: 22,
        marginBottom: 10,
    },
    reviewDate: {
        fontSize: 13,
        color: '#9E9E9E', // Lighter grey for dates
        textAlign: 'right',
        marginTop: 5,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#7F8C8D', // Neutral grey for informative text
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    // Reply and Response Styles
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerMain: {
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCF8E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D4AF37',
    },
    reviewContent: {
        marginBottom: 12,
    },
    responseContainer: {
        marginTop: 12,
        flexDirection: 'row',
    },
    responseConnector: {
        width: 2,
        backgroundColor: '#80000020',
        marginLeft: 12,
        marginRight: 16,
        borderRadius: 1,
    },
    responseContent: {
        flex: 1,
        backgroundColor: '#FAF8F5',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8EBF2',
    },
    responseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    responseAuthor: {
        fontSize: 13,
        fontWeight: '700',
        color: '#800000',
    },
    responseDate: {
        fontSize: 11,
        color: '#9E9E9E',
    },
    responseText: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
    },
    actionsContainer: {
        marginTop: 8,
    },
    replyToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    replyToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#800000',
    },
    replyForm: {
        backgroundColor: '#FAF8F5',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#80000030',
        marginTop: 8,
    },
    replyInput: {
        fontSize: 15,
        color: '#1c1917',
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    replyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    replyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F4',
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#57534e',
    },
    submitBtn: {
        backgroundColor: '#800000',
    },
    submitBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default DisplayReviews;