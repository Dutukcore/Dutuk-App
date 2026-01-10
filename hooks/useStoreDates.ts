import { supabase } from "@/utils/supabase";

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
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return false;
    }

    const userId = user.id;

    // Check if date already exists for this user
    const { data: existing, error: fetchError } = await supabase
      .from("dates")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing date:", fetchError);
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
        console.error("Error updating date:", updateError);
        return false;
      }
      console.log(`Date ${date} updated to ${status}`);
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
        console.error("Error inserting date:", insertError);
        return false;
      }
      console.log(`Date ${date} inserted as ${status}`);
    }

    return true;
  } catch (e) {
    console.error("Error in storeDateWithStatus:", e);
    return false;
  }
};

/**
 * Remove a date entry from the database
 */
const removeDate = async (date: string): Promise<boolean> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return false;
    }

    const { error: deleteError } = await supabase
      .from("dates")
      .delete()
      .eq("user_id", user.id)
      .eq("date", date);

    if (deleteError) {
      console.error("Error removing date:", deleteError);
      return false;
    }

    console.log(`Date ${date} removed successfully`);
    return true;
  } catch (e) {
    console.error("Error in removeDate:", e);
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