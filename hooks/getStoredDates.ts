import { supabase } from "@/utils/supabase";

const getStoredDates = async()=>{
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
    
    
            const { data: existing, error: fetchError } = await supabase
          .from("dates")
          .select("date")
          .eq("user_id", userId);
    
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching company info:", fetchError);
          return;
        }
        console.log("Done")
        return existing;
    }
    catch(e){
        console.error(e);
    }
}
export default getStoredDates;