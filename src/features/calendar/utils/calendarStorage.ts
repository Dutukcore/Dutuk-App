import logger from '@/lib/logger';
import { storage } from '@/lib/storage';

export type CalendarDateStatus = 'available' | 'unavailable';

export interface CalendarDate {
  date: string; // Format: YYYY-MM-DD
  status: CalendarDateStatus;
  event?: string;
  description?: string;
}

const CALENDAR_STORAGE_KEY = '@dutuk_calendar_dates';

/**
 * Get all stored calendar dates from MMKV
 */
export const getCalendarDates = async (): Promise<CalendarDate[]> => {
  try {
    const jsonValue = storage.getString(CALENDAR_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    logger.error('Error reading calendar dates from MMKV:', error);
    return [];
  }
};

/**
 * Save calendar dates to MMKV
 */
export const saveCalendarDates = async (dates: CalendarDate[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(dates);
    storage.set(CALENDAR_STORAGE_KEY, jsonValue);
  } catch (error) {
    logger.error('Error saving calendar dates to MMKV:', error);
  }
};

/**
 * Add or update a calendar date
 */
export const setCalendarDate = async (
  date: string,
  status: CalendarDateStatus,
  event?: string,
  description?: string
): Promise<void> => {
  try {
    const dates = await getCalendarDates();
    const existingIndex = dates.findIndex((d) => d.date === date);

    if (existingIndex >= 0) {
      // Update existing date
      dates[existingIndex] = { date, status, event, description };
    } else {
      // Add new date
      dates.push({ date, status, event, description });
    }

    await saveCalendarDates(dates);
  } catch (error) {
    logger.error('Error setting calendar date:', error);
  }
};

/**
 * Remove a calendar date
 */
export const removeCalendarDate = async (date: string): Promise<void> => {
  try {
    const dates = await getCalendarDates();
    const filteredDates = dates.filter((d) => d.date !== date);
    await saveCalendarDates(filteredDates);
  } catch (error) {
    logger.error('Error removing calendar date:', error);
  }
};

/**
 * Get a specific calendar date
 */
export const getCalendarDate = async (date: string): Promise<CalendarDate | null> => {
  try {
    const dates = await getCalendarDates();
    return dates.find((d) => d.date === date) || null;
  } catch (error) {
    logger.error('Error getting calendar date:', error);
    return null;
  }
};

/**
 * Toggle date status (available <-> unavailable)
 */
export const toggleDateStatus = async (date: string): Promise<CalendarDateStatus> => {
  try {
    const existingDate = await getCalendarDate(date);

    if (existingDate) {
      // Toggle status
      const newStatus: CalendarDateStatus =
        existingDate.status === 'available' ? 'unavailable' : 'available';
      await setCalendarDate(date, newStatus, existingDate.event, existingDate.description);
      return newStatus;
    } else {
      // New date, default to unavailable
      await setCalendarDate(date, 'unavailable');
      return 'unavailable';
    }
  } catch (error) {
    logger.error('Error toggling date status:', error);
    return 'unavailable';
  }
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

/**
 * Clear all calendar dates (for testing/reset purposes)
 */
export const clearAllCalendarDates = async (): Promise<void> => {
  try {
    storage.delete(CALENDAR_STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing calendar dates from MMKV:', error);
  }
};
