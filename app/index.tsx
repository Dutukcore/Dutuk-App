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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Check if this is a new user (needs onboarding) vs existing user (go to home)
        // New users are identified by checking if they have a company profile set up
        try {
          const { data: companyData } = await supabase
            .from('companies')
            .select('company_name')
            .eq('user_id', session.user.id)
            .single();
          
          // If user has no company name set, they need onboarding
          if (!companyData?.company_name) {
            console.log("New user detected, redirecting to onboarding");
            router.replace('/auth/OnboardingGetStarted');
          } else {
            // Existing user with profile, redirect to home
            console.log("Existing user detected, redirecting to home");
            router.replace("/(tabs)/home");
          }
        } catch (error) {
          // If there's an error (e.g., no company record), treat as new user
          console.log("No company profile found, redirecting to onboarding");
          router.replace('/auth/OnboardingGetStarted');
        }
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
