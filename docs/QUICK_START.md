# Quick Start Guide - Navigation

## How to Navigate in This App

### Basic Navigation

```typescript
import { router } from 'expo-router';

// Navigate to a screen
router.push('/screen-name');

// Go back
router.back();

// Replace current screen (no back)
router.replace('/screen-name');
```

### Navigate to Tabs

```typescript
// Home tab
router.push('/(tabs)/home');

// Orders tab
router.push('/(tabs)/orders');

// Profile tab
router.push('/(tabs)/profile');
```

### Navigate with Parameters

```typescript
import { router } from 'expo-router';
import type { OrderDetailsParams } from '@/types/navigation';

const params: OrderDetailsParams = {
  orderId: '12345',
  title: 'Birthday Party',
  customerName: 'John Doe',
  packageType: 'Premium',
  customerEmail: 'john@example.com',
  customerPhone: '+1234567890'
};

router.push({
  pathname: '/orders/customerApproval',
  params: params
});
```

### Receive Parameters

```typescript
import { useLocalSearchParams } from 'expo-router';

const params = useLocalSearchParams();

const orderId = params.orderId as string;
const title = params.title as string;
```

## Common Screens

### Main Tabs
- **Home**: `/(tabs)/home`
- **Orders**: `/(tabs)/orders`
- **Profile**: `/(tabs)/profile`

### Auth Screens
- **Login**: `/auth/UserLogin`
- **Register**: `/auth/register`
- **OTP**: `/auth/OtpPage`

### Order Screens
- **Order List**: `/(tabs)/orders` (tab)
- **Approval**: `/orders/customerApproval`
- **Details**: `/orders/customerDetails`

### Other Screens
- **Calendar**: `/profilePages/calender/CalendarPage`
- **Events**: `/event`
- **Requests**: `/requests/menu`

## Creating a New Screen

### 1. Create the file
```bash
# For a tab screen
touch app/(tabs)/new-screen.tsx

# For a regular screen
touch app/new-screen.tsx

# For a nested screen
touch app/feature/new-screen.tsx
```

### 2. Basic screen template
```typescript
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text>New Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
```

### 3. Add to navigator (if needed)
```typescript
// In app/_layout.tsx
<Stack.Screen name="new-screen" />

// Or in app/(tabs)/_layout.tsx for a new tab
<Tabs.Screen 
  name="new-screen"
  options={{
    title: 'New',
    tabBarIcon: ({ color }) => (
      <Icon width={24} height={24} stroke={color} />
    ),
  }}
/>
```

## Styling Tips

### Tab Bar Icons
```typescript
tabBarIcon: ({ color, focused }) => (
  <Icon 
    width={24} 
    height={24} 
    stroke={color}
    strokeWidth={focused ? 2.5 : 2}
  />
)
```

### Safe Area
```typescript
<SafeAreaView style={styles.container} edges={['top']}>
  {/* Content */}
</SafeAreaView>
```

### Scrollable Content
```typescript
<ScrollView 
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>
  {/* Content */}
</ScrollView>
```

## Troubleshooting

### Screen not found
- Check file name matches route name
- Ensure file is in correct directory
- Verify export default is present

### Tab bar covering content
- Add padding to scroll content
- Use SafeAreaView properly
- Check contentContainerStyle padding

### Navigation not working
- Check route name spelling
- Verify screen is registered in _layout.tsx
- Use correct navigation method (push/replace/back)

### Back button not showing
- Verify screen is in a stack (not tab root)
- Check if headerShown is false (custom header needed)
- Ensure proper stack nesting

## Pro Tips

1. **Use TypeScript types** for type-safe navigation
2. **Test on both iOS and Android** - behavior can differ
3. **Use SafeAreaView** on all screens
4. **Manage scroll padding** properly for tab bars
5. **Use modals** for contextual flows (like order details)
6. **Test deep links** early if needed
7. **Keep navigation flat** - avoid too much nesting
