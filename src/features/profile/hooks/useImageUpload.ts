import { useAuthStore } from "@/store/useAuthStore";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

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
        logger.error("Permission to access media library denied");
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error requesting permissions");
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
      logger.log("Compressing image");

      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      logger.log("Image compressed successfully");
      return manipResult.uri;
    } catch (error) {
      logger.error("Error compressing image");
      throw new Error("Failed to compress image");
    }
  };

  /**
   * Get proper MIME type from file extension
   */
  const getMimeType = (fileExt: string): string => {
    const ext = fileExt.toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };
    return mimeTypeMap[ext] || 'image/jpeg';
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
      logger.log("Starting upload to storage");

      // Check if user is authenticated
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error("User is not authenticated. Please log in and try again.");
      }

      // Convert image to blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create array buffer from blob
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${filePath}.${fileExt}`;

      // Get proper MIME type
      const mimeType = getMimeType(fileExt);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        logger.error("Upload failed:", error.message);
        throw new Error('Upload failed. Please try again.');
      }

      logger.log("Upload complete");

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      return urlData.publicUrl;
    } catch (error: any) {
      logger.error("Upload error:", error?.message);
      throw new Error(error?.message || "Failed to upload image to storage");
    }
  };

  /**
   * Pick and compress image only (no upload)
   * @returns Compressed image URI or null if cancelled
   */
  const pickImage = async (
    options: ImageUploadOptions
  ): Promise<string | null> => {
    try {
      logger.log("Starting image selection");

      // Step 1: Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error("Permission to access media library denied. Please enable photo access in your device settings.");
      }

      // Step 2: Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: options.bucket === "profile-images" ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (result.canceled) {
        logger.log("Image selection cancelled");
        return null;
      }

      const imageUri = result.assets[0].uri;

      if (!imageUri) {
        throw new Error("No image URI received from picker");
      }

      // Step 3: Compress image
      const compressedUri = await compressImage(
        imageUri,
        options.maxWidth || 1024,
        options.maxHeight || 1024,
        options.quality || 0.7
      );

      logger.log("Image compressed successfully");
      return compressedUri;
    } catch (error: any) {
      logger.error("Error in pickImage");
      throw new Error(error?.message || "Failed to select image");
    }
  };

  /**
   * Upload a previously selected image
   * @param imageUri - Local URI of the compressed image
   * @param options - Upload options
   * @returns Public URL of uploaded image
   */
  const uploadImage = async (
    imageUri: string,
    options: ImageUploadOptions
  ): Promise<string> => {
    try {
      logger.log("Starting image upload");

      if (!imageUri) {
        throw new Error("No image URI provided for upload");
      }

      // Get user ID for folder structure
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error("User not authenticated. Please log in and try again.");
      }

      // Create file path (user_id/folder/timestamp)
      const timestamp = Date.now();
      const folder = options.folder || "default";
      const filePath = `${user.id}/${folder}/${timestamp}`;

      logger.log("Uploading image");

      // Upload to Supabase Storage
      const publicUrl = await uploadToStorage(
        imageUri,
        options.bucket,
        filePath
      );

      logger.log("Image upload completed");
      return publicUrl;
    } catch (error: any) {
      logger.error("Error in uploadImage");
      throw new Error(error?.message || "Failed to upload image");
    }
  };

  /**
   * Main function: Pick image, compress, and upload (all in one)
   * @returns Image URL or null if cancelled
   */
  const pickAndUploadImage = async (
    options: ImageUploadOptions
  ): Promise<string | null> => {
    try {
      logger.log("Starting image upload process");

      // Pick and compress image
      const compressedUri = await pickImage(options);
      if (!compressedUri) {
        return null; // User cancelled
      }

      // Upload the image
      const publicUrl = await uploadImage(compressedUri, options);
      return publicUrl;
    } catch (error) {
      logger.error("Error in pickAndUploadImage");
      throw error;
    }
  };

  /**
   * Delete image from Supabase Storage
   * @param imageUrl - Full public URL of the image to delete
   * @returns true if deleted successfully, false otherwise
   */
  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      if (!imageUrl) {
        return false;
      }

      logger.log("Starting image deletion");

      // Extract bucket and file path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filepath]
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length < 2) {
        logger.error("Invalid image URL format");
        return false;
      }

      const pathParts = urlParts[1].split('/');
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      // Delete from Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        logger.error("Error deleting image from storage");
        // Don't throw error - we don't want to block event deletion if image delete fails
        return false;
      }

      logger.log("Image deleted successfully");
      return true;
    } catch (error: any) {
      logger.error("Error in deleteImage");
      // Don't throw - just log and return false
      return false;
    }
  };

  return { pickImage, uploadImage, pickAndUploadImage, deleteImage };
};

export default useImageUpload;
