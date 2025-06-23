import customStyle from "@/assets/customStyle";
import getStoredDates from "@/hooks/getStoredDates";
import storeDates from "@/hooks/useStoreDates";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
    const [isAllowed,setAllowed] = useState(false);

    const getDates = async()=>{
        let dates = await getStoredDates();
        console.log(dates);
        let correctDates: any[] | ((prevState: string[]) => string[]) =[];
        dates?.forEach((obj)=>correctDates.push(obj.date));
            setMarked(correctDates);
            setAllowed(true);
    }


    const [marked,setMarked] = useState<string[]>(['2025-07-01']);
    const markedDates:MarkedDateType = marked.reduce((acc,date)=>{
        acc[date]={...customStyle};
        return acc;
    },{} as MarkedDateType)
    
    useEffect(()=>{
        getDates();
    },[])

    if(isAllowed){

    return(
        
        <View style={style.container}>
        
            <Calendar 

            markingType={"custom"}

            onDayPress={async (day)=>{
                if(marked.includes(day.dateString)) {
                    
                      Alert.alert(
                        'Confirmation',
                        'Are you sure to remove the date',
                [
                    {
                    text: 'Cancel',
                    style: 'cancel',
                    },
                    {
                    text:'Confirm',
                    onPress:()=> setMarked(marked.filter((i)=> i!==day.dateString)),
                    style:'default'
                    }
                ],
                {
                cancelable: true,
    },
  );

                    
                   
                    
                }
                else setMarked([...marked,day.dateString]);
               await storeDates(day.dateString);
            }}

            style={style.calendar} 

            onDayLongPress={async(date)=>{
                if(!marked.includes(date.dateString)){
                    setMarked([...marked,date.dateString]);
                    await storeDates(date.dateString);
                }
                router.push({pathname:"/profile/calender/CalendarRedirect",params:{date:date.dateString}})
            }}
              

            markedDates={{
                ...markedDates,
        }}
            /> 
       

        </View>
    )
}
    else{
        return(
             <View style={style.container}>
                <Text>Loading</Text>
             </View>
        )
    }
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