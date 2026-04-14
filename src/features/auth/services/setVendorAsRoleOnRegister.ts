import { useAuthStore } from "@/store/useAuthStore";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";

/**
 * Creates vendor profile and company entry for a user
 * This function ensures both user_profiles and companies tables are populated
 * Used for vendor registration from this app
 * 
 * @param companyName - Optional company name (used for Google OAuth with user's display name)
 * @returns Promise<boolean> - Returns true if entries were created/already exist, false on error
 */
const setRole = async (companyName?: string | null): Promise<boolean> => {
  try {
    const user = useAuthStore.getState().user;

    if (!user) {
      logger.error("No user found when attempting to create vendor profile");
      return false;
    }

    logger.log("Setting up vendor profile for user");

    // Step 1: Ensure user_profiles entry exists
    // Check if user profile already exists
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from("user_profiles")
      .select("id, user_id, role")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (profileFetchError && profileFetchError.code !== "PGRST116") {
      logger.error("Unexpected fetch error from user_profiles:", profileFetchError.message);
      return false;
    }

    // If profile doesn't exist, create one
    if (!existingProfile) {
      logger.log("Creating new user_profiles entry");

      const { error: profileInsertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          role: "vendor",
        });

      if (profileInsertError) {
        // Check if error is due to trigger already creating the profile (race condition)
        if (profileInsertError.code === "23505") {
          logger.log("User profile already exists (created by trigger), continuing...");
        } else {
          logger.error("Error inserting user_profiles entry:", profileInsertError.message);
          return false;
        }
      } else {
        logger.log("Successfully created user_profiles entry");
      }
    } else {
      logger.log("User profile already exists");
    }

    // Step 2: Ensure companies entry exists
    // Check if company entry already exists
    const { data: existingCompany, error: companyFetchError } = await supabase
      .from("companies")
      .select("id, user_id, company")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (companyFetchError && companyFetchError.code !== "PGRST116") {
      logger.error("Unexpected fetch error from companies:", companyFetchError.message);
      return false;
    }

    // If company doesn't exist, create one
    if (!existingCompany) {
      logger.log("Creating new company entry for vendor user");

      // Use provided company name or user's email as fallback
      const defaultCompanyName = companyName || user.user_metadata?.full_name || null;

      const { error: companyInsertError } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          company: defaultCompanyName || "My Company", // Use provided name or default
          mail: user.email,
        });

      if (companyInsertError) {
        logger.error("Error inserting company entry");
        return false;
      }

      logger.log("Successfully created company entry for vendor");
      return true;
    }

    // Company already exists
    logger.log("Company entry already exists");
    return true;
  } catch (error) {
    logger.error("Unexpected error in setRole");
    return false;
  }
};

export default setRole;
