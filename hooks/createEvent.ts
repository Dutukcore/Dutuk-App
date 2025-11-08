import getCompanyInfo from "@/hooks/useGetCompanyInfo";
import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type CreateEventPayload = {
  event: string;
  description?: string;
  payment?: number;
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
    const user = await getUser();
    if (!user) {
      throw new Error("No authenticated user");
    }

    const companyInfo = await getCompanyInfo();
    const companyName = companyInfo?.company || "My Company";

    const dateArray = payload.endDate && payload.endDate.length > 0
      ? [payload.startDate, payload.endDate]
      : [payload.startDate];

    if (!payload.event?.trim()) {
      throw new Error("Event title is required");
    }

    if (!payload.startDate) {
      throw new Error("Start date is required");
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        vendor_id: user.id,
        company_name: companyName,
        customer_id: payload.customerId || user.id,
        customer_name: payload.customerName || null,
        event: payload.event.trim(),
        description: payload.description?.trim() || null,
        date: dateArray,
        payment: payload.payment ?? 0,
        status: payload.status || "upcoming",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export default createEvent;

