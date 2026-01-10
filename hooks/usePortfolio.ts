import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';

export interface PortfolioItem {
    id: string;
    vendor_id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    thumbnail_url: string | null;
    event_type: string | null;
    event_date: string | null;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreatePortfolioItemParams {
    title?: string;
    description?: string;
    event_type?: string;
    event_date?: string;
    is_featured?: boolean;
}

export interface UpdatePortfolioItemParams extends Partial<CreatePortfolioItemParams> {
    sort_order?: number;
}

/**
 * Hook to fetch and manage vendor portfolio items
 */
export const usePortfolio = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error('Authentication error:', authError);
                setLoading(false);
                return;
            }

            setUserId(user.id);

            const { data, error: fetchError } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('vendor_id', user.id)
                .order('is_featured', { ascending: false })
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Failed to fetch portfolio:', fetchError);
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            setItems(data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching portfolio:', err);
            setError('Failed to load portfolio');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

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
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (result.canceled) return null;

            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Read file as base64
            const asset = result.assets[0];
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Generate file path
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

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

            // Create portfolio item
            const { data, error: insertError } = await supabase
                .from('portfolio_items')
                .insert({
                    vendor_id: user.id,
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

            setItems((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error uploading image:', err);
            setError(err.message);
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

            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, ...params, updated_at: new Date().toISOString() } : item))
            );
            return true;
        } catch (err: any) {
            console.error('Error updating portfolio item:', err);
            setError(err.message);
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

            // Try to delete from storage (ignore errors)
            if (item?.image_url) {
                try {
                    const path = item.image_url.split('/portfolio/').pop();
                    if (path) {
                        await supabase.storage.from('portfolio').remove([path]);
                    }
                } catch (e) {
                    console.warn('Could not delete image from storage:', e);
                }
            }

            setItems((prev) => prev.filter((i) => i.id !== id));
            return true;
        } catch (err: any) {
            console.error('Error deleting portfolio item:', err);
            setError(err.message);
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
        refetch: fetchPortfolio,
        pickAndUploadImage,
        updateItem,
        deleteItem,
        toggleFeatured,
    };
};
