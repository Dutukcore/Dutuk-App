import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Toast from 'react-native-toast-message';
import setRole from "../services/setVendorAsRoleOnRegister";

WebBrowser.maybeCompleteAuthSession();

/**
 * Handle Google OAuth authentication
 * Automatically assigns vendor role ONLY if this is a new user registration
 * Uses PKCE flow for enhanced security
 * 
 * @returns Promise<void>
 */
const googleLogin = async (): Promise<void> => {
  try {
    logger.log("Initiating Google OAuth login");

    const redirectUrl = Linking.createURL("auth/callback");
    logger.log("Redirect URL configured");

    // Initiate OAuth flow with Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        // Add metadata to identify sign-ins from this app
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error("OAuth initiation error");
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: 'Unable to connect to Google. Please try again.'
      });
      return;
    }

    const authUrl = data?.url;
    if (!authUrl) {
      logger.error("No auth URL returned");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Unable to start Google sign-in. Please try again.'
      });
      return;
    }

    logger.log("Opening Google authentication in browser");

    // Open Google auth in browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type !== "success" || !result.url) {
      logger.warn("Auth session cancelled or failed");

      if (result.type === "cancel") {
        Toast.show({
          type: 'info',
          text1: 'Sign-In Cancelled',
          text2: 'Google sign-in was cancelled.'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: 'Unable to complete Google sign-in.'
        });
      }
      return;
    }

    // Extract authorization code from redirect URL
    const parsedUrl = Linking.parse(result.url);
    const code = parsedUrl.queryParams?.code as string | undefined;

    if (!code) {
      logger.error("No auth code returned in redirect URL");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Failed to receive authorization code from Google.'
      });
      return;
    }

    logger.log("Authorization code received, exchanging for session");

    // Exchange authorization code for session
    let sessionError;
    let sessionData;
    try {
      const response = await (supabase.auth.exchangeCodeForSession as any)(
        supabase.auth.exchangeCodeForSession.length === 1 ? code : { code }
      );

      sessionError = response.error;
      sessionData = response.data;
    } catch (err) {
      sessionError = err;
    }

    if (sessionError) {
      logger.error("Session exchange error");
      Toast.show({
        type: 'error',
        text1: 'Session Error',
        text2: 'Failed to establish session. Please try again.'
      });
      return;
    }

    if (!sessionData?.session) {
      logger.error("No session data returned");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Failed to create session. Please try again.'
      });
      return;
    }

    logger.log("Session established successfully");

    const userId = sessionData.session?.user?.id;

    // Check if this is a new user by querying the companies table
    // If no company exists, this is a first-time registration
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .single();

    // PGRST116 means no rows found - this is a new user
    const isNewUser = companyCheckError?.code === "PGRST116" || !existingCompany;

    logger.log("Is new user:", isNewUser);

    // Only call setRole for NEW users (first time registration via Google)
    if (isNewUser) {
      logger.log("New Google OAuth user detected, creating vendor profile");

      // Extract user's name from Google account metadata
      const googleUserName = sessionData.session?.user?.user_metadata?.full_name ||
        sessionData.session?.user?.user_metadata?.name ||
        null;

      // Create company entry for new users from this app
      // Pass the Google user's name as default company name
      const roleSet = await setRole(googleUserName);

      if (!roleSet) {
        logger.warn("Warning: Failed to create company entry for new Google OAuth user");
        Toast.show({
          type: 'info',
          text1: 'Account Created',
          text2: 'Welcome! If you experience any issues, please contact support.'
        });
      } else {
        logger.log("Successfully created vendor profile for new user");
      }

      // Show welcome message for new users
      Toast.show({
        type: 'success',
        text1: 'Welcome to Dutuk!',
        text2: 'Your vendor account has been created.'
      });

      // Redirect new Google users to onboarding
      router.replace("/auth/OnboardingGetStarted");
    } else {
      logger.log("Existing Google OAuth user, skipping vendor profile creation");

      // Show welcome back message for existing users
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Successfully signed in.'
      });

      // Existing users go directly to home
      router.replace("/(tabs)/home");
    }
  } catch (err) {
    logger.error("Unexpected Google OAuth error");
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'An unexpected error occurred. Please try again.'
    });
  }
};

export default googleLogin;
