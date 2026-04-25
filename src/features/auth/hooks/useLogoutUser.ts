import { signOutAndClear } from "@/lib/clearUserData";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const logoutUser = async () => {
  const { error } = await signOutAndClear();
  if (error) {
    Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to logout' });
    return;
  }
  Toast.show({ type: 'success', text1: 'Success', text2: 'Logged out successfully' });
  router.replace("/");
};

export default logoutUser;
