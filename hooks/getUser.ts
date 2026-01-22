import { supabase } from "@/utils/supabase";

const getUser = async() => {
    try {
        // First try to get user from existing session (faster, no network call)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
            return session.user;
        }
        
        // If no session, try getUser with a longer timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('User fetch timeout')), 10000)
        );
        
        const userPromise = supabase.auth.getUser();
        
        const { data: { user }, error: authError } = await Promise.race([
            userPromise, 
            timeoutPromise
        ]) as any;
    
        if (authError) {
            console.error("Authentication error:", authError);
            return null;
        }
    
        return user;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }        
}
export default getUser;