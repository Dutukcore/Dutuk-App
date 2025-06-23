import { supabase } from "@/utils/supabase";

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
          console.error("Authentication error:", authError);
          return;
        }
        const userId = user.id;
        const {error:err} = await supabase
        .from("dates")
        .update({event:data.eventName,description:data.eventDescription})
        .eq("user_id",userId)
        .eq("date",data.date);

        if(err){
            console.error(err.message);
        }

    }
    catch(e){
        console.error(e);
    }
}
export default storeDatesInfo;