import AuthButton from "@/components/AuthButton";
import NavBar from "@/components/NavBar";
import React from "react";
import { Text, View } from "react-native";

const Home = () => {
  // const [email, setEmail] = useState<string | null>(null);

  // useEffect(() => {
  //   async function fetchUser() {
  //     const {
  //       data: { user },
  //       error,
  //     } = await supabase.auth.getUser();
  //     if (error) {
  //       console.error("Error fetching user:", error.message);
  //       setEmail(null);
  //     } else {
  //       setEmail(user?.email ?? null);
  //     }
  //   }

  //   fetchUser();
  // }, []);

  return (
    <View style={{flex:1,flexDirection:"row"}}>
      
      <NavBar  />
      
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontWeight: "bold", fontSize: 50 }}>
        {/* {email ?? "Loading..."} */}
        Home
      </Text>
      <AuthButton
          buttonText="Login"
          buttonColorType="button"
          onPress={()=>{}}
        />
    </View>
    </View>
  );
};

export default Home;
