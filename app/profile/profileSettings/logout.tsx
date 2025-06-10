import AuthButton from "@/components/AuthButton";
import logoutUser from "@/hooks/useLogoutUser";
import { View } from "react-native";


const Logout = ()=>{
    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AuthButton
        buttonText="Logout"
        buttonColorType="buttonSecondary"
        onPress={() => logoutUser()}
      />
    </View>
    )
}
export default Logout;