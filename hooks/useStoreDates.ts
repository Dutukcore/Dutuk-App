import { supabase } from "@/utils/supabase";



const storeDates = async(date:string)=>{
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
      .select("*")
      .eq("user_id", userId);

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching Dates info:", fetchError);
      return;
    }
    const doesExist = existing?.some((item)=>item.date ===date && item.user_id ===userId)
    if (doesExist) {
      const { error: updateError } = await supabase
        .from("dates")
        .delete()
        .eq("user_id", userId)
        .eq("date",date)
        ;

      if (updateError) {
        console.error("Error removing Date:", updateError);
      } else {
        console.log("Date successfully removed.");
      }
    }
    else{
    
         const { error: insertError } = await supabase.from("dates").insert([
        {
          user_id: userId,
          date
        },
      ]);
      if (insertError) {
        console.error("Error inserting Date:", insertError);
      } else {
        console.log("Date inserted.");
      }
    }
}
catch(e){
    console.error(e);
}
}
export default storeDates;