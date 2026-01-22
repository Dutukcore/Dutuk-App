import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const getAllEvents = async () => {
    try {
        const user = await getUser();
        if (!user) {
            // Silently return empty - user may not be authenticated yet
            return [];
        }

        const { data: events, error } = await supabase
            .from("events")
            .select("*")
            .eq("vendor_id", user.id)
            .order("start_date", { ascending: true });

        if (error) {
            console.error("Error fetching all events:", error);
            return [];
        }

        return events || [];
    } catch (e) {
        console.error("Exception fetching all events:", e);
        return [];
    }
};

export default getAllEvents;
