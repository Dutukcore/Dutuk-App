import NavBar from "@/components/NavBar";
import RouteAssist from "@/components/RouteAssist";
import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

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
      <Button title="Calendar" onPress={()=>router.push("/profile/calender/CalendarPage")} />
      <RouteAssist text="Events" path="/event" />
    </View>
    </View>
  );
};

export default Home;
