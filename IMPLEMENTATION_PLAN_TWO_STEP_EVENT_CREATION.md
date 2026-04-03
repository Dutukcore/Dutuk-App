# Two-Step Event Creation Implementation Plan

## Project Context
**App Type:** React Native (Expo) Mobile Application  
**Stack:** TypeScript, Expo Router (file-based routing), Supabase Backend  
**Current State:** Single-step event creation exists at `/app/event/manage/create.tsx`  
**Navigation:** Bottom tab navigation with Home, Orders, Profile tabs

---

## Requirements Summary

### Primary Goal
Implement a **two-step event creation flow** accessible via:
1. A **plus button** in the center of the bottom navigation bar
2. Any "Create Event" button on the home page

### Two-Step Flow Specification

**Step 1: Event Basic Info**
- Input: Event title (required)
- Input: Event image (required)
- Action: "Next" button → Navigate to Step 2 with data

**Step 2: Event Details**
- Display: Selected title & image preview from Step 1
- Input: Payment/Price amount (required, default: 0)
- Input: Start date (optional but cannot be past date)
- Input: End date (optional but must be after start date)
- Input: Description (optional)
- Action: "Create Event" button → Save to database with status="upcoming"

---

## File Structure Changes

```
/app/dutuk-vendor/
├── components/
│   └── BottomNavigation.tsx              # MODIFY: Add center plus button
├── app/
│   ├── event/
│   │   └── manage/
│   │       ├── createStepOne.tsx         # CREATE: Step 1 - Title & Image
│   │       └── createStepTwo.tsx         # CREATE: Step 2 - Price & Date
│   └── (tabs)/
│       └── home.tsx                       # MODIFY: Update create event button routing
```

---

## Implementation Steps

### STEP 1: Update Bottom Navigation Component

**File:** `/app/dutuk-vendor/components/BottomNavigation.tsx`

**Current Layout:** `[Home] [Orders] [Profile]` (3 items, evenly spaced)  
**New Layout:** `[Home] [Orders] [PLUS] [Chat] [Profile]` (5 items with elevated center button)

**Changes Required:**

1. **Update TypeScript Interface:**
```typescript
interface BottomNavigationProps {
  activeTab: 'home' | 'orders' | 'chat' | 'profile';
}
```

2. **Import Required Icons:**
```typescript
import { FileText, Home, MessageCircle, Plus, User } from 'react-native-feather';
```

3. **Add Plus Button Handler:**
```typescript
const handleCreateEvent = () => {
  router.push('/event/manage/createStepOne' as any);
};
```

4. **Update JSX Structure:**
Replace the existing `bottomNavbar` View content with:

```typescript
<View style={styles.bottomNavbar}>
  {/* Home */}
  <Pressable style={styles.navItem} onPress={handleHome}>
    <Home 
      width={24} 
      height={24} 
      stroke={activeTab === 'home' ? "#800000" : "#a8a29e"} 
    />
    <Text style={[styles.navLabel, { color: activeTab === 'home' ? '#800000' : '#a8a29e' }]}>
      Home
    </Text>
  </Pressable>
  
  {/* Orders */}
  <Pressable style={styles.navItem} onPress={handleOrders}>
    <FileText 
      width={24} 
      height={24} 
      stroke={activeTab === 'orders' ? "#800000" : "#a8a29e"} 
    />
    <Text style={[styles.navLabel, { color: activeTab === 'orders' ? '#800000' : '#a8a29e' }]}>
      Orders
    </Text>
  </Pressable>

  {/* CENTER PLUS BUTTON - ELEVATED */}
  <Pressable 
    style={styles.centerPlusButton} 
    onPress={handleCreateEvent}
    data-testid="create-event-plus-button"
  >
    <View style={styles.plusIconContainer}>
      <Plus width={28} height={28} stroke="#FFFFFF" strokeWidth={3} />
    </View>
  </Pressable>

  {/* Chat */}
  <Pressable style={styles.navItem} onPress={() => router.push('/chat' as any)}>
    <MessageCircle 
      width={24} 
      height={24} 
      stroke={activeTab === 'chat' ? "#800000" : "#a8a29e"} 
    />
    <Text style={[styles.navLabel, { color: activeTab === 'chat' ? '#800000' : '#a8a29e' }]}>
      Chat
    </Text>
  </Pressable>

  {/* Profile */}
  <Pressable style={styles.navItem} onPress={handleProfile}>
    <User 
      width={24} 
      height={24} 
      stroke={activeTab === 'profile' ? "#800000" : "#a8a29e"} 
    />
    <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#800000' : '#a8a29e' }]}>
      Profile
    </Text>
  </Pressable>
</View>
```

5. **Add New Styles:**
Add these styles to the StyleSheet:

```typescript
centerPlusButton: {
  position: 'absolute',
  bottom: 32,
  left: '50%',
  marginLeft: -32, // Half of width to center
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#800000',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#800000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
  zIndex: 999,
},
plusIconContainer: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#800000',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 4,
  borderColor: '#FFFFFF',
},
```

6. **Adjust Existing Styles:**
Update `navItem` to reduce flex to accommodate 4 regular items:
```typescript
navItem: {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 0.2,  // Changed from flex: 1
  paddingVertical: 8,
  paddingHorizontal: 4,
},
```

---

### STEP 2: Create Step One Component (Title + Image)

**File:** `/app/dutuk-vendor/app/event/manage/createStepOne.tsx`

**Purpose:** Collect event title and image, then navigate to Step 2

**Implementation:**

```typescript
import useImageUpload from "@/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import KeyboardSafeView from "@/components/KeyboardSafeView";

const CreateEventStepOne = () => {
  const [selectingImage, setSelectingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");

  const { pickImage, uploadImage } = useImageUpload();

  const handleImageSelect = async () => {
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
          text2: 'Now click "Upload Image" to proceed.'
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Selection Failed',
        text2: error?.message || 'Failed to select image.'
      });
    } finally {
      setSelectingImage(false);
    }
  };

  const handleImageUpload = async () => {
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
      
      const imageUrl = await uploadImage(selectedImageUri, {
        bucket: "event-images",
        folder: "events",
      });

      if (imageUrl) {
        setEventImageUrl(imageUrl);
        setSelectedImageUri(null);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image uploaded successfully!'
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.message || 'Failed to upload image.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNext = () => {
    // Validation
    if (!eventTitle.trim()) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter an event title.",
      });
      return;
    }

    if (!eventImageUrl) {
      Toast.show({
        type: "error",
        text1: "Image Required",
        text2: "Please upload an event image.",
      });
      return;
    }

    // Navigate to Step 2 with params
    router.push({
      pathname: '/event/manage/createStepTwo' as any,
      params: {
        eventTitle: eventTitle.trim(),
        eventImageUrl: eventImageUrl,
      }
    });
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
          <View style={[styles.progressCircle, styles.progressActive]}>
            <Text style={styles.progressNumber}>1</Text>
          </View>
          <Text style={[styles.progressLabel, styles.progressLabelActive]}>Basic Info</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Details</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 1: Basic Information</Text>

        {/* Event Title */}
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          style={styles.input}
          value={eventTitle}
          onChangeText={setEventTitle}
          placeholder="e.g. Wedding Reception"
          data-testid="event-title-input"
        />

        {/* Event Image */}
        <Text style={styles.label}>Event Image *</Text>
        {eventImageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: eventImageUrl }} 
              style={styles.imagePreview} 
            />
            <Pressable 
              style={styles.changeImageButton}
              onPress={handleImageSelect}
              disabled={selectingImage || uploadingImage}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </Pressable>
          </View>
        ) : selectedImageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: selectedImageUri }} 
              style={styles.imagePreview} 
            />
            <Pressable 
              style={[styles.uploadImageButton, uploadingImage && { opacity: 0.6 }]}
              onPress={handleImageUpload}
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
          </View>
        ) : (
          <Pressable 
            style={styles.uploadButton}
            onPress={handleImageSelect}
            disabled={selectingImage}
            data-testid="select-image-button"
          >
            {selectingImage ? (
              <ActivityIndicator color="#007AFF" size="large" />
            ) : (
              <>
                <Ionicons name="image-outline" size={40} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Select Event Image</Text>
                <Text style={styles.uploadButtonSubtext}>Tap to choose from gallery</Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Next Button */}
      <Pressable
        style={styles.nextButton}
        onPress={handleNext}
        data-testid="next-button"
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>

      {/* Cancel Button */}
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
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
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
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
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FF',
    marginTop: 8,
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
  imagePreviewContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#F0F0F0',
  },
  uploadImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#800000',
    padding: 12,
    marginTop: 8,
  },
  uploadImageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  changeImageButton: {
    backgroundColor: '#800000',
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#800000',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#800000',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateEventStepOne;
```

---

### STEP 3: Create Step Two Component (Price + Date)

**File:** `/app/dutuk-vendor/app/event/manage/createStepTwo.tsx`

**Purpose:** Collect event price, dates, description and save to database

**Implementation:**

```typescript
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
import KeyboardSafeView from "@/components/KeyboardSafeView";

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
        <Text style={styles.label}>Payment Amount (₹) *</Text>
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
        <Ionicons name="arrow-back" size={18} color="#007AFF" />
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
```

---

### STEP 4: Update Home Page Create Event Button

**File:** `/app/dutuk-vendor/app/(tabs)/home.tsx`

**Action:** Find any "Create Event" button and update its `onPress` handler

**Find and Replace:**
Look for navigation to `/event/manage/create` and replace with `/event/manage/createStepOne`

**Example:**
```typescript
// OLD:
onPress={() => router.push('/event/manage/create' as any)}

// NEW:
onPress={() => router.push('/event/manage/createStepOne' as any)}
```

---

## Testing Checklist

### Manual Testing Steps

1. **Bottom Navigation Plus Button**
   - [ ] Verify plus button appears in center of bottom tab
   - [ ] Verify button is elevated above other tabs
   - [ ] Click plus button → Should navigate to Step 1

2. **Step 1 Flow**
   - [ ] Enter event title
   - [ ] Select image from gallery
   - [ ] Upload image
   - [ ] Verify validation: Cannot proceed without title
   - [ ] Verify validation: Cannot proceed without image
   - [ ] Click "Next" → Should navigate to Step 2 with data

3. **Step 2 Flow**
   - [ ] Verify Step 1 data (title + image) is shown in preview
   - [ ] Enter payment amount
   - [ ] Enter start date (try past date → should show error)
   - [ ] Enter end date (try date before start → should show error)
   - [ ] Add optional description
   - [ ] Click "Create Event" → Should save to database
   - [ ] Verify redirection to home page
   - [ ] Verify new event appears in home events list

4. **Home Page Integration**
   - [ ] Click any "Create Event" button on home → Should open Step 1
   - [ ] Complete flow from home button → Should work same as plus button

5. **Navigation & Back Buttons**
   - [ ] Step 1: Click "Cancel" → Should go back
   - [ ] Step 2: Click "Back" → Should return to Step 1 (but data might not persist)
   - [ ] Device back button should work properly on both steps

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Triggers Event Creation                              │
│  (Plus Button OR Home Create Button)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: /event/manage/createStepOne.tsx                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Input: Event Title (string)                          │  │
│  │ Input: Event Image (upload to Supabase)             │  │
│  │ Validation: Both required                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │ Click "Next"
                 │ Pass: { eventTitle, eventImageUrl }
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: /event/manage/createStepTwo.tsx                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Display: Preview of title & image from Step 1       │  │
│  │ Input: Payment (number, default 0)                  │  │
│  │ Input: Start Date (required, cannot be past)        │  │
│  │ Input: End Date (optional, must be after start)     │  │
│  │ Input: Description (optional)                        │  │
│  │ Validation: Dates & payment                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │ Click "Create Event"
                 │ Call: createEvent({ ...allData, status: "upcoming" })
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Database: events table                           │
│  - Insert new event record                                 │
│  - Return to Home screen                                   │
│  - Refresh events list                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Technical Considerations

### 1. **Parameter Passing Between Steps**
Use Expo Router's `useLocalSearchParams()` hook to receive params in Step 2:
```typescript
const params = useLocalSearchParams();
const eventTitle = params.eventTitle as string;
const eventImageUrl = params.eventImageUrl as string;
```

### 2. **Image Upload Timing**
- Step 1: Image must be uploaded to Supabase BEFORE proceeding to Step 2
- Only pass the final `eventImageUrl` (Supabase public URL) to Step 2
- Do NOT pass local URI between screens

### 3. **Date Validation**
Reuse the existing date validation logic from the current `/app/event/manage/create.tsx`:
- Parse dates with `new Date(dateString)`
- Compare with `today` (set to start of day)
- Validate end date is after start date

### 4. **Navigation Flow**
- Step 1 → Step 2: Use `router.push()` with params
- Step 2 → Home: Use `router.replace()` to prevent back navigation to Step 2
- Cancel/Back: Use `router.back()`

### 5. **Styling Consistency**
- Maintain existing color scheme: Primary `#800000` (maroon)
- Use existing components: `KeyboardSafeView`, `Toast`, `ActivityIndicator`
- Match existing card shadows and border radius (16px)

### 6. **Error Handling**
- Show Toast messages for all errors
- Disable buttons during async operations
- Show loading indicators on image upload and event creation

---

## Implementation Order

**RECOMMENDED SEQUENCE:**

1. **Phase 1:** Create Step 1 file (`createStepOne.tsx`)
2. **Phase 2:** Create Step 2 file (`createStepTwo.tsx`)
3. **Phase 3:** Update Bottom Navigation to add plus button
4. **Phase 4:** Update Home page create button routing
5. **Phase 5:** Test full flow end-to-end

---

## Rollback Plan

If issues occur, the original single-step event creation is at:
`/app/dutuk-vendor/app/event/manage/create.tsx`

To rollback:
1. Keep the original file intact (don't delete it)
2. Change routing back to `/event/manage/create`
3. Remove plus button or route it to old create screen

---

## Success Criteria

✅ Plus button appears in center of bottom navigation  
✅ Plus button navigates to Step 1  
✅ Step 1 collects title and image  
✅ Step 1 validates inputs before proceeding  
✅ Step 2 receives and displays Step 1 data  
✅ Step 2 collects payment, dates, description  
✅ Step 2 validates dates (no past dates, end > start)  
✅ Event is created with status "upcoming"  
✅ User is redirected to home after creation  
✅ Event appears in home events list  
✅ Home page create button uses same flow  
