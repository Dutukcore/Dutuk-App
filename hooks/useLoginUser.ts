import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { Alert } from "react-native";
import setRole from "./setVendorAsRoleOnRegister";

const loginUser = async (userEmail: string, userPassword: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      Alert.alert("Login Failed", "Wrong email or password.");
    } else if (message.includes("user not found")) {
      Alert.alert("Login Failed", "User does not exist.");
    } else if (message.includes("email not confirmed")) {
      Alert.alert(
        "Login Failed",
        "Please verify your email before logging in."
      );
    } else {
      Alert.alert("Login Failed", error.message);
    }

    return;
  }

  await setRole();
  Alert.alert("Login success!");
  router.replace("/(tabs)/home");
};

export default loginUser;
