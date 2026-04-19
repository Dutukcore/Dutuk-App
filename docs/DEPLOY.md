# Deployment Guide

## Prerequisites

### 1. EAS Secrets (CI/CD builds)

The Supabase credentials are **not** committed to the repository. You must configure them as EAS project secrets before running any cloud build:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbG..."
```

### 2. Local `.env` file (local dev)

Create a `.env` file in the project root (already git-ignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

> **Never commit this file.** It is already in `.gitignore`.

---

### 3. Play Console Service Account Key (`google-services.json`)

To submit builds to the Play Store using `eas submit`, you need a **Google Play service-account JSON** (different from Firebase's `google-services.json`).

**To set it up:**
1. Go to [Google Play Console](https://play.google.com/console) → Setup → API access
2. Link to a Google Cloud project and create a service account with *Release Manager* permissions
3. Download the private JSON key
4. Place it at the **project root** as `google-services.json`

> **⚠️ NEVER commit this file.** It is added to `.gitignore`.  
> Store it in a CI/CD secret vault (e.g., GitHub Actions `secrets.PLAY_SERVICE_ACCOUNT`) and write it to disk before running `eas submit`.

**Running submission:**
```bash
eas submit --platform android --profile production
```

---

## Build Commands

| Command | Description |
|---|---|
| `npm run build:apk` | Production APK via EAS cloud |
| `npm run build:preview` | Internal test APK via EAS cloud |
| `npm run build:apk:local` | Production APK built locally |
| `eas submit --platform android` | Submit to Play Store (requires `google-services.json`) |
