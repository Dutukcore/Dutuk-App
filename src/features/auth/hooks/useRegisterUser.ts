import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import setRole from "../services/setVendorAsRoleOnRegister";

/**
 * Register a new user with email and password
 * Automatically assigns 'vendor' role on successful registration
 * Creates entries in both user_profiles and companies tables
 * MVP: No email verification required - direct signup and auto-login
 * 
 * @param userEmail - User's email address
 * @param password - User's password (minimum 8 characters)
 * @returns Promise<void>
 * @throws Error if registration fails
 */
const registerUser = async (userEmail: string, password: string): Promise<void> => {
  try {
    // Validate inputs
    if (!userEmail || !userEmail.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address.'
      });
      throw new Error('Email is required');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!password || password.length < 8 || !hasUpperCase || !hasNumber) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be 8+ chars with an uppercase letter and a number.'
      });
      throw new Error('Password complexity requirement not met');
    }

    const trimmedEmail = userEmail.trim().toLowerCase();

    logger.log("Attempting to register user");

    // Set flag BEFORE signup so that onAuthStateChange in index.tsx
    // always knows this is a new user when it fires.
    await AsyncStorage.setItem('isNewUserSignup', 'true');

    // Attempt to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        // Add metadata to identify registration from this app
        data: {
          app_source: 'dutuk_vendor_app',
          registration_timestamp: new Date().toISOString(),
        }
      }
    });

    if (signUpError) {
      const message = signUpError.message.toLowerCase();

      logger.error("Registration error:", signUpError.message);

      // Handle specific error cases with user-friendly messages
      if (message.includes("user already registered") || message.includes("already registered")) {
        Toast.show({
          type: 'error',
          text1: 'Account Already Exists',
          text2: 'An account with this email already exists. Please log in instead.'
        });

        // Navigate to login page after a short delay
        setTimeout(() => {
          router.push('/auth/UserLogin');
        }, 1500);
      } else if (message.includes("password")) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Password',
          text2: 'Password must be at least 6 characters long.'
        });
      } else if (message.includes("email") || message.includes("invalid")) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Email',
          text2: 'Please enter a valid email address.'
        });
      } else if (message.includes("rate limit")) {
        Toast.show({
          type: 'error',
          text1: 'Too Many Attempts',
          text2: 'Please wait a few minutes before trying again.'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: signUpError.message
        });
      }

      throw signUpError;
    }

    if (!signUpData?.user) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Unable to create account. Please try again.'
      });
      throw new Error('User data not returned from signup');
    }

    logger.log("User signed up successfully");

    // MVP: Auto-login after registration (no email verification)
    logger.log("Proceeding to auto-login after registration");

    // Set flag to indicate this is a new user signup (for onboarding redirect)
    await AsyncStorage.setItem('isNewUserSignup', 'true');

    // Automatically sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    });

    if (signInError) {
      logger.error("Auto-login error after registration");
      // Clear flag since auto-login failed
      await AsyncStorage.removeItem('isNewUserSignup');
      Toast.show({
        type: 'info',
        text1: 'Registration Complete',
        text2: 'Please log in with your credentials.'
      });
      router.replace('/auth/UserLogin');
    } else {
      logger.log("Auto-login successful");

      // Set vendor role and create company entry for the new user
      const roleSet = await setRole();
      if (!roleSet) {
        logger.warn("Warning: Failed to set vendor role, but continuing login");
      }

      // Do NOT manually redirect here. The onAuthStateChange listener in
      // index.tsx will read the 'isNewUserSignup' flag and redirect to
      // /auth/OnboardingGetStarted automatically.
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Your vendor account has been created successfully!'
      });
    }
  } catch (error) {
    logger.error("Unexpected error during registration");
    // Error toast already shown in specific error handlers
    throw error;
  }
};

export default registerUser;
