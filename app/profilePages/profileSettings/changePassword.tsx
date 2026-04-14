import resetPasswordStyles from "../../../src/css/resetPasswordStyle";
import usePasswordChange from "@/features/auth/hooks/usePasswordChange";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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
      return Alert.alert("Please fill in all fields");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("New passwords do not match");
    }
    if (newPassword === oldPassword) {
      return Alert.alert("New password cannot be the same as the old password");
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
