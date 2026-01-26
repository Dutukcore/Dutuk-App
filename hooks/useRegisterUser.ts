import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { supabase } from "../utils/supabase";
import setRole from "./setVendorAsRoleOnRegister";

/**
 * Register a new user with email and password
 * Automatically assigns 'vendor' role on successful registration
 * Creates entries in both user_profiles and companies tables
 * MVP: No email verification required - direct signup and auto-login
 * 
 * @param userEmail - User's email address
 * @param password - User's password (minimum 6 characters)
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

    if (!password || password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters.'
      });
      throw new Error('Password must be at least 6 characters');
    }

    const trimmedEmail = userEmail.trim().toLowerCase();
    
    console.log("Attempting to register user:", trimmedEmail);

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
      
      console.error("Registration error:", signUpError);
      
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

    console.log("User signed up successfully:", signUpData.user.id);

    // MVP: Auto-login after registration (no email verification)
    console.log("Proceeding to auto-login after registration");
    
    // Automatically sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    });

    if (signInError) {
      console.error("Auto-login error after registration:", signInError);
      Toast.show({
        type: 'info',
        text1: 'Registration Complete',
        text2: 'Please log in with your credentials.'
      });
      router.replace('/auth/UserLogin');
    } else {
      console.log("Auto-login successful");
      
      // Set vendor role and create company entry for the new user
      const roleSet = await setRole();
      if (!roleSet) {
        console.warn("Warning: Failed to set vendor role, but continuing login");
      }

      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Your vendor account has been created successfully!'
      });
      
      router.replace('/(tabs)/home');
    }
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    // Error toast already shown in specific error handlers
    throw error;
  }
};

export default registerUser;
