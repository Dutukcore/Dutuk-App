// Calendar components
export { default as UnifiedCalendar } from './components/UnifiedCalendar';

// Calendar hooks
export { removeDate, storeDateWithStatus, toggleDateStatus } from './hooks/useStoreDates';
export { default as getStoredDates } from './hooks/getStoredDates';
export type { StoredDate } from './hooks/getStoredDates';

// Calendar utils
export { buildAvailabilityMarkedDates, mergeAvailabilityWithEvents, buildOrderBookingMarkedDates } from './utils/calendarAvailability';
export type { MarkedDate, MarkedDatesMap } from './utils/calendarAvailability';
