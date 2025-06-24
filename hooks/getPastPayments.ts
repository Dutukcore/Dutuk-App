import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastPayments=async()=>{
    const user =await getUser();
    let id;
    if(user){
        id=user.id;
    }
    const { data: existing, error: fetchError } = await supabase
        .from("pastpayments")
        .select("*")
        .eq("user_id",id)
    if(existing){
        return existing;
    }
}
export default getPastPayments;