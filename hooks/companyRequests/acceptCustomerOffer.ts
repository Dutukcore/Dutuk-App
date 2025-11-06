import { supabase } from "@/utils/supabase";

type companyRequestProp = {
    customerId:string,
    companyName:string,
    date:string[],
    eventName:string,
    eventDescription:string,
    payment:number
}
const acceptCustomerRequest = async(data:companyRequestProp)=>{
    try {
        // Get current user (vendor)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error("Authentication error:", authError);
            return false;
        }
        
        const {error:err} = await supabase.from("events").insert([
            {
                customer_id:data.customerId,
                company_name:data.companyName,
                vendor_id: user.id, // Add vendor_id
                date:data.date,
                event:data.eventName,
                description:data.eventDescription,
                payment:data.payment,
                status: 'upcoming' // Set initial status
            }
        ])
        if(err){
            console.error("Error Accepting Offer: ",err);
            return false;
        }
        else{
            console.log("Successfully Accepted offer");
            return true;
        }
    } catch (error) {
        console.error("Unexpected error accepting offer:", error);
        return false;
    }
}
export default acceptCustomerRequest;