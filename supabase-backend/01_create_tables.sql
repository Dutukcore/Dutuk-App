-- Dutuk Backend - Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT DEFAULT 'vendor' CHECK (role IN ('vendor', 'customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company TEXT NOT NULL,
    mail TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. DATES TABLE (Calendar)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    event TEXT,
    description TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_dates_user_date ON public.dates(user_id, date);

-- =====================================================
-- 4. REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    company_name TEXT NOT NULL,
    event TEXT NOT NULL,
    description TEXT,
    date TEXT[] NOT NULL,
    payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for company queries
CREATE INDEX IF NOT EXISTS idx_requests_company ON public.requests(company_name, status);

-- =====================================================
-- 5. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    customer_name TEXT,
    company_name TEXT NOT NULL,
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    description TEXT,
    date TEXT[] NOT NULL,
    payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vendor and status queries
CREATE INDEX IF NOT EXISTS idx_events_vendor_status ON public.events(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);

-- =====================================================
-- 6. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    title TEXT NOT NULL,
    package_type TEXT,
    event_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vendor queries
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status ON public.orders(vendor_id, status);

-- =====================================================
-- 7. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    event_name TEXT,
    event_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vendor queries
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON public.reviews(vendor_id, created_at DESC);

-- =====================================================
-- 8. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID NOT NULL,
    customer_name TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    event_name TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vendor queries
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON public.payments(vendor_id, payment_status);

-- =====================================================
-- 9. EARNINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    event_name TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    earning_date DATE NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vendor queries
CREATE INDEX IF NOT EXISTS idx_earnings_vendor ON public.earnings(vendor_id, earning_date DESC);

-- =====================================================
-- Create views for past data (for backward compatibility)
-- =====================================================

-- Past Events View
CREATE OR REPLACE VIEW public.pastevents AS
SELECT 
    id,
    vendor_id as user_id,
    event,
    description,
    date,
    payment,
    end_date,
    created_at,
    updated_at
FROM public.events
WHERE status = 'completed' AND end_date < CURRENT_DATE;

-- Past Payments View
CREATE OR REPLACE VIEW public.pastpayments AS
SELECT 
    id,
    vendor_id as user_id,
    customer_name,
    event_name,
    amount,
    payment_method,
    payment_date,
    created_at
FROM public.payments
WHERE payment_status = 'completed' AND payment_date < CURRENT_DATE;

-- Past Reviews View
CREATE OR REPLACE VIEW public.pastreviews AS
SELECT 
    id,
    vendor_id as user_id,
    customer_name,
    rating,
    review,
    event_name,
    event_date,
    created_at
FROM public.reviews;

-- Past Earnings View
CREATE OR REPLACE VIEW public.pastearnings AS
SELECT 
    id,
    vendor_id as user_id,
    event_name,
    amount,
    earning_date,
    notes,
    created_at
FROM public.earnings
WHERE earning_date < CURRENT_DATE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.companies IS 'Vendor company information';
COMMENT ON TABLE public.dates IS 'Vendor calendar dates (availability)';
COMMENT ON TABLE public.requests IS 'Customer requests for events';
COMMENT ON TABLE public.events IS 'Accepted and ongoing events';
COMMENT ON TABLE public.orders IS 'Customer orders requiring approval';
COMMENT ON TABLE public.reviews IS 'Customer reviews for vendors';
COMMENT ON TABLE public.payments IS 'Payment transactions';
COMMENT ON TABLE public.earnings IS 'Vendor earnings records';

COMMENT ON VIEW public.pastevents IS 'View of completed events (backward compatibility)';
COMMENT ON VIEW public.pastpayments IS 'View of past payments (backward compatibility)';
COMMENT ON VIEW public.pastreviews IS 'View of all reviews (backward compatibility)';
COMMENT ON VIEW public.pastearnings IS 'View of past earnings (backward compatibility)';