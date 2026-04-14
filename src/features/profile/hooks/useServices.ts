/**
 * Vendor Services Hook — reads/writes to `vendor_services` table.
 * Replaces the old `services` table (now renamed services_deprecated).
 */
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export type PricingModel = 'starting' | 'range' | 'quote';

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  category: string | null;
  pricing_model: PricingModel;
  min_price: number | null;
  max_price: number | null;
  usp_tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceParams {
  name: string;
  description?: string;
  category?: string;
  pricing_model?: PricingModel;
  min_price?: number;
  max_price?: number;
  usp_tags?: string[];
  is_active?: boolean;
}

export interface UpdateServiceParams extends Partial<CreateServiceParams> {}

/** Fetch and manage the authenticated vendor's services */
export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        logger.error('Authentication error in useServices');
        setLoading(false);
        return;
      }

      // Resolve company_id from user_id
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        logger.error('No company found for user in useServices');
        setLoading(false);
        return;
      }

      setCompanyId(company.id);

      const { data, error: fetchError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        logger.error('Failed to fetch vendor services');
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setServices(data || []);
    } catch (err) {
      logger.error('Error fetching services', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  /** Create a new service */
  const createService = async (params: CreateServiceParams): Promise<Service | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let cId = companyId;
      if (!cId) {
        const { data: company } = await supabase
          .from('companies').select('id').eq('user_id', user.id).single();
        cId = company?.id || null;
      }
      if (!cId) throw new Error('No company found');

      const { data, error: insertError } = await supabase
        .from('vendor_services')
        .insert({
          company_id: cId,
          name: params.name,
          description: params.description || null,
          category: params.category || null,
          pricing_model: params.pricing_model || 'starting',
          min_price: params.min_price ?? null,
          max_price: params.max_price ?? null,
          usp_tags: params.usp_tags || null,
          is_active: params.is_active ?? true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setServices(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      logger.error('Error creating service', err);
      setError(err.message);
      return null;
    }
  };

  /** Update an existing service */
  const updateService = async (id: string, params: UpdateServiceParams): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('vendor_services')
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      setServices(prev =>
        prev.map(s => s.id === id ? { ...s, ...params, updated_at: new Date().toISOString() } : s)
      );
      return true;
    } catch (err: any) {
      logger.error('Error updating service', err);
      setError(err.message);
      return false;
    }
  };

  /** Delete a service */
  const deleteService = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('vendor_services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      logger.error('Error deleting service', err);
      setError(err.message);
      return false;
    }
  };

  /** Toggle a service's active state */
  const toggleServiceActive = async (id: string): Promise<boolean> => {
    const service = services.find(s => s.id === id);
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
