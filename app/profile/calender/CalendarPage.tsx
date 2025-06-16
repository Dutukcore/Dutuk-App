import markedDatesDummy from "@/dummy_data/markedDates";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";


const CalendarPage = ()=>{
    const [marked,setMarked] = useState<string>('2025-07-01');
    
    return(
        
        <View style={style.container}>
        
            <Calendar 

            markingType={"period"}

            style={style.calendar} 

            onDayLongPress={day=>{
                let found = false;
                markedDatesDummy.events.forEach((event)=>{if(event.dates.includes(day.dateString)){
                    Alert.alert("Event",event.message);
                    found=true;
                    return;
                }
            })
            if(!found){
                Alert.alert("No event Found at the date");
            }
        }}        

            markedDates={{[marked]:{selected: true, marked: true,color:"white",textColor:"black",selectedColor: 'blue',},
                    ...markedDatesDummy.period
        }}
            /> 
       

        </View>
    )
}
const style = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    calendar:{
        width:300,
        borderCurve:"circular",
        borderRadius:10
    }
})
export default CalendarPage;