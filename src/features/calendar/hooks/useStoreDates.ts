import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

export type DateStatus = 'available' | 'unavailable';

export interface DateEntry {
  date: string;
  status: DateStatus;
  event?: string;
  description?: string;
}

/**
 * Store or update a date's availability status in Supabase
 * If the date already exists, updates it. Otherwise, creates a new entry.
 */
const storeDateWithStatus = async (
  date: string,
  status: DateStatus,
  event?: string,
  description?: string
): Promise<boolean> => {
  try {
    // Get the current user from the store
    const userId = useAuthStore.getState().userId;

    if (!userId) {
      logger.error("No authenticated user found in store");
      return false;
    }

    // Check if date already exists for this user
    const { data: existing, error: fetchError } = await supabase
      .from("dates")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (fetchError) {
      logger.error("Error checking existing date:", fetchError);
      return false;
    }

    if (existing) {
      // Update existing date
      const { error: updateError } = await supabase
        .from("dates")
        .update({
          status,
          event: event || null,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("date", date);

      if (updateError) {
        logger.error("Error updating date:", updateError);
        return false;
      }
      logger.log(`Date ${date} updated to ${status}`);
    } else {
      // Insert new date
      const { error: insertError } = await supabase.from("dates").insert([
        {
          user_id: userId,
          date,
          status,
          event: event || null,
          description: description || null,
        },
      ]);

      if (insertError) {
        logger.error("Error inserting date:", insertError);
        return false;
      }
      logger.log(`Date ${date} inserted as ${status}`);
    }

    return true;
  } catch (e) {
    logger.error("Error in storeDateWithStatus:", e);
    return false;
  }
};

/**
 * Remove a date entry from the database
 */
const removeDate = async (date: string): Promise<boolean> => {
  try {
    // Get user id from store
    const userId = useAuthStore.getState().userId;

    if (!userId) {
      logger.error("No authenticated user found in store");
      return false;
    }

    const { error: deleteError } = await supabase
      .from("dates")
      .delete()
      .eq("user_id", userId)
      .eq("date", date);

    if (deleteError) {
      logger.error("Error removing date:", deleteError);
      return false;
    }

    logger.log(`Date ${date} removed successfully`);
    return true;
  } catch (e) {
    logger.error("Error in removeDate:", e);
    return false;
  }
};

/**
 * Toggle a date's status between available and unavailable
 */
const toggleDateStatus = async (
  date: string,
  currentStatus: DateStatus
): Promise<DateStatus | null> => {
  const newStatus: DateStatus = currentStatus === 'available' ? 'unavailable' : 'available';
  const success = await storeDateWithStatus(date, newStatus);
  return success ? newStatus : null;
};

export { removeDate, storeDateWithStatus, toggleDateStatus };
export default storeDateWithStatus;