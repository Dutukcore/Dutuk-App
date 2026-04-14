# dutuk-vendor-app Codebase Organization Plan

This plan outlines a strategy for restructuring the `dutuk-vendor-app` to resolve module entanglement, enforce a clear separation of concerns, and make the codebase scalable and easier to navigate.

## Current State Observations
- **Mixed Concerns in `hooks/`**: Standard async functions (like `createEvent.ts`, `authHelpers.ts`) are mixed with actual React Hooks (like `useOrders.ts`).
- **Heavy Components**: The `components/` folder merges global dumb UI components (`DutukLogo.tsx`) with domain-heavy feature containers (`UnifiedCalendar.tsx`, `PricingItemEditor.tsx`).
- **Feature Fragmentation**: A single feature like "Events" spans across `app/event/`, `hooks/updateEvent.ts`, `components/DisplayEvents.tsx`, and `store/useVendorStore.ts`. 
- **Monolithic State**: `useVendorStore.ts` (17KB) manages too many distinct domains.

## User Review Required

> [!WARNING]
> Restructuring a codebase involves moving many files, which will heavily affect existing `import` paths across the app. We highly recommend configuring **Absolute Imports** (e.g., using `@/components/...`) in `tsconfig.json` before proceeding to make future refactoring easier.

> [!IMPORTANT]  
> Expo Router supports putting the `app/` directory alongside a generic `src/` directory, or putting everything *inside* a `src/` directory. For maximum cleanliness, we recommend moving everything except configuration files into a `/src` directory. Please confirm if this is acceptable.

## Proposed New Directory Structure (Feature-Based)

We propose organizing the codebase by **Domain Features** rather than strictly by file type (e.g. putting all hooks in one folder, all components in another). 

```text
dutuk-vendor-app/
├── app/                  (Expo Router Entrypoints - Keep UI lean here)
│   ├── (tabs)/
│   ├── auth/
│   ├── orders/
│   └── ...
├── src/                  (All non-routing source code)
│   ├── components/       (Generic, reusable UI components only)
│   │   ├── ui/           (Buttons, Inputs, Modals)
│   │   └── layout/       (NavBar, BottomNavigation, KeyboardSafeView)
│   ├── features/         (Domain-specific logic and complex components)
│   │   ├── auth/         (Login logic, AuthAssist)
│   │   ├── events/       (Prices, Event Editors, DisplayEvents)
│   │   ├── orders/       (Order Cards, Approvals)
│   │   ├── chat/         (Message list, chat wrappers)
│   │   └── calendar/     (UnifiedCalendar, availability hooks)
│   ├── hooks/            (App-wide React Hooks, e.g., useKeyboard, useRealtime)
│   ├── services/         (API & Supabase calls - Moved from 'hooks/')
│   ├── store/            (Zustand stores, split into multiple slices)
│   ├── types/            (Global TypeScript definitions & DB schemas)
│   ├── utils/            (Pure helper functions)
│   └── constants/        (Themes, typography, configurations)
└── ...config files
```

## Migration Phases

### Phase 1: Establish Foundation & UI Separation
- Configure Absolute Path aliases in `tsconfig.json` (`"@/*": ["./src/*"]`).
- Create the generic `src/components/ui` folder.
- Move dumb components (`DutukLogo`, `EditableInputField`, `RouteAssist`) into `ui/`.

### Phase 2: Feature Modularization
- Create the `src/features/` directory with sub-folders for `events`, `orders`, `chat`, `calendar`, `auth`, `profile`.
- Move heavy components like `UnifiedCalendar.tsx` into `features/calendar/components/`.
- Move `DisplayEvents.tsx` and `PricingItemEditor.tsx` into `features/events/components/`.

### Phase 3: Clean up Hooks & Services
- Extract pure functions from `hooks/` (e.g., `createEvent.ts`, `deleteEvent.ts`, `authHelpers.ts`, `getStoredDates.ts`).
- Move them to `src/services/` or `src/features/[domain]/api/` (e.g., `src/features/events/api/createEvent.ts`).
- Keep only strictly React Hooks (`useX`) in the hooks folders.

### Phase 4: State Management Refactor
- Split `useVendorStore.ts` into smaller specialized modular stores, or use Zustand slices if they must remain in a single provider.
- Example: `useEventStore.ts`, `useOrderStore.ts`, `useCalendarStore.ts`.

## Open Questions

1. **Move to `src/` directory**: Should we containerize the codebase inside a `src/` directory (leaving `app/` outside or moving `app/` inside `src/`)?
2. **Path Aliasing**: Are you comfortable adding `tsconfig.json` path aliases (`@/*`) to streamline imports before we move files? 
3. **Data Fetching Strategy**: You are currently using custom hooks wrapping Supabase calls. In the future, would you like to adopt **TanStack Query (React Query)** to handle remote state caching, leaving Zustand only for local UI state?

## Verification Plan
1. Ensure the Expo app successfully builds (`npm start`, `npx expo export`).
2. Run TypeScript checks to verify all imports and paths correspond to the correct new locations.
3. Verify that the app's routing and main screens (Home, Events, Orders) render without runtime crashes due to missing modules.
