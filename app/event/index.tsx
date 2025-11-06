import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const EventPage = ()=>{
    return(
        <View style={styles.container}>
            <Pressable style={[styles.options,styles.past]} onPress={()=>router.push("/event/pastEvents")}><Text style={styles.optionsText}>Past Events</Text></Pressable>
            <Pressable style={[styles.options,styles.current]} onPress={()=>router.push("/event/currentEvents")}><Text style={styles.optionsText}>Current Events</Text></Pressable>
            <Pressable style={[styles.options,styles.upcoming]} onPress={()=>router.push("/event/upcomingEvents")}><Text style={styles.optionsText}>Upcoming Events</Text></Pressable>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    options:{
        padding:20,
        margin:10,
       borderRadius: 10,
    },
    optionsText:{
        textAlign:"left",
        color:"black"
    },
   past: {
    backgroundColor: "#ffffffff"
    },
    current: {
    backgroundColor: "#ffffffff" 
    },
    upcoming: {
    backgroundColor: "#ffffffff" 
    }

})
export default EventPage;