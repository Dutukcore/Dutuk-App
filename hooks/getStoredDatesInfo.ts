import { supabase } from "@/utils/supabase";

type storeDatesInfoType = {
    date:string
}

const getStoreDatesInfo= async(data:storeDatesInfoType)=>{
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
        const {data:d,error:err} = await supabase
        .from("dates")
        .select("event,description")
        .eq("user_id",userId)
        .eq("date",data.date);

        if(err){
            console.error(err.message);
        }
        if(d!==null){
            return d[0];
        }
        else{
            console.error("NO data found");
        }

    }
    catch(e){
        console.error(e);
    }
}
export default getStoreDatesInfo;