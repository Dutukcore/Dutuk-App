import { supabase } from "@/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

const OtpPage = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(59);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(
      () => setCountdown((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    // Handle paste of full OTP
    if (text.length > 1) {
      const digits = text.slice(0, 6).split("");
      setOtp(digits.concat(Array(6 - digits.length).fill("")));
      digits.length === 6 && inputs.current[5]?.blur();
      return;
    }

    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);

    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0)
      inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      return Toast.show({ type: "error", text1: "Please enter full OTP" });
    }

    setLoading(true);
    try {
      console.log("Verifying OTP for email:", email);
      
      // Use "signup" type for OTP verification during registration
      // This matches the OTP type that Supabase sends during signup
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: code,
        type: "signup",
      });

      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }

      console.log("OTP verified successfully, setting up vendor profile...");
      
      Toast.show({ type: "success", text1: "OTP Verified! Welcome to Dutuk." });
      
      // Set vendor role and create company entry
      const setRole = (await import("@/hooks/setVendorAsRoleOnRegister"))
        .default;
      const roleSet = await setRole();
      
      if (!roleSet) {
        console.warn("Warning: Failed to set vendor role after OTP verification");
      } else {
        console.log("Vendor role and company entry created successfully");
      }
      
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const errorMessage = err.message?.toLowerCase() || "";
      let displayMessage = "Please try again";
      
      if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
        displayMessage = "Code expired or invalid. Please request a new one.";
      } else if (errorMessage.includes("too many")) {
        displayMessage = "Too many attempts. Please wait a moment.";
      } else {
        displayMessage = err.message || "Please try again";
      }
      
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: displayMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    console.log("Resending OTP to:", email);
    
    try {
      // Use signInWithOtp for resending OTP
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email as string,
        options: {
          shouldCreateUser: false, // Don't create user, they already exist
        }
      });
      
      if (error) throw error;
      
      Toast.show({ type: "success", text1: "New code sent!" });
      setCountdown(59);
    } catch (err: any) {
      console.error("Error resending OTP:", err);
      Toast.show({ 
        type: "error", 
        text1: "Failed to resend code",
        text2: err.message || "Please try again later"
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Enter OTP</Text>
        <Text style={styles.subHeader}>Code sent to {email}</Text>

        <View style={styles.otpRow}>
          {otp.map((val, i) => (
            <TextInput
              key={i}
             ref={(ref) => {
  if (ref) inputs.current[i] = ref;
}}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              value={val}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              textAlign="center"
              autoFocus={i === 0}
            />
          ))}
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </Pressable>

        <Pressable onPress={handleResend} disabled={countdown > 0}>
          <Text style={[styles.resend, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : "Resend code"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 400,
    height: 933,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingTop: 260,
    paddingHorizontal: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 60,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  input: {
    width: 47,
    height: 47,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 7,
    fontSize: 20,
    fontWeight: "600",
  },
  button: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 20 },
  resend: { textAlign: "center", fontSize: 18, color: "#000" },
  resendDisabled: { color: "#888" },
});

export default OtpPage;
