import DisplayEvents from "@/components/DisplayEvents";
import pastEventsData from "@/dummy_data/pastEventsData";
import { Text, View } from "react-native";

const PastEvents = ()=>{
    //getting the dummy data
    const data = pastEventsData;
    return(
        <View>
            <Text style={{ fontWeight: "bold", fontSize: 20 , textAlign:"center" }}>Past Events</Text>
            <DisplayEvents events={data}/>
        </View>
    )
}
export default PastEvents;