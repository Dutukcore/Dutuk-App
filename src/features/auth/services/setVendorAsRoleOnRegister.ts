import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Creates vendor profile and company entry for a user
 * This function ensures both user_profiles and companies tables are populated
 *
 * @param companyName - Optional company name
 * @param userArg - Optional user object to avoid race conditions with store hydration
 * @returns Promise<boolean> - Returns true if entries were created/already exist, false on error
 */
const setRole = async (companyName?: string | null, userArg?: any): Promise<boolean> => {
  try {
    const user = userArg || useAuthStore.getState().user;

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

    // Step 2: Ensure companies entry exists (idempotent upsert).
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("company")
      .eq("user_id", user.id)
      .single();

    const defaultCompanyName = companyName || user.user_metadata?.full_name || "My Company";

    const { error: upsertError } = await supabase
      .from("companies")
      .upsert(
        {
          user_id: user.id,
          company: existingCompany?.company || defaultCompanyName,
          mail: user.email,
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );

    if (upsertError) {
      logger.error("Error upserting company entry:", upsertError.message);
      return false;
    }

    logger.log("Company entry ensured for vendor");
    return true;
  } catch (error) {
    logger.error("Unexpected error in setRole");
    return false;
  }
};

export default setRole;
