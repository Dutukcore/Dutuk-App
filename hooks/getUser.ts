import { supabase } from "@/utils/supabase";

const getUser = async()=>{
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
            
                return user;
        }
        catch(e){
            console.error(e);
        }        
}
export default getUser;