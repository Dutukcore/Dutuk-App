import KeyboardSafeView from "@/components/KeyboardSafeView";
import createEvent from "@/hooks/createEvent";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const CreateEventStepTwo = () => {
    const params = useLocalSearchParams();
    const eventTitle = params.eventTitle as string;
    const eventImageUrl = params.eventImageUrl as string;

    const [saving, setSaving] = useState(false);
    const [payment, setPayment] = useState("0");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateEvent = async () => {
        // Validate payment
        const paymentAmount = Number.parseFloat(payment);
        if (isNaN(paymentAmount) || paymentAmount < 0) {
            Toast.show({
                type: "error",
                text1: "Invalid Payment",
                text2: "Please enter a valid payment amount.",
            });
            return;
        }

        // Validate start date if provided
        if (startDate.trim()) {
            const startDateObj = new Date(startDate.trim());
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (isNaN(startDateObj.getTime())) {
                Toast.show({
                    type: "error",
                    text1: "Invalid Start Date",
                    text2: "Please provide a valid date in YYYY-MM-DD format.",
                });
                return;
            }

            if (startDateObj < today) {
                Toast.show({
                    type: "error",
                    text1: "Invalid Start Date",
                    text2: "Start date cannot be in the past.",
                });
                return;
            }
        } else {
            // Start date is required
            Toast.show({
                type: "error",
                text1: "Start Date Required",
                text2: "Please provide a start date for the event.",
            });
            return;
        }

        // Validate end date if provided
        if (endDate.trim()) {
            const endDateObj = new Date(endDate.trim());

            if (isNaN(endDateObj.getTime())) {
                Toast.show({
                    type: "error",
                    text1: "Invalid End Date",
                    text2: "Please provide a valid date in YYYY-MM-DD format.",
                });
                return;
            }

            const startDateObj = new Date(startDate.trim());
            if (endDateObj < startDateObj) {
                Toast.show({
                    type: "error",
                    text1: "Invalid End Date",
                    text2: "End date must be after the start date.",
                });
                return;
            }
        }

        setSaving(true);
        try {
            await createEvent({
                event: eventTitle,
                description: description.trim() || undefined,
                payment: paymentAmount,
                status: "upcoming",
                startDate: startDate.trim(),
                endDate: endDate.trim() || undefined,
                image_url: eventImageUrl,
            });

            Toast.show({
                type: "success",
                text1: "Event Created",
                text2: "Your event has been added successfully.",
            });

            // Navigate to home
            router.replace('/(tabs)/home' as any);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Creation Failed",
                text2: "Unable to create event. Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardSafeView
            scrollable={true}
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressStep}>
                    <View style={[styles.progressCircle, styles.progressCompleted]}>
                        <Ionicons name="checkmark" size={20} color="#FFF" />
                    </View>
                    <Text style={[styles.progressLabel, styles.progressLabelCompleted]}>Basic Info</Text>
                </View>
                <View style={[styles.progressLine, styles.progressLineActive]} />
                <View style={styles.progressStep}>
                    <View style={[styles.progressCircle, styles.progressActive]}>
                        <Text style={[styles.progressNumber, { color: '#FFF' }]}>2</Text>
                    </View>
                    <Text style={[styles.progressLabel, styles.progressLabelActive]}>Details</Text>
                </View>
            </View>

            {/* Preview of Step 1 Data */}
            <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Event Preview</Text>
                <Image
                    source={{ uri: eventImageUrl }}
                    style={styles.previewImage}
                />
                <Text style={styles.previewEventTitle}>{eventTitle}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 2: Event Details</Text>

                {/* Payment */}
                <Text style={styles.label}>Payment Amount ($) *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={payment}
                    onChangeText={setPayment}
                    placeholder="0.00"
                    data-testid="payment-input"
                />

                {/* Start Date */}
                <Text style={styles.label}>Start Date *</Text>
                <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD (e.g. 2025-05-01)"
                    data-testid="start-date-input"
                />

                {/* End Date */}
                <Text style={styles.label}>End Date (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD (e.g. 2025-05-02)"
                    data-testid="end-date-input"
                />

                {/* Description */}
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.multiline]}
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add additional details about this event"
                    data-testid="description-input"
                />
            </View>

            {/* Create Event Button */}
            <Pressable
                style={[styles.createButton, saving && { opacity: 0.7 }]}
                onPress={handleCreateEvent}
                disabled={saving}
                data-testid="create-event-button"
            >
                {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Create Event</Text>
                    </>
                )}
            </Pressable>

            {/* Back Button */}
            <Pressable style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={18} color="#800000" />
                <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
        </KeyboardSafeView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8f5",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        marginTop: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    progressActive: {
        backgroundColor: '#800000',
    },
    progressCompleted: {
        backgroundColor: '#34C759',
    },
    progressNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    progressLabel: {
        fontSize: 12,
        color: '#999',
    },
    progressLabelActive: {
        color: '#800000',
        fontWeight: '600',
    },
    progressLabelCompleted: {
        color: '#34C759',
        fontWeight: '600',
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: '#34C759',
    },
    previewSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        resizeMode: 'cover',
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    previewEventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: '#800000',
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
        color: "#1c1917",
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        fontSize: 14,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#800000',
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 16,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    backButtonText: {
        color: '#800000',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CreateEventStepTwo;
