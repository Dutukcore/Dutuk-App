import createEvent from "@/hooks/createEvent";
import useImageUpload from "@/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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

const CreateEventScreen = () => {
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { pickImage, uploadImage, deleteImage } = useImageUpload();

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
          text2: 'Now click "Upload Image" to attach it to the event.'
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
      
      // Store old image URL before uploading new one
      const oldImageUrl = eventImageUrl;
      
      const imageUrl = await uploadImage(selectedImageUri, {
        bucket: "event-images",
        folder: "events",
      });

      if (imageUrl) {
        // Delete old image from storage if it exists (user is replacing image)
        if (oldImageUrl) {
          console.log("Deleting old image:", oldImageUrl);
          await deleteImage(oldImageUrl);
        }

        setEventImageUrl(imageUrl);
        setSelectedImageUri(null); // Clear selection after upload
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Event image uploaded successfully!'
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

  const handleRemoveImage = async () => {
    if (!eventImageUrl) return;

    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from storage
              console.log("Removing image from storage:", eventImageUrl);
              await deleteImage(eventImageUrl);
              
              setEventImageUrl(null);
              Toast.show({
                type: 'success',
                text1: 'Image Removed',
                text2: 'Event image has been removed.'
              });
            } catch (error) {
              console.error("Error removing image:", error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to remove image.'
              });
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!eventName.trim()) {
      Toast.show({
        type: "error",
        text1: "Event title required",
        text2: "Please enter an event title before saving.",
      });
      return;
    }

    // Make image upload mandatory
    if (!eventImageUrl) {
      Toast.show({
        type: "error",
        text1: "Image required",
        text2: "Please upload an event image before creating the event.",
      });
      return;
    }

    // Validate start date if provided
    if (startDate.trim()) {
      const startDateObj = new Date(startDate.trim());
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison

      if (isNaN(startDateObj.getTime())) {
        Toast.show({
          type: "error",
          text1: "Invalid start date",
          text2: "Please provide a valid start date in YYYY-MM-DD format.",
        });
        return;
      }

      if (startDateObj < today) {
        Toast.show({
          type: "error",
          text1: "Invalid start date",
          text2: "Start date cannot be in the past.",
        });
        return;
      }
    }

    // Validate end date if provided
    if (endDate.trim()) {
      const endDateObj = new Date(endDate.trim());

      if (isNaN(endDateObj.getTime())) {
        Toast.show({
          type: "error",
          text1: "Invalid end date",
          text2: "Please provide a valid end date in YYYY-MM-DD format.",
        });
        return;
      }

      // If both dates are provided, validate that end date is after start date
      if (startDate.trim()) {
        const startDateObj = new Date(startDate.trim());
        
        if (endDateObj < startDateObj) {
          Toast.show({
            type: "error",
            text1: "Invalid end date",
            text2: "End date must be after the start date.",
          });
          return;
        }
      } else {
        // If end date is provided but start date is not, validate end date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (endDateObj < today) {
          Toast.show({
            type: "error",
            text1: "Invalid end date",
            text2: "End date cannot be in the past.",
          });
          return;
        }
      }
    }

    setSaving(true);
    try {
      await createEvent({
        event: eventName.trim(),
        description: description.trim() || undefined,
        payment: Number.parseFloat(payment) || 0,
        status: "upcoming",
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        image_url: eventImageUrl || undefined,
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

        {/* Event Image Section */}
        <Text style={styles.label}>Event Image (Required) *</Text>
        {eventImageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: eventImageUrl }} 
              style={styles.imagePreview} 
            />
            <View style={styles.imageActionsRow}>
              <Pressable 
                style={styles.changeImageButton}
                onPress={handleEventImageSelect}
                disabled={selectingImage || uploadingImage}
              >
                {selectingImage ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.changeImageText}>Change Image</Text>
                )}
              </Pressable>
              <Pressable 
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
                disabled={selectingImage || uploadingImage}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                <Text style={styles.removeImageText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : selectedImageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: selectedImageUri }} 
              style={styles.imagePreview} 
            />
            <View style={styles.imageActionsRow}>
              <Pressable 
                style={[styles.uploadImageButton, uploadingImage && { opacity: 0.6 }]}
                onPress={handleEventImageUpload}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                    <Text style={styles.uploadImageButtonText}>Upload Image</Text>
                  </>
                )}
              </Pressable>
              <Pressable 
                style={styles.changeSelectionButton}
                onPress={handleEventImageSelect}
                disabled={uploadingImage}
              >
                <Text style={styles.changeSelectionText}>Change Selection</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable 
            style={styles.uploadButton}
            onPress={handleEventImageSelect}
            disabled={selectingImage}
          >
            {selectingImage ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator color="#007AFF" size="large" />
                <Text style={styles.uploadingText}>Selecting...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="image-outline" size={40} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Select Event Image</Text>
                <Text style={styles.uploadButtonSubtext}>Tap to choose from gallery</Text>
              </>
            )}
          </Pressable>
        )}

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

        <Text style={styles.label}>Start Date (optional)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD (e.g. 2025-01-01)"
        />

        <Text style={styles.label}>End Date (optional)</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD (e.g. 2025-01-02)"
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
  imagePreviewContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#F0F0F0',
  },
  changeImageButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF',
  },
  removeImageText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    marginBottom: 16,
  },
  uploadButtonText: {
    marginTop: 12,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadButtonSubtext: {
    marginTop: 4,
    color: '#666666',
    fontSize: 13,
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadingText: {
    marginTop: 12,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  imageActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  uploadImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  uploadImageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  changeSelectionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  changeSelectionText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreateEventScreen;

