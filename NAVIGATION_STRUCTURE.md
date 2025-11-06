# Navigation Structure Documentation

## Overview

This React Native Expo app uses **expo-router** for file-based routing with a clean separation between authentication and main app flows.

## Architecture

### Stack Navigator (Root Layout)
- **Location**: `/app/app/_layout.tsx`
- **Purpose**: Manages top-level navigation and screen transitions
- **Features**:
  - Auth flow screens
  - Main app tabs
  - Modal overlays
  - Nested navigators

### Tab Navigator (Main App)
- **Location**: `/app/app/(tabs)/_layout.tsx`
- **Purpose**: Bottom tab navigation for primary app sections
- **Tabs**:
  1. **Home** - Dashboard and quick actions
  2. **Orders** - View and manage orders
  3. **Profile** - User profile and settings

## File Structure

```
/app/app/
├── _layout.tsx                 # Root stack navigator
├── index.tsx                   # Landing/auth check screen
├── (tabs)/                     # Main app tabs group
│   ├── _layout.tsx            # Tab navigator configuration
│   ├── home.tsx               # Home tab screen
│   ├── orders.tsx             # Orders tab screen
│   └── profile.tsx            # Profile tab screen
├── auth/                       # Authentication screens
│   ├── UserLogin.tsx
│   ├── register.tsx
│   ├── OtpPage.tsx
│   ├── EmailAuth.tsx
│   └── callback.tsx
├── orders/                     # Order detail screens (modal)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── customerApproval.tsx
│   └── customerDetails.tsx
├── event/                      # Event screens
├── requests/                   # Request screens
├── profilePages/               # Profile sub-screens
└── public/                     # Public screens
```

## Navigation Flow

### 1. App Launch
```
index.tsx (Auth Check)
    ├── No Session → WelcomeScreen
    └── Has Session → (tabs)/home
```

### 2. Authentication Flow
```
WelcomeScreen
    ├── Login → auth/UserLogin
    ├── Register → auth/register
    └── OTP → auth/OtpPage
        └── Success → (tabs)/home
```

### 3. Main App Flow
```
(tabs)
    ├── home
    │   ├── Calendar → profilePages/calender/CalendarPage
    │   ├── Events → event/
    │   └── Requests → requests/menu
    ├── orders (Tab)
    │   └── Order Item → orders/customerApproval OR orders/customerDetails
    └── profile
        ├── Edit Profile → profilePages/...
        └── Logout → auth/UserLogin
```

## Key Features

### Native Bottom Tabs
- Uses expo-router's built-in `<Tabs>` component
- Custom icons from `react-native-feather`
- Active/inactive states with color changes
- Stroke width changes on selection

### Icons Used
- **Home**: `<Home>` from react-native-feather
- **Orders**: `<FileText>` from react-native-feather
- **Profile**: `<User>` from react-native-feather

### Modal Presentation
The `/orders` stack uses modal presentation:
```typescript
<Stack.Screen 
  name="orders" 
  options={{ 
    presentation: 'modal',
    animation: 'slide_from_bottom'
  }} 
/>
```
This makes order detail screens overlay the tab bar with a back button.

## TypeScript Support

### Navigation Types
All navigation types are defined in `/app/types/navigation.ts`:

```typescript
import { OrderDetailsParams } from '@/types/navigation';

// Type-safe navigation
router.push({
  pathname: '/orders/customerApproval',
  params: orderParams
});
```

## Screen Configurations

### Tab Screens
- `headerShown: false` - No native header
- Custom headers implemented in each screen
- Safe area handling with `<SafeAreaView>`
- Scrollable content with proper padding

### Modal Screens (Orders)
- Presentation: `'modal'`
- Animation: `'slide_from_bottom'`
- Back button for navigation
- No bottom tab bar visible

### Auth Screens
- Stack presentation
- Slide animations
- No back button on login screen

## Best Practices

### 1. Navigation
```typescript
// Use router.push for forward navigation
router.push('/screen');

// Use router.back for going back
router.back();

// Use router.replace for replacing current screen
router.replace('/(tabs)/home');
```

### 2. Safe Area Handling
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top']}>
  {/* Content */}
</SafeAreaView>
```

### 3. Tab Bar Styling
Tab bar is configured in `(tabs)/_layout.tsx`:
- Height: 80px
- Border radius: 14px (top corners)
- Shadow/elevation for depth
- Proper padding for touch targets

### 4. Scrollable Content
```typescript
<ScrollView 
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>
  {/* Content */}
</ScrollView>
```

## Common Issues & Solutions

### Issue: Tab bar covering content
**Solution**: Add proper `paddingBottom` to scroll content:
```typescript
contentContainerStyle={{
  paddingBottom: 20 // Adjust as needed
}}
```

### Issue: Orders screen showing tab bar
**Solution**: Orders stack is configured as modal in root layout:
```typescript
<Stack.Screen 
  name="orders" 
  options={{ presentation: 'modal' }} 
/>
```

### Issue: Navigation not type-safe
**Solution**: Import types from `/app/types/navigation.ts` and use them:
```typescript
import { OrderDetailsParams } from '@/types/navigation';
```

## Migration Notes

### Removed Components
- **BottomNavigation.tsx** - Replaced with native tabs
- Custom navigation logic - Replaced with expo-router

### Updated Components
- All tab screens now use native tab navigation
- Removed custom bottom navigation from screens
- Updated safe area handling

## Future Enhancements

### Potential Improvements
1. **Deep Linking**: Add URL scheme support
2. **Lazy Loading**: Implement lazy loading for screens
3. **Navigation Guards**: Add auth guards for protected routes
4. **Animations**: Custom screen transitions
5. **State Persistence**: Save navigation state

## Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Support](https://docs.expo.dev/router/reference/typed-routes/)
