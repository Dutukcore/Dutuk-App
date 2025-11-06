-- Dutuk Backend - Helper Functions and Triggers
-- Execute this in Supabase SQL Editor AFTER creating tables and policies

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Auto-update updated_at on all tables
-- =====================================================

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_companies
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_dates
    BEFORE UPDATE ON public.dates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
    BEFORE UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reviews
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_earnings
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCTION: Create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Get request count for a vendor
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_request_count(vendor_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    company_name_var TEXT;
    request_count INTEGER;
BEGIN
    -- Get company name for this vendor
    SELECT company INTO company_name_var
    FROM public.companies
    WHERE user_id = vendor_user_id
    LIMIT 1;
    
    -- Count pending requests
    SELECT COUNT(*) INTO request_count
    FROM public.requests
    WHERE company_name = company_name_var
    AND status = 'pending';
    
    RETURN COALESCE(request_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Update event dates from array
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_event_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract start and end dates from date array
    IF NEW.date IS NOT NULL AND array_length(NEW.date, 1) > 0 THEN
        NEW.start_date := (NEW.date[1])::DATE;
        NEW.end_date := (NEW.date[array_length(NEW.date, 1)])::DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set start/end dates
CREATE TRIGGER set_event_dates
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_event_dates();

-- =====================================================
-- FUNCTION: Update event status based on dates
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS void AS $$
BEGIN
    -- Update to ongoing if start date is today or past and end date is future
    UPDATE public.events
    SET status = 'ongoing'
    WHERE status = 'upcoming'
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE;
    
    -- Update to completed if end date is past
    UPDATE public.events
    SET status = 'completed'
    WHERE status IN ('upcoming', 'ongoing')
    AND end_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Set vendor role on registration
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_vendor_role(user_id_param UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (user_id_param, 'vendor')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'vendor';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get vendor dashboard stats
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_vendor_stats(vendor_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_events', (
            SELECT COUNT(*) FROM public.events WHERE vendor_id = vendor_user_id
        ),
        'active_events', (
            SELECT COUNT(*) FROM public.events 
            WHERE vendor_id = vendor_user_id 
            AND status IN ('upcoming', 'ongoing')
        ),
        'pending_requests', (
            SELECT COUNT(*) FROM public.requests r
            INNER JOIN public.companies c ON r.company_name = c.company
            WHERE c.user_id = vendor_user_id AND r.status = 'pending'
        ),
        'total_earnings', (
            SELECT COALESCE(SUM(amount), 0) 
            FROM public.earnings 
            WHERE vendor_id = vendor_user_id
        ),
        'avg_rating', (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE vendor_id = vendor_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEDULED JOB (Optional - requires pg_cron extension)
-- =====================================================

-- To enable scheduled jobs, run this:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule event status updates (runs daily at midnight)
-- SELECT cron.schedule(
--     'update-event-status',
--     '0 0 * * *',
--     'SELECT public.update_event_status();'
-- );