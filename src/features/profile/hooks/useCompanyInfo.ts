import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";
import { useAuthStore } from '@/store/useAuthStore';
import { useVendorStore } from '@/store/useVendorStore';

type CompanyInfoType = {
  company: string;
  mail: string;
  phone: string;
  address: string;
  website: string;
  logo_url?: string;
  description?: string;
  category?: string[];
  service_area?: string;
};

const useCompanyInfo = async ({
  company,
  mail,
  phone,
  address,
  website,
  logo_url,
  description,
  category,
  service_area,
}: CompanyInfoType) => {
  try {
    const userId = useAuthStore.getState().userId;

    if (!userId) {
      logger.error("No authenticated user ID found in store.");
      return;
    }

    // Check if company info already exists for this user
    const { data: existing, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      logger.error("Error fetching company info:", fetchError);
      return;
    }

    if (existing) {
      // Update existing company info
      const updateData: any = { company, mail, phone, address, website };

      if (logo_url !== undefined) updateData.logo_url = logo_url;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (service_area !== undefined) updateData.service_area = service_area;

      const { error: updateError } = await supabase
        .from("companies")
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) {
        logger.error("Error updating company info:", updateError);
      } else {
        logger.log("Company info updated.");
        // Refresh store
        await useVendorStore.getState().fetchCompany();
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

      if (logo_url !== undefined) insertData.logo_url = logo_url;
      if (description !== undefined) insertData.description = description;
      if (category !== undefined) insertData.category = category;
      if (service_area !== undefined) insertData.service_area = service_area;

      const { error: insertError } = await supabase.from("companies").insert([insertData]);

      if (insertError) {
        logger.error("Error inserting company info:", insertError);
      } else {
        logger.log("Company info inserted.");
        // Refresh store
        await useVendorStore.getState().fetchCompany();
      }
    }
  } catch (error) {
    logger.error("Unexpected error in useCompanyInfo:", error);
  }
};

export default useCompanyInfo;
