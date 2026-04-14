import customStyle from "@/css/customStyle";
import acceptCustomerRequest from "@/features/orders/services/acceptCustomerOffer";
import getReqMini from "@/features/orders/services/getRequestFromId";
import removeRequest from "@/features/orders/services/removeRequestFromId";
import storeMultipleDates from "@/features/orders/services/storeMultipleDates";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const SeperateRequest = () => {
  type MarkedDateType = {
    [date: string]: {
      dots?: { key: string; color: string }[];
      periods?: {
        startingDay?: boolean;
        endingDay?: boolean;
        color: string;
      }[];
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

  const [req, setReq] = useState<{
    customer_id:string,
    company_name:string,
    event: string;
    payment: string;
    date: string[];
    description: string;
  }>();
  const [loading, setLoading] = useState(true);
  const { data } = useLocalSearchParams();

  const [marked, setMarked] = useState<string[]>([]);
  const markedDates: MarkedDateType = marked.reduce((acc, date) => {
    acc[date] = { ...customStyle };
    return acc;
  }, {} as MarkedDateType);

  const getRequest = async () => {
    if (typeof data === "string") {
      const d = await getReqMini(data);
      setReq(d);
      setMarked(d.date);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(()=>{
      getRequest();
    },[])
  )

  const handleDeclineReq = async()=>{
    const result = await removeRequest(Number(data));
    if(result){
        Alert.alert("Succesully declined Offer");
        router.replace("/requests/menu");
    }
    else{
        Alert.alert("Error declining the request");
    }
  }
  const handleAcceptReq =async()=>{
    if(typeof req?.event==='string'){
    const result = await storeMultipleDates(marked,req?.event,req?.description);
    
    
    if(result){
      Alert.alert("Request Successfully accepted");
      await removeRequest(Number(data));
      router.back();
    }
    else{
      Alert.alert("Error Accepting Request,Please try again later");
    }
     let d = {customerId:req?.customer_id,companyName:req?.company_name,date:req?.date,eventName:req?.event,eventDescription:req?.description,payment:Number(req?.payment)};
    const result2 = await acceptCustomerRequest(d);
  }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request Details</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : req ? (
        <View style={styles.card}>
          <Text style={styles.label}>Event Name</Text>
          <Text style={styles.value}>{req.event}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{req.description}</Text>

          <Text style={styles.label}>Scheduled Dates</Text>
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            style={styles.calendar}
          />

          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>₹ {req.payment}</Text>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.acceptButton} onPress={handleAcceptReq}>
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable style={styles.declineButton} onPress={handleDeclineReq}>
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>No request found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 28,
    backgroundColor: "#faf8f5",
    minHeight: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#800000",
    marginBottom: 24,
    textAlign: "left",
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 16,
    color: "#1c1917",
    letterSpacing: -0.1,
  },
  value: {
    fontSize: 15,
    marginTop: 8,
    color: "#57534e",
    lineHeight: 24,
    fontWeight: '400',
  },
  calendar: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#34C759",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 16,
    color: "#57534e",
    fontWeight: '500',
  },
});

export default SeperateRequest;
