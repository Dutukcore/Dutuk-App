// BACKEND INTEGRATION COMMENTED OUT - USING ASYNCSTORAGE FOR LOCAL STORAGE
// import customStyle from "@/assets/customStyle";
// import getStoredDates from "@/hooks/getStoredDates";
// import storeDates from "@/hooks/useStoreDates";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { 
  getCalendarDates, 
  setCalendarDate, 
  removeCalendarDate, 
  isPastDate,
  CalendarDate,
  CalendarDateStatus 
} from "@/utils/calendarStorage";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';


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
        fontWeight?: string;
      };
    };
  };
};  
    const [isAllowed,setAllowed] = useState(false);
    const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);

    // BACKEND CALL COMMENTED OUT - NOW USING ASYNCSTORAGE
    const getDates = async()=>{
        try {
          // Backend version (commented out):
          // let dates = await getStoredDates();
          // console.log(dates);
          // let correctDates: any[] | ((prevState: string[]) => string[]) =[];
          // dates?.forEach((obj)=>correctDates.push(obj.date));
          // setMarked(correctDates);
          
          // AsyncStorage version:
          const storedDates = await getCalendarDates();
          console.log('Loaded dates from AsyncStorage:', storedDates);
          setCalendarDates(storedDates);
          setAllowed(true);
        } catch (error) {
          console.error('Error loading dates:', error);
          setAllowed(true);
        }
    }

    // Convert calendar dates to marked dates format
    const markedDates: MarkedDateType = calendarDates.reduce((acc, calDate) => {
      if (calDate.status === 'unavailable') {
        // Unavailable: red text
        acc[calDate.date] = {
          customStyles: {
            text: {
              color: '#FF3B30',
              fontWeight: '700',
            },
          },
        };
      } else if (calDate.status === 'available') {
        // Available: black circle with white text
        acc[calDate.date] = {
          customStyles: {
            container: {
              backgroundColor: '#000000',
              borderRadius: 20,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: '700',
            },
          },
        };
      }
      return acc;
    }, {} as MarkedDateType);
    
    useEffect(()=>{
        getDates();
    },[])

    const handleDayPress = async (day: any) => {
      // Validate: Cannot mark past dates
      if (isPastDate(day.dateString)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Date',
          text2: 'Cannot mark dates in the past',
          position: 'bottom',
        });
        return;
      }

      const existingDate = calendarDates.find(d => d.date === day.dateString);

      if (existingDate) {
        // Date exists - show options
        Alert.alert(
          'Update Date',
          `Current status: ${existingDate.status}\n\nWhat would you like to do?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Toggle Status',
              onPress: async () => {
                const newStatus: CalendarDateStatus = 
                  existingDate.status === 'available' ? 'unavailable' : 'available';
                await setCalendarDate(day.dateString, newStatus, existingDate.event, existingDate.description);
                await getDates(); // Reload
                Toast.show({
                  type: 'success',
                  text1: 'Status Updated',
                  text2: `Date marked as ${newStatus}`,
                  position: 'bottom',
                });
              },
            },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeCalendarDate(day.dateString);
                await getDates(); // Reload
                Toast.show({
                  type: 'success',
                  text1: 'Date Removed',
                  text2: 'Date marking has been removed',
                  position: 'bottom',
                });
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        // New date - show status selection
        Alert.alert(
          'Mark Date',
          'Select availability status:',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Available',
              onPress: async () => {
                await setCalendarDate(day.dateString, 'available');
                await getDates(); // Reload
                Toast.show({
                  type: 'success',
                  text1: 'Date Marked',
                  text2: 'Date marked as available',
                  position: 'bottom',
                });
              },
            },
            {
              text: 'Unavailable',
              style: 'default',
              onPress: async () => {
                await setCalendarDate(day.dateString, 'unavailable');
                await getDates(); // Reload
                Toast.show({
                  type: 'success',
                  text1: 'Date Marked',
                  text2: 'Date marked as unavailable',
                  position: 'bottom',
                });
              },
            },
          ],
          { cancelable: true }
        );
      }
    };

    if(isAllowed){

    return(
        
        <View style={style.container}>
          {/* Back Button */}
          <Pressable 
            style={style.backButton}
            onPress={() => router.back()}
            data-testid="calendar-back-button"
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={style.backButtonText}>Back</Text>
          </Pressable>

          <View style={style.headerContainer}>
            <Text style={style.headerTitle}>Manage Availability</Text>
            <Text style={style.headerSubtitle}>
              Tap a date to mark your availability
            </Text>
          </View>

          <View style={style.legendContainer}>
            <View style={style.legendItem}>
              <View style={[style.legendBox, { backgroundColor: '#000000' }]} />
              <Text style={style.legendText}>Available</Text>
            </View>
            <View style={style.legendItem}>
              <View style={[style.legendBox, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FF3B30' }]} />
              <Text style={[style.legendText, { color: '#FF3B30' }]}>Unavailable</Text>
            </View>
          </View>
        
            <Calendar 

            markingType={"custom"}

            onDayPress={handleDayPress}

            style={style.calendar} 

            // BACKEND VERSION COMMENTED OUT:
            // onDayLongPress={async(date)=>{
            //     if(!marked.includes(date.dateString)){
            //         setMarked([...marked,date.dateString]);
            //         await storeDates(date.dateString);
            //     }
            //     router.push({pathname:"/profilePages/calender/CalendarRedirect",params:{date:date.dateString}})
            // }}
              
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#000000',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#000000',
              textDisabledColor: '#CCCCCC', // Past dates in grey
              dotColor: '#007AFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#007AFF',
              monthTextColor: '#000000',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12
            }}
            
            // Disable past dates visually
            minDate={new Date().toISOString().split('T')[0]}

            markedDates={{
                ...markedDates,
        }}
            /> 

          <View style={style.instructionContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666666" />
            <Text style={style.instructionText}>
              You cannot mark dates in the past
            </Text>
          </View>
       

        </View>

        
    )
}
    else{
        return(
             <View style={style.container}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={style.loadingText}>Loading Calendar...</Text>
             </View>
        )
    }
}
const style = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center",
        backgroundColor: '#F3F3F3',
        paddingVertical: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    legendText: {
        fontSize: 13,
        color: '#000000',
        fontWeight: '500',
    },
    calendar:{
        width: 350,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        padding: 10,
    },
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
        gap: 8,
    },
    instructionText: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666666',
    }
})
export default CalendarPage;