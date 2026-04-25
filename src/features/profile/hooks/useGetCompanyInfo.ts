import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";
import { useAuthStore } from '@/store/useAuthStore';

const getCompanyInfo = async () => {
    try {
        // Get the current user ID from the store
        const userId = useAuthStore.getState().userId;

        if (!userId) {
            logger.error("No authenticated user ID found in store in useGetCompanyInfo");
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
        else {
            return existing;
        }
    }
    catch (e) {
        logger.error(e);
    }
}
export default getCompanyInfo;