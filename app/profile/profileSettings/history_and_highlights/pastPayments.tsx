import DisplayPayments from "@/components/DisplayPayments";
import getPastPayments from "@/hooks/getPastPayments";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const PastPayments = ()=>{
    const [data,setData] = useState<any|null>(null);

    const getPayments = async()=>{
        let temp=await getPastPayments();
        if(typeof temp ==='object')
            setData(temp);
    }
    useEffect(()=>{
        getPayments();
    },[]);

    if(data!==null){

    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayPayments payments={data} />
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
export default PastPayments;