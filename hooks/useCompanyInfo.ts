import { supabase } from "@/utils/supabase";

type CompanyInfoType = {
  company: string;
  mail: string;
  phone: string;
  address: string;
  website: string;
  logo_url?: string;
  description?: string;
};

const useCompanyInfo = async ({
  company,
  mail,
  phone,
  address,
  website,
  logo_url,
  description,
}: CompanyInfoType) => {
  try {
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return;
    }

    const userId = user.id;

    // Check if company info already exists for this user
    const { data: existing, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching company info:", fetchError);
      return;
    }

    if (existing) {
      // Update existing company info
      const updateData: any = { company, mail, phone, address, website };
      
      // Only include logo_url if provided
      if (logo_url !== undefined) {
        updateData.logo_url = logo_url;
      }
      
      // Only include description if provided
      if (description !== undefined) {
        updateData.description = description;
      }
      
      const { error: updateError } = await supabase
        .from("companies")
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating company info:", updateError);
      } else {
        console.log("Company info updated.");
      }
    } else {
      // Insert new company info
      const insertData: any = {
        user_id: userId,
        company,
        mail,
        phone,
        address,
        website,
      };
      
      // Only include logo_url if provided
      if (logo_url !== undefined) {
        insertData.logo_url = logo_url;
      }
      
      // Only include description if provided
      if (description !== undefined) {
        insertData.description = description;
      }
      
      const { error: insertError } = await supabase.from("companies").insert([insertData]);

      if (insertError) {
        console.error("Error inserting company info:", insertError);
      } else {
        console.log("Company info inserted.");
      }
    }
  } catch (error) {
    console.error("Unexpected error in useCompanyInfo:", error);
  }
};

export default useCompanyInfo;
