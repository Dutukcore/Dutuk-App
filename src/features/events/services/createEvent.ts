import { saveEventPricing } from '@/features/events/hooks/useEventPricing';
import { useAuthStore } from '@/store/useAuthStore';
import { useVendorStore } from '@/store/useVendorStore';
import { calculateCompatPayment, PricingItem } from '@/types/pricing';
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type CreateEventPayload = {
  event: string;
  description?: string;
  /** @deprecated Pass pricingItems instead. Only used as fallback if pricingItems is empty. */
  payment?: number;
  pricingItems?: PricingItem[];
  status?: EventStatus;
  startDate: string;
  endDate?: string;
  customerId?: string;
  customerName?: string;
  image_url?: string;
  banner_url?: string;
};

const createEvent = async (payload: CreateEventPayload) => {
  try {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      throw new Error("No authenticated user");
    }

    const companyName = useVendorStore.getState().company?.company || "My Company";

    const dateArray = payload.endDate && payload.endDate.length > 0
      ? [payload.startDate, payload.endDate]
      : [payload.startDate];

    if (!payload.event?.trim()) {
      throw new Error("Event title is required");
    }

    if (!payload.startDate) {
      throw new Error("Start date is required");
    }

    // Calculate backward-compat payment from pricing items
    const compatPayment = payload.pricingItems && payload.pricingItems.length > 0
      ? calculateCompatPayment(payload.pricingItems)
      : (payload.payment ?? 0);

    const { data, error } = await supabase
      .from("events")
      .insert({
        vendor_id: userId,
        company_name: companyName,
        customer_id: payload.customerId || userId,
        customer_name: payload.customerName || null,
        event: payload.event.trim(),
        description: payload.description?.trim() || null,
        date: dateArray,
        payment: compatPayment,
        status: payload.status || "upcoming",
        image_url: payload.image_url || null,
        banner_url: payload.banner_url || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Save pricing items to the child table (trigger will sync summary to events)
    if (data && payload.pricingItems && payload.pricingItems.length > 0) {
      await saveEventPricing(data.id, payload.pricingItems);
    }

    return data;
  } catch (error) {
    logger.error("Error creating event:", error);
    throw error;
  }
};

export default createEvent;
