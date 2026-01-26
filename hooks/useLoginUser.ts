import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import setRole from "./setVendorAsRoleOnRegister";

/**
 * Login user with email and password
 * Verifies user profile exists and creates vendor role if needed
 * Handles various error states with user-friendly messages
 * 
 * @param userEmail - User's email address
 * @param userPassword - User's password
 * @returns Promise<void>
 */
const loginUser = async (userEmail: string, userPassword: string): Promise<void> => {
  try {
    // Validate inputs
    if (!userEmail || !userEmail.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter your email address.",
      });
      return;
    }

    if (!userPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter your password.",
      });
      return;
    }

    const trimmedEmail = userEmail.trim().toLowerCase();
    console.log("Attempting login for:", trimmedEmail);

    // Attempt to sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: userPassword,
    });

    if (error) {
      console.error("Login error:", error);
      const msg = error.message.toLowerCase();

      // Handle specific error cases with user-friendly messages
      if (msg.includes("invalid login credentials") || msg.includes("invalid password")) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Incorrect email or password. Please try again.",
        });
      } else if (msg.includes("user not found")) {
        Toast.show({
          type: "error",
          text1: "Account Not Found",
          text2: "No account exists with this email. Please sign up first.",
        });
      } else if (msg.includes("email not confirmed") || msg.includes("not verified")) {
        // MVP: Simplified message without OTP redirect
        Toast.show({
          type: "error",
          text1: "Email Not Verified",
          text2: "Please contact support if you cannot access your account.",
        });
        return;
      } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
        Toast.show({
          type: "error",
          text1: "Too Many Attempts",
          text2: "Please wait a few minutes before trying again.",
        });
      } else if (msg.includes("signup disabled")) {
        Toast.show({
          type: "error",
          text1: "Login Unavailable",
          text2: "Account registration is required. Please sign up.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: error.message,
        });
      }

      return;
    }

    if (!data?.user) {
      console.error("No user data returned after login");
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Unable to retrieve user data. Please try again.",
      });
      return;
    }

    console.log("Login successful for user:", data.user.id);

    // Verify user profile and company exist (edge case: user created outside this app)
    // Check if company entry exists
    const { data: companyData } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    // If no company exists, this might be a user created outside the app
    // or registration didn't complete properly - create entries now
    if (!companyData) {
      console.log("No company found for user, creating vendor profile...");
      const roleSet = await setRole();
      
      if (!roleSet) {
        console.warn("Warning: Could not create user profile after login");
        // Show info message but allow login
        Toast.show({
          type: "info",
          text1: "Profile Setup",
          text2: "Please complete your profile setup in settings.",
        });
      }
    }

    Toast.show({
      type: "success",
      text1: "Welcome Back!",
      text2: "Successfully logged in.",
    });

    // Navigate to home page
    router.replace("/(tabs)/home");
  } catch (err: any) {
    console.error("Unexpected login error:", err);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "An unexpected error occurred. Please try again.",
    });
  }
};

export default loginUser;
