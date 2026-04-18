import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

// Performance Stores
import { useAuthStore } from '@/store/useAuthStore';
import { setupRealtimeSubscriptions, teardownRealtimeSubscriptions } from '@/store/useRealtimeStore';
import { useVendorStore } from '@/store/useVendorStore';

WebBrowser.maybeCompleteAuthSession();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCritical = useVendorStore((s) => s.fetchCritical);

  useEffect(() => {
    // Initialize auth state from MMKV/Supabase session
    initialize().finally(() => {
      // Hide splash screen after initialization attempt
      SplashScreen.hideAsync().catch(() => { });
    });
  }, []);

  // When user authenticates, fetch critical vendor data + setup unified realtime channel
  useEffect(() => {
    if (isAuthenticated) {
      fetchCritical();
      setupRealtimeSubscriptions();
    } else {
      teardownRealtimeSubscriptions();
    }
  }, [isAuthenticated, fetchCritical]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          {/* Landing/Auth Check Screen */}
          <Stack.Screen name="index" options={{ animation: 'none' }} />

          {/* Main App Tabs */}
          <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />

          {/* Auth Screens */}
          <Stack.Screen name="auth/UserLogin" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/EmailAuth" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="auth/OnboardingGetStarted" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/OnboardingCategories" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/OnboardingLocation" options={{ animation: 'slide_from_right' }} />

          {/* Modal/Overlay Screens */}
          <Stack.Screen
            name="orders"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />

          {/* Other App Screens */}
          <Stack.Screen name="event" />
          <Stack.Screen name="requests" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="profilePages" />
          <Stack.Screen name="public" />
        </Stack>
        <Toast />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

