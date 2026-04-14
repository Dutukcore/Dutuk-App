# Dutuk Vendor - APK Export Guide

This project has been prepared for APK export using Expo EAS Build.

## ✅ Pre-Export Checklist Completed

- [x] Lock file cleanup (removed package-lock.json, using yarn.lock only)
- [x] Missing peer dependencies installed (expo-font, react-native-worklets)
- [x] Duplicate dependencies resolved with resolutions in package.json
- [x] Package versions aligned with Expo SDK 54
- [x] Native code regenerated with `expo prebuild --clean`
- [x] eas.json configured for APK builds
- [x] Hermes JavaScript engine enabled
- [x] New Architecture enabled

## 🚀 How to Build APK

### Option 1: EAS Build (Recommended - Cloud Build)

1. **Install EAS CLI globally (if not already):**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account:**
   ```bash
   eas login
   ```

3. **Build APK for production:**
   ```bash
   yarn build:apk
   # OR
   eas build --platform android --profile production
   ```

4. **Build APK for preview/testing:**
   ```bash
   yarn build:preview
   # OR
   eas build --platform android --profile preview
   ```

5. **Download the APK:**
   After build completes, download from the URL provided or from [expo.dev](https://expo.dev)

### Option 2: Local Build (Requires Android SDK)

1. **Prerequisites:**
   - Android SDK installed
   - Java JDK 17+
   - ANDROID_HOME environment variable set

2. **Run local build:**
   ```bash
   yarn build:apk:local
   # OR
   eas build --platform android --profile production --local
   ```

3. **Find APK at:**
   The APK will be generated in the project directory

## 📱 Build Profiles

| Profile | Use Case | Output |
|---------|----------|--------|
| `development` | Local development with dev client | Debug APK |
| `preview` | Internal testing | APK (internal distribution) |
| `production` | App store release | APK (production-ready) |

## ⚙️ Configuration Files

### eas.json
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### app.json (Android section)
```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/images/adaptive-icon.png",
      "backgroundColor": "#000000"
    },
    "package": "com.dharsdev.dutuk_frontend"
  }
}
```

## 🔑 Release Signing (For Production)

For Play Store release, you'll need to:

1. **Generate a keystore:**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure credentials in EAS:**
   ```bash
   eas credentials
   ```

3. **Update eas.json for production signing:**
   EAS Build will manage signing automatically when you configure credentials.

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails with dependency errors:**
   ```bash
   rm -rf node_modules
   yarn install
   npx expo prebuild --clean
   ```

2. **Version mismatch errors:**
   ```bash
   npx expo install --fix
   ```

3. **Clear EAS cache:**
   ```bash
   eas build --clear-cache --platform android --profile production
   ```

## 📊 Build Info

- **Expo SDK:** 54
- **React Native:** 0.81.5
- **Architecture:** New Architecture enabled
- **JS Engine:** Hermes
- **Target Architectures:** armeabi-v7a, arm64-v8a, x86, x86_64

## 🔗 Useful Commands

```bash
# Check project health
npx expo-doctor

# Start development server
yarn start

# Run on Android emulator
yarn android

# Check EAS build status
eas build:list

# View build logs
eas build:view
```

## 📝 Notes

- This project uses **Supabase** as the backend
- Backend URL is configured in `utils/supabase.ts`
- EAS project ID: `97c03a82-f4a5-4d56-b302-59d4bc033cc5`
