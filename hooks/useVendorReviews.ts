import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Review {
    id: string;
    vendor_id: string;
    customer_id: string;
    customer_name: string;
    event_id: string | null;
    event_name: string | null;
    event_date: string | null;
    rating: number;
    review: string | null;
    verified_booking: boolean;
    helpful_count: number;
    response: string | null;
    response_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
}

/**
 * Hook to fetch vendor's reviews with realtime updates
 */
export const useVendorReviews = (limit?: number) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('Authentication error:', authError);
                setLoading(false);
                return;
            }

            setUserId(user.id);

            // Fetch reviews for this vendor
            let query = supabase
                .from('reviews')
                .select('*')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data: reviewsData, error: fetchError } = await query;

            if (fetchError) {
                console.error('Failed to fetch reviews:', fetchError);
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            const reviewsList = reviewsData || [];
            setReviews(reviewsList);

            // Calculate stats
            if (reviewsList.length > 0) {
                const total = reviewsList.length;
                const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
                const avg = sum / total;

                const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                reviewsList.forEach((r) => {
                    if (r.rating >= 1 && r.rating <= 5) {
                        distribution[r.rating]++;
                    }
                });

                setStats({
                    totalReviews: total,
                    averageRating: Math.round(avg * 10) / 10,
                    ratingDistribution: distribution,
                });
            } else {
                setStats({
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                });
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews');
            setLoading(false);
        }
    }, [limit]);

    // Subscribe to new reviews
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up reviews real-time subscription for vendor:', userId);

        const channel = supabase
            .channel(`vendor-reviews-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'reviews',
                    filter: `vendor_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('New review received:', payload.new);
                    const newReview = payload.new as Review;
                    setReviews((prev) => [newReview, ...prev]);
                    // Update stats
                    setStats((prev) => {
                        const newTotal = prev.totalReviews + 1;
                        const newSum = prev.averageRating * prev.totalReviews + newReview.rating;
                        const newDist = { ...prev.ratingDistribution };
                        if (newReview.rating >= 1 && newReview.rating <= 5) {
                            newDist[newReview.rating]++;
                        }
                        return {
                            totalReviews: newTotal,
                            averageRating: Math.round((newSum / newTotal) * 10) / 10,
                            ratingDistribution: newDist,
                        };
                    });
                }
            )
            .subscribe((status) => {
                console.log('Reviews subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return {
        reviews,
        stats,
        loading,
        error,
        refetch: fetchReviews,
    };
};

/**
 * Hook to respond to a review
 */
export const useRespondToReview = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const respondToReview = async (reviewId: string, response: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('Not authenticated');
            }

            const { error: updateError } = await supabase
                .from('reviews')
                .update({
                    response,
                    response_at: new Date().toISOString(),
                })
                .eq('id', reviewId)
                .eq('vendor_id', user.id);

            if (updateError) {
                throw updateError;
            }

            return true;
        } catch (err: any) {
            console.error('Error responding to review:', err);
            setError(err.message || 'Failed to respond to review');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { respondToReview, loading, error };
};
