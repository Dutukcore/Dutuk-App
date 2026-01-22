import getUser from '@/hooks/getUser';
import { supabase } from '@/utils/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

// =====================================================
// TYPES
// =====================================================

export interface Attachment {
    uri: string;
    name: string;
    type: string;
    size: number;
}

export interface UploadedAttachment {
    url: string;
    name: string;
    type: string;
    size: string;
}

// =====================================================
// HOOK: useAttachments
// =====================================================

/**
 * Handles file/image attachments in chat
 * - Pick images from gallery or camera
 * - Pick documents
 * - Upload to Supabase Storage
 * 
 * @returns Object with pick functions, upload function, and state
 */
export function useAttachments() {
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Request permissions for image picker
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access media library is required');
                return false;
            }
        }
        return true;
    };

    // Pick image from gallery
    const pickImage = useCallback(async (): Promise<Attachment | null> => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return null;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const fileName = asset.uri.split('/').pop() || 'image.jpg';
                const fileType = asset.mimeType || 'image/jpeg';

                const newAttachment: Attachment = {
                    uri: asset.uri,
                    name: fileName,
                    type: fileType,
                    size: asset.fileSize || 0,
                };

                setAttachment(newAttachment);
                setError(null);
                return newAttachment;
            }
            return null;
        } catch (err: any) {
            console.error('Error picking image:', err);
            setError(err.message || 'Failed to pick image');
            return null;
        }
    }, []);

    // Take photo with camera
    const takePhoto = useCallback(async (): Promise<Attachment | null> => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access camera is required');
                return null;
            }
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const fileName = `photo_${Date.now()}.jpg`;

                const newAttachment: Attachment = {
                    uri: asset.uri,
                    name: fileName,
                    type: 'image/jpeg',
                    size: asset.fileSize || 0,
                };

                setAttachment(newAttachment);
                setError(null);
                return newAttachment;
            }
            return null;
        } catch (err: any) {
            console.error('Error taking photo:', err);
            setError(err.message || 'Failed to take photo');
            return null;
        }
    }, []);

    // Pick document
    const pickDocument = useCallback(async (): Promise<Attachment | null> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                const newAttachment: Attachment = {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/octet-stream',
                    size: asset.size || 0,
                };

                setAttachment(newAttachment);
                setError(null);
                return newAttachment;
            }
            return null;
        } catch (err: any) {
            console.error('Error picking document:', err);
            setError(err.message || 'Failed to pick document');
            return null;
        }
    }, []);

    // Upload attachment to Supabase Storage
    const uploadAttachment = useCallback(async (
        attachmentToUpload?: Attachment
    ): Promise<UploadedAttachment | null> => {
        const fileToUpload = attachmentToUpload || attachment;

        if (!fileToUpload) {
            setError('No attachment to upload');
            return null;
        }

        try {
            setUploading(true);
            setError(null);

            const user = await getUser();
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            // Create unique file path
            const fileExt = fileToUpload.name.split('.').pop() || 'file';
            const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // For React Native, we need to create a proper file object
            // Using FormData approach which is more reliable on mobile
            const formData = new FormData();

            // React Native requires this specific format for file uploads
            formData.append('file', {
                uri: Platform.OS === 'android'
                    ? fileToUpload.uri
                    : fileToUpload.uri.replace('file://', ''),
                name: fileToUpload.name,
                type: fileToUpload.type,
            } as any);

            // Upload to Supabase Storage using the arraybuffer approach
            const response = await fetch(fileToUpload.uri);
            const arrayBuffer = await response.arrayBuffer();

            const { data, error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(fileName, arrayBuffer, {
                    contentType: fileToUpload.type,
                    cacheControl: '3600',
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(fileName);

            const uploadedAttachment: UploadedAttachment = {
                url: publicUrl,
                name: fileToUpload.name,
                type: fileToUpload.type,
                size: formatFileSize(fileToUpload.size),
            };

            // Clear the local attachment
            setAttachment(null);

            return uploadedAttachment;
        } catch (err: any) {
            console.error('Error uploading attachment:', err);
            setError(err.message || 'Failed to upload attachment');
            return null;
        } finally {
            setUploading(false);
        }
    }, [attachment]);

    // Clear attachment
    const clearAttachment = useCallback(() => {
        setAttachment(null);
        setError(null);
    }, []);

    return {
        attachment,
        uploading,
        error,
        pickImage,
        takePhoto,
        pickDocument,
        uploadAttachment,
        clearAttachment,
    };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isImageType(type: string): boolean {
    return type.startsWith('image/');
}

export function getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📎';
}
