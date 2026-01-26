import { OrderNotificationProvider } from '@/hooks/OrderNotificationContext';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import '../global';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately to prevent hanging
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors if splash screen is already hidden
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OrderNotificationProvider>
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
      </OrderNotificationProvider>
    </GestureHandlerRootView>
  );
}

