# Dutuk Vendor App

A mobile vendor management dashboard built with **React Native + Expo Router** and **Supabase** as the backend.

Vendors (photographers, caterers, decorators, etc.) use this app to manage listings, orders, chat with customers, and track their calendar availability.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native 0.81 + Expo ~54 |
| Routing | Expo Router (file-based) |
| State | Zustand + MMKV (sync persistence) |
| Backend | Supabase (Postgres + RLS + Realtime + Storage) |
| Language | TypeScript (strict) |
| Build | EAS Build (Android + iOS) |

---

## Project Structure

```
dutuk-vendor-app/
│
├── app/                    # Expo Router screen files (routing only)
│   ├── (tabs)/             # Bottom-tab screens: home, orders, chat, calendar, profile
│   ├── auth/               # Login, register, onboarding screens
│   ├── chat/               # Chat conversation screen
│   ├── event/              # Event list + create/edit screens
│   ├── orders/             # Order approval & details screens
│   ├── profilePages/       # Settings, portfolio, services, calendar
│   └── quotations/         # Quotation request screens
│
├── src/                    # All application source code
│   ├── components/
│   │   ├── layout/         # NavBar, BottomNavigation, KeyboardSafeView
│   │   └── ui/             # DutukLogo, EditableInputField, RouteAssist
│   │
│   ├── constants/          # theme.ts (colors, spacing, shadows), Typography.ts
│   │
│   ├── features/           # Domain-sliced feature modules
│   │   ├── auth/           # Login/register hooks, services & components
│   │   ├── calendar/       # Availability calendar component, hooks & utils
│   │   ├── chat/           # Message, conversation, attachment, typing hooks
│   │   ├── events/         # Pricing components, event CRUD services & hooks
│   │   ├── orders/         # Order hooks, completion hooks, request services
│   │   └── profile/        # Portfolio, services, reviews, image upload hooks
│   │
│   ├── lib/                # Shared infrastructure
│   │   ├── supabase.ts     # Supabase client singleton
│   │   ├── storage.ts      # MMKV storage adapter
│   │   ├── logger.ts       # Dev logger
│   │   └── usePushNotifications.ts
│   │
│   ├── store/              # Zustand stores
│   │   ├── useAuthStore.ts       # Auth session (userId, isAuthenticated)
│   │   ├── useVendorStore.ts     # Global vendor data (events, orders, reviews…)
│   │   └── useRealtimeStore.ts   # Unified Supabase Realtime channel manager
│   │
│   ├── types/              # Shared TypeScript interfaces
│   │   ├── navigation.ts   # Route param types
│   │   └── pricing.ts      # PricingItem interface + helpers
│   │
│   └── __mocks__/          # Local dev mock/fixture data
│
├── assets/                 # App icons, splash screen, images
├── docs/                   # All project documentation (see docs/INDEX.md)
├── app.json                # Expo config
├── babel.config.js         # Babel config (includes module-resolver for @/ alias)
├── tsconfig.json           # TypeScript config (@/* → ./src/*)
└── eas.json                # EAS Build profiles
```

---

## Path Alias

All source imports use the `@/` alias which maps to `./src/`:

```ts
// ✅ Correct
import { supabase } from '@/lib/supabase';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { UnifiedCalendar } from '@/features/calendar/components/UnifiedCalendar';
import { COLORS } from '@/constants/theme';
import { useVendorStore } from '@/store/useVendorStore';

// ❌ No longer valid (old flat paths)
// import { supabase } from '@/utils/supabase';
// import { useOrders } from '@/hooks/useOrders';
```

---

## Feature Modules

Each feature under `src/features/` follows this contract:

```
features/<domain>/
├── components/    # React Native components specific to this domain
├── hooks/         # React hooks (useX — stateful, use React APIs)
├── services/      # Pure async functions (no React hooks, no useState)
└── index.ts       # Public barrel — only import from here outside the feature
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Build APK (EAS)
npm run build:apk
```

See [`docs/QUICK_START.md`](./docs/QUICK_START.md) for detailed setup.

---

## Documentation

All documentation lives in [`docs/`](./docs/INDEX.md).
Key references:

- [`docs/ARCHITECTURE_AUDIT.md`](./docs/ARCHITECTURE_AUDIT.md) — Full system architecture audit
- [`docs/RESTRUCTURING_PLAN.md`](./docs/RESTRUCTURING_PLAN.md) — Booking flow pipeline design
- [`docs/DEPLOYMENT_READINESS_REPORT.md`](./docs/DEPLOYMENT_READINESS_REPORT.md) — Pre-release checklist
- [`docs/APK_EXPORT_GUIDE.md`](./docs/APK_EXPORT_GUIDE.md) — Build & export guide