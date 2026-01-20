import { Review, ReviewStats } from '@/hooks/useVendorReviews';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ReviewsCardProps {
    reviews: Review[];
    stats: ReviewStats;
    loading?: boolean;
}

/**
 * Compact reviews card for the vendor home page
 * Shows recent reviews and average rating
 */
const ReviewsCard: React.FC<ReviewsCardProps> = ({ reviews, stats, loading = false }) => {
    const recentReviews = reviews.slice(0, 3); // Show max 3 reviews

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reviews</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading reviews...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            {/* Header with Stats */}
            <View style={styles.header}>
                <Text style={styles.title}>Reviews</Text>
                {stats.totalReviews > 0 && (
                    <View style={styles.statsContainer}>
                        <Text style={styles.ratingBig}>{stats.averageRating}</Text>
                        <Text style={styles.starIcon}>★</Text>
                        <Text style={styles.totalCount}>({stats.totalReviews})</Text>
                    </View>
                )}
            </View>

            {/* Reviews List or Empty State */}
            {recentReviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyText}>No reviews yet</Text>
                    <Text style={styles.emptySubtext}>
                        Complete events to start receiving reviews from customers
                    </Text>
                </View>
            ) : (
                <View style={styles.reviewsList}>
                    {recentReviews.map((review, index) => (
                        <View
                            key={review.id}
                            style={[
                                styles.reviewItem,
                                index !== recentReviews.length - 1 && styles.reviewItemBorder
                            ]}
                        >
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {review.customer_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewerDetails}>
                                        <Text style={styles.reviewerName} numberOfLines={1}>
                                            {review.customer_name}
                                        </Text>
                                        <View style={styles.ratingRow}>
                                            <Text style={styles.stars}>
                                                {renderStars(review.rating)}
                                            </Text>
                                            {review.verified_booking && (
                                                <Text style={styles.verifiedBadge}>✓ Verified</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewDate}>
                                    {formatDate(review.created_at)}
                                </Text>
                            </View>

                            {review.review && (
                                <Text style={styles.reviewText} numberOfLines={2}>
                                    "{review.review}"
                                </Text>
                            )}

                            {review.event_name && (
                                <Text style={styles.eventName} numberOfLines={1}>
                                    📍 {review.event_name}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* View All Button */}
            {stats.totalReviews > 0 && (
                <Pressable
                    style={styles.viewAllButton}
                    onPress={() => router.push('/profilePages/profileSettings/history_and_highlights/pastReviews')}
                >
                    <Text style={styles.viewAllText}>
                        View all {stats.totalReviews} reviews
                    </Text>
                    <Text style={styles.arrowIcon}>→</Text>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7E6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    ratingBig: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    starIcon: {
        fontSize: 14,
        color: '#FFB800',
        marginLeft: 2,
    },
    totalCount: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: '#999',
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    reviewsList: {
        marginBottom: 12,
    },
    reviewItem: {
        paddingVertical: 12,
    },
    reviewItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#7C2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    reviewerDetails: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stars: {
        fontSize: 12,
        color: '#FFB800',
        letterSpacing: 1,
    },
    verifiedBadge: {
        fontSize: 10,
        color: '#22c55e',
        marginLeft: 8,
        fontWeight: '500',
    },
    reviewDate: {
        fontSize: 11,
        color: '#999',
    },
    reviewText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
        fontStyle: 'italic',
        marginLeft: 46,
    },
    eventName: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        marginLeft: 46,
    },
    viewAllButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7C2A2A',
    },
    arrowIcon: {
        fontSize: 14,
        color: '#7C2A2A',
        marginLeft: 6,
    },
});

export default ReviewsCard;
