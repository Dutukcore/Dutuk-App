import logger from '@/lib/logger';
import { useVendorStore } from '@/store/useVendorStore';
import { useEffect } from 'react';

/**
 * useOrdersPolling
 *
 * Fallback safety net: when the realtime socket is not in a healthy SUBSCRIBED
 * state for more than 10 seconds, starts a 15-second polling loop that calls
 * fetchOrders() until realtime recovers or the component unmounts.
 *
 * This prevents a dead socket from ever leaving the vendor with stale order data.
 */
export function useOrdersPolling() {
    const realtimeStatus = useVendorStore((s) => s.realtimeStatus);

    useEffect(() => {
        let pollInterval: ReturnType<typeof setInterval> | null = null;
        if (realtimeStatus === 'SUBSCRIBED') return;

        logger.log(`Realtime is ${realtimeStatus} — polling fallback will activate in 3s`);

        // Wait 3s before starting the polling loop (give realtime time to recover)
        const activationTimer = setTimeout(() => {
            if (useVendorStore.getState().realtimeStatus === 'SUBSCRIBED') return;

            logger.warn('Realtime unhealthy for >3s — starting fallback poll every 8s');
            pollInterval = setInterval(() => {
                if (useVendorStore.getState().realtimeStatus === 'SUBSCRIBED') {
                    logger.log('Realtime recovered — stopping fallback poll');
                    if (pollInterval) clearInterval(pollInterval);
                    pollInterval = null;
                    return;
                }
                useVendorStore.getState().fetchOrders().catch((e) =>
                    logger.warn('Polling fetchOrders failed:', e)
                );
            }, 8_000);
        }, 3_000);

        return () => {
            clearTimeout(activationTimer);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [realtimeStatus]);
}
