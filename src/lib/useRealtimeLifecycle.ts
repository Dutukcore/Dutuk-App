import logger from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';
import { setupRealtimeSubscriptions, teardownRealtimeSubscriptions } from '@/store/useRealtimeStore';
import { useVendorStore } from '@/store/useVendorStore';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * useRealtimeLifecycle
 *
 * Manages the lifecycle of the realtime subscription:
 * - Waits for `appReady` (auth initialized) before setting up — prevents
 *   connecting as `anon` before the session is loaded from storage.
 * - Sets up/tears down on auth state change.
 * - Re-establishes connection when the app returns to foreground.
 * - Runs a catch-up fetch on foreground resume.
 *
 * Mount once at the root layout, inside the provider tree.
 * Pass `appReady` from root layout to gate setup after auth init.
 */
export function useRealtimeLifecycle(appReady: boolean) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const backgroundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Don't attempt realtime setup until auth has finished initializing.
        // Otherwise getSession() returns null and the socket joins as anon.
        if (!appReady) return;

        if (!isAuthenticated) {
            teardownRealtimeSubscriptions();
            return;
        }

        // Auth ready + authenticated → setup (async: eagerly fetches JWT)
        setupRealtimeSubscriptions().catch((e) =>
            logger.warn('setupRealtimeSubscriptions failed:', e)
        );

        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                logger.log('App foregrounded — re-ensuring realtime subscription');
                // Cancel any pending background teardown
                if (backgroundTimer.current) {
                    clearTimeout(backgroundTimer.current);
                    backgroundTimer.current = null;
                }
                // Re-subscribe (no-op if already subscribed to same user)
                setupRealtimeSubscriptions().catch((e) =>
                    logger.warn('Foreground setupRealtimeSubscriptions failed:', e)
                );
                // Catch-up fetch for events missed while backgrounded
                useVendorStore.getState().fetchOrders().catch((e) =>
                    logger.warn('Foreground catch-up fetchOrders failed:', e)
                );
            } else if (nextState === 'background') {
                logger.log('App backgrounded — scheduling realtime teardown in 30s');
                backgroundTimer.current = setTimeout(() => {
                    logger.log('App background timeout — tearing down realtime');
                    teardownRealtimeSubscriptions();
                    backgroundTimer.current = null;
                }, 30_000);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            if (backgroundTimer.current) {
                clearTimeout(backgroundTimer.current);
                backgroundTimer.current = null;
            }
            teardownRealtimeSubscriptions();
        };
    }, [appReady, isAuthenticated]);
}
