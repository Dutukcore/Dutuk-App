import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

const getCompanyInfo = async() =>{
    try{
    // Get the current user from the session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error("Authentication error:", authError);
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
        logger.error("Error fetching company info:", fetchError);
        return;
    }
    else{
        return existing;
    }
}
    catch(e){
        logger.error(e);
    }
}
export default getCompanyInfo;