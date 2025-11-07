import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getPastEvents = async () => {
    try {
        const user = await getUser();
        if (!user) {
            console.error("No authenticated user");
            return [];
        }

        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("vendor_id", user.id)
            .eq("status", "completed")
            .order("end_date", { ascending: false });

        if (error) {
            console.error("Error fetching past events:", error);
            return [];
        }

        return events || [];
    } catch (e) {
        console.error("Exception fetching past events:", e);
        return [];
    }
};

export default getPastEvents;