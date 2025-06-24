import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();

      if (url?.includes("code=")) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) console.error("exchangeCodeForSession error", error);

        // router.replace("/(tabs)/home");
      }
    };

    handleDeepLink();
  }, []);

  return null;
}
