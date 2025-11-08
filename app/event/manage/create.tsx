import createEvent from "@/hooks/createEvent";
import useImageUpload from "@/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"] as const;

const CreateEventScreen = () => {
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("0");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("upcoming");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");

  const { pickAndUploadImage } = useImageUpload();

  const handleSave = async () => {
    if (!eventName.trim()) {
      Toast.show({
        type: "error",
        text1: "Event title required",
        text2: "Please enter an event title before saving.",
      });
      return;
    }

    if (!startDate.trim()) {
      Toast.show({
        type: "error",
        text1: "Start date required",
        text2: "Please provide a start date (YYYY-MM-DD).",
      });
      return;
    }

    setSaving(true);
    try {
      await createEvent({
        event: eventName.trim(),
        description: description.trim() || undefined,
        payment: Number.parseFloat(payment) || 0,
        status,
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        customerId: customerId.trim() || undefined,
        customerName: customerName.trim() || undefined,
      });

      Toast.show({
        type: "success",
        text1: "Event created",
        text2: "Your event has been added successfully.",
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Creation failed",
        text2: "Unable to create event. Check your details and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Event</Text>

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={eventName}
          onChangeText={setEventName}
          placeholder="Wedding Reception"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Share more information about this event"
        />

        <Text style={styles.label}>Payment (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={payment}
          onChangeText={setPayment}
          placeholder="0.00"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((item) => {
            const active = item === status;
            return (
              <Pressable
                key={item}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setStatus(item)}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2025-01-01"
        />

        <Text style={styles.label}>End Date (optional)</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2025-01-02"
        />

        <Text style={styles.label}>Customer ID (optional)</Text>
        <TextInput
          style={styles.input}
          value={customerId}
          onChangeText={setCustomerId}
          placeholder="Paste customer UUID"
        />

        <Text style={styles.label}>Customer Name (optional)</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="e.g. Priya Singh"
        />
      </View>

      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="flame-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Create Event</Text>
          </>
        )}
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#007AFF" />
        <Text style={styles.backButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 14,
    color: "#333333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  statusChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C7C7CC",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusChipText: {
    fontSize: 13,
    color: "#3A3A3C",
    textTransform: "capitalize",
  },
  statusChipTextActive: {
    color: "#FFFFFF",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default CreateEventScreen;

