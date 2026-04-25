/**
 * Vendor Services Hook — reads/writes to `vendor_services` table.
 * Now uses Zustand store for SWR caching.
 */
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { CreateServiceParams, Service, UpdateServiceParams } from '@/store/useVendorStore';
import { useVendorStore } from '@/store/useVendorStore';
import { useEffect, useState } from 'react';

export type { CreateServiceParams, PricingModel, Service, UpdateServiceParams } from '@/store/useVendorStore';

/** Fetch and manage the authenticated vendor's services 
 * Now uses Zustand store for SWR caching
*/
export const useServices = () => {
  const company = useVendorStore((s) => s.company);
  const services = useVendorStore((s) => s.vendorServices);
  const loading = useVendorStore((s) => s.servicesLoading);
  const fetchServices = useVendorStore((s) => s.fetchServices);

  // Store mutations
  const addVendorService = useVendorStore((s) => s.addVendorService);
  const updateVendorServiceInStore = useVendorStore((s) => s.updateVendorService);
  const removeVendorServiceFromStore = useVendorStore((s) => s.removeVendorService);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company?.id) {
      fetchServices();
    }
  }, [company?.id, fetchServices]);

  /** Create a new service */
  const createService = async (params: CreateServiceParams): Promise<Service | null> => {
    try {
      const companyId = useVendorStore.getState().company?.id;
      if (!companyId) throw new Error('No company ID found in vendor store');

      const { data, error: insertError } = await supabase
        .from('vendor_services')
        .insert({
          company_id: companyId,
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

      addVendorService(data);
      return data;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('Error creating service', error);
      setError(error.message);
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

      updateVendorServiceInStore(id, { ...params, updated_at: new Date().toISOString() });
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('Error updating service', error);
      setError(error.message);
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

      removeVendorServiceFromStore(id);
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('Error deleting service', error);
      setError(error.message);
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
    refetch: () => fetchServices({ force: true }),
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
  };
};
