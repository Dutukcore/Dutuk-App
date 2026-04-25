import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import PricingItemEditor from "@/features/events/components/PricingItemEditor";
import createEvent from "@/features/events/services/createEvent";
import { useVendorStore } from "@/store/useVendorStore";
import { createEmptyPricingItem, PricingItem } from "@/types/pricing";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";

const CreateEventStepTwo = () => {
    const params = useLocalSearchParams();
    const eventTitle = params.eventTitle as string || "New Event";
    const eventImageUrl = params.eventImageUrl as string;

    const [saving, setSaving] = useState(false);
    const [pricingItems, setPricingItems] = useState<PricingItem[]>([
        createEmptyPricingItem(0),
    ]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    // Calendar Modal State
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');

    const updatePricingItem = (index: number, updated: PricingItem) => {
        setPricingItems((prev) => {
            const next = [...prev];
            next[index] = updated;
            return next;
        });
    };

    const deletePricingItem = (index: number) => {
        setPricingItems((prev) => prev.filter((_, i) => i !== index));
    };

    const addPricingItem = () => {
        setPricingItems((prev) => [...prev, createEmptyPricingItem(prev.length)]);
    };

    const openCalendar = (mode: 'start' | 'end') => {
        setCalendarMode(mode);
        setShowCalendar(true);
    };

    const onDateSelect = (day: { dateString: string }) => {
        if (calendarMode === 'start') {
            setStartDate(day.dateString);
        } else {
            setEndDate(day.dateString);
        }
        setShowCalendar(false);
    };

    const validatePricingItems = (): boolean => {
        for (let i = 0; i < pricingItems.length; i++) {
            const item = pricingItems[i];
            const num = i + 1;

            if (!item.label.trim()) {
                Toast.show({ type: "error", text1: `Item ${num}: Label required`, text2: "Please enter a name for each pricing item." });
                return false;
            }
            if (item.pricing_type === "fixed") {
                if (!item.price || item.price <= 0) {
                    Toast.show({ type: "error", text1: `Item ${num}: Invalid price`, text2: "Fixed price must be greater than ₹0." });
                    return false;
                }
            }
            if (item.pricing_type === "range") {
                if (!item.price_min || item.price_min <= 0) {
                    Toast.show({ type: "error", text1: `Item ${num}: Invalid minimum`, text2: "Minimum price must be greater than ₹0." });
                    return false;
                }
                if (item.price_max !== undefined && item.price_max < item.price_min) {
                    Toast.show({ type: "error", text1: `Item ${num}: Invalid range`, text2: "Maximum must be ≥ minimum price." });
                    return false;
                }
            }
        }
        return true;
    };

    const handleCreateEvent = async () => {
        if (!validatePricingItems()) return;

        if (!startDate.trim()) {
            Toast.show({ type: "error", text1: "Start Date Required", text2: "Please provide a start date for the event." });
            return;
        }

        if (endDate.trim()) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                Toast.show({ type: "error", text1: "Invalid End Date", text2: "End date must be after the start date." });
                return;
            }
        }

        setSaving(true);
        try {
            const newEvent = await createEvent({
                event: eventTitle,
                description: description.trim() || undefined,
                pricingItems,
                status: "upcoming",
                startDate: startDate.trim(),
                endDate: endDate.trim() || undefined,
                image_url: eventImageUrl,
            });

            useVendorStore.getState().addEvent(newEvent);
            useVendorStore.getState().fetchEvents();

            Toast.show({ type: "success", text1: "Event Created", text2: "Your event has been added successfully." });
            router.navigate('/(tabs)/home' as any);
        } catch (error) {
            Toast.show({ type: "error", text1: "Creation Failed", text2: "Unable to create event. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardSafeView
            scrollable={true}
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Header Area */}
            <View style={styles.headerArea}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#800000" />
                </Pressable>
                <View>
                    <Text style={styles.pageTitle}>Service Details</Text>
                    <Text style={styles.pageSubtitle}>{eventTitle}</Text>
                </View>
            </View>

            {/* Banner Section */}
            <View style={styles.bannerContainer}>
                {eventImageUrl ? (
                    <Image source={{ uri: eventImageUrl }} style={styles.bannerImage} />
                ) : (
                    <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
                        <Ionicons name="image-outline" size={40} color="rgba(128,0,0,0.2)" />
                    </View>
                )}
                <View style={styles.bannerOverlay}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>STEP 2 / 2</Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainContainer}>
                {/* Pricing Section */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="cash" size={20} color="#800000" />
                    <Text style={styles.sectionTitle}>Breakdown Pricing</Text>
                </View>
                <Text style={styles.sectionHint}>Add multiple pricing items to define your budget clearly.</Text>

                {pricingItems.map((item, index) => (
                    <PricingItemEditor
                        key={item.tempId || item.id || String(index)}
                        item={item}
                        onUpdate={(updated) => updatePricingItem(index, updated)}
                        onDelete={() => deletePricingItem(index)}
                        isOnlyItem={pricingItems.length === 1}
                    />
                ))}

                <Pressable style={styles.addItemButton} onPress={addPricingItem}>
                    <Ionicons name="add-circle" size={20} color="#800000" />
                    <Text style={styles.addItemText}>Add More Pricing</Text>
                </Pressable>

                {/* Logistics Section */}
                <View style={[styles.sectionHeader, { marginTop: 40 }]}>
                    <Ionicons name="calendar-clear" size={20} color="#800000" />
                    <Text style={styles.sectionTitle}>Service Timeline</Text>
                </View>

                <View style={styles.datePickerRow}>
                    <View style={styles.dateInputContainer}>
                        <Text style={styles.inputLabel}>START DATE *</Text>
                        <Pressable
                            style={[styles.pickerButton, !startDate && styles.pickerButtonEmpty]}
                            onPress={() => openCalendar('start')}
                        >
                            <Text style={[styles.pickerText, !startDate && styles.pickerTextEmpty]}>
                                {startDate || "Select Date"}
                            </Text>
                            <Ionicons name="calendar-outline" size={18} color="#800000" />
                        </Pressable>
                    </View>

                    <View style={styles.dateInputContainer}>
                        <Text style={styles.inputLabel}>END DATE (OPT.)</Text>
                        <Pressable
                            style={styles.pickerButton}
                            onPress={() => openCalendar('end')}
                        >
                            <Text style={[styles.pickerText, !endDate && styles.pickerTextEmpty]}>
                                {endDate || "Select Date"}
                            </Text>
                            <Ionicons name="calendar-outline" size={18} color="#800000" />
                        </Pressable>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.inputLabel}>ADDITIONAL NOTES</Text>
                    <TextInput
                        style={styles.multiline}
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g. Include details about specific tasks or requirements."
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.spacer} />

                {/* Actions */}
                <Pressable
                    style={[styles.createButton, saving && { opacity: 0.7 }]}
                    onPress={handleCreateEvent}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.createButtonText}>Create Service</Text>
                    )}
                </Pressable>
            </View>

            {/* Calendar Modal */}
            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCalendar(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowCalendar(false)}
                >
                    <View style={styles.calendarContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Choose {calendarMode === 'start' ? 'Start' : 'End'} Date
                            </Text>
                            <Pressable onPress={() => setShowCalendar(false)}>
                                <Ionicons name="close" size={24} color="#57534e" />
                            </Pressable>
                        </View>
                        <Calendar
                            onDayPress={onDateSelect}
                            markedDates={{
                                [calendarMode === 'start' ? startDate : endDate]: {
                                    selected: true,
                                    selectedColor: '#800000'
                                }
                            }}
                            theme={{
                                selectedDayBackgroundColor: '#800000',
                                todayTextColor: '#800000',
                                arrowColor: '#800000',
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </KeyboardSafeView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    content: { paddingBottom: 60 },
    headerArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        gap: 16,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    pageTitle: { fontSize: 22, fontWeight: '800', color: '#800000', letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 12, fontWeight: '500', color: '#57534e', marginTop: 2 },

    bannerContainer: {
        width: '100%', height: 260, position: 'relative', overflow: 'hidden',
    },
    bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    bannerPlaceholder: { backgroundColor: '#F0EBE9', alignItems: 'center', justifyContent: 'center' },
    bannerOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-start', alignItems: 'flex-end', padding: 24,
    },
    stepBadge: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    stepText: { fontSize: 10, fontWeight: '800', color: '#800000', letterSpacing: 1 },

    mainContainer: {
        paddingHorizontal: 24, marginTop: -32,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        backgroundColor: '#faf8f5', paddingTop: 32,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1c1917', letterSpacing: -0.3 },
    sectionHint: { fontSize: 14, color: '#777', marginBottom: 24, fontWeight: '500' },

    addItemButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 18, borderRadius: 20,
        backgroundColor: '#80000008',
        borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(128,0,0,0.15)',
    },
    addItemText: { fontSize: 16, fontWeight: '800', color: '#800000' },

    datePickerRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
    dateInputContainer: { flex: 1 },
    inputLabel: { fontSize: 10, fontWeight: '800', color: '#800000', letterSpacing: 1, marginBottom: 10 },
    pickerButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        height: 52, borderRadius: 14, backgroundColor: '#FFF', paddingHorizontal: 16,
        borderWidth: 1.5, borderColor: 'rgba(128,0,0,0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
    },
    pickerButtonEmpty: { borderColor: 'rgba(128,0,0,0.15)' },
    pickerText: { fontSize: 14, fontWeight: '700', color: '#1c1917' },
    pickerTextEmpty: { color: '#999', fontWeight: '500' },

    descriptionContainer: { marginTop: 32 },
    multiline: {
        backgroundColor: '#FFF', borderRadius: 18, padding: 20,
        fontSize: 15, color: '#1c1917', minHeight: 120, textAlignVertical: 'top',
        borderWidth: 1.5, borderColor: 'rgba(128,0,0,0.06)',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },

    spacer: { height: 40 },
    createButton: {
        backgroundColor: '#800000', paddingVertical: 18, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
    },
    createButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    calendarContainer: {
        backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#800000' },
});

export default CreateEventStepTwo;
