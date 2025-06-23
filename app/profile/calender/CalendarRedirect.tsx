import AuthButton from "@/components/AuthButton";
import EditableInputField from "@/components/EditableInputField";
import getStoreDatesInfo from "@/hooks/getStoredDatesInfo";
import storeDatesInfo from "@/hooks/storeDatesInfo";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

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
        const data ={date,eventName,eventDescription}
        await storeDatesInfo(data); 
        Alert.alert("Data Stored Successfully");
    }

    const getInfo=async()=>{
        const info = await getStoreDatesInfo({date});
        setEventDescription(info?.description);
        setEventName(info?.event);
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