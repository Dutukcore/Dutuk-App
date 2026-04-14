import { formatPricingItem, PricingItem } from '@/types/pricing';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PricingItemDisplayProps {
    item: PricingItem;
}

const PricingItemDisplay: React.FC<PricingItemDisplayProps> = ({ item }) => {
    const isCustom = item.pricing_type === 'custom';

    return (
        <View style={styles.row}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={[styles.value, isCustom && styles.customValue]}>
                {formatPricingItem(item)}
            </Text>
        </View>
    );
};

interface PricingListDisplayProps {
    items: PricingItem[];
}

export const PricingListDisplay: React.FC<PricingListDisplayProps> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <View style={styles.list}>
            {items.map((item, i) => (
                <PricingItemDisplay key={item.id || item.tempId || String(i)} item={item} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    labelContainer: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#57534e',
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
        color: '#800000',
        textAlign: 'right',
        flexShrink: 1,
    },
    customValue: {
        color: '#57534e',
        fontStyle: 'italic',
        fontWeight: '500',
    },
});

export default PricingItemDisplay;
