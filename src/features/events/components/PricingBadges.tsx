import { formatINR, formatPricingItem, PricingItem } from '@/types/pricing';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PricingBadgesProps {
    /** Pricing items from events.pricing_summary (already loaded with the event) */
    pricingSummary?: PricingItem[] | null;
    /** Legacy payment value — shown if pricingSummary is empty/null */
    fallbackPayment?: number;
}

const PricingBadges: React.FC<PricingBadgesProps> = ({ pricingSummary, fallbackPayment }) => {
    const hasItems = pricingSummary && pricingSummary.length > 0;

    if (!hasItems) {
        // Backward compat: show legacy payment
        const amount = fallbackPayment ?? 0;
        return (
            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{formatINR(amount)}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.badgeRow}>
            {pricingSummary!.map((item, i) => {
                const isCustom = item.pricing_type === 'custom';
                return (
                    <View key={item.id || String(i)} style={[styles.badge, isCustom && styles.customBadge]}>
                        <Text
                            style={[styles.badgeText, isCustom && styles.customBadgeText]}
                            numberOfLines={1}
                        >
                            {item.label ? `${item.label}: ` : ''}
                            {isCustom ? 'Quote' : formatPricingItem(item)}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        backgroundColor: '#80000012',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(128,0,0,0.12)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#800000',
    },
    customBadge: {
        backgroundColor: '#57534e12',
        borderColor: 'rgba(87,83,78,0.15)',
    },
    customBadgeText: {
        color: '#57534e',
        fontStyle: 'italic',
        fontWeight: '500',
    },
});

export default PricingBadges;
