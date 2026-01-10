import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Service {
    id: string;
    vendor_id: string;
    name: string;
    description: string | null;
    price: number | null;
    price_type: 'fixed' | 'starting_from' | 'hourly' | 'per_event' | 'custom' | null;
    duration_hours: number | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateServiceParams {
    name: string;
    description?: string;
    price?: number;
    price_type?: Service['price_type'];
    duration_hours?: number;
    is_active?: boolean;
}

export interface UpdateServiceParams extends Partial<CreateServiceParams> {
    sort_order?: number;
}

/**
 * Hook to fetch and manage vendor services
 */
export const useServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
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
                .from('services')
                .select('*')
                .eq('vendor_id', user.id)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Failed to fetch services:', fetchError);
                setError(fetchError.message);
                setLoading(false);
                return;
            }

            setServices(data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Create a new service
    const createService = async (params: CreateServiceParams): Promise<Service | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error: insertError } = await supabase
                .from('services')
                .insert({
                    vendor_id: user.id,
                    name: params.name,
                    description: params.description || null,
                    price: params.price || null,
                    price_type: params.price_type || null,
                    duration_hours: params.duration_hours || null,
                    is_active: params.is_active ?? true,
                    sort_order: services.length, // Add at end
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setServices((prev) => [...prev, data]);
            return data;
        } catch (err: any) {
            console.error('Error creating service:', err);
            setError(err.message);
            return null;
        }
    };

    // Update a service
    const updateService = async (id: string, params: UpdateServiceParams): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('services')
                .update({
                    ...params,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setServices((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...params, updated_at: new Date().toISOString() } : s))
            );
            return true;
        } catch (err: any) {
            console.error('Error updating service:', err);
            setError(err.message);
            return false;
        }
    };

    // Delete a service
    const deleteService = async (id: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setServices((prev) => prev.filter((s) => s.id !== id));
            return true;
        } catch (err: any) {
            console.error('Error deleting service:', err);
            setError(err.message);
            return false;
        }
    };

    // Toggle service active status
    const toggleServiceActive = async (id: string): Promise<boolean> => {
        const service = services.find((s) => s.id === id);
        if (!service) return false;

        return updateService(id, { is_active: !service.is_active });
    };

    return {
        services,
        loading,
        error,
        refetch: fetchServices,
        createService,
        updateService,
        deleteService,
        toggleServiceActive,
    };
};
