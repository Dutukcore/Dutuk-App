import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

const deleteEvent = async (eventId: string) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const userId = useAuthStore.getState().userId;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("vendor_id", userId);

    if (error) {
      throw error;
    }

    // Refresh the vendor store events after deletion
    const { useVendorStore } = require('@/store/useVendorStore');
    await useVendorStore.getState().fetchEvents();

    return true;
  } catch (error) {
    logger.error("Error deleting event:", error);
    throw error;
  }
};

export default deleteEvent;

