import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import WelcomeScreen from "@/features/auth/components/WelcomeScreen";

export default function Index() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  // Prevent duplicate routing if multiple auth events fire during signup
  const handlingAuth = useRef(false);

  useEffect(() => {
    // Check for existing session on app startup
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // User is already logged in, redirect to home.
          // The onAuthStateChange listener will NOT be active yet
          // for this initial check, so a dedicated flag check isn't needed here.
          logger.log("Existing session found, redirecting to home");
          router.replace("/(tabs)/home");
        } else {
          // No session, show welcome screen
          setIsCheckingAuth(false);
        }
      } catch (error) {
        logger.error("Error checking session:", error);
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // Listen for auth state changes (login, signup, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Guard against multiple firings during the signup flow
        // (supabase fires both a SIGNED_UP and a SIGNED_IN event)
        if (handlingAuth.current) return;
        handlingAuth.current = true;

        try {
          // Check if this is a new user signup
          const isNewUser = await AsyncStorage.getItem('isNewUserSignup');

          if (isNewUser === 'true') {
            // Clear the flag and redirect to onboarding
            await AsyncStorage.removeItem('isNewUserSignup');
            logger.log("New user signup, redirecting to onboarding");
            router.replace('/auth/OnboardingGetStarted');
          } else {
            // Existing user login, redirect to home
            logger.log("User logged in, redirecting to home");
            router.replace("/(tabs)/home");
          }
        } finally {
          // Reset the guard after a short delay to allow future logins/logouts
          setTimeout(() => {
            handlingAuth.current = false;
          }, 2000);
        }
      } else {
        // User logged out, stay on welcome screen
        handlingAuth.current = false;
        setIsCheckingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show welcome screen if no session is found
  if (isCheckingAuth) {
    return null; // Or a loading screen
  }

  return <WelcomeScreen />;
}
