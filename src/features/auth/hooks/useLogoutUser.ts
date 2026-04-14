import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to logout'
    });
  } else {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Logged out successfully'
    });
    // Redirect to welcome screen (consistent with app entry point)
    router.replace("/");
  }
};

export default logoutUser;
