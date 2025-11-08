import deleteEvent from "@/hooks/deleteEvent";
import getEventById from "@/hooks/getEventById";
import updateEvent, { UpdateEventPayload } from "@/hooks/updateEvent";
import useImageUpload from "@/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import placeholderImage from "@/assets/avatar.png";

const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"] as const;

type ManageFormState = {
  event: string;
  description: string;
  payment: string;
  status: (typeof STATUSES)[number];
  startDate: string;
  endDate: string;
};

const ManageEventScreen = () => {
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = useMemo(() => {
    const raw = params.eventId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.eventId]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [formState, setFormState] = useState<ManageFormState>({
    event: "",
    description: "",
    payment: "0",
    status: "upcoming",
    startDate: "",
    endDate: "",
  });

  const { pickImage, uploadImage } = useImageUpload();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!eventId) {
          throw new Error("Missing event id");
        }
        setLoading(true);
        const data = await getEventById(eventId);
        setFormState({
          event: data.event || "",
          description: data.description || "",
          payment: data.payment ? String(data.payment) : "0",
          status: (STATUSES.includes(data.status) ? data.status : "upcoming") as ManageFormState["status"],
          startDate: data.start_date || "",
          endDate: data.end_date || "",
        });
        // Load existing image if available
        if (data.image_url) {
          setEventImageUrl(data.image_url);
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Unable to load event",
          text2: "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleEventImageSelect = async () => {
    try {
      setSelectingImage(true);
      
      const imageUri = await pickImage({
        bucket: "event-images",
        folder: "events",
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
      });

      if (imageUri) {
        setSelectedImageUri(imageUri);
        Toast.show({
          type: 'success',
          text1: 'Image Selected',
          text2: 'Now click "Upload Image" to save it.'
        });
      }
    } catch (error: any) {
      console.error("Failed to select event image:", error);
      Toast.show({
        type: 'error',
        text1: 'Selection Failed',
        text2: error?.message || 'Failed to select image. Please try again.'
      });
    } finally {
      setSelectingImage(false);
    }
  };

  const handleEventImageUpload = async () => {
    if (!selectedImageUri) {
      Toast.show({
        type: 'error',
        text1: 'No Image Selected',
        text2: 'Please select an image first.'
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      Toast.show({
        type: 'info',
        text1: 'Uploading...',
        text2: 'Uploading image to server...'
      });
      
      const imageUrl = await uploadImage(selectedImageUri, {
        bucket: "event-images",
        folder: "events",
      });

      if (imageUrl) {
        setEventImageUrl(imageUrl);
        setSelectedImageUri(null);
        
        // Also update in database immediately
        if (eventId) {
          await updateEvent(eventId, { image_url: imageUrl });
        }
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event image updated successfully!'
        });
      }
    } catch (error: any) {
      console.error("Failed to upload event image:", error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.message || 'Failed to upload event image. Please try again.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!eventId) {
      return;
    }

    if (!formState.event.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing title",
        text2: "Event title is required.",
      });
      return;
    }

    setSaving(true);
    try {
      const updates: UpdateEventPayload = {
        event: formState.event.trim(),
        description: formState.description.trim() || null,
        status: formState.status,
        payment: Number.parseFloat(formState.payment) || 0,
      };

      if (formState.startDate) {
        const dateRange = [formState.startDate];
        if (formState.endDate) {
          dateRange.push(formState.endDate);
        }
        updates.date = dateRange;
      }

      await updateEvent(eventId, updates);

      Toast.show({
        type: "success",
        text1: "Event updated",
        text2: "Your event details have been saved.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: "Unable to save event changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!eventId) {
      return;
    }

    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${formState.event || "this event"}"? This action cannot be undone and all event data will be permanently removed.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteEvent(eventId);
              Toast.show({
                type: "success",
                text1: "Event deleted",
                text2: "The event has been removed successfully.",
              });
              router.back();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Delete failed",
                text2: "Unable to delete event. Please try again.",
              });
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Details</Text>

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          value={formState.event}
          onChangeText={(text) => setFormState((prev) => ({ ...prev, event: text }))}
          placeholder="Enter event title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
          value={formState.description}
          onChangeText={(text) => setFormState((prev) => ({ ...prev, description: text }))}
          placeholder="Describe the event"
        />

        <Text style={styles.label}>Payment (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={formState.payment}
          onChangeText={(text) => setFormState((prev) => ({ ...prev, payment: text }))}
          placeholder="0.00"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((status) => {
            const active = status === formState.status;
            return (
              <Pressable
                key={status}
                style={[styles.statusChip, active && styles.statusChipActive]}
                onPress={() => setFormState((prev) => ({ ...prev, status }))}
              >
                <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={formState.startDate}
          onChangeText={(text) => setFormState((prev) => ({ ...prev, startDate: text }))}
          placeholder="2025-01-01"
        />

        <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={formState.endDate}
          onChangeText={(text) => setFormState((prev) => ({ ...prev, endDate: text }))}
          placeholder="2025-01-02"
        />
      </View>

      <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving || deleting}>
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </Pressable>

      <Pressable 
        style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]} 
        onPress={handleDelete} 
        disabled={saving || deleting}
      >
        {deleting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </>
        )}
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()} disabled={saving || deleting}>
        <Ionicons name="arrow-back" size={18} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
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
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
});

export default ManageEventScreen;

