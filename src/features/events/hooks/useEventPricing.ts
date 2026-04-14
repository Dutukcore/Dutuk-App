import { PricingItem } from '@/types/pricing';
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';

/**
 * Fetch ordered pricing items for a specific event.
 * Returns [] if the event has no pricing items yet (legacy events).
 */
export const getEventPricing = async (eventId: string): Promise<PricingItem[]> => {
    const { data, error } = await supabase
        .from('event_pricing_items')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

    if (error) {
        logger.error('Error fetching event pricing:', error);
        return [];
    }
    return (data || []) as PricingItem[];
};

/**
 * Save pricing items for an event using a delete-and-replace strategy.
 * The DB trigger will auto-sync pricing_summary, total_min_budget,
 * total_max_budget, has_custom_pricing, and the legacy payment column.
 */
export const saveEventPricing = async (
    eventId: string,
    items: PricingItem[],
): Promise<boolean> => {
    try {
        // 1. Delete existing pricing items for this event
        const { error: deleteError } = await supabase
            .from('event_pricing_items')
            .delete()
            .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        // 2. Insert new items (if any)
        if (items.length > 0) {
            const rows = items.map((item, index) => ({
                event_id: eventId,
                label: item.label.trim(),
                pricing_type: item.pricing_type,
                price: item.pricing_type === 'fixed' ? (item.price ?? null) : null,
                price_min: item.pricing_type === 'range' ? (item.price_min ?? null) : null,
                price_max: item.pricing_type === 'range' ? (item.price_max ?? null) : null,
                price_unit: item.price_unit,
                custom_note:
                    item.pricing_type === 'custom' ? (item.custom_note?.trim() || null) : null,
                sort_order: index,
            }));

            const { error: insertError } = await supabase
                .from('event_pricing_items')
                .insert(rows);

            if (insertError) throw insertError;
        }

        return true;
    } catch (error) {
        logger.error('Error saving event pricing:', error);
        throw error;
    }
};
