import authOtpStyle from "@/css/authOtpStyle";
import sendOTP from "@/hooks/useSendOTP";
import verifyOTP from "@/hooks/useVerifyOTP";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import AuthButton from "./AuthButton";

type AuthOTPProps = {
  email: any;
  cell_count: number;
  route: any;
  title?: string;
  subtitle?: string;
  initOTP?: boolean;
};

const AuthOTP: React.FC<AuthOTPProps> = ({
  email,
  cell_count,
  route,
  title,
  subtitle,
  initOTP,
}) => {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const ref = useBlurOnFulfill({ value: otp, cellCount: cell_count });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  useEffect(() => {
    if (initOTP) {
      sendOTP(email);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0) return;
    sendOTP(email);
    setCooldown(60);
  };

  return (
    <View style={authOtpStyle.container}>
      <Text style={authOtpStyle.title}>{title}</Text>
      <Text style={authOtpStyle.subtitle}>{subtitle}</Text>

      <CodeField
        ref={ref}
        {...props}
        value={otp}
        onChangeText={setOtp}
        cellCount={cell_count}
        rootStyle={authOtpStyle.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[authOtpStyle.cell, isFocused && authOtpStyle.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <Text style={authOtpStyle.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity onPress={handleResend} disabled={cooldown > 0}>
        <Text
          style={[authOtpStyle.resendText, cooldown > 0 && { opacity: 0.5 }]}
        >
          {cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
        </Text>
      </TouchableOpacity>

      <View style={authOtpStyle.buttonWrapper}>
        <AuthButton
          buttonText="Verify"
          buttonColorType="buttonSecondary"
          onPress={() => verifyOTP(email, otp, route)}
          width={140}
          height={60}
        />
      </View>
    </View>
  );
};

export default AuthOTP;
