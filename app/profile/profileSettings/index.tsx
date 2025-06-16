import RouteAssist from "@/components/RouteAssist";
import logoutUser from "@/hooks/useLogoutUser";
import { Pressable, StyleSheet, Text, View } from "react-native";
const Index = () => {
  return (
    <View style={profileSettingsMenuStyle.container}>
      <Text style={profileSettingsMenuStyle.title}>Profile Settings</Text>
      <View style={profileSettingsMenuStyle.optionsView}>
        <RouteAssist
          path={"/profile/companyBasicInfo/companyInfoPage"}
          text={"Company's Basic Information"}
        />
        <RouteAssist
          path={"/profile/profileSettings/documentVerification"}
          text={"Document Verification"}
        />
        <RouteAssist
          path={"/profile/profileSettings/changePasswordOtp"}
          text={"Change Password"}
        />
        <RouteAssist
          path={"/profile/profileSettings/changeUsername"}
          text={"Change Username"}
        />
        <RouteAssist
          path={"/profile/profileSettings/history_and_highlights"}
          text={"History & Highlights"}
        />
        <RouteAssist
          path={"/profile/profileSettings/helpcenter"}
          text={"Help Center"}
        />
        <RouteAssist path={"/profile/profileSettings/about"} text={"About"} />
        <Pressable style={profileSettingsMenuStyle.options} onPress={logoutUser}>
                    <Text style={profileSettingsMenuStyle.optionText}>Logout</Text>
                </Pressable>
      </View>
    </View>
  );
};
const profileSettingsMenuStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsView: {
    gap: 15,
  },
  options: {
    fontSize: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText:{
      fontSize:16
  }
});

export default Index;
