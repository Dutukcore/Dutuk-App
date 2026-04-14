# Routing Structure - Fixed

## Overview
This document outlines the complete routing structure for the profilePages section after fixing all routing issues.

## Main Profile Screen
**Location:** `/app/app/(tabs)/profile.tsx`  
**Route:** `/(tabs)/profile`

This is the main profile screen accessible from the bottom tab navigation.

### Menu Items Routes:
1. **Edit Profile** → `/profilePages/editProfile`
2. **Document Verification** → `/profilePages/documentVerificationScreen`
3. **History** → `/profilePages/historyScreen`
4. **Chat Support** → `/profilePages/chatSupport` *(NEW)*
5. **Help Center** → `/profilePages/profileSettings/helpcenter`

---

## Profile Pages Structure

### Root Level Screens
Located in `/app/app/profilePages/`

- `/profilePages/editProfile` → `editProfile.tsx`
- `/profilePages/documentVerificationScreen` → `documentVerificationScreen.tsx`
- `/profilePages/historyScreen` → `historyScreen.tsx`
- `/profilePages/chatSupport` → `chatSupport.tsx` *(NEW)*
- `/profilePages/legal` → `legal.tsx`
- `/profilePages/profile` → `profile.tsx` *(Alternate profile view)*

### Calendar Screens
- `/profilePages/calender/CalendarPage` → `calender/CalendarPage.tsx`
- `/profilePages/calender/CalendarRedirect` → `calender/CalendarRedirect.tsx`

### Company Info
- `/profilePages/companyBasicInfo/companyInfoPage` → `companyBasicInfo/companyInfoPage.tsx`

### Message/Chat
- `/profilePages/message` → `message/index.tsx`
- `/profilePages/message/chatPage` → `message/chatPage.tsx`

---

## Profile Settings Section
**Location:** `/app/app/profilePages/profileSettings/`  
**Main Screen:** `/profilePages/profileSettings` → `index.tsx`

### Settings Menu Items:
1. **Company's Basic Information** → `/profilePages/companyBasicInfo/companyInfoPage`
2. **Document Verification** → `/profilePages/profileSettings/documentVerification`
3. **Change Password** → `/profilePages/profileSettings/changePasswordOtp`
4. **Change Username** → `/profilePages/profileSettings/changeUsername`
5. **History & Highlights** → `/profilePages/profileSettings/history_and_highlights`
6. **Help Center** → `/profilePages/profileSettings/helpcenter`
7. **About** → `/profilePages/profileSettings/about`

### Profile Settings Screens:
- `/profilePages/profileSettings/about` → `about.tsx`
- `/profilePages/profileSettings/changePassword` → `changePassword.tsx`
- `/profilePages/profileSettings/changePasswordOtp` → `changePasswordOtp.tsx`
- `/profilePages/profileSettings/changeUsername` → `changeUsername.tsx`
- `/profilePages/profileSettings/companysBasicInfo` → `companysBasicInfo.tsx`
- `/profilePages/profileSettings/documentVerification` → `documentVerification.tsx`
- `/profilePages/profileSettings/helpcenter` → `helpcenter.tsx`
- `/profilePages/profileSettings/historyAndHighlights` → `historyAndHighlights.tsx`
- `/profilePages/profileSettings/logout` → `logout.tsx`

---

## History & Highlights Section
**Location:** `/app/app/profilePages/profileSettings/history_and_highlights/`  
**Main Screen:** `/profilePages/profileSettings/history_and_highlights` → `index.tsx`

### History Menu Items:
1. **Past Events** → `/profilePages/profileSettings/history_and_highlights/pastEvents`
2. **Past Earnings** → `/profilePages/profileSettings/history_and_highlights/pastEarnings`
3. **Past Payments** → `/profilePages/profileSettings/history_and_highlights/pastPayments`
4. **Past Reviews** → `/profilePages/profileSettings/history_and_highlights/pastReviews`

### History Screens:
- `/profilePages/profileSettings/history_and_highlights/pastEvents` → `pastEvents.tsx`
- `/profilePages/profileSettings/history_and_highlights/pastEarnings` → `pastEarnings.tsx`
- `/profilePages/profileSettings/history_and_highlights/pastPayments` → `pastPayments.tsx`
- `/profilePages/profileSettings/history_and_highlights/pastReviews` → `pastReviews.tsx`

---

## Changes Made

### 1. Fixed Inconsistent Route Prefixes
**Before:** Routes were using `/profile/profileSettings/...`  
**After:** All routes now use `/profilePages/profileSettings/...`

### 2. Updated Main Profile Menu (/(tabs)/profile.tsx)
- Fixed Edit Profile route
- Fixed Document Verification route
- Fixed History route
- Added Chat Support menu item (NEW)
- Fixed Help Center route

### 3. Created New Chat Support Screen
- Location: `/app/app/profilePages/chatSupport.tsx`
- Route: `/profilePages/chatSupport`
- Status: "Coming Soon" placeholder

### 4. Fixed Profile Settings Index Routes
- Updated History & Highlights route
- Updated Help Center route
- Updated About route

### 5. Fixed History & Highlights Submenu Routes
- Updated all past events, earnings, payments, and reviews routes

---

## Route Verification

All routes have been verified to match the actual file system structure:
- ✅ All `/profile/...` routes changed to `/profilePages/...`
- ✅ All menu items point to existing screens
- ✅ Chat Support screen created and integrated
- ✅ Consistent naming throughout the app
- ✅ Expo Router file-based routing followed correctly

---

## Testing Checklist

- [ ] Navigate from main profile to Edit Profile
- [ ] Navigate from main profile to Document Verification
- [ ] Navigate from main profile to History
- [ ] Navigate from main profile to Chat Support (NEW)
- [ ] Navigate from main profile to Help Center
- [ ] Navigate to Profile Settings menu
- [ ] Test all Profile Settings submenu items
- [ ] Navigate to History & Highlights
- [ ] Test all History & Highlights submenu items
- [ ] Verify back navigation works correctly
