import { supabase } from "@/lib/supabase";

const getReqs = async(id:string)=>{
    const result = await supabase.from("companies").select("company").eq("user_id",id).single();
    const companyName = result.data?.company;
    const data = await supabase.from("requests").select("*").eq("company_name",companyName);
    return data.data;
}
export default getReqs;