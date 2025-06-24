import DisplayEarnings from "@/components/DisplayEarnings";
import getPastEarnings from "@/hooks/getPastEarnings";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const PastEarnings = ()=>{
    const [data,setData] = useState<any|null>(null);

    const getEarnings = async()=>{
        let temp=await getPastEarnings();
        if(typeof temp ==='object')
            setData(temp);
    }
    useEffect(()=>{
        getEarnings();
    },[]);

    if(data!==null){

    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayEarnings earnings={data} />
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
export default PastEarnings;