import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import setRole from "./setVendorAsRoleOnRegister";

const loginUser = async (userEmail: string, userPassword: string) => {
  try {
    console.log("Attempting login for:", userEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail.trim(),
      password: userPassword,
    });

    if (error) {
      console.log("Login error:", error);
      const msg = error.message.toLowerCase();

      if (msg.includes("invalid login credentials")) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Wrong email or password.",
        });
      } else if (msg.includes("user not found")) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "User does not exist.",
        });
      } else if (msg.includes("email not confirmed")) {
        Toast.show({
          type: "error",
          text1: "Email Not Verified",
          text2: "Please verify your email first.",
        });
        router.push(`/auth/OtpPage?email=${encodeURIComponent(userEmail)}`);
        return;
      } else if (msg.includes("signup disabled")) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Account registration is required.",
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
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "User data missing. Try again.",
      });
      return;
    }

    console.log("Login successful for:", data.user.email);

    await setRole();

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Login successful!",
    });

    router.replace("/(tabs)");
  } catch (err: any) {
    console.error("Unexpected login error:", err);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Something went wrong. Please try again.",
    });
  }
};

export default loginUser;
