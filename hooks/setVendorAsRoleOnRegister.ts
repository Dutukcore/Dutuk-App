import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

/**
 * Creates a vendor company entry for a user in companies table
 * This function checks if the company entry exists and creates one if not
 * Used for vendor registration from this app
 * 
 * @param companyName - Optional company name (used for Google OAuth with user's display name)
 * @returns Promise<boolean> - Returns true if company was created/already exists, false on error
 */
const setRole = async (companyName?: string | null): Promise<boolean> => {
  try {
    const user = await getUser();

    if (!user) {
      console.error("No user found when attempting to create company entry");
      return false;
    }

    // Check if company entry already exists in companies table
    const { data: existingCompany, error: fetchError } = await supabase
      .from("companies")
      .select("id, user_id, company")
      .eq("user_id", user.id)
      .single();

    // PGRST116 means "Result contains 0 rows" - this is expected for new users
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Unexpected fetch error from companies:", fetchError);
      return false;
    }

    // If company doesn't exist, create one
    if (!existingCompany) {
      console.log("Creating new company entry for vendor user:", user.id);
      
      // Use provided company name or user's email as fallback
      const defaultCompanyName = companyName || user.user_metadata?.full_name || null;
      
      const { error: insertError } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          company: defaultCompanyName || "My Company", // Use provided name or default
          mail: user.email,
        });

      if (insertError) {
        console.error("Error inserting company entry:", insertError);
        return false;
      }

      console.log("Successfully created company entry for vendor:", user.id);
      return true;
    }

    // Company already exists
    console.log("Company entry already exists:", existingCompany.company);
    return true;
  } catch (error) {
    console.error("Unexpected error in setRole:", error);
    return false;
  }
};

export default setRole;
