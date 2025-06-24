import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "../utils/supabase";
import setRole from "./setVendorAsRoleOnRegister";

const verifyOTP = async (email: any, otp: any, route: any) => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error) {
    const errorMsg = "There is an error verifying OTP: " + error.message;
    Alert.alert(errorMsg);
  } else {
    await setRole();
    Alert.alert("OTP verified successfully");
    router.replace(route);
  }
};

export default verifyOTP;
