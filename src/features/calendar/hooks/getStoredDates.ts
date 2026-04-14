import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export interface StoredDate {
    date: string;
    status: 'available' | 'unavailable';
    event?: string;
    description?: string;
}

/**
 * Fetches calendar availability dates for the current vendor from Supabase
 * @returns Array of StoredDate objects
 */
const getStoredDates = async (): Promise<StoredDate[]> => {
    try {
        // 1. Get current authenticated user id from store
        const userId = useAuthStore.getState().userId;

        if (!userId) {
            logger.error('No authenticated user found in store');
            return [];
        }

        // 2. Query dates table for this user
        const { data, error } = await supabase
            .from('dates')
            .select('date, status, event, description')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) {
            logger.error('Error querying stored dates:', error);
            return [];
        }

        // 3. Transform and return results
        return (data || []).map(d => ({
            date: d.date,
            status: (d.status as 'available' | 'unavailable') || 'unavailable',
            event: d.event || undefined,
            description: d.description || undefined,
        }));

    } catch (err) {
        logger.error('Unexpected error in getStoredDates:', err);
        return [];
    }
};

export default getStoredDates;
