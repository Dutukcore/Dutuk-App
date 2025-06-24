import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import setRole from "./setVendorAsRoleOnRegister";

WebBrowser.maybeCompleteAuthSession();

const googleLogin = async () => {
  const redirectUrl = Linking.createURL("auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.log("Login error:", error);
    return;
  }

  const authUrl = data?.url;
  console.log("🔗 Auth URL:", authUrl);
  if (!authUrl) return;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

  if (result.type === "success" && result.url) {
    console.log("Received redirect URL:", result.url);

    const params = new URLSearchParams(result.url.split("#")[1]);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

      if (sessionError) {
        console.log(" setSession error:", sessionError);
      } else {
        await setRole();
        console.log("Session obtained via token:", sessionData);
        router.replace("/(tabs)/home");
      }
    } else {
      console.log("Tokens missing from redirect URL");
    }
  } else {
    console.log("Auth session failed or cancelled.");
  }
};

export default googleLogin;
