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
      console.log("=== Starting Upload to Storage ===");
      console.log("Bucket:", bucket);
      console.log("File path:", filePath);
      console.log("URI:", uri);
      
      // Convert image to blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log("Image blob size:", blob.size, "bytes");
      console.log("Image blob type:", blob.type);

      // Create array buffer from blob
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${filePath}.${fileExt}`;

      console.log("File name:", fileName);
      console.log("File extension:", fileExt);

      // Get proper MIME type
      const mimeType = getMimeType(fileExt);
      console.log("MIME type:", mimeType);
      console.log("Array buffer size:", arrayBuffer.byteLength, "bytes");

      // Upload to Supabase Storage
      console.log("Attempting upload to Supabase...");
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error("=== Supabase Upload Error ===");
        console.error("Error object:", JSON.stringify(error, null, 2));
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
        
        // Provide more specific error messages
        if (error.message?.includes('Bucket not found')) {
          throw new Error(`Storage bucket "${bucket}" not found. Please ensure the bucket is created in Supabase Dashboard: Storage → Create bucket → Name: "${bucket}" → Public: Yes`);
        } else if (error.message?.includes('row-level security')) {
          throw new Error(`Permission denied. Please check storage policies for "${bucket}" bucket in Supabase Dashboard.`);
        } else {
          throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
        }
      }

      console.log("Upload successful!");
      console.log("Upload data:", JSON.stringify(data, null, 2));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log("Public URL generated:", urlData.publicUrl);
      
      if (!urlData.publicUrl) {
        throw new Error("Failed to generate public URL");
      }
      
      console.log("=== Upload Complete ===");
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("=== Upload Error ===");
      console.error("Error:", error);
      console.error("Error message:", error?.message);
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
      console.log("Starting image selection with options:", options);

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
        console.log("Image selection cancelled by user");
        return null;
      }

      const imageUri = result.assets[0].uri;
      console.log("Image selected:", imageUri);

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

      console.log("Image compressed successfully:", compressedUri);
      return compressedUri;
    } catch (error: any) {
      console.error("Error in pickImage:", error);
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
      console.log("Starting image upload:", imageUri);

      if (!imageUri) {
        throw new Error("No image URI provided for upload");
      }

      // Get user ID for folder structure
      const user = await getUser();
      if (!user) {
        throw new Error("User not authenticated. Please log in and try again.");
      }

      // Create file path (user_id/folder/timestamp)
      const timestamp = Date.now();
      const folder = options.folder || "default";
      const filePath = `${user.id}/${folder}/${timestamp}`;

      console.log("Uploading with file path:", filePath);

      // Upload to Supabase Storage
      const publicUrl = await uploadToStorage(
        imageUri,
        options.bucket,
        filePath
      );

      console.log("Image upload completed successfully:", publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error("Error in uploadImage:", error);
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
      console.log("Starting image upload process with options:", options);

      // Pick and compress image
      const compressedUri = await pickImage(options);
      if (!compressedUri) {
        return null; // User cancelled
      }

      // Upload the image
      const publicUrl = await uploadImage(compressedUri, options);
      return publicUrl;
    } catch (error) {
      console.error("Error in pickAndUploadImage:", error);
      throw error;
    }
  };

  return { pickImage, uploadImage, pickAndUploadImage };
};

export default useImageUpload;
