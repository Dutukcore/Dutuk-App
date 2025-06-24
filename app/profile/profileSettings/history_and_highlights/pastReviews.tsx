import DisplayReviews from "@/components/DisplayReviews";
import getPastReviews from "@/hooks/getPastReviews";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const PastReviews = ()=>{
    const [data,setData] = useState<any|null>(null);

    const getReviews = async()=>{
        let temp=await getPastReviews();
        if(typeof temp ==='object')
            setData(temp);
    }
    useEffect(()=>{
        getReviews();
    },[]);

    if(data!==null){

    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayReviews reviews={data} />
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
export default PastReviews;