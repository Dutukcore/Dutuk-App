import { maskEmail } from '@/features/auth/hooks/authHelpers';
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

    // Try to sign in with a dummy password to check if user exists
    // This is a quick check - if user doesn't exist, we get a specific error
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: "dummy_check_password_12345", // This will fail, but error tells us if user exists
    });

    if (error) {
      const message = error.message.toLowerCase();

      // If error mentions "invalid login credentials", user exists but password was wrong
      if (message.includes("invalid login credentials") || message.includes("invalid password")) {
        logger.log("User exists (invalid credentials error):", maskEmail(trimmedEmail));
        return { exists: true, error: null };
      }

      // If error mentions "user not found" or "email not found", user doesn't exist
      if (message.includes("user not found") || message.includes("not found")) {
        logger.log("User does not exist:", maskEmail(trimmedEmail));
        return { exists: false, error: null };
      }

      // For "email not confirmed", user exists but hasn't verified email
      if (message.includes("email not confirmed") || message.includes("not verified")) {
        logger.log("User exists but email not confirmed:", maskEmail(trimmedEmail));
        return { exists: true, error: null };
      }

      // Other errors - assume user doesn't exist to allow registration attempt
      logger.log("Ambiguous error, assuming user doesn't exist:", error);
      return { exists: false, error: null };
    }

    // If somehow login succeeded (shouldn't happen with dummy password), user exists
    if (data?.user) {
      // Sign out immediately
      await supabase.auth.signOut();
      return { exists: true, error: null };
    }

    return { exists: false, error: null };
  } catch (error) {
    logger.error("Unexpected error checking user existence:", error);
    // On error, allow registration to proceed
    return { exists: false, error: null };
  }
};

export default checkUserExists;
