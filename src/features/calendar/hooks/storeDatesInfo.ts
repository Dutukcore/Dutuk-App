import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

type storeDatesInfoType = {
    date:string,
    eventName:string,
    eventDescription:string
}

const storeDatesInfo= async(data:storeDatesInfoType)=>{
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
        const {error:err} = await supabase
        .from("dates")
        .update({event:data.eventName,description:data.eventDescription})
        .eq("user_id",userId)
        .eq("date",data.date);

        if(err){
            logger.error(err.message);
        }

    }
    catch(e){
        logger.error(e);
    }
}
export default storeDatesInfo;