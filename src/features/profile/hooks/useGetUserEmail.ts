import { supabase } from "@/lib/supabase";
const getUserEmail = async () => {
  const user = await supabase.auth.getUser();
  if (user) {
    return user.data.user?.email;
  }
  return "NOT FOUND";
};
export default getUserEmail;
