import logger from '@/lib/logger';
// BACKEND INTEGRATION COMMENTED OUT - USING ASYNCSTORAGE FOR LOCAL STORAGE
import AuthButton from "@/features/auth/components/AuthButton";
import EditableInputField from "@/components/ui/EditableInputField";
// import getStoreDatesInfo from "@/features/calendar/hooks/getStoredDatesInfo";
// import storeDatesInfo from "@/features/calendar/hooks/storeDatesInfo";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { getCalendarDate, setCalendarDate } from "@/features/calendar/utils/calendarStorage";
import Toast from 'react-native-toast-message';

type prop = {
    date:string
}

const CalendarRedirect=()=>{
    const[eventName,setEventName] = useState<string>("");
    const[eventDescription,setEventDescription] = useState<string>("");
    const[eventNameEditable,setEventNameEditable] = useState<boolean>(false);
    const[eventDescriptionEditable,setEventDescriptionEditable] = useState<boolean>(false);
    const prop = useLocalSearchParams<prop>();
    const {date} =prop; 

    const storeInfo=async()=>{
        try {
          // Backend version (commented out):
          // const data ={date,eventName,eventDescription}
          // await storeDatesInfo(data); 
          
          // AsyncStorage version:
          const existingDate = await getCalendarDate(date);
          const status = existingDate?.status || 'unavailable';
          await setCalendarDate(date, status, eventName, eventDescription);
          
          Toast.show({
            type: 'success',
            text1: 'Saved',
            text2: 'Date information updated successfully',
            position: 'bottom',
          });
        } catch (error) {
          logger.error('Error saving date info:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to save date information',
            position: 'bottom',
          });
        }
    }

    const getInfo=async()=>{
        try {
          // Backend version (commented out):
          // const info = await getStoreDatesInfo({date});
          // setEventDescription(info?.description);
          // setEventName(info?.event);
          
          // AsyncStorage version:
          const dateInfo = await getCalendarDate(date);
          if (dateInfo) {
            setEventDescription(dateInfo.description || "");
            setEventName(dateInfo.event || "");
          }
        } catch (error) {
          logger.error('Error loading date info:', error);
        }
    }

    useEffect(()=>{
        getInfo();
    },[])

    return(
        <View style={styles.container}>
            <Text>Date:{date}</Text>
            <EditableInputField
            placeholder="Event Name"
            value={eventName}
            editable={eventNameEditable}
            onTextChange={(text)=>setEventName(text)}
            onToggleEdit={() => setEventNameEditable(!eventNameEditable)}
            />
            <EditableInputField
            placeholder="Event Description"
            value={eventDescription}
            editable={eventDescriptionEditable}
            onTextChange={(text)=>setEventDescription(text)}
            onToggleEdit={() => setEventDescriptionEditable(!eventDescriptionEditable)}
            />
            <AuthButton
            buttonText="Save changes"
            height={75}
            width={150}
            onPress={storeInfo}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    }
})
export default CalendarRedirect;