import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallback() {
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
          logger.error("exchangeCodeForSession error");
          // Redirect to login on error
          router.replace("/auth/UserLogin");
        } else {
          logger.log("Session established, redirecting to home");
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

  // Show loading indicator while processing callback
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#800000" />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#57534e',
    fontWeight: '500',
  },
});
