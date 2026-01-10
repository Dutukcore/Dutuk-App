import { supabase } from "@/utils/supabase";

export interface StoredDate {
  date: string;
  status: 'available' | 'unavailable';
  event?: string;
  description?: string;
}

/**
 * Fetch all stored availability dates for the current vendor from Supabase
 * Returns dates with their availability status
 */
const getStoredDates = async (): Promise<StoredDate[] | undefined> => {
  try {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return undefined;
    }

    const userId = user.id;

    const { data: dates, error: fetchError } = await supabase
      .from("dates")
      .select("date, status, event, description")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching dates:", fetchError);
      return undefined;
    }

    // Transform to StoredDate format
    const storedDates: StoredDate[] = (dates || []).map((d) => ({
      date: d.date,
      status: (d.status as 'available' | 'unavailable') || 'unavailable',
      event: d.event || undefined,
      description: d.description || undefined,
    }));

    console.log("Fetched dates from Supabase:", storedDates);
    return storedDates;
  } catch (e) {
    console.error("Error in getStoredDates:", e);
    return undefined;
  }
};

export default getStoredDates;