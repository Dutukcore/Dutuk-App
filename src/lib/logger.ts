/**
 * Production-safe logger utility
 * Only outputs to console in development mode (__DEV__)
 * Prevents sensitive data from leaking in production builds
 */
const logger = {
    log: (...args: any[]) => {
        if (__DEV__) console.log(...args);
    },
    warn: (...args: any[]) => {
        if (__DEV__) console.warn(...args);
    },
    error: (...args: any[]) => {
        if (__DEV__) console.error(...args);
    },
};

export default logger;
