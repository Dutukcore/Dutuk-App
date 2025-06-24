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

        const user = data?.user;

        if (user) {
          const { data: existingUser, error: fetchError } = await supabase
            .from("userByRole")
            .select("id")
            .eq("id", user.id)
            .single();
          if (fetchError) {
            console.log("Error when fetching" + fetchError);
            return;
          }
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from("userByRole")
              .insert({
                id: user.id,
                email: user.email,
                role: "vendor",
                created_at: new Date().toISOString(),
              });
            if (insertError) {
              console.log("Error when inserting " + insertError);
              return;
            }
          }
          router.replace("/(tabs)/home");
        }
      }
    };

    handleDeepLink();
  }, []);

  return null;
}
