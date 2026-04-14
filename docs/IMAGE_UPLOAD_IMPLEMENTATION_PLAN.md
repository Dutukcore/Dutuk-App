# 📸 Image Upload Implementation Plan - Supabase Storage

## Project Overview
Implement image upload functionality for **user profile images** and **event images** in a React Native (Expo) app with Supabase backend.

---

## 📋 Phase 1: Supabase Backend Setup

### Step 1.1: Create Storage Buckets in Supabase Dashboard

**Action:** Create two storage buckets in your Supabase project

1. **Navigate to Supabase Dashboard:**
   - Go to your Supabase project
   - Click on **Storage** in the left sidebar
   - Click **"New bucket"**

2. **Create Profile Images Bucket:**
   ```
   Bucket name: profile-images
   Public bucket: ✅ Yes (checked)
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

3. **Create Event Images Bucket:**
   ```
   Bucket name: event-images
   Public bucket: ✅ Yes (checked)
   File size limit: 10 MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

**Why Public?** For easy image display without authentication tokens. Images will have public URLs.

---

### Step 1.2: Set Storage Policies (RLS for Storage)

**Action:** Configure Row Level Security policies for the storage buckets

#### For `profile-images` bucket:

1. **Allow authenticated users to upload their own profile images:**
   ```sql
   -- Policy: Allow authenticated users to upload profile images
   CREATE POLICY "Users can upload their own profile images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'profile-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

2. **Allow authenticated users to update their own profile images:**
   ```sql
   -- Policy: Users can update their own profile images
   CREATE POLICY "Users can update their own profile images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'profile-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Allow authenticated users to delete their own profile images:**
   ```sql
   -- Policy: Users can delete their own profile images
   CREATE POLICY "Users can delete their own profile images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'profile-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

4. **Allow public read access:**
   ```sql
   -- Policy: Public can view all profile images
   CREATE POLICY "Public can view profile images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'profile-images');
   ```

#### For `event-images` bucket:

1. **Allow authenticated users to upload event images:**
   ```sql
   -- Policy: Users can upload event images
   CREATE POLICY "Users can upload event images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'event-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

2. **Allow authenticated users to update their event images:**
   ```sql
   -- Policy: Users can update their event images
   CREATE POLICY "Users can update their event images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'event-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Allow authenticated users to delete their event images:**
   ```sql
   -- Policy: Users can delete their event images
   CREATE POLICY "Users can delete their event images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'event-images' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

4. **Allow public read access:**
   ```sql
   -- Policy: Public can view event images
   CREATE POLICY "Public can view event images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'event-images');
   ```

**Execute these in:** Supabase Dashboard → SQL Editor → New query → Run

---

### Step 1.3: Update Database Schema

**Action:** Add image URL columns to existing tables

```sql
-- Add logo_url column to companies table (if not exists)
-- This should already exist based on DATABASE_ARCHITECTURE.md
-- Just verify it exists:
-- ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add image columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.companies.logo_url IS 'URL to company/profile logo image stored in Supabase Storage';
COMMENT ON COLUMN public.events.image_url IS 'URL to event thumbnail image stored in Supabase Storage';
COMMENT ON COLUMN public.events.banner_url IS 'URL to event banner image stored in Supabase Storage';
```

**Execute in:** Supabase Dashboard → SQL Editor

**Verify Schema:**
- `companies` table has `logo_url` column (TEXT, nullable)
- `events` table has `image_url` column (TEXT, nullable)
- `events` table has `banner_url` column (TEXT, nullable)

---

## 📋 Phase 2: Frontend Implementation

### Step 2.1: Install Required Dependencies

**Action:** Install image picker and manipulation libraries

```bash
# Navigate to project root
cd /app

# Install expo-image-picker (for selecting images from device)
npx expo install expo-image-picker

# Install expo-image-manipulator (for resizing/optimizing images)
npx expo install expo-image-manipulator

# Install additional dependencies if needed
yarn install
```

**Verify installation:**
```bash
# Check package.json includes:
# - expo-image-picker
# - expo-image-manipulator
```

---

### Step 2.2: Create Image Upload Utility Hook

**Action:** Create a reusable hook for image uploads

**File:** `/app/hooks/useImageUpload.ts`

```typescript
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import getUser from "./getUser";

export type ImageUploadOptions = {
  bucket: "profile-images" | "event-images";
  folder?: string; // Optional subfolder within user folder
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

/**
 * Hook for uploading images to Supabase Storage
 * Handles image selection, compression, and upload
 * 
 * @returns Object with pickAndUploadImage function
 */
const useImageUpload = () => {
  /**
   * Request permissions for camera roll/photos access
   */
  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      console.error("Permission to access media library denied");
      return false;
    }
    
    return true;
  };

  /**
   * Compress and optimize image before upload
   */
  const compressImage = async (
    uri: string,
    maxWidth: number = 1024,
    maxHeight: number = 1024,
    quality: number = 0.7
  ): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return manipResult.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  /**
   * Upload image to Supabase Storage
   */
  const uploadToStorage = async (
    uri: string,
    bucket: string,
    filePath: string
  ): Promise<string> => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create file from blob
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${filePath}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true, // Replace if exists
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      throw error;
    }
  };

  /**
   * Main function: Pick image, compress, and upload
   */
  const pickAndUploadImage = async (
    options: ImageUploadOptions
  ): Promise<string | null> => {
    try {
      // Step 1: Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error("Permission to access media library denied");
      }

      // Step 2: Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: options.bucket === "profile-images" ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (result.canceled) {
        return null;
      }

      const imageUri = result.assets[0].uri;

      // Step 3: Compress image
      const compressedUri = await compressImage(
        imageUri,
        options.maxWidth || 1024,
        options.maxHeight || 1024,
        options.quality || 0.7
      );

      // Step 4: Get user ID for folder structure
      const user = await getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Step 5: Create file path (user_id/folder/timestamp)
      const timestamp = Date.now();
      const folder = options.folder || "default";
      const filePath = `${user.id}/${folder}/${timestamp}`;

      // Step 6: Upload to Supabase Storage
      const publicUrl = await uploadToStorage(
        compressedUri,
        options.bucket,
        filePath
      );

      return publicUrl;
    } catch (error) {
      console.error("Error in pickAndUploadImage:", error);
      throw error;
    }
  };

  return { pickAndUploadImage };
};

export default useImageUpload;
```

**Key Features:**
- ✅ Permission handling
- ✅ Image compression (reduces file size)
- ✅ User-specific folder structure
- ✅ Upsert (replace existing images)
- ✅ Public URL generation
- ✅ Type-safe with TypeScript

---

### Step 2.3: Update Profile Edit Page

**Action:** Add profile image upload functionality

**File:** `/app/app/profilePages/editProfile.tsx`

**Modifications needed:**

1. **Import the upload hook:**
```typescript
import useImageUpload from "@/hooks/useImageUpload";
```

2. **Add state for uploading:**
```typescript
const [uploadingImage, setUploadingImage] = useState(false);
```

3. **Initialize the upload hook:**
```typescript
const { pickAndUploadImage } = useImageUpload();
```

4. **Create upload handler function:**
```typescript
const handleProfileImageUpload = async () => {
  try {
    setUploadingImage(true);
    
    const imageUrl = await pickAndUploadImage({
      bucket: "profile-images",
      folder: "profile",
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    });

    if (imageUrl) {
      // Update local state
      setCompanyData({ ...companyData, logoUrl: imageUrl });
      
      // Update in database
      await useCompanyInfo({
        company: companyData.name,
        mail: companyData.mail,
        phone: companyData.phone,
        address: companyData.address,
        website: companyData.website,
        logo_url: imageUrl,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile image updated successfully!'
      });
    }
  } catch (error) {
    console.error("Failed to upload profile image:", error);
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: 'Failed to upload profile image. Please try again.'
    });
  } finally {
    setUploadingImage(false);
  }
};
```

5. **Update the "Change Profile" button (around line 128):**
```typescript
<Pressable 
  style={[styles.primaryBtn, uploadingImage && { opacity: 0.6 }]} 
  onPress={handleProfileImageUpload}
  disabled={uploadingImage}
>
  <Text style={styles.primaryBtnText}>
    {uploadingImage ? "Uploading..." : "Change Profile"}
  </Text>
</Pressable>
```

6. **Update the avatar image to show loading indicator:**
```typescript
<View style={{ position: 'relative' }}>
  <Image source={{ uri: companyData.logoUrl }} style={styles.avatar} />
  {uploadingImage && (
    <View style={styles.uploadingOverlay}>
      <ActivityIndicator color="#FFF" />
    </View>
  )}
</View>
```

7. **Add overlay style:**
```typescript
uploadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
```

**Note:** Also need to update the `useCompanyInfo` hook to include `logo_url` parameter.

---

### Step 2.4: Update useCompanyInfo Hook

**Action:** Ensure logo_url can be saved

**File:** `/app/hooks/useCompanyInfo.ts`

**Expected update:**
```typescript
// Add logo_url to the function parameters
const useCompanyInfo = async (payload: {
  company: string;
  mail?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string; // Add this
}) => {
  // ... rest of implementation
  // Make sure logo_url is included in the update
};
```

---

### Step 2.5: Update Event Creation Page

**Action:** Add event image upload functionality

**File:** `/app/app/event/manage/create.tsx` (need to locate this file)

**Implementation steps:**

1. **Import dependencies:**
```typescript
import useImageUpload from "@/hooks/useImageUpload";
import { Image, ActivityIndicator } from "react-native";
```

2. **Add state:**
```typescript
const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
const [uploadingImage, setUploadingImage] = useState(false);
```

3. **Initialize upload hook:**
```typescript
const { pickAndUploadImage } = useImageUpload();
```

4. **Create upload handler:**
```typescript
const handleEventImageUpload = async () => {
  try {
    setUploadingImage(true);
    
    const imageUrl = await pickAndUploadImage({
      bucket: "event-images",
      folder: "events",
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
    });

    if (imageUrl) {
      setEventImageUrl(imageUrl);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Event image uploaded successfully!'
      });
    }
  } catch (error) {
    console.error("Failed to upload event image:", error);
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: 'Failed to upload event image. Please try again.'
    });
  } finally {
    setUploadingImage(false);
  }
};
```

5. **Add image picker UI (insert before event title input):**
```typescript
{/* Event Image Section */}
<View style={styles.imageSection}>
  <Text style={styles.label}>Event Image (Optional)</Text>
  
  {eventImageUrl ? (
    <View style={styles.imagePreviewContainer}>
      <Image 
        source={{ uri: eventImageUrl }} 
        style={styles.imagePreview} 
      />
      <Pressable 
        style={styles.changeImageButton}
        onPress={handleEventImageUpload}
        disabled={uploadingImage}
      >
        <Text style={styles.changeImageText}>
          {uploadingImage ? "Uploading..." : "Change Image"}
        </Text>
      </Pressable>
    </View>
  ) : (
    <Pressable 
      style={styles.uploadButton}
      onPress={handleEventImageUpload}
      disabled={uploadingImage}
    >
      {uploadingImage ? (
        <ActivityIndicator color="#007AFF" />
      ) : (
        <>
          <Ionicons name="image-outline" size={32} color="#007AFF" />
          <Text style={styles.uploadButtonText}>Upload Event Image</Text>
        </>
      )}
    </Pressable>
  )}
</View>
```

6. **Add styles:**
```typescript
imageSection: {
  marginBottom: 20,
},
imagePreviewContainer: {
  width: '100%',
  borderRadius: 12,
  overflow: 'hidden',
},
imagePreview: {
  width: '100%',
  height: 200,
  resizeMode: 'cover',
},
changeImageButton: {
  backgroundColor: '#007AFF',
  padding: 12,
  alignItems: 'center',
  marginTop: 8,
  borderRadius: 8,
},
changeImageText: {
  color: '#FFFFFF',
  fontWeight: '600',
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
},
uploadButtonText: {
  marginTop: 8,
  color: '#007AFF',
  fontWeight: '600',
},
```

---

### Step 2.6: Update createEvent Hook

**Action:** Include image_url in event creation

**File:** `/app/hooks/createEvent.ts`

**Update CreateEventPayload type:**
```typescript
export type CreateEventPayload = {
  event: string;
  description?: string;
  payment?: number;
  status?: EventStatus;
  startDate: string;
  endDate?: string;
  customerId?: string;
  customerName?: string;
  image_url?: string; // Add this
  banner_url?: string; // Add this
};
```

**Update insert query (around line 40):**
```typescript
const { data, error } = await supabase
  .from("events")
  .insert({
    vendor_id: user.id,
    company_name: companyName,
    customer_id: payload.customerId || user.id,
    customer_name: payload.customerName || null,
    event: payload.event.trim(),
    description: payload.description?.trim() || null,
    date: dateArray,
    payment: payload.payment ?? 0,
    status: payload.status || "upcoming",
    image_url: payload.image_url || null, // Add this
    banner_url: payload.banner_url || null, // Add this
  })
  .select()
  .single();
```

---

### Step 2.7: Update Home Page to Display Images

**Action:** Ensure uploaded images are displayed correctly

**File:** `/app/app/(tabs)/home.tsx`

The home page already handles image display (line 183-192), so it should work automatically once images are uploaded.

**Verify:**
- Line 183: `const imageUri = item.image_url || item.banner_url || "";`
- Line 191: `source={imageUri ? { uri: imageUri } : placeholderImage}`

✅ Already implemented correctly!

---

## 📋 Phase 3: Testing Plan

### Test 3.1: Profile Image Upload

**Steps:**
1. Open app and navigate to Edit Profile page
2. Click "Change Profile" button
3. Select an image from device gallery
4. Wait for compression and upload
5. Verify image appears immediately in profile
6. Click Save
7. Navigate away and return - verify image persists
8. Check Supabase Storage bucket - verify file exists
9. Check companies table - verify logo_url is updated

**Expected Result:**
- ✅ Image picker opens
- ✅ Image compresses and uploads
- ✅ URL saved to database
- ✅ Image displays in profile
- ✅ Image persists after navigation

---

### Test 3.2: Event Image Upload

**Steps:**
1. Navigate to Create Event page
2. Click "Upload Event Image" button
3. Select an image from device gallery
4. Verify image preview appears
5. Fill in event details (title, dates, etc.)
6. Create event
7. Navigate to home page
8. Verify event card shows uploaded image
9. Check Supabase Storage - verify file exists
10. Check events table - verify image_url is populated

**Expected Result:**
- ✅ Image picker opens
- ✅ Image preview shows
- ✅ Event created with image
- ✅ Image displays in event cards
- ✅ Image loads correctly from URL

---

### Test 3.3: Permission Handling

**Steps:**
1. Fresh install of app
2. Try to upload image without granting permissions
3. Verify permission request appears
4. Deny permission
5. Verify error message appears
6. Grant permission in settings
7. Try upload again
8. Verify it works

**Expected Result:**
- ✅ Permission request shows
- ✅ Graceful error handling
- ✅ Works after permission granted

---

### Test 3.4: Large Image Handling

**Steps:**
1. Select a very large image (>5MB)
2. Verify compression works
3. Verify upload completes
4. Check file size in Supabase Storage
5. Verify image quality is acceptable

**Expected Result:**
- ✅ Image compresses to <1MB
- ✅ Upload succeeds
- ✅ Image quality acceptable

---

### Test 3.5: Replace Existing Image

**Steps:**
1. Upload a profile image
2. Upload a different image (replace)
3. Verify old image is replaced (upsert: true)
4. Check storage - only one file should exist

**Expected Result:**
- ✅ Old image replaced
- ✅ No duplicate files
- ✅ URL updated correctly

---

## 📋 Phase 4: Error Handling & Edge Cases

### Error Scenarios to Handle:

1. **No Internet Connection:**
   - Show error toast
   - Don't save to database until upload succeeds

2. **Upload Timeout:**
   - Implement timeout (30 seconds)
   - Show retry option

3. **Storage Quota Exceeded:**
   - Handle storage limit errors
   - Show user-friendly message

4. **Invalid Image Format:**
   - Validate file type before upload
   - Show error if unsupported format

5. **User Cancels Selection:**
   - Handle gracefully
   - Don't show error message

---

## 📋 Phase 5: Optimization & Polish

### Performance Optimizations:

1. **Image Caching:**
   - Use `expo-image` instead of native `Image` for better caching
   - Add loading states

2. **Compression Settings:**
   - Profile images: 500x500, quality 0.8
   - Event images: 1920x1080, quality 0.8

3. **Progress Indicators:**
   - Show upload progress
   - Disable buttons during upload

4. **Lazy Loading:**
   - Load images progressively
   - Use placeholder while loading

### UI/UX Improvements:

1. **Image Cropping:**
   - Allow users to crop before upload
   - Use `allowsEditing: true` in ImagePicker

2. **Delete Image Option:**
   - Add "Remove Image" button
   - Clear URL from database

3. **Image Preview:**
   - Show full-screen preview option
   - Add zoom capability

---

## 📋 Summary Checklist

### Backend (Supabase):
- [ ] ✅ Create `profile-images` storage bucket
- [ ] ✅ Create `event-images` storage bucket
- [ ] ✅ Set up RLS policies for profile-images
- [ ] ✅ Set up RLS policies for event-images
- [ ] ✅ Add `logo_url` column to `companies` table (verify exists)
- [ ] ✅ Add `image_url` column to `events` table
- [ ] ✅ Add `banner_url` column to `events` table

### Frontend Dependencies:
- [ ] ✅ Install `expo-image-picker`
- [ ] ✅ Install `expo-image-manipulator`
- [ ] ✅ Run `yarn install`

### Frontend Code:
- [ ] ✅ Create `/app/hooks/useImageUpload.ts`
- [ ] ✅ Update `/app/app/profilePages/editProfile.tsx`
- [ ] ✅ Update `/app/hooks/useCompanyInfo.ts`
- [ ] ✅ Update `/app/hooks/createEvent.ts`
- [ ] ✅ Locate and update event creation page
- [ ] ✅ Verify home page displays images

### Testing:
- [ ] ✅ Test profile image upload
- [ ] ✅ Test event image upload
- [ ] ✅ Test permissions handling
- [ ] ✅ Test large image compression
- [ ] ✅ Test image replacement
- [ ] ✅ Test error scenarios

---

## 🚀 Next Steps After Backend Setup

Once you've completed **Phase 1 (Backend Setup)** in Supabase:

1. **Confirm buckets are created** - Check Storage section in Supabase
2. **Verify policies are applied** - Test upload permissions
3. **Confirm schema is updated** - Check tables have image columns

Then proceed with **Phase 2 (Frontend Implementation)** where I'll help you:
- Install dependencies
- Create the upload hook
- Update the UI components
- Test the functionality

---

## 📞 Support & Troubleshooting

### Common Issues:

**Issue:** "Permission denied" error when uploading
**Solution:** Check RLS policies are correctly applied in Supabase

**Issue:** Image not displaying after upload
**Solution:** Verify bucket is public and URL is correct

**Issue:** Upload taking too long
**Solution:** Reduce image quality or max dimensions

**Issue:** "No such bucket" error
**Solution:** Verify bucket names match exactly ("profile-images", "event-images")

---

**Ready to start? Begin with Phase 1: Supabase Backend Setup!**

Let me know once you've completed the backend setup, and I'll help you implement the frontend code.
