import usePasswordChange from "@/features/auth/hooks/usePasswordChange";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  BackHandler,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import resetPasswordStyles from "../../../src/css/resetPasswordStyle";

const ChangePassword = () => {
  const styles = resetPasswordStyles;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)/home");
        return true;
      };
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [])
  );
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Toast.show({ type: "error", text1: "Please fill in all fields" });
    }
    if (newPassword !== confirmPassword) {
      return Toast.show({ type: "error", text1: "New passwords do not match" });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (newPassword.length < 8 || !hasUpperCase || !hasNumber) {
      return Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be 8+ chars with an uppercase letter and a number.",
      });
    }

    if (newPassword === oldPassword) {
      return Toast.show({
        type: "error",
        text1: "New password cannot match old password",
      });
    }

    usePasswordChange(newPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <Text style={styles.label}>Old Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
};

export default ChangePassword;
