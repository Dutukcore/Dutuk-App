import WelcomeScreen from "@/features/auth/components/WelcomeScreen";
import logger from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";

/**
 * Landing screen – reads auth state from the Zustand store (single source of truth).
 * The store's onAuthStateChange listener (in useAuthStore.initialize) handles all
 * auth transitions; this screen simply reacts to the resulting state changes.
 */
export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return; // Still initialising – wait

    if (isAuthenticated) {
      // Check if this is a new user who needs onboarding
      AsyncStorage.getItem('isNewUserSignup').then((isNewUser) => {
        if (isNewUser === 'true') {
          AsyncStorage.removeItem('isNewUserSignup');
          logger.log('New user signup, redirecting to onboarding');
          router.replace('/auth/OnboardingGetStarted');
        } else {
          logger.log('User logged in, redirecting to home');
          router.replace('/(tabs)/home');
        }
      }).catch(() => {
        // Fallback: just go home if AsyncStorage fails
        router.replace('/(tabs)/home');
      });
    }
    // If !isAuthenticated, show the welcome screen (rendered below)
  }, [isAuthenticated, isLoading, router]);

  // While initialising show nothing (splash screen is still up)
  if (isLoading) return null;

  // Authenticated users are being redirected above; show welcome to guests
  if (isAuthenticated) return null;

  return <WelcomeScreen />;
}
