import { supabase } from '@/utils/supabase';

export interface EventInquiry {
    id: string;
    event_id: string;
    vendor_id: string;
    quoted_price: number | null;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED';
    created_at: string;
    updated_at: string;
    // Joined data
    planned_event?: {
        id: string;
        title: string;
        event_date: string;
        status: string;
        user_id: string;
    };
    customer?: {
        id: string;
        email?: string;
    };
}

/**
 * Fetch pending inquiries for the current vendor
 */
export const getVendorInquiries = async (vendorProfileId: string): Promise<EventInquiry[]> => {
    try {
        // First get inquiries
        const { data: inquiries, error } = await supabase
            .from('event_inquiry_items')
            .select(`
        *,
        planned_event:planned_events!event_id (
          id,
          title,
          event_date,
          status,
          user_id
        )
      `)
            .eq('vendor_id', vendorProfileId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return inquiries || [];
    } catch (err) {
        console.error('Error fetching vendor inquiries:', err);
        return [];
    }
};

/**
 * Fetch only pending inquiries
 */
export const getPendingInquiries = async (vendorProfileId: string): Promise<EventInquiry[]> => {
    try {
        const { data: inquiries, error } = await supabase
            .from('event_inquiry_items')
            .select(`
        *,
        planned_event:planned_events!event_id (
          id,
          title,
          event_date,
          status,
          user_id
        )
      `)
            .eq('vendor_id', vendorProfileId)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return inquiries || [];
    } catch (err) {
        console.error('Error fetching pending inquiries:', err);
        return [];
    }
};

/**
 * Count pending inquiries for badge display
 */
export const getPendingInquiriesCount = async (vendorProfileId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('event_inquiry_items')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendorProfileId)
            .eq('status', 'PENDING');

        if (error) throw error;

        return count || 0;
    } catch (err) {
        console.error('Error counting pending inquiries:', err);
        return 0;
    }
};

/**
 * Accept an inquiry
 */
export const acceptInquiry = async (inquiryId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('event_inquiry_items')
            .update({
                status: 'ACCEPTED',
                updated_at: new Date().toISOString()
            })
            .eq('id', inquiryId);

        if (error) throw error;

        return true;
    } catch (err) {
        console.error('Error accepting inquiry:', err);
        return false;
    }
};

/**
 * Reject an inquiry
 */
export const rejectInquiry = async (inquiryId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('event_inquiry_items')
            .update({
                status: 'REJECTED',
                updated_at: new Date().toISOString()
            })
            .eq('id', inquiryId);

        if (error) throw error;

        return true;
    } catch (err) {
        console.error('Error rejecting inquiry:', err);
        return false;
    }
};
