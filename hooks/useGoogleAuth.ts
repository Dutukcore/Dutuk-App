import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const googleLogin = async () => {
  try {
    const redirectUrl = Linking.createURL("auth/callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Login error:", error.message);
      return;
    }

    const authUrl = data?.url;
    if (!authUrl) {
      console.error("No auth URL returned from Supabase");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type !== "success" || !result.url) {
      console.warn("Auth session cancelled or failed.");
      return;
    }

    const url = new URL(result.url);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("No auth code returned in redirect URL");
      return;
    }

    // ✅ Handle both SDK versions dynamically
    let sessionError;
    try {
     const response = await (supabase.auth.exchangeCodeForSession as any)(
  supabase.auth.exchangeCodeForSession.length === 1 ? code : { code }
);


      sessionError = response.error;
    } catch (err) {
      sessionError = err;
    }

    if (sessionError) {
      console.error("Session exchange error:", sessionError.message);
      return;
    }

    router.replace("/(tabs)/home");
  } catch (err) {
    console.error("Unexpected login error:", err);
  }
};

export default googleLogin;
