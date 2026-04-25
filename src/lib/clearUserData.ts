import logger from '@/lib/logger';
import { storage as mmkv } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { teardownRealtimeSubscriptions } from '@/store/useRealtimeStore';
import { useVendorStore } from '@/store/useVendorStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initial values for the vendor store. MUST match the literal defaults in
 * useVendorStore.ts (lines 241-264). Update both together.
 */
const VENDOR_INITIAL = {
    company: null,
    companyLoading: false,
    allEvents: [],
    eventsLoading: false,
    orders: [],
    ordersLoading: false,
    newOrderCount: 0,
    calendarDates: [],
    requestsCount: 0,
    pendingInquiries: 0,
    reviews: [],
    reviewStats: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    lastFetchedAt: null,
    isHydrated: false,
    reviewsLoading: false,
    earnings: [],
    earningsLoading: false,
    payments: [],
    paymentsLoading: false,
    conversations: [],
    conversationsLoading: false,
    realtimeStatus: null,
    ordersRevision: 0,
} as const;

const AUTH_INITIAL = {
    user: null,
    userId: null,
    isAuthenticated: false,
    provider: null,
    isLoading: false,
    _authSub: null,
} as const;

/**
 * Idempotent local-state wipe. Safe to call multiple times.
 * Does NOT call supabase.auth.signOut() — caller is responsible for that.
 */
export async function clearAllUserData(): Promise<void> {
    try {
        // 1. Stop realtime so no more push updates write to a wiped store.
        teardownRealtimeSubscriptions();

        // 2. Reset Zustand in-memory state.
        useVendorStore.setState(VENDOR_INITIAL as any, false);
        useAuthStore.setState(AUTH_INITIAL as any, false);

        // 3. Purge persisted MMKV partitions (zustand/persist names).
        if (mmkv) {
            mmkv.delete('dutuk-vendor-data-storage');
            mmkv.delete('dutuk-auth-storage');
        }

        // 4. Clear ad-hoc AsyncStorage flags. Add new keys here as the app grows.
        await AsyncStorage.multiRemove([
            'isNewUserSignup',
            // Add per-user cache keys here if any are introduced later.
        ]).catch(() => { /* swallow — best-effort */ });

        logger.log('clearAllUserData: complete');
    } catch (e) {
        logger.error('clearAllUserData failed', e);
    }
}

/**
 * The single, canonical sign-out function. Use this everywhere instead of
 * supabase.auth.signOut() directly.
 */
export async function signOutAndClear(): Promise<{ error: Error | null }> {
    try {
        // Sign out FIRST so the SIGNED_OUT event fires while channel is still
        // alive (clean unsubscribe). Then wipe local state.
        const { error } = await supabase.auth.signOut();
        await clearAllUserData();
        return { error: error ?? null };
    } catch (e: any) {
        // Even if signOut throws (e.g. network), wipe local state.
        await clearAllUserData();
        return { error: e };
    }
}
