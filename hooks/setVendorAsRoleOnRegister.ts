import { supabase } from "@/utils/supabase";
import getUser from "./getUser";

const setRole = async () => {
  const user = await getUser();

  if (user != null) {
    const { data: existingUser, error: fetchError } = await supabase
      .from("userbyrole")
      .select("id")
      .eq("id", user.id)
      .single();
    //   So this is for my future self, that code "PGRST116" is a code which means
    // Result contains 0 rows, so it's important since the purpose is to check if there are any users with that if not create.
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Unexpected fetch error:", fetchError);
      return false;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("userbyrole").insert({
        id: user.id,
        email: user.email,
        role: "vendor",
        created_at: new Date().toISOString(),
      });
      if (insertError) {
        console.log("Error when inserting " + insertError);
        return false;
      }

      return true;
    }
  }
};

export default setRole;
