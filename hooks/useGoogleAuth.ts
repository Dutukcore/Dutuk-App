import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Toast from 'react-native-toast-message';
import setRole from "./setVendorAsRoleOnRegister";

WebBrowser.maybeCompleteAuthSession();

/**
 * Handle Google OAuth authentication
 * Automatically assigns vendor role if this is a new user registration
 * Uses PKCE flow for enhanced security
 * 
 * @returns Promise<void>
 */
const googleLogin = async (): Promise<void> => {
  try {
    console.log("Initiating Google OAuth login");
    
    const redirectUrl = Linking.createURL("auth/callback");
    console.log("Redirect URL:", redirectUrl);

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
      console.error("OAuth initiation error:", error.message);
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: 'Unable to connect to Google. Please try again.'
      });
      return;
    }

    const authUrl = data?.url;
    if (!authUrl) {
      console.error("No auth URL returned from Supabase");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Unable to start Google sign-in. Please try again.'
      });
      return;
    }

    console.log("Opening Google authentication in browser");

    // Open Google auth in browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type !== "success" || !result.url) {
      console.warn("Auth session cancelled or failed:", result.type);
      
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
    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("No auth code returned in redirect URL");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Failed to receive authorization code from Google.'
      });
      return;
    }

    console.log("Authorization code received, exchanging for session");

    // Check if user existed before to determine if this is a new registration
    const { data: { user: beforeUser } } = await supabase.auth.getUser();
    const isNewUser = !beforeUser;

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
      console.error("Session exchange error:", sessionError);
      Toast.show({
        type: 'error',
        text1: 'Session Error',
        text2: 'Failed to establish session. Please try again.'
      });
      return;
    }

    if (!sessionData?.session) {
      console.error("No session data returned");
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Failed to create session. Please try again.'
      });
      return;
    }

    console.log("Session established successfully");

    // Extract user's name from Google account metadata
    const googleUserName = sessionData.session?.user?.user_metadata?.full_name || 
                          sessionData.session?.user?.user_metadata?.name || 
                          null;
    
    console.log("Google user name:", googleUserName);

    // Create company entry for new users from this app
    // Pass the Google user's name as default company name
    // For existing users, their company should already exist
    const roleSet = await setRole(googleUserName);
    
    if (!roleSet && isNewUser) {
      console.warn("Warning: Failed to create company entry for new Google OAuth user");
      Toast.show({
        type: 'info',
        text1: 'Account Created',
        text2: 'Welcome! If you experience any issues, please contact support.'
      });
    }

    // Show success message
    Toast.show({
      type: 'success',
      text1: 'Welcome!',
      text2: isNewUser ? 'Your vendor account has been created.' : 'Successfully signed in.'
    });

    // Navigate to home
    router.replace("/(tabs)/home");
  } catch (err) {
    console.error("Unexpected Google OAuth error:", err);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'An unexpected error occurred. Please try again.'
    });
  }
};

export default googleLogin;
