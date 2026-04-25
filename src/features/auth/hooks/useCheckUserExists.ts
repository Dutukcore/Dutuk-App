import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

/**
 * Check if a user with given email already exists in the system
 * Uses password reset request as a way to check if email exists
 * 
 * @param email - The email address to check
 * @returns Promise<{exists: boolean, error: string | null}>
 */
const checkUserExists = async (
  email: string
): Promise<{ exists: boolean; error: string | null }> => {
  try {
    if (!email || !email.trim()) {
      return { exists: false, error: "Email is required" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Call the dedicated RPC to check if email exists
    // This is safer than signInWithPassword as it doesn't trigger rate limits or disclose passwords
    const { data, error } = await supabase.rpc('check_email_exists', {
      email_to_check: trimmedEmail
    });

    if (error) {
      logger.error("Error calling check_email_exists RPC:", error);
      // Fallback or handle error - return exists: false to avoid blocking registration
      return { exists: false, error: null };
    }

    return { exists: !!data, error: null };
  } catch (error) {
    logger.error("Unexpected error checking user existence:", error);
    // On error, allow registration to proceed
    return { exists: false, error: null };
  }
};

export default checkUserExists;
