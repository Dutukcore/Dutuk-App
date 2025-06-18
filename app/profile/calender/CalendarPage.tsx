import customStyle from "@/assets/customStyle";
import markedDatesDummy from "@/dummy_data/markedDates";
import getStoredDates from "@/hooks/getStoredDates";
import storeDates from "@/hooks/useStoreDates";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";


const CalendarPage = ()=>{

    type MarkedDateType = {
  [date: string]: {
    dots?: { key: string; color: string }[];
    periods?: { startingDay?: boolean; endingDay?: boolean; color: string }[];
    customStyles?: {
      container?: {
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;
      };
      text?: {
        color?: string;
      };
    };
  };
};  
    const getDates = async()=>{
        let dates = await getStoredDates();
        console.log(dates);
        let correctDates: any[] | ((prevState: string[]) => string[]) =[];
        dates?.forEach((obj)=>correctDates.push(obj.date));
            setMarked(correctDates);
    }

    useEffect(()=>{
        getDates();
    },[])

    const [marked,setMarked] = useState<string[]>(['2025-07-01']);
    const markedDates:MarkedDateType = marked.reduce((acc,date)=>{
        acc[date]={...customStyle};
        return acc;
    },{} as MarkedDateType)
    
    return(
        
        <View style={style.container}>
        
            <Calendar 

            markingType={"custom"}

            onDayPress={async (day)=>{
                if(marked.includes(day.dateString)) setMarked(marked.filter((i)=> i!==day.dateString))
                else setMarked([...marked,day.dateString]);
               await storeDates(day.dateString);
            }}

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

            markedDates={{
                ...markedDates,
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