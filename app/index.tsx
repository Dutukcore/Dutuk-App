import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import WelcomeScreen from "../components/WelcomeScreen";

export default function Index() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for existing session on app startup
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is already logged in, redirect to home
          console.log("Existing session found, redirecting to home");
          router.replace("/(tabs)/home");
        } else {
          // No session, show welcome screen
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User logged in, redirect to home
        router.replace("/(tabs)/home");
      } else {
        // User logged out, stay on welcome screen
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
