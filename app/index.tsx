import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { supabase } from "../utils/supabase";
import UserAuth from "./auth/UserAuth";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // This part checks if there is any session stored if yes router to home or auth page
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return null;

  return isSignedIn ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 50,
      }}
    >
      <UserAuth />
    </View>
  );
}
