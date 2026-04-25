import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import AuthAssist from "@/features/auth/components/AuthAssist";
import AuthButton from "@/features/auth/components/AuthButton";
import registerUser from "@/features/auth/hooks/useRegisterUser";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import authEmailPageStyle from "../../src/css/authEmailPageStyle";
import authInputStyle from "../../src/css/authInputStyle";
import authLableStyle from "../../src/css/authLableStyle";

const EmailAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const useUserRegistration = (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (password != confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "Please make sure both passwords are identical.",
      });
    } else {
      registerUser(email, password).catch(() => { });
    }
  };

  return (
    <SafeAreaView style={authEmailPageStyle.container}>
      <KeyboardSafeView scrollable={true}>
        <View>
          <Text style={authEmailPageStyle.headerText}>Let's get started</Text>
        </View>

        <View style={authEmailPageStyle.inputSection}>
          <Text style={authLableStyle.label}>E-mail</Text>
          <TextInput
            style={authInputStyle.inputField}
            placeholder="Type your email"
            onChangeText={setEmail}
          />
          <Text style={authLableStyle.label}>Password</Text>
          <TextInput
            style={authInputStyle.inputField}
            placeholder="Type your password"
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={authLableStyle.label}>Confirm Password</Text>
          <TextInput
            style={authInputStyle.inputField}
            placeholder="Type your password again"
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <AuthAssist
            AssistText="Already have an account? "
            LinkText="Login"
            route="/auth/UserLogin"
          />
          <AuthButton
            buttonText="Register"
            onPress={() => useUserRegistration(email, password, confirmPassword)}
          />
        </View>
      </KeyboardSafeView>
    </SafeAreaView>
  );
};

export default EmailAuth;
