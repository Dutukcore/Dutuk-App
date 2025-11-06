# 🚀 Dutuk Backend - Quick Start Checklist

## ⏱️ Time Required: ~30 minutes

Follow this checklist step-by-step to get your backend up and running.

---

## 📋 Pre-Implementation Checklist

- [ ] Access to Supabase Dashboard
- [ ] Project URL confirmed: `https://unqpmwlzyaqrryzyrslf.supabase.co`
- [ ] Read the IMPLEMENTATION_GUIDE.md
- [ ] Backend files in `/app/supabase-backend/` folder

---

## 🔨 Step-by-Step Implementation

### ☑️ Step 1: Access Supabase
- [ ] Open browser
- [ ] Go to: https://supabase.com/dashboard
- [ ] Login to your account
- [ ] Select project: `unqpmwlzyaqrryzyrslf`
- [ ] Navigate to **SQL Editor** (left sidebar)

**Time:** 2 minutes

---

### ☑️ Step 2: Create Database Tables
- [ ] Open file: `/app/supabase-backend/01_create_tables.sql`
- [ ] Copy entire content (Ctrl+A, Ctrl+C)
- [ ] Paste into Supabase SQL Editor
- [ ] Click **RUN** button
- [ ] Wait for success message
- [ ] Verify: "Success. No rows returned"

**Expected Result:** 9 tables + 4 views created

**Tables created:**
- user_profiles ✅
- companies ✅
- dates ✅
- requests ✅
- events ✅
- orders ✅
- reviews ✅
- payments ✅
- earnings ✅

**Time:** 5 minutes

---

### ☑️ Step 3: Enable Row Level Security
- [ ] Open file: `/app/supabase-backend/02_create_rls_policies.sql`
- [ ] Copy entire content
- [ ] Paste into Supabase SQL Editor
- [ ] Click **RUN**
- [ ] Wait for success message

**Expected Result:** RLS enabled + 40+ policies created

**Time:** 3 minutes

---

### ☑️ Step 4: Create Functions & Triggers
- [ ] Open file: `/app/supabase-backend/03_create_functions.sql`
- [ ] Copy entire content
- [ ] Paste into Supabase SQL Editor
- [ ] Click **RUN**
- [ ] Wait for success message

**Expected Result:** 6 functions + 9 triggers created

**Functions:**
- handle_updated_at() ✅
- handle_new_user() ✅
- get_request_count() ✅
- handle_event_dates() ✅
- update_event_status() ✅
- set_vendor_role() ✅
- get_vendor_stats() ✅

**Time:** 3 minutes

---

### ☑️ Step 5: Verify Tables in Dashboard
- [ ] Go to **Table Editor** (left sidebar)
- [ ] See all 9 tables listed
- [ ] Click on `companies` table
- [ ] Check RLS shield icon is green 🟢
- [ ] Click on `requests` table
- [ ] Check RLS shield icon is green 🟢
- [ ] Click on `orders` table
- [ ] Check RLS shield icon is green 🟢

**Time:** 5 minutes

---

### ☑️ Step 6: Run Verification Query
- [ ] Go back to **SQL Editor**
- [ ] Run this verification query:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

- [ ] Verify you see 9 tables in results

**Expected Tables:**
1. companies
2. dates
3. earnings
4. events
5. orders
6. payments
7. requests
8. reviews
9. user_profiles

**Time:** 2 minutes

---

### ☑️ Step 7: Test Authentication
- [ ] Open your Dutuk mobile app
- [ ] Register a new vendor account
- [ ] Complete signup with email verification
- [ ] Go to Supabase Dashboard
- [ ] Navigate to **Authentication** → **Users**
- [ ] Verify new user appears in list
- [ ] Go to **Table Editor** → `user_profiles`
- [ ] Verify profile created with role='vendor'

**Time:** 5 minutes

---

### ☑️ Step 8: Test Company Profile
- [ ] In mobile app, go to Profile
- [ ] Fill in company information:
  - [ ] Company name
  - [ ] Email
  - [ ] Phone
  - [ ] Address
  - [ ] Website
- [ ] Save changes
- [ ] Go to Supabase Dashboard → **Table Editor** → `companies`
- [ ] Verify your company data appears
- [ ] Check all fields populated correctly

**Time:** 3 minutes

---

### ☑️ Step 9: Test Calendar Feature
- [ ] In mobile app, go to Calendar
- [ ] Mark a date as available/blocked
- [ ] Go to Supabase Dashboard → **Table Editor** → `dates`
- [ ] Verify date entry appears
- [ ] Check user_id matches your user

**Time:** 2 minutes

---

### ☑️ Step 10: Test Orders (Previously Mock)
- [ ] In mobile app, go to Orders section
- [ ] Check if orders load (may be empty, that's OK)
- [ ] Note: Orders are now connected to real database!
- [ ] Previously showed mock data
- [ ] Now shows real data from `orders` table

**Time:** 2 minutes

---

## ✅ Final Verification Checklist

Run this comprehensive check in SQL Editor:

```sql
-- Verify everything is set up correctly
SELECT 
    'Tables' as category, 
    COUNT(*) as count,
    '9 expected' as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'RLS Policies' as category,
    COUNT(*) as count,
    '40+ expected' as expected
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Functions' as category,
    COUNT(*) as count,
    '7 expected' as expected
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

**Expected Results:**
- [ ] Tables: 9
- [ ] RLS Policies: 40+
- [ ] Functions: 7

---

## 🎯 What's Working Now

### ✅ Features Now Connected to Real Backend:

1. **Authentication** ✅
   - Email/password signup
   - OTP verification
   - Login/logout
   - Session management

2. **Company Profiles** ✅
   - Create/update company info
   - Store vendor details
   - Public company profiles

3. **Calendar Management** ✅
   - Mark available dates
   - Block booked dates
   - Add event info to dates

4. **Request Management** ✅
   - Receive customer requests
   - View request details
   - Accept/decline requests
   - Track request count

5. **Event Management** ✅
   - Create events from accepted requests
   - Track event status (upcoming/ongoing/completed)
   - View past events
   - Auto-update event status

6. **Orders** ✅ **[FIXED]**
   - Real database connection (was mock data)
   - Approve/reject orders
   - Track order status
   - Order history

7. **Reviews** ✅
   - Receive customer reviews
   - View ratings
   - Track review history

8. **Payments & Earnings** ✅
   - Track payments
   - Record earnings
   - Payment history
   - Earnings reports

---

## 🐛 Troubleshooting

### Problem: SQL execution failed

**Solution:**
1. Check for syntax errors
2. Make sure you copied entire file
3. Run files in order (01 → 02 → 03)

---

### Problem: "Permission denied" when viewing data

**Solution:**
1. Make sure you're logged in to the app
2. RLS requires authentication
3. Clear app cache and re-login

---

### Problem: No data showing in app

**Solution:**
1. Check Supabase Dashboard → API Logs
2. Verify you have data in tables
3. Check RLS policies allow read access
4. Test query directly in SQL Editor

---

### Problem: Can't insert data

**Solution:**
1. Verify authentication
2. Check RLS INSERT policies exist
3. Check foreign key constraints
4. Verify required fields are filled

---

## 📊 Quick Health Check

Run this query anytime to check system health:

```sql
-- Database Health Check
SELECT 
    'Users Registered' as metric,
    COUNT(*)::text as value
FROM auth.users

UNION ALL

SELECT 
    'Vendor Profiles' as metric,
    COUNT(*)::text as value
FROM public.user_profiles

UNION ALL

SELECT 
    'Companies' as metric,
    COUNT(*)::text as value
FROM public.companies

UNION ALL

SELECT 
    'Pending Requests' as metric,
    COUNT(*)::text as value
FROM public.requests
WHERE status = 'pending'

UNION ALL

SELECT 
    'Active Events' as metric,
    COUNT(*)::text as value
FROM public.events
WHERE status IN ('upcoming', 'ongoing')

UNION ALL

SELECT 
    'Pending Orders' as metric,
    COUNT(*)::text as value
FROM public.orders
WHERE status = 'pending';
```

---

## 🎉 Success Criteria

You've successfully implemented the backend when:

- [x] All 3 SQL files executed without errors
- [x] 9 tables visible in Table Editor
- [x] RLS enabled on all tables (green shields)
- [x] Test user created successfully
- [x] Company profile saved successfully
- [x] App loads data from real database
- [x] Orders section shows real data (not mock)

---

## ⏭️ Next Steps

After completing this checklist:

1. **Test all features thoroughly**
2. **Add sample data** using `04_seed_data.sql` (optional)
3. **Set up Storage buckets** for images (optional)
4. **Enable Realtime** for live updates (optional)
5. **Monitor usage** in Supabase Dashboard
6. **Deploy mobile app** to production

---

## 📈 Optional Enhancements

### Enable Realtime (for live updates)

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

### Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Create `company-logos` (public)
4. Create `event-images` (public)

---

## 🏁 Completion Time

- **Minimum:** 20 minutes (just migrations)
- **Recommended:** 30-40 minutes (with testing)
- **With sample data:** 45-60 minutes

---

## ✨ You're Done!

Congratulations! Your Dutuk backend is now fully functional with:
- ✅ 9 production-ready database tables
- ✅ 40+ security policies
- ✅ 7 helper functions
- ✅ Proper relationships and constraints
- ✅ Frontend fully integrated
- ✅ Orders now using real data

**Your MVP is backend-complete and ready for production! 🚀**
