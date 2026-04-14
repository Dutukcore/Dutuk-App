/**
 * Shared Calendar Availability Logic
 * This is the single source of truth for how availability/unavailability is computed
 * and displayed across the app.
 * 
 * DO NOT duplicate this logic - import and use this utility.
 */

import { StoredDate } from "@/store/useVendorStore";

export interface MarkedDate {
  unavailable?: boolean;
  available?: boolean;
  hasEvent?: boolean;
  eventColor?: string;
  selected?: boolean;
}

export interface MarkedDatesMap {
  [date: string]: MarkedDate;
}

/**
 * Converts calendar dates (from database/storage) to marked dates format for UnifiedCalendar
 * This is the SINGLE SOURCE OF TRUTH for availability interpretation
 * 
 * @param calendarDates - Array of stored dates with status (available/unavailable)
 * @returns Object with date strings as keys and MarkedDate as values
 */
export function buildAvailabilityMarkedDates(calendarDates: StoredDate[]): MarkedDatesMap {
  const markedDates: MarkedDatesMap = {};

  calendarDates.forEach((calDate) => {
    if (calDate.status === 'unavailable') {
      markedDates[calDate.date] = {
        unavailable: true,
      };
    } else if (calDate.status === 'available') {
      markedDates[calDate.date] = {
        available: true,
      };
    }
  });

  return markedDates;
}

/**
 * Merges availability data with event markers
 * Use this when you need to show both availability AND events on the same calendar
 * 
 * @param availabilityMarkedDates - Marked dates from buildAvailabilityMarkedDates
 * @param eventMarkedDates - Event markers to overlay
 * @returns Merged object preserving both availability and event data
 */
export function mergeAvailabilityWithEvents(
  availabilityMarkedDates: MarkedDatesMap,
  eventMarkedDates: MarkedDatesMap
): MarkedDatesMap {
  const merged: MarkedDatesMap = { ...availabilityMarkedDates };

  // Overlay event markers on top of availability
  Object.keys(eventMarkedDates).forEach((dateKey) => {
    merged[dateKey] = {
      ...merged[dateKey], // Preserve availability if it exists
      ...eventMarkedDates[dateKey], // Add event markers
    };
  });

  return merged;
}

/**
 * Creates marked dates for Orders pages - ONLY the user-selected booking date
 * NO availability or unavailability information
 * 
 * @param bookingDateString - The date string in YYYY-MM-DD format
 * @param eventColor - Color for the event indicator (default: maroon #800000)
 * @returns Object with only the booking date marked
 */
export function buildOrderBookingMarkedDates(
  bookingDateString: string,
  eventColor: string = '#800000'
): MarkedDatesMap {
  return {
    [bookingDateString]: {
      hasEvent: true,
      eventColor: eventColor,
    },
  };
}
