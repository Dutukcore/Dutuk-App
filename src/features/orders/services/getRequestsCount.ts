import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

const getCount = async(id: string) => {
    try {
        // First get the company name
        const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("company")
            .eq("user_id", id)
            .single();

        if (companyError || !companyData?.company) {
            logger.log("Company lookup error:", companyError);
            return 0;
        }

        // Then get the count of requests (more efficient than selecting all data)
        const { count, error: requestsError } = await supabase
            .from("requests")
            .select("*", { count: 'exact', head: true })
            .eq("company_name", companyData.company);

        if (requestsError) {
            logger.error("Requests count error:", requestsError);
            return 0;
        }

        return count || 0;
    } catch (error) {
        logger.error("Error getting requests count:", error);
        return 0;
    }
}
export default getCount;