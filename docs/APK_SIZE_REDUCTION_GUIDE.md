# APK Size Reduction Guide - Dutuk Vendor App

## Current Status: ~90MB APK Size

This guide provides a comprehensive analysis of the React Native Expo app and actionable steps to significantly reduce the APK size.

---

## 📊 ANALYSIS SUMMARY

### 1. DUPLICATE LIBRARIES (HIGH IMPACT)

| Library | Alternative | Action | Estimated Savings |
|---------|-------------|--------|-------------------|
| `react-native-vector-icons` | `@expo/vector-icons` | **REMOVE** - not used in code but installed | ~2-3MB |
| `@backpackapp-io/react-native-toast` | `react-native-toast-message` | **REMOVE** - only 2 files use it, consolidate to react-native-toast-message | ~200KB |
| `react-native-worklets` | Part of Reanimated | **REMOVE** - no direct usage found | ~500KB |

### 2. UNUSED LIBRARIES (HIGH IMPACT)

| Library | Usage Found | Action | Estimated Savings |
|---------|-------------|--------|-------------------|
| `react-native-confirmation-code-field` | ❌ None | **REMOVE** | ~150KB |
| `react-native-webview` | ❌ None | **REMOVE** | ~1-2MB |
| `expo-asset` | ❌ None (plugin only) | Keep for now (expo requirement) | - |

### 3. UNUSED FILES & ASSETS (MEDIUM IMPACT)

#### Unused Images:
| File | Size | Action |
|------|------|--------|
| `assets/images/react-logo.png` | 6.2KB | **DELETE** |
| `assets/images/partial-react-logo.png` | 5.0KB | **DELETE** |

#### Unused Fonts:
| File | Size | Action |
|------|------|--------|
| `assets/fonts/SpaceMono-Regular.ttf` | 92KB | **DELETE** - no usage in code |

#### Unused Components/Hooks:
| File | Status | Action |
|------|--------|--------|
| `components/DutukLogo.tsx` | ❌ Not imported anywhere | **DELETE** |
| `components/ReviewsCard.tsx` | ❌ Not imported anywhere | **DELETE** |
| `hooks/authIndex.ts` | ❌ Not imported anywhere | **DELETE** |
| `hooks/getStoredDatesInfo.ts` | ❌ Only commented imports | **DELETE** |
| `hooks/storeDatesInfo.ts` | ❌ Only commented imports | **DELETE** |
| `css/authPageStyle.ts` | ❌ Not imported anywhere | **DELETE** |
| `constants/Typography.ts` | ❌ Not imported anywhere | **DELETE** |

#### Unused Dummy Data:
| File | Status | Action |
|------|--------|--------|
| `dummy_data/currentEvents.ts` | ❌ Not imported | **DELETE** |
| `dummy_data/pastEvents.ts` | ❌ Not imported | **DELETE** |
| `dummy_data/upcomingEvents.ts` | ❌ Not imported | **DELETE** |
| `dummy_data/markedDates.ts` | ❌ Not imported | **DELETE** |

### 4. DOCUMENTATION FILES (BUILD EXCLUDED but cleanup recommended)

29 markdown files (~220KB total) exist in root directory. While these don't affect APK size, consolidating documentation would improve project hygiene.

---

## 🔧 OPTIMIZATION STEPS

### STEP 1: Remove Unused Libraries (Highest Impact)

```bash
# Remove unused/duplicate libraries
yarn remove react-native-vector-icons
yarn remove react-native-confirmation-code-field
yarn remove react-native-webview
yarn remove react-native-worklets
yarn remove @backpackapp-io/react-native-toast
```

**After removing `@backpackapp-io/react-native-toast`, refactor these 2 files:**
- `app/profilePages/services/ServicesPage.tsx`
- `app/profilePages/portfolio/index.tsx`

Replace the toast imports with `react-native-toast-message` which is already used throughout the app.

### STEP 2: Delete Unused Files

```bash
# Delete unused images
rm assets/images/react-logo.png
rm assets/images/partial-react-logo.png

# Delete unused font
rm assets/fonts/SpaceMono-Regular.ttf

# Delete unused components
rm components/DutukLogo.tsx
rm components/ReviewsCard.tsx

# Delete unused hooks
rm hooks/authIndex.ts
rm hooks/getStoredDatesInfo.ts
rm hooks/storeDatesInfo.ts

# Delete unused CSS/styles
rm css/authPageStyle.ts
rm constants/Typography.ts

# Delete unused dummy data
rm dummy_data/currentEvents.ts
rm dummy_data/pastEvents.ts
rm dummy_data/upcomingEvents.ts
rm dummy_data/markedDates.ts
```

### STEP 3: Optimize eas.json Build Configuration

Update `eas.json` to enable ProGuard and split APK by ABI:

```json
{
  "cli": {
    "version": ">= 3.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "base": {
      "node": "20.19.4",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://unqpmwlzyaqrryzyrslf.supabase.co"
      }
    },
    "production": {
      "extends": "base",
      "autoIncrement": true,
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "EXPO_NO_BUNDLE_SPLITTING": "0"
        }
      }
    },
    "production-aab": {
      "extends": "base",
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### STEP 4: Optimize app.json

```json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
    }
  }
}
```

### STEP 5: Create Gradle Optimization (Optional - Advanced)

Create `android/gradle.properties` optimizations:

```properties
# Enable R8 full mode for better code shrinking
android.enableR8.fullMode=true

# Reduce APK size
android.enableJetifier=true
```

---

## 📱 ARCHITECTURE-SPECIFIC APKs (Recommended for Distribution)

Instead of a single APK with all architectures (~90MB), build **App Bundle (AAB)** for Play Store:

```bash
eas build --platform android --profile production-aab
```

Or build split APKs per architecture:

| Architecture | Typical Size | Devices |
|--------------|--------------|---------|
| `arm64-v8a` | ~25-35MB | Modern phones (2016+) |
| `armeabi-v7a` | ~20-30MB | Older phones |
| `x86_64` | ~30-40MB | Emulators, Chromebooks |

**Single Architecture Build (for testing):**
Add to `eas.json`:
```json
"production-arm64": {
  "extends": "production",
  "android": {
    "buildType": "apk",
    "ndk": {
      "abiFilters": ["arm64-v8a"]
    }
  }
}
```

---

## 📦 EXPECTED SIZE REDUCTION

| Optimization | Estimated Savings |
|--------------|-------------------|
| Remove unused libraries | ~4-6MB |
| Remove unused files | ~200KB |
| Enable ProGuard/R8 | ~10-15MB |
| Single ABI (arm64-v8a only) | ~20-30MB |
| AAB instead of APK | N/A (Play Store serves optimized) |

**Projected Final Size:**
- Universal APK (all ABIs): **~55-65MB**
- Single ABI APK (arm64): **~25-35MB**
- AAB for Play Store: **~15-25MB** (per device download)

---

## 🔄 REFACTORING REQUIRED

### Replace `@backpackapp-io/react-native-toast` with `react-native-toast-message`

**File: `app/profilePages/services/ServicesPage.tsx`**

Change:
```tsx
import { toast, Toasts } from '@backpackapp-io/react-native-toast';

// Usage
toast.success('Service added');
```

To:
```tsx
import Toast from 'react-native-toast-message';

// Usage
Toast.show({
  type: 'success',
  text1: 'Service added'
});
```

**File: `app/profilePages/portfolio/index.tsx`**
Same refactoring pattern as above.

---

## ✅ QUICK CHECKLIST

- [ ] Remove `react-native-vector-icons` (duplicate of @expo/vector-icons)
- [ ] Remove `react-native-confirmation-code-field` (unused)
- [ ] Remove `react-native-webview` (unused)
- [ ] Remove `react-native-worklets` (unused)
- [ ] Remove `@backpackapp-io/react-native-toast` (duplicate, refactor 2 files)
- [ ] Delete unused image assets (react-logo.png, partial-react-logo.png)
- [ ] Delete unused font (SpaceMono-Regular.ttf)
- [ ] Delete unused components (DutukLogo.tsx, ReviewsCard.tsx)
- [ ] Delete unused hooks (authIndex.ts, getStoredDatesInfo.ts, storeDatesInfo.ts)
- [ ] Delete unused styles (authPageStyle.ts, Typography.ts)
- [ ] Delete unused dummy data (4 files)
- [ ] Update eas.json for ProGuard optimization
- [ ] Consider AAB build for Play Store distribution
- [ ] Consider single ABI builds for testing

---

## 📝 NOTES

1. **Hermes is already enabled** ✅ - Good for performance and size
2. **New Architecture is enabled** ✅ - Good for performance
3. **Buffer polyfill is required** - Keep `buffer` package for `react-native-svg`
4. **expo-asset plugin** - Keep as Expo requirement even if not directly imported
5. **react-native-gifted-chat** - Large library but actively used for chat feature

---

## 🚀 COMMANDS TO RUN

```bash
# 1. Remove unused packages
yarn remove react-native-vector-icons react-native-confirmation-code-field react-native-webview react-native-worklets @backpackapp-io/react-native-toast

# 2. Delete unused files (run from project root)
rm -f assets/images/react-logo.png assets/images/partial-react-logo.png
rm -f assets/fonts/SpaceMono-Regular.ttf
rm -f components/DutukLogo.tsx components/ReviewsCard.tsx
rm -f hooks/authIndex.ts hooks/getStoredDatesInfo.ts hooks/storeDatesInfo.ts
rm -f css/authPageStyle.ts constants/Typography.ts
rm -f dummy_data/currentEvents.ts dummy_data/pastEvents.ts dummy_data/upcomingEvents.ts dummy_data/markedDates.ts

# 3. Clean and rebuild
rm -rf node_modules
yarn install
npx expo prebuild --clean

# 4. Build optimized APK
eas build --platform android --profile production --clear-cache
```
