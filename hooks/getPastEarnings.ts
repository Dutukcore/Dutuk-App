import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastEarnings=async()=>{
    const user =await getUser();
    let id;
    if(user){
        id=user.id;
    }
    const { data: existing, error: fetchError } = await supabase
        .from("pastearnings")
        .select("*")
        .eq("user_id",id)
    if(existing){
        return existing;
    }
}
export default getPastEarnings;