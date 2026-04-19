import { LogBox } from 'react-native';
import logger from './logger';

let installed = false;

/**
 * Installs a global error handler that catches unhandled JS errors in release builds.
 * Without this, unhandled promise rejections from Supabase network calls etc. propagate
 * to the default handler which shows nothing and crashes the app silently.
 *
 * Call this ONCE, at the very top of app/_layout.tsx before anything else executes.
 * Leave a TODO here to wire up Sentry/Bugsnag when you're ready.
 */
export function installGlobalErrorHandler() {
    if (installed) return;
    installed = true;

    const errorUtils = (global as any).ErrorUtils;
    if (!errorUtils) return;

    const defaultHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((err: Error, isFatal?: boolean) => {
        logger.error('[GlobalError]', isFatal ? 'FATAL' : 'non-fatal', err?.message ?? err);
        // TODO: forward to Sentry / Bugsnag here
        if (defaultHandler) defaultHandler(err, isFatal);
    });

    // Silence known-benign warnings that pollute logs
    LogBox.ignoreLogs([
        'AsyncStorage has been extracted',
        'Non-serializable values were found in the navigation state',
    ]);
}
