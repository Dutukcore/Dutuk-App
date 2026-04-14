import { supabase } from "@/lib/supabase";

const getReqMini = async(id:string)=>{
    const data = await supabase.from("requests").select("*").eq("id",id).single();
    return data.data;
}
export default getReqMini;