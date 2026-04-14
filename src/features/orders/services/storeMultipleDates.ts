import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

const storeMultipleDates = async (dates: string[], event: string, description: string) => {
  let id = useAuthStore.getState().userId;
  dates.forEach(async (date) => {
    const { error: insertError } = await supabase.from("dates").insert([
      {
        user_id: id,
        date,
        event,
        description
      },
    ]);
    if (insertError) {
      logger.error("Error inserting Date:" + date + "\n" + insertError);
      return false;
    } else {
      logger.log("Date inserted." + date);
    }
  })
  return true;
}
export default storeMultipleDates;