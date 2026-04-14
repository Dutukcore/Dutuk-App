import {
    PRICE_UNIT_OPTIONS,
    PRICING_TYPE_LABELS,
    PricingItem,
    PricingType,
} from '@/types/pricing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface PricingItemEditorProps {
    item: PricingItem;
    onUpdate: (updatedItem: PricingItem) => void;
    onDelete: () => void;
    isOnlyItem: boolean;
}

const PRICING_TYPES: PricingType[] = ['fixed', 'range', 'custom'];

const TYPE_ICONS: Record<PricingType, any> = {
    fixed: 'pricetag-outline',
    range: 'git-compare-outline',
    custom: 'chatbubble-ellipses-outline',
};

const PricingItemEditor: React.FC<PricingItemEditorProps> = ({
    item,
    onUpdate,
    onDelete,
    isOnlyItem,
}) => {
    const update = (fields: Partial<PricingItem>) => onUpdate({ ...item, ...fields });

    return (
        <View style={styles.card}>
            {/* Header row: Label + Delete */}
            <View style={styles.headerRow}>
                <View style={styles.labelContainer}>
                    <Text style={styles.fieldLabel}>ITEM NAME</Text>
                    <TextInput
                        style={styles.labelInput}
                        value={item.label}
                        onChangeText={(text) => update({ label: text })}
                        placeholder="e.g. Venue, Catering, Decoration"
                        placeholderTextColor="#999"
                    />
                </View>
                {!isOnlyItem && (
                    <Pressable style={styles.deleteBtn} onPress={onDelete}>
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </Pressable>
                )}
            </View>

            <Text style={styles.fieldLabel}>PRICING TYPE</Text>
            <View style={styles.typeRow}>
                {PRICING_TYPES.map((type) => (
                    <Pressable
                        key={type}
                        style={[styles.typeChip, item.pricing_type === type && styles.typeChipActive]}
                        onPress={() => update({ pricing_type: type })}
                    >
                        <Ionicons
                            name={TYPE_ICONS[type]}
                            size={14}
                            color={item.pricing_type === type ? '#FFF' : '#800000'}
                        />
                        <Text
                            style={[styles.typeChipText, item.pricing_type === type && styles.typeChipTextActive]}
                        >
                            {PRICING_TYPE_LABELS[type]}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Type-specific inputs */}
            {item.pricing_type === 'fixed' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>
                    <View style={styles.priceInputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.priceInput}
                            keyboardType="decimal-pad"
                            value={item.price != null ? String(item.price) : ''}
                            onChangeText={(text) => update({ price: text ? parseFloat(text) : undefined })}
                            placeholder="0.00"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>
            )}

            {item.pricing_type === 'range' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>PRICE RANGE (₹)</Text>
                    <View style={styles.rangeRow}>
                        <View style={[styles.priceInputWrapper, { flex: 1 }]}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.priceInput}
                                keyboardType="decimal-pad"
                                value={item.price_min != null ? String(item.price_min) : ''}
                                onChangeText={(text) => update({ price_min: text ? parseFloat(text) : undefined })}
                                placeholder="Min"
                                placeholderTextColor="#999"
                            />
                        </View>
                        <Text style={styles.rangeDash}>–</Text>
                        <View style={[styles.priceInputWrapper, { flex: 1 }]}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.priceInput}
                                keyboardType="decimal-pad"
                                value={item.price_max != null ? String(item.price_max) : ''}
                                onChangeText={(text) => update({ price_max: text ? parseFloat(text) : undefined })}
                                placeholder="Max"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </View>
            )}

            {item.pricing_type === 'custom' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>CUSTOM NOTE</Text>
                    <TextInput
                        style={styles.noteInput}
                        value={item.custom_note || ''}
                        onChangeText={(text) => update({ custom_note: text })}
                        placeholder="e.g. Depends on venue size. Contact us for a quote."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={2}
                    />
                </View>
            )}

            {item.pricing_type !== 'custom' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>UNIT</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitList}>
                        {PRICE_UNIT_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[
                                    styles.unitChip,
                                    item.price_unit === opt.value && styles.unitChipActive,
                                ]}
                                onPress={() => update({ price_unit: opt.value })}
                            >
                                <Text
                                    style={[
                                        styles.unitChipText,
                                        item.price_unit === opt.value && styles.unitChipTextActive,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(128,0,0,0.06)',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    labelContainer: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#800000',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    labelInput: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,0,0,0.1)',
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF3B3010',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    typeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(128,0,0,0.1)',
        backgroundColor: '#FAF8F5',
    },
    typeChipActive: {
        backgroundColor: '#800000',
        borderColor: '#800000',
    },
    typeChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#800000',
    },
    typeChipTextActive: {
        color: '#FFF',
    },
    inputGroup: {
        marginBottom: 16,
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rangeDash: {
        fontSize: 20,
        color: '#800000',
        fontWeight: '300',
    },
    priceInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(128,0,0,0.08)',
        borderRadius: 14,
        backgroundColor: '#FAF8F5',
        paddingHorizontal: 16,
        height: 52,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: '#800000',
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
    },
    unitList: {
        gap: 8,
        paddingRight: 20,
    },
    unitChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(128,0,0,0.1)',
        backgroundColor: '#FAF8F5',
    },
    unitChipActive: {
        backgroundColor: '#800000',
        borderColor: '#800000',
    },
    unitChipText: {
        fontSize: 12,
        color: '#800000',
        fontWeight: '700',
    },
    unitChipTextActive: {
        color: '#FFF',
    },
    noteInput: {
        backgroundColor: '#FAF8F5',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(128,0,0,0.08)',
        padding: 16,
        fontSize: 15,
        color: '#1c1917',
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default PricingItemEditor;
