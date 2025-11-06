-- Dutuk Backend - Sample Seed Data
-- Execute this ONLY for testing/development
-- DO NOT run in production

-- Note: Replace the UUIDs with actual user IDs from your auth.users table
-- You can get user IDs by running: SELECT id, email FROM auth.users;

-- =====================================================
-- SAMPLE DATA WARNING
-- =====================================================

-- This file contains sample data for testing purposes.
-- Before running, you need to:
-- 1. Create test users through the app's signup flow
-- 2. Get their user_id values
-- 3. Replace the placeholder UUIDs below

-- =====================================================
-- SAMPLE COMPANIES
-- =====================================================

-- Example (update with real user_id):
/*
INSERT INTO public.companies (user_id, company, mail, phone, address, website, description)
VALUES 
    ('YOUR_USER_ID_HERE', 'Elite Events Co.', 'contact@eliteevents.com', '+1-555-0101', '123 Event Street, New York, NY', 'https://eliteevents.com', 'Professional event management and planning services'),
    ('ANOTHER_USER_ID', 'Perfect Weddings', 'info@perfectweddings.com', '+1-555-0102', '456 Wedding Ave, Los Angeles, CA', 'https://perfectweddings.com', 'Specialized in wedding planning and coordination');
*/

-- =====================================================
-- SAMPLE REQUESTS
-- =====================================================

/*
INSERT INTO public.requests (customer_id, customer_name, customer_email, customer_phone, company_name, event, description, date, payment, status)
VALUES 
    ('CUSTOMER_USER_ID', 'John & Sarah', 'john.sarah@example.com', '+1-555-1234', 'Elite Events Co.', 'Wedding Photography', 'Full day wedding coverage with album', ARRAY['2025-10-15', '2025-10-16'], 5000.00, 'pending'),
    ('ANOTHER_CUSTOMER_ID', 'Tech Corp Inc.', 'events@techcorp.com', '+1-555-5678', 'Elite Events Co.', 'Corporate Conference', 'Annual tech conference for 200 attendees', ARRAY['2025-11-20', '2025-11-21', '2025-11-22'], 15000.00, 'pending');
*/

-- =====================================================
-- SAMPLE ORDERS
-- =====================================================

/*
INSERT INTO public.orders (vendor_id, customer_id, customer_name, customer_email, customer_phone, title, package_type, event_date, status, amount)
VALUES 
    ('VENDOR_USER_ID', 'CUSTOMER_USER_ID', 'John & Sarah', 'john.sarah@example.com', '+1-555-1234', 'Wedding Photography', 'Premium Package', '2025-10-26', 'pending', 5000.00),
    ('VENDOR_USER_ID', 'ANOTHER_CUSTOMER_ID', 'Tech Corp Inc.', 'events@techcorp.com', '+1-555-5678', 'Corporate Event', 'Business Package', '2025-10-24', 'approved', 15000.00);
*/

-- =====================================================
-- SAMPLE EVENTS
-- =====================================================

/*
INSERT INTO public.events (customer_id, customer_name, company_name, vendor_id, event, description, date, payment, status, start_date, end_date)
VALUES 
    ('CUSTOMER_USER_ID', 'Jane & Michael', 'Elite Events Co.', 'VENDOR_USER_ID', 'Summer Wedding', 'Beach wedding with 150 guests', ARRAY['2025-07-15'], 8000.00, 'upcoming', '2025-07-15', '2025-07-15'),
    ('ANOTHER_CUSTOMER_ID', 'StartupXYZ', 'Elite Events Co.', 'VENDOR_USER_ID', 'Product Launch', 'New product launch event', ARRAY['2025-08-01', '2025-08-02'], 12000.00, 'upcoming', '2025-08-01', '2025-08-02');
*/

-- =====================================================
-- SAMPLE REVIEWS
-- =====================================================

/*
INSERT INTO public.reviews (vendor_id, customer_id, customer_name, rating, review, event_name, event_date)
VALUES 
    ('VENDOR_USER_ID', 'CUSTOMER_USER_ID', 'Emily Johnson', 5, 'Outstanding service! They made our wedding day perfect.', 'Wedding Ceremony', '2025-05-20'),
    ('VENDOR_USER_ID', 'ANOTHER_CUSTOMER_ID', 'David Smith', 4, 'Great experience overall. Very professional team.', 'Corporate Event', '2025-04-15'),
    ('VENDOR_USER_ID', 'THIRD_CUSTOMER_ID', 'Sarah Williams', 5, 'Exceeded all expectations. Highly recommend!', 'Birthday Party', '2025-03-10');
*/

-- =====================================================
-- SAMPLE PAYMENTS
-- =====================================================

/*
INSERT INTO public.payments (vendor_id, customer_id, customer_name, event_name, amount, payment_method, payment_status, payment_date)
VALUES 
    ('VENDOR_USER_ID', 'CUSTOMER_USER_ID', 'Emily Johnson', 'Wedding Ceremony', 8000.00, 'Credit Card', 'completed', '2025-05-20'),
    ('VENDOR_USER_ID', 'ANOTHER_CUSTOMER_ID', 'David Smith', 'Corporate Event', 12000.00, 'Bank Transfer', 'completed', '2025-04-15'),
    ('VENDOR_USER_ID', 'THIRD_CUSTOMER_ID', 'Sarah Williams', 'Birthday Party', 3500.00, 'Credit Card', 'completed', '2025-03-10');
*/

-- =====================================================
-- SAMPLE EARNINGS
-- =====================================================

/*
INSERT INTO public.earnings (vendor_id, event_name, amount, earning_date, notes)
VALUES 
    ('VENDOR_USER_ID', 'Wedding Ceremony', 8000.00, '2025-05-20', 'Full payment received'),
    ('VENDOR_USER_ID', 'Corporate Event', 12000.00, '2025-04-15', 'Full payment received'),
    ('VENDOR_USER_ID', 'Birthday Party', 3500.00, '2025-03-10', 'Full payment received');
*/

-- =====================================================
-- HOW TO USE THIS FILE
-- =====================================================

-- 1. Create test users through your app's signup page
-- 2. Get their user IDs:
--    SELECT id, email FROM auth.users;
--
-- 3. Replace all placeholder UUIDs in the INSERT statements above
-- 4. Uncomment the INSERT statements
-- 5. Run this file in Supabase SQL Editor

-- =====================================================
-- QUICK TEST QUERY
-- =====================================================

-- After seeding, verify data:
/*
SELECT 'companies' as table_name, COUNT(*) as count FROM public.companies
UNION ALL
SELECT 'requests', COUNT(*) FROM public.requests
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'events', COUNT(*) FROM public.events
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'earnings', COUNT(*) FROM public.earnings;
*/