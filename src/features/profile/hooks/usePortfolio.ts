import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreatePortfolioItemParams, PortfolioItem, UpdatePortfolioItemParams } from '@/store/useVendorStore';
import { useVendorStore } from '@/store/useVendorStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

// Inline decode function to avoid external dependency
function decode(base64: string): ArrayBuffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    const bufferLength = base64.length * 0.75;
    const len = base64.length;
    let p = 0;
    let encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === '=') {
        p++;
        if (base64[base64.length - 2] === '=') {
            p++;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength - p);
    const bytes = new Uint8Array(arraybuffer);

    p = 0;
    for (let i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
}

export type { CreatePortfolioItemParams, PortfolioItem, UpdatePortfolioItemParams } from '@/store/useVendorStore';

/**
 * Hook to fetch and manage vendor portfolio items
 * Now uses Zustand store for SWR caching
 */
export const usePortfolio = () => {
    const userId = useAuthStore((s) => s.userId);
    const items = useVendorStore((s) => s.portfolioItems);
    const loading = useVendorStore((s) => s.portfolioLoading);
    const fetchPortfolio = useVendorStore((s) => s.fetchPortfolio);

    // Store mutations
    const addPortfolioItem = useVendorStore((s) => s.addPortfolioItem);
    const updatePortfolioItemInStore = useVendorStore((s) => s.updatePortfolioItem);
    const removePortfolioItemFromStore = useVendorStore((s) => s.removePortfolioItem);

    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchPortfolio();
        }
    }, [userId, fetchPortfolio]);

    // Pick and upload image
    const pickAndUploadImage = async (params?: CreatePortfolioItemParams): Promise<PortfolioItem | null> => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access photos was denied');
                return null;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled) return null;

            setUploading(true);
            const currentUserId = useAuthStore.getState().userId;
            if (!currentUserId) throw new Error('Not authenticated');

            // Read file as base64
            const asset = result.assets[0];
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: 'base64',
            });

            // Generate file path
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(fileName, decode(base64), {
                    contentType: `image/${fileExt}`,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(uploadData.path);

            // Create portfolio item using auth user's ID
            const { data, error: insertError } = await supabase
                .from('portfolio_items')
                .insert({
                    vendor_id: currentUserId,
                    image_url: publicUrl,
                    title: params?.title || null,
                    description: params?.description || null,
                    event_type: params?.event_type || null,
                    event_date: params?.event_date || null,
                    is_featured: params?.is_featured || false,
                    sort_order: items.length,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            addPortfolioItem(data);
            return data;
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Error uploading image:', error);
            setError(error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    // Pick and upload video
    const pickAndUploadVideo = async (params?: CreatePortfolioItemParams): Promise<PortfolioItem | null> => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access media was denied. Please enable media access in Settings.');
                return null;
            }

            // Pick video
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: false,
                quality: 0.5,
                videoMaxDuration: 300,
                videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
            });

            if (result.canceled) return null;

            const asset = result.assets[0];

            // Check video duration
            if (asset.duration && asset.duration > 60000) {
                setError(`Video is too long (${Math.round(asset.duration / 1000)}s). Please select a video under 60 seconds.`);
                return null;
            }

            setUploading(true);
            const currentUserId = useAuthStore.getState().userId;
            if (!currentUserId) throw new Error('Not authenticated');

            // Read video file
            let arrayBuffer: ArrayBuffer;
            try {
                const response = await fetch(asset.uri);
                if (!response.ok) {
                    throw new Error('Failed to read video file');
                }
                arrayBuffer = await response.arrayBuffer();
            } catch (err: unknown) {
                throw new Error('Could not access video file. Please try again.');
            }

            // Get file extension
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'mp4';
            const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

            // Upload
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(fileName, arrayBuffer, {
                    contentType: `video/${fileExt}`,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(uploadData.path);

            // Create portfolio item using auth user's ID
            const { data, error: insertError } = await supabase
                .from('portfolio_items')
                .insert({
                    vendor_id: currentUserId,
                    image_url: publicUrl,
                    title: params?.title || null,
                    description: params?.description || null,
                    event_type: params?.event_type || null,
                    event_date: params?.event_date || null,
                    is_featured: params?.is_featured || false,
                    sort_order: items.length,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            addPortfolioItem(data);
            setError(null);
            return data;
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Error uploading video:', error);
            setError(error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    // Update a portfolio item
    const updateItem = async (id: string, params: UpdatePortfolioItemParams): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('portfolio_items')
                .update({
                    ...params,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            updatePortfolioItemInStore(id, { ...params, updated_at: new Date().toISOString() });
            return true;
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Error updating portfolio item:', error);
            setError(error.message);
            return false;
        }
    };

    // Delete a portfolio item
    const deleteItem = async (id: string): Promise<boolean> => {
        try {
            const item = items.find((i) => i.id === id);

            // Delete from database
            const { error: deleteError } = await supabase
                .from('portfolio_items')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            // Try to delete from storage
            if (item?.image_url) {
                try {
                    const path = item.image_url.split('/portfolio/').pop();
                    if (path) {
                        await supabase.storage.from('portfolio').remove([path]);
                    }
                } catch (e) {
                    logger.warn('Could not delete media from storage:', e);
                }
            }

            removePortfolioItemFromStore(id);
            return true;
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Error deleting portfolio item:', error);
            setError(error.message);
            return false;
        }
    };

    // Toggle featured status
    const toggleFeatured = async (id: string): Promise<boolean> => {
        const item = items.find((i) => i.id === id);
        if (!item) return false;
        return updateItem(id, { is_featured: !item.is_featured });
    };

    return {
        items,
        loading,
        error,
        uploading,
        vendorId: userId,
        refetch: () => fetchPortfolio({ force: true }),
        pickAndUploadImage,
        pickAndUploadVideo,
        updateItem,
        deleteItem,
        toggleFeatured,
    };
};
