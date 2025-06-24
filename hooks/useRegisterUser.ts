import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "../utils/supabase";

const registerUser = async (userEmail: any, password: string) => {
  const { data, error }: any = await supabase.auth.signUp({
    email: userEmail,
    password,
  });

  if (error) {
    Alert.alert("There is error", error.cause);
  } else {
    // Alert.alert("Registered successfully");
    console.log("From useRegistrationUser hook" + userEmail);

    router.push(`/auth/OtpPage?email=${encodeURIComponent(userEmail)}`);
  }
};

export default registerUser;
