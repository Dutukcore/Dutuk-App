import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export default function AuthCallback(): null {
  const router = useRouter();
  const handledRef = useRef(false); // prevent double-handling

  useEffect(() => {
    const handleDeepLink = async (url?: string) => {
      if (!url || handledRef.current) return;

      // Supabase OAuth sometimes returns either ?code= or #access_token=
      const hasCode = url.includes("code=");
      const hasAccessToken = url.includes("access_token=");

      if (hasCode || hasAccessToken) {
        handledRef.current = true; // ✅ prevent multiple triggers

        const { data, error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) {
          console.error("exchangeCodeForSession error:", error.message);
        } else {
          console.log("Session:", data.session);
          router.replace("/(tabs)/home");
        }
      }
    };

    // Handle initial link when app launches
    const processInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      await handleDeepLink(initialUrl ?? undefined);
    };
    processInitialUrl();

    // Handle future deep links while app is open
    const subscription = Linking.addEventListener("url", ({ url }: { url: string }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}
