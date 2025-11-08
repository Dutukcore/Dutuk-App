import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import getUser from "./getUser";

export type ImageUploadOptions = {
  bucket: "profile-images" | "event-images";
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

/**
 * Hook for uploading images to Supabase Storage
 * Handles image selection, compression, and upload with proper state management
 * 
 * @returns Object with pickAndUploadImage function
 */
const useImageUpload = () => {
  /**
   * Request permissions for camera roll/photos access
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        console.error("Permission to access media library denied");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
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
      console.log("Compressing image:", uri);
      
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log("Image compressed successfully:", manipResult.uri);
      return manipResult.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw new Error("Failed to compress image");
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
      console.log("Uploading to storage:", { bucket, filePath });
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create array buffer from blob
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${filePath}.${fileExt}`;

      console.log("File name:", fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log("Public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      throw new Error("Failed to upload image to storage");
    }
  };

  /**
   * Main function: Pick image, compress, and upload
   * @returns Image URL or null if cancelled
   */
  const pickAndUploadImage = async (
    options: ImageUploadOptions
  ): Promise<string | null> => {
    try {
      console.log("Starting image upload process with options:", options);

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
        console.log("Image selection cancelled by user");
        return null;
      }

      const imageUri = result.assets[0].uri;
      console.log("Image selected:", imageUri);

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

      console.log("Image upload completed successfully:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error in pickAndUploadImage:", error);
      throw error;
    }
  };

  return { pickAndUploadImage };
};

export default useImageUpload;
