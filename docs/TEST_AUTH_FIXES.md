# Testing Authentication Fixes

## Quick Test Guide

### Test 1: Duplicate Registration Prevention ⭐ CRITICAL

**Steps:**
1. Open the app
2. Go to Registration page
3. Enter email: `testuser@example.com`
4. Enter password: `test1234`
5. Click "Register"
6. **Expected:** Registration succeeds, OTP sent
7. Complete OTP verification
8. You should land on Home page ✅
9. Log out from Profile > Logout
10. Go to Registration page again
11. Enter the SAME email: `testuser@example.com`
12. Enter password: `test1234`
13. Click "Register"
14. **Expected:** See error message: "Account Already Exists"
15. **Expected:** After 1.5 seconds, auto-redirect to Login page
16. **PASS if:** Cannot register with duplicate email ✅

**What to Check:**
- [ ] Error toast appears with message "Account Already Exists"
- [ ] Message includes "Please log in instead"
- [ ] Automatically redirects to login page
- [ ] No OTP is sent for duplicate registration
- [ ] Console shows: "User already exists: testuser@example.com"

---

### Test 2: Navigation After New Registration

**Steps:**
1. Register with a NEW email (e.g., `newuser@example.com`)
2. Enter password
3. Click "Register"
4. Enter OTP from email
5. Click "Verify"
6. **Expected:** Navigate to Home page (should see events/calendar)
7. **Expected:** Bottom navigation shows Home tab highlighted
8. **PASS if:** Lands on home page, not blank screen ✅

**What to Check:**
- [ ] URL in browser/console is `/(tabs)/home`
- [ ] Can see home page content (events, calendar, etc.)
- [ ] Home icon in bottom nav is active/highlighted
- [ ] Toast shows "Welcome!" message
- [ ] Console shows vendor role was set

---

### Test 3: Navigation After Login

**Steps:**
1. Logout if logged in
2. Go to Login page
3. Enter email: `testuser@example.com`
4. Enter password: `test1234`
5. Click "Login"
6. **Expected:** Immediately navigate to Home page
7. **Expected:** See "Welcome Back!" toast
8. **PASS if:** Lands directly on home page ✅

**What to Check:**
- [ ] No blank screen after login
- [ ] Home page content visible immediately
- [ ] Toast shows "Welcome Back!" or "Successfully logged in"
- [ ] Bottom nav shows home as active
- [ ] Can navigate to other tabs normally

---

### Test 4: Google OAuth (If Configured)

**Steps:**
1. Logout if logged in
2. Go to Login page
3. Click "Sign in with Google"
4. Complete Google authentication
5. **Expected:** Navigate to Home page
6. **Expected:** See welcome message
7. **PASS if:** Lands on home page after OAuth ✅

**What to Check:**
- [ ] Google auth completes successfully
- [ ] Redirects to home page (not blank)
- [ ] Vendor role assigned (check in database)
- [ ] Can access all features

---

### Test 5: Home Button in Bottom Navigation

**Steps:**
1. Login successfully
2. Navigate to "Orders" tab
3. Click "Home" icon in bottom navigation
4. **Expected:** Return to Home page
5. Navigate to "Profile" tab
6. Click "Home" icon again
7. **Expected:** Return to Home page
8. **PASS if:** Home button always works ✅

**What to Check:**
- [ ] Home button responds to clicks
- [ ] Always navigates to home page
- [ ] No console errors
- [ ] Page content loads correctly

---

## Edge Case Tests

### Test 6: Unverified Email Registration

**Steps:**
1. Register with email: `unverified@example.com`
2. Get OTP but DON'T verify
3. Logout or close app
4. Try to register again with `unverified@example.com`
5. **Expected:** Should show "Account Already Exists" error
6. **PASS if:** Duplicate prevented even for unverified users ✅

---

### Test 7: Invalid Email Format

**Steps:**
1. Try to register with email: `notanemail`
2. Enter password
3. Click "Register"
4. **Expected:** Error about invalid email
5. **Expected:** Should NOT call user existence check
6. **PASS if:** Validation catches bad email before API call ✅

---

### Test 8: Network Error During Check

**Steps:**
1. Enable "Slow 3G" or "Offline" in browser dev tools
2. Try to register with new email
3. **Expected:** Should show network error OR allow registration
4. **Expected:** Should not crash or hang
5. **PASS if:** Handles network errors gracefully ✅

---

## Database Verification

### Check User Profile Creation

**After successful registration, verify in Supabase:**

1. Open Supabase dashboard
2. Go to "Table Editor"
3. Open `user_profiles` table
4. Find the newly created user
5. **Check:**
   - [ ] `user_id` matches the auth.users.id
   - [ ] `role` is set to `"vendor"`
   - [ ] `created_at` timestamp is correct

**SQL Query to Check:**
```sql
SELECT 
  up.id,
  up.user_id,
  up.role,
  up.created_at,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE au.email = 'testuser@example.com';
```

**Expected Result:**
```
user_id: abc-123-def-456
role: vendor
email: testuser@example.com
```

---

## Console Log Verification

### During Registration (Success)
```
Attempting to register user: testuser@example.com
Checking if user already exists...
User does not exist, proceeding with registration
User signed up successfully: abc-123-def-456
Email confirmation required, sending OTP
```

### During Registration (Duplicate)
```
Attempting to register user: testuser@example.com
Checking if user already exists...
User exists (invalid credentials error): testuser@example.com
User already exists: testuser@example.com
```

### During Login
```
Attempting login for: testuser@example.com
Login successful for user: abc-123-def-456
User profile already exists with role: vendor
```

### During OTP Verification
```
Attempting to verify OTP for: testuser@example.com
OTP verified successfully for user: abc-123-def-456
Vendor role successfully set for user
```

---

## Error Scenarios to Test

### Expected Errors (Should Handle Gracefully)

| Scenario | Expected Behavior |
|----------|-------------------|
| Wrong password on login | "Incorrect email or password" error |
| Expired OTP code | "Code has expired" error, can request new one |
| Invalid OTP code | "Invalid code" error, can retry |
| Email already registered | "Account already exists" → redirect to login |
| Network timeout | "Network error" or allow registration (fail-open) |
| Empty email field | "Please enter email" validation error |
| Short password | "Password must be at least 6 characters" |

---

## Performance Benchmarks

### Expected Timings

| Action | Expected Time | Acceptable Delay |
|--------|---------------|------------------|
| User existence check | 200-500ms | < 1 second |
| Registration attempt | 1-2 seconds | < 3 seconds |
| OTP send | 2-4 seconds | < 5 seconds |
| Login | 500ms-1s | < 2 seconds |
| Navigation | Instant | < 200ms |

---

## Automated Test Checklist

If you want to write automated tests:

```typescript
describe('Authentication Fixes', () => {
  test('prevents duplicate registration', async () => {
    // Register user once
    await registerUser('test@test.com', 'password');
    
    // Try to register again
    await expect(
      registerUser('test@test.com', 'password')
    ).rejects.toThrow('User already exists');
  });
  
  test('navigates to home after login', async () => {
    await loginUser('test@test.com', 'password');
    expect(router.currentRoute).toBe('/(tabs)/home');
  });
  
  test('checkUserExists detects existing users', async () => {
    const { exists } = await checkUserExists('existing@test.com');
    expect(exists).toBe(true);
  });
});
```

---

## Rollback Plan

If issues are found:

### Quick Rollback
1. Revert `/app/hooks/useCheckUserExists.ts` to previous version
2. Remove user existence check from `useRegisterUser.ts`
3. Revert navigation changes (change back to `/(tabs)`)

### Partial Rollback
- Keep navigation fixes (safe)
- Rollback only duplicate check if causing issues

---

## Success Criteria

✅ **All Tests Must Pass:**
- [ ] Cannot register with duplicate email
- [ ] Clear error message on duplicate attempt
- [ ] Navigates to home after registration
- [ ] Navigates to home after login
- [ ] Navigates to home after OTP verification
- [ ] Home button in nav works correctly
- [ ] No blank screens
- [ ] No console errors
- [ ] Vendor role assigned correctly
- [ ] All error messages are user-friendly

---

## Report Template

After testing, fill out:

**Date Tested:** _________  
**Tester:** _________  
**Device/Browser:** _________

| Test | Result | Notes |
|------|--------|-------|
| Duplicate Prevention | ☐ Pass ☐ Fail | |
| Navigation - Registration | ☐ Pass ☐ Fail | |
| Navigation - Login | ☐ Pass ☐ Fail | |
| Home Button | ☐ Pass ☐ Fail | |
| Error Messages | ☐ Pass ☐ Fail | |

**Issues Found:**
- 

**Overall Status:** ☐ Ready for Production ☐ Needs More Work

---

**Testing Priority: HIGH**  
**Estimated Test Time: 15-20 minutes**  
**Critical for User Experience: YES**
