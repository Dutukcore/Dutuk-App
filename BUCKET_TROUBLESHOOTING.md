# Bucket Error Troubleshooting Guide

## Current Issue
Getting "Bucket not found" error even though `event-images` bucket exists in Supabase.

## Diagnostic Steps to Try:

### 1. Check Console Logs
When you try to upload an image, the enhanced logging will show:
- Current user ID (check if authenticated)
- Available buckets list
- Bucket access test result
- Exact error message and status code

**Action:** Try uploading an image and share the complete console output.

---

### 2. Verify Bucket Configuration in Supabase Dashboard

Go to: **Supabase Dashboard → Storage → event-images**

Check these settings:
- ✅ Bucket name is exactly: `event-images` (no spaces, exact case)
- ✅ Bucket is marked as "Public"
- ✅ File size limit is appropriate (suggest 10 MB)
- ✅ Allowed MIME types include: `image/jpeg`, `image/png`, `image/webp`

---

### 3. Check RLS Policies (Most Common Issue)

Go to: **Supabase Dashboard → Storage → Policies**

You need these policies for `event-images` bucket:

#### Policy 1: Allow INSERT (Upload)
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
);
```

#### Policy 2: Allow SELECT (Read)
```sql
CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');
```

#### Policy 3: Allow UPDATE (Optional - for replacing files)
```sql
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');
```

#### Policy 4: Allow DELETE (Optional - for deleting files)
```sql
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
```

**How to add policies:**
1. Go to Supabase Dashboard → Storage
2. Click on "Policies" tab
3. Click "New Policy"
4. Choose "Custom" policy
5. Paste the SQL above
6. Click "Review" then "Save policy"

---

### 4. Verify API Keys

In `/app/utils/supabase.ts`:
- Ensure `supabaseUrl` is correct
- Ensure `supabaseAnonKey` is the correct anon/public key (not service role key)

Current values:
- URL: `https://unqpmwlzyaqrryzyrslf.supabase.co`
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key - correct ✅)

---

### 5. Test Bucket Access Manually

Try this in Supabase Dashboard → SQL Editor:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'event-images';

-- Check policies on storage.objects
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Try to list files in bucket (should work if policies are correct)
SELECT * FROM storage.objects WHERE bucket_id = 'event-images' LIMIT 5;
```

---

### 6. Common Issues & Solutions

#### Issue: "Bucket not found"
**Possible causes:**
1. Bucket name has typo or wrong case
2. RLS policies block access
3. User not authenticated
4. API key is incorrect

**Solution:**
- Verify exact bucket name
- Add RLS policies (see section 3)
- Verify user is logged in
- Check API keys

#### Issue: "Permission denied" or "row-level security"
**Cause:** RLS policies not configured

**Solution:** Add the policies from section 3

#### Issue: "Network request failed"
**Cause:** Timeout or network issue

**Solution:** Already fixed with 30-second timeout for storage requests

---

### 7. Alternative: Disable RLS (Not Recommended for Production)

⚠️ **Only for testing purposes:**

```sql
-- Disable RLS on storage.objects (NOT SECURE - only for testing)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

If this works, it confirms the issue is with RLS policies. Then re-enable and add proper policies:

```sql
-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Then add the policies from section 3
```

---

## What I've Already Fixed:

✅ Enhanced error logging with detailed diagnostics
✅ User authentication check before upload
✅ Bucket listing to verify available buckets
✅ Bucket access test before upload attempt
✅ Increased timeout for storage operations (30s)
✅ Better error messages with specific solutions
✅ Status code logging

---

## Next Steps:

1. **Try uploading an image** and copy the complete console log output
2. **Check the Supabase Dashboard** for RLS policies (most likely the issue)
3. **Add the policies** from section 3 if they're missing
4. Share the console logs if issue persists

The enhanced logging will tell us exactly what's wrong!
