# Backend Changes Needed

## Overview
This document outlines the backend changes required for the authentication and data flow updates.

---

## 1. Database Trigger Update ❗ CRITICAL

### Issue
The current `handle_new_user()` trigger creates entries in `user_profiles` table, but the app now creates entries in `companies` table instead.

### Current Trigger (Needs Update)
```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Recommended Action

**Option 1: Update Trigger to Create Companies Entry**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create company entry instead of user_profiles
    INSERT INTO public.companies (user_id, company, mail)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company'),
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Option 2: Keep Both Tables (Recommended)**
If you need both `user_profiles` for all users AND `companies` for vendors:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile with vendor role
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Also create company entry for vendors
    INSERT INTO public.companies (user_id, company, mail)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company'),
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**To Apply:**
1. Go to Supabase Dashboard > SQL Editor
2. Run the updated function
3. Verify trigger is still attached to `auth.users` table

---

## 2. Row Level Security (RLS) Policies

### Ensure Companies Table Has Proper RLS

**Check Current Policies:**
```sql
-- View existing policies
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

**Required Policies:**
```sql
-- Allow vendors to read their own company
CREATE POLICY "Vendors can read own company"
ON public.companies FOR SELECT
USING (auth.uid() = user_id);

-- Allow vendors to insert their own company
CREATE POLICY "Vendors can insert own company"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow vendors to update their own company
CREATE POLICY "Vendors can update own company"
ON public.companies FOR UPDATE
USING (auth.uid() = user_id);

-- Allow public to read all companies (for customer discovery)
CREATE POLICY "Public can read companies"
ON public.companies FOR SELECT
USING (true);
```

---

## 3. Orders Table Verification

### Check Orders Table Exists
```sql
-- Verify orders table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

### Expected Columns
- `id` (UUID, PK)
- `vendor_id` (UUID, FK to auth.users)
- `customer_id` (UUID)
- `customer_name` (TEXT)
- `customer_email` (TEXT)
- `customer_phone` (TEXT)
- `title` (TEXT)
- `package_type` (TEXT)
- `event_date` (DATE)
- `status` (TEXT) - 'pending', 'approved', 'rejected', 'completed'
- `amount` (DECIMAL)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### If Orders Table Doesn't Exist
```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id),
    customer_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    title TEXT NOT NULL,
    package_type TEXT,
    event_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for vendor queries
CREATE INDEX idx_orders_vendor_status ON public.orders(vendor_id, status);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Vendors can see their orders"
ON public.orders FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their orders"
ON public.orders FOR UPDATE
USING (auth.uid() = vendor_id);
```

---

## 4. Companies Table Description Field

### Check if Description Field Exists
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'companies' AND column_name = 'description';
```

### If Missing, Add It
```sql
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS description TEXT;
```

---

## 5. Data Migration (If Needed)

### If User Profiles Exist But No Companies
```sql
-- Migrate existing user_profiles to companies
INSERT INTO public.companies (user_id, company, mail)
SELECT 
    up.user_id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'My Company') as company,
    au.email as mail
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE up.role = 'vendor'
AND NOT EXISTS (
    SELECT 1 FROM public.companies c WHERE c.user_id = up.user_id
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## 6. Test Queries

### Verify New User Registration Flow
```sql
-- After a user registers, check both tables
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    c.id as company_id,
    c.company,
    c.mail,
    c.created_at as company_created
FROM auth.users au
LEFT JOIN public.companies c ON c.user_id = au.id
WHERE au.email = 'test@example.com';
```

### Verify Orders Are Accessible
```sql
-- Check if orders can be fetched by vendor
SELECT * FROM public.orders 
WHERE vendor_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

---

## 7. Quick Start Checklist

Run these in Supabase SQL Editor:

- [ ] Update `handle_new_user()` function
- [ ] Verify companies table RLS policies
- [ ] Verify orders table exists with correct schema
- [ ] Add description field to companies table if missing
- [ ] Run test queries to verify setup
- [ ] Test registration flow with new account
- [ ] Verify company entry is created automatically
- [ ] Test orders fetching

---

## 8. Testing After Backend Changes

### Test Registration
1. Register new user with email
2. Check Supabase > Table Editor > companies
3. Verify entry exists with user_id, company name, and email

### Test Google OAuth
1. Sign in with Google
2. Check companies table
3. Verify company name is set to Google account name

### Test Orders
1. Go to Orders screen in app
2. Should show empty state or real orders
3. No errors in console

### Test Edit Profile
1. Go to Profile > Edit Profile
2. Should load company data
3. Can edit and save
4. Changes persist after refresh

---

## 9. Common Issues & Solutions

### Issue: "relation 'user_profiles' does not exist"
**Solution:** The trigger or app code is still referencing user_profiles. Update to use companies table.

### Issue: Orders not showing
**Solution:** 
- Check orders table exists
- Verify RLS policies allow vendor to read orders
- Check vendor_id matches current user's auth.uid()

### Issue: Cannot save company info
**Solution:**
- Check RLS policies on companies table
- Verify UPDATE policy exists
- Check user_id matches auth.uid()

### Issue: Google name not showing
**Solution:**
- Check user_metadata is being captured: `SELECT raw_user_meta_data FROM auth.users WHERE email = 'X'`
- Verify `full_name` or `name` field exists in metadata

---

## 10. Rollback Plan

If issues occur:

```sql
-- Restore old handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'vendor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Both tables can coexist, so no data loss
```

---

## Summary

**Critical Changes:**
1. ✅ Update `handle_new_user()` trigger to create companies entry
2. ✅ Verify orders table exists with proper schema
3. ✅ Check RLS policies on companies and orders tables
4. ✅ Add description field to companies if missing

**Testing:**
1. Register new user → Check companies table
2. Google OAuth → Verify name from Google account
3. Orders screen → Should load without errors
4. Edit profile → Should load and save data

---

**Status:** ⚠️ Backend updates required before full functionality
**Priority:** HIGH - Affects all new user registrations
**Time Estimate:** 15-30 minutes for SQL updates
