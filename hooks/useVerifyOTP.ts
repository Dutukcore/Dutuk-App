import { router } from "expo-router";
import { Alert } from "react-native";
import Toast from 'react-native-toast-message';
import { supabase } from "../utils/supabase";
import setRole from "./setVendorAsRoleOnRegister";

/**
 * Verify OTP (One-Time Password) for email verification
 * Sets vendor role and creates company entry after successful verification for new users
 * 
 * @param email - User's email address
 * @param otp - The OTP code received via email
 * @param route - The route to navigate to after successful verification
 * @returns Promise<void>
 * @throws Error if verification fails
 */
const verifyOTP = async (
  email: string,
  otp: string,
  route: string
): Promise<void> => {
  try {
    if (!email || !otp) {
      Alert.alert("Validation Error", "Email and OTP are required");
      throw new Error("Email and OTP are required");
    }

    console.log("Attempting to verify OTP for:", email);

    // Use "signup" type for OTP verification from registration flow
    // Use "email" type for magic link/email OTP flows
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: "signup", // Changed from "magiclink" to "signup" for registration flow
    });

    if (error) {
      console.error("OTP verification error:", error);
      
      const message = error.message.toLowerCase();
      let errorMsg = "Verification failed. Please try again.";
      
      if (message.includes("expired") || message.includes("invalid")) {
        errorMsg = "This code has expired or is invalid. Please request a new one.";
      } else if (message.includes("too many")) {
        errorMsg = "Too many attempts. Please wait a few minutes.";
      } else {
        errorMsg = error.message;
      }
      
      Alert.alert("Verification Failed", errorMsg);
      throw error;
    }

    if (!data?.user) {
      Alert.alert("Verification Failed", "Unable to verify user. Please try again.");
      throw new Error("User data not returned after OTP verification");
    }

    console.log("OTP verified successfully for user:", data.user.id);

    // Set vendor role and create company entry for the newly verified user
    // This is crucial for new registrations from this app
    const roleSet = await setRole();
    
    if (!roleSet) {
      console.warn("Warning: Failed to set vendor role after OTP verification");
      // Show warning but don't block the login
      Toast.show({
        type: 'info',
        text1: 'Account Created',
        text2: 'Your account was created. Please contact support if you experience any issues.'
      });
    } else {
      console.log("Vendor role and company entry successfully created for user");
    }

    Alert.alert("Success", "Email verified successfully! Welcome to Dutuk.");
    
    // Navigate to the specified route (usually home or tabs)
    router.replace(route);
  } catch (error) {
    console.error("Unexpected error during OTP verification:", error);
    throw error;
  }
};

export default verifyOTP;
