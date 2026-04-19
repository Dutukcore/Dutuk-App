import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

// Performance Stores
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { installGlobalErrorHandler } from '@/lib/globalErrorHandler';
import { useAuthStore } from '@/store/useAuthStore';
import { setupRealtimeSubscriptions, teardownRealtimeSubscriptions } from '@/store/useRealtimeStore';
import { useVendorStore } from '@/store/useVendorStore';

// Install global error handler before anything else runs
installGlobalErrorHandler();

WebBrowser.maybeCompleteAuthSession();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCritical = useVendorStore((s) => s.fetchCritical);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Run initialization in a proper async context so errors are caught
    // and the splash never gets stuck showing indefinitely.
    (async () => {
      try {
        await initialize();
      } catch (e) {
        // Swallow – never let init crash the app.
        // isLoading will be false already (set in the store's catch block).
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => { });
      }
    })();
  }, [initialize]);

  // When user authenticates (and app is ready), fetch critical vendor data
  // + setup unified realtime channel.
  useEffect(() => {
    if (!appReady) return;
    if (isAuthenticated) {
      fetchCritical();
      setupRealtimeSubscriptions();
    } else {
      teardownRealtimeSubscriptions();
    }
  }, [appReady, isAuthenticated, fetchCritical]);

  // Don't render the navigation tree until init is complete.
  // The splash screen is still visible at this point.
  if (!appReady) return null;

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
