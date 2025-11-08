import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type UpdateEventPayload = {
  event?: string;
  description?: string | null;
  status?: EventStatus;
  payment?: number;
  date?: string[];
  image_url?: string | null;
  banner_url?: string | null;
};

const updateEvent = async (eventId: string, payload: UpdateEventPayload) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const user = await getUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const updates: UpdateEventPayload & { updated_at?: string } = { ...payload };
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("vendor_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export default updateEvent;

