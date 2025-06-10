import { router } from "expo-router"
import { Pressable, StyleSheet, Text } from "react-native"
import { ValidRoute } from "./AuthButton"

type routeAssistProp = {
    path:ValidRoute,
    text:string,
}

const RouteAssist = ({path,text}:routeAssistProp)=>{

    return(
        <Pressable style={routeAssistStyle.options} onPress={()=>router.push(path)}>
            <Text style={routeAssistStyle.optionText}>{text}</Text>
        </Pressable>
    )
}

const routeAssistStyle = StyleSheet.create({
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
})
export default RouteAssist;