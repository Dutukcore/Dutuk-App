import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
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
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event" />
        <Stack.Screen name="requests" />
        <Stack.Screen name="auth/UserLogin" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/OtpPage" />
        <Stack.Screen name="auth/EmailAuth" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="customerApproval" />
        <Stack.Screen name="customerDetails" />
        <Stack.Screen name="profile" />
      </Stack>
      <Toast />
    </>
  );
}
