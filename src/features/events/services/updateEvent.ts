import { saveEventPricing } from '@/features/events/hooks/useEventPricing';
import { useAuthStore } from '@/store/useAuthStore';
import { calculateCompatPayment, PricingItem } from '@/types/pricing';
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type UpdateEventPayload = {
  event?: string;
  description?: string | null;
  status?: EventStatus;
  /** Auto-calculated from pricingItems if provided; kept for backward compat */
  payment?: number;
  date?: string[];
  image_url?: string | null;
  banner_url?: string | null;
  /** New pricing items to save to the child table */
  pricingItems?: PricingItem[];
};

const updateEvent = async (eventId: string, payload: UpdateEventPayload) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const userId = useAuthStore.getState().userId;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    // Build the DB update object (exclude pricingItems — that goes to the child table)
    const { pricingItems, ...dbPayload } = payload;

    // If pricing items are provided, recalculate backward-compat payment
    if (pricingItems && pricingItems.length > 0) {
      dbPayload.payment = calculateCompatPayment(pricingItems);
    }

    const updates: typeof dbPayload & { updated_at?: string } = { ...dbPayload };
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("vendor_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Save pricing items to child table (trigger syncs summary back to events)
    if (pricingItems && pricingItems.length > 0) {
      await saveEventPricing(eventId, pricingItems);
    }

    // Refresh the vendor store events after update
    const { useVendorStore } = require('@/store/useVendorStore');
    await useVendorStore.getState().fetchEvents();

    return data;
  } catch (error) {
    logger.error("Error updating event:", error);
    throw error;
  }
};

export default updateEvent;
