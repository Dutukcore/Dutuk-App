-- Dutuk Backend - Row Level Security (RLS) Policies
-- Execute this in Supabase SQL Editor AFTER creating tables

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- COMPANIES POLICIES
-- =====================================================

-- Users can read their own company
CREATE POLICY "Users can read own company"
    ON public.companies
    FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can read company info (public profiles)
CREATE POLICY "Public can read companies"
    ON public.companies
    FOR SELECT
    USING (true);

-- Users can insert their own company
CREATE POLICY "Users can insert own company"
    ON public.companies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own company
CREATE POLICY "Users can update own company"
    ON public.companies
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own company
CREATE POLICY "Users can delete own company"
    ON public.companies
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- DATES POLICIES
-- =====================================================

-- Users can read their own dates
CREATE POLICY "Users can read own dates"
    ON public.dates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own dates
CREATE POLICY "Users can insert own dates"
    ON public.dates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own dates
CREATE POLICY "Users can update own dates"
    ON public.dates
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own dates
CREATE POLICY "Users can delete own dates"
    ON public.dates
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- REQUESTS POLICIES
-- =====================================================

-- Vendors can see requests for their company
CREATE POLICY "Vendors can see their requests"
    ON public.requests
    FOR SELECT
    USING (
        company_name IN (
            SELECT company FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Customers can see their own requests
CREATE POLICY "Customers can see own requests"
    ON public.requests
    FOR SELECT
    USING (customer_id = auth.uid());

-- Anyone authenticated can insert requests
CREATE POLICY "Authenticated users can insert requests"
    ON public.requests
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Vendors can update requests for their company
CREATE POLICY "Vendors can update their requests"
    ON public.requests
    FOR UPDATE
    USING (
        company_name IN (
            SELECT company FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Vendors can delete requests for their company
CREATE POLICY "Vendors can delete their requests"
    ON public.requests
    FOR DELETE
    USING (
        company_name IN (
            SELECT company FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

-- Vendors can see their own events
CREATE POLICY "Vendors can see own events"
    ON public.events
    FOR SELECT
    USING (vendor_id = auth.uid());

-- Customers can see their own events
CREATE POLICY "Customers can see own events"
    ON public.events
    FOR SELECT
    USING (customer_id = auth.uid());

-- Vendors can insert events
CREATE POLICY "Vendors can insert events"
    ON public.events
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Vendors can update their own events
CREATE POLICY "Vendors can update own events"
    ON public.events
    FOR UPDATE
    USING (vendor_id = auth.uid());

-- Vendors can delete their own events
CREATE POLICY "Vendors can delete own events"
    ON public.events
    FOR DELETE
    USING (vendor_id = auth.uid());

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Vendors can see their own orders
CREATE POLICY "Vendors can see own orders"
    ON public.orders
    FOR SELECT
    USING (vendor_id = auth.uid());

-- Customers can see their own orders
CREATE POLICY "Customers can see own orders"
    ON public.orders
    FOR SELECT
    USING (customer_id = auth.uid());

-- Anyone authenticated can create orders
CREATE POLICY "Authenticated users can insert orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Vendors can update their own orders
CREATE POLICY "Vendors can update own orders"
    ON public.orders
    FOR UPDATE
    USING (vendor_id = auth.uid());

-- =====================================================
-- REVIEWS POLICIES
-- =====================================================

-- Anyone can read reviews
CREATE POLICY "Public can read reviews"
    ON public.reviews
    FOR SELECT
    USING (true);

-- Customers can insert reviews
CREATE POLICY "Customers can insert reviews"
    ON public.reviews
    FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews"
    ON public.reviews
    FOR UPDATE
    USING (customer_id = auth.uid());

-- Customers can delete their own reviews
CREATE POLICY "Customers can delete own reviews"
    ON public.reviews
    FOR DELETE
    USING (customer_id = auth.uid());

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Vendors can see their own payments
CREATE POLICY "Vendors can see own payments"
    ON public.payments
    FOR SELECT
    USING (vendor_id = auth.uid());

-- Customers can see their own payments
CREATE POLICY "Customers can see own payments"
    ON public.payments
    FOR SELECT
    USING (customer_id = auth.uid());

-- System/authenticated users can insert payments
CREATE POLICY "Authenticated users can insert payments"
    ON public.payments
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Vendors can update their own payments
CREATE POLICY "Vendors can update own payments"
    ON public.payments
    FOR UPDATE
    USING (vendor_id = auth.uid());

-- =====================================================
-- EARNINGS POLICIES
-- =====================================================

-- Vendors can see their own earnings
CREATE POLICY "Vendors can see own earnings"
    ON public.earnings
    FOR SELECT
    USING (vendor_id = auth.uid());

-- Vendors can insert their own earnings
CREATE POLICY "Vendors can insert own earnings"
    ON public.earnings
    FOR INSERT
    WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own earnings
CREATE POLICY "Vendors can update own earnings"
    ON public.earnings
    FOR UPDATE
    USING (vendor_id = auth.uid());

-- Vendors can delete their own earnings
CREATE POLICY "Vendors can delete own earnings"
    ON public.earnings
    FOR DELETE
    USING (vendor_id = auth.uid());

-- =====================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- =====================================================

GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.dates TO authenticated;
GRANT ALL ON public.requests TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.earnings TO authenticated;

-- Grant SELECT on views
GRANT SELECT ON public.pastevents TO authenticated;
GRANT SELECT ON public.pastpayments TO authenticated;
GRANT SELECT ON public.pastreviews TO authenticated;
GRANT SELECT ON public.pastearnings TO authenticated;