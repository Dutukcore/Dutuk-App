import logger from '@/lib/logger';
import { storage } from '@/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CalendarDateStatus = 'available' | 'unavailable';

export interface CalendarDate {
  date: string; // Format: YYYY-MM-DD
  status: CalendarDateStatus;
  event?: string;
  description?: string;
}

const CALENDAR_STORAGE_KEY = '@dutuk_calendar_dates';

// ─── Low-level helpers that transparently handle MMKV vs AsyncStorage ────────

const readRaw = async (): Promise<string | null> => {
  if (storage) {
    return storage.getString(CALENDAR_STORAGE_KEY) ?? null;
  }
  return AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
};

const writeRaw = async (value: string): Promise<void> => {
  if (storage) {
    storage.set(CALENDAR_STORAGE_KEY, value);
  } else {
    await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, value);
  }
};

const deleteRaw = async (): Promise<void> => {
  if (storage) {
    storage.remove(CALENDAR_STORAGE_KEY);
  } else {
    await AsyncStorage.removeItem(CALENDAR_STORAGE_KEY);
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all stored calendar dates
 */
export const getCalendarDates = async (): Promise<CalendarDate[]> => {
  try {
    const jsonValue = await readRaw();
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    logger.error('Error reading calendar dates:', error);
    return [];
  }
};

/**
 * Save calendar dates
 */
export const saveCalendarDates = async (dates: CalendarDate[]): Promise<void> => {
  try {
    await writeRaw(JSON.stringify(dates));
  } catch (error) {
    logger.error('Error saving calendar dates:', error);
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
      dates[existingIndex] = { date, status, event, description };
    } else {
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
      const newStatus: CalendarDateStatus =
        existingDate.status === 'available' ? 'unavailable' : 'available';
      await setCalendarDate(date, newStatus, existingDate.event, existingDate.description);
      return newStatus;
    } else {
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
 * Clear all calendar dates (for testing/reset)
 */
export const clearAllCalendarDates = async (): Promise<void> => {
  try {
    await deleteRaw();
  } catch (error) {
    logger.error('Error clearing calendar dates:', error);
  }
};
