export type PricingType = 'fixed' | 'range' | 'custom';

export type PriceUnit = 'per_event' | 'per_day' | 'per_plate' | 'per_person' | 'per_hour' | 'lumpsum';

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
    per_event: 'per event',
    per_day: 'per day',
    per_plate: 'per plate',
    per_person: 'per person',
    per_hour: 'per hour',
    lumpsum: 'lumpsum',
};

export const PRICE_UNIT_OPTIONS: { value: PriceUnit; label: string }[] = [
    { value: 'per_event', label: 'Per Event' },
    { value: 'per_day', label: 'Per Day' },
    { value: 'per_plate', label: 'Per Plate' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'lumpsum', label: 'Lumpsum' },
];

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
    fixed: 'Fixed',
    range: 'Range',
    custom: 'Custom',
};

export interface PricingItem {
    id?: string;         // UUID from DB (absent for new items)
    tempId?: string;     // client-side temp ID for new items
    label: string;
    pricing_type: PricingType;
    price?: number;      // for 'fixed'
    price_min?: number;  // for 'range'
    price_max?: number;  // for 'range'
    price_unit: PriceUnit;
    custom_note?: string; // for 'custom'
    sort_order: number;
}

export const createEmptyPricingItem = (sortOrder: number): PricingItem => ({
    tempId: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    pricing_type: 'fixed',
    price: undefined,
    price_min: undefined,
    price_max: undefined,
    price_unit: 'per_event',
    custom_note: '',
    sort_order: sortOrder,
});

/**
 * Format a pricing item into a human-readable string using INR locale.
 */
export const formatINR = (amount: number): string =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

export const formatPricingItem = (item: PricingItem): string => {
    const unit = PRICE_UNIT_LABELS[item.price_unit] || item.price_unit;
    switch (item.pricing_type) {
        case 'fixed':
            return item.price != null ? `${formatINR(item.price)} ${unit}` : '—';
        case 'range':
            if (item.price_min != null && item.price_max != null) {
                return `${formatINR(item.price_min)} – ${formatINR(item.price_max)} ${unit}`;
            }
            if (item.price_min != null) {
                return `From ${formatINR(item.price_min)} ${unit}`;
            }
            return '—';
        case 'custom':
            return item.custom_note?.trim() || 'Contact for pricing';
        default:
            return '—';
    }
};

/**
 * Calculate backward-compatible payment value from pricing items.
 * Fixed → exact price; Range → minimum; Custom → 0.
 */
export const calculateCompatPayment = (items: PricingItem[]): number =>
    items.reduce((sum, item) => {
        if (item.pricing_type === 'fixed') return sum + (item.price || 0);
        if (item.pricing_type === 'range') return sum + (item.price_min || 0);
        return sum;
    }, 0);
