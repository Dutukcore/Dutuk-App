import DisplayEvents from "@/components/DisplayEvents";
import getPastEvents from "@/hooks/getPastEvents";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const PastEvents = ()=>{
    const [data,setData] = useState<any|null>(null);

    const getEarnings = async()=>{
        let temp=await getPastEvents();
        if(typeof temp ==='object')
            setData(temp);
    }
    useEffect(()=>{
        getEarnings();
    },[]);

    if(data!==null){

    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayEvents events={data} />
        </View>
    )
    }
    else{
        return(
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Loading</Text>
        </View>
        )
    }
}
export default PastEvents;