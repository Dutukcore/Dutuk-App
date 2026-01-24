import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Copy, Calendar as CalendarIcon } from 'react-native-feather';
import { SafeAreaView } from "react-native-safe-area-context";
import UnifiedCalendar from "../../components/UnifiedCalendar";

const CustomerDetailsScreen = () => {
  const params = useLocalSearchParams<{
    orderId: string;
    title: string;
    customerName: string;
    packageType: string;
    customerEmail: string;
    customerPhone: string;
    eventDate?: string;
  }>();
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Parse the event date from params (format: "January 20, 2026" or fallback)
  const parsedEventDate = React.useMemo(() => {
    if (!params.eventDate) {
      // Fallback to October 24, 2025 if no date provided
      return { day: 24, month: 9, year: 2025 };
    }

    // Try to parse "January 20, 2026" format
    const parts = params.eventDate.split(' ');
    if (parts.length >= 3) {
      const monthName = parts[0];
      const day = parseInt(parts[1].replace(',', ''));
      const year = parseInt(parts[2]);
      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
        return { day, month: monthIndex, year };
      }
    }

    // Fallback to October 24, 2025
    return { day: 24, month: 9, year: 2025 };
  }, [params.eventDate]);
  
  const [selectedDate, setSelectedDate] = useState(parsedEventDate.day);
  
  // Create initial date for calendar
  const initialDate = new Date(parsedEventDate.year, parsedEventDate.month, parsedEventDate.day);
  
  // Create the booked event date string
  const bookedEventDateString = `${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-${String(parsedEventDate.day).padStart(2, '0')}`;
  
  // Marked dates for unavailable days and booked event (example data)
  const markedDates = {
    [`${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-22`]: { unavailable: true },
    [`${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-23`]: { unavailable: true },
    [`${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-26`]: { unavailable: true },
    // Add the booked event date with maroon indicator
    [bookedEventDateString]: { hasEvent: true, eventColor: '#800000' },
  };

  const handleDayPress = (day: number, dateString: string) => {
    setSelectedDate(day);
  };

  const customerEmail = params.customerEmail as string || "customer@example.com";
  const customerPhone = params.customerPhone as string || "1234567890";

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `${type} copied to clipboard!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft width={18} height={18} stroke="#000000" />
        </TouchableOpacity>
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle}>{params.title || "Event"}</Text>
        <Text style={styles.customerName}>{params.customerName || "Customer"}</Text>
        <Text style={styles.packageInfo}>Package: {params.packageType || "Basic"}</Text>
        
        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => copyToClipboard(customerEmail, "Email")}
          >
            <Text style={styles.contactText}>{customerEmail}</Text>
            <Copy width={20} height={20} stroke="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => copyToClipboard(customerPhone, "Phone")}
          >
            <Text style={styles.contactText}>{customerPhone}</Text>
            <Copy width={20} height={20} stroke="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Event Date Display */}
      <View style={styles.eventDateContainer}>
        <CalendarIcon width={20} height={20} stroke="#7C2A2A" />
        <Text style={styles.eventDateLabel}>Event Date:</Text>
        <Text style={styles.eventDateText}>{params.eventDate || 'Not specified'}</Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <UnifiedCalendar
          initialDate={initialDate}
          selectedDate={selectedDate}
          onDayPress={handleDayPress}
          markedDates={markedDates}
        />
      </View>

     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 252, 250, 0.95)',
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  orderInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    marginHorizontal: 30,
    marginBottom: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#800000",
    marginBottom: 12,
    fontFamily: "Inter",
    letterSpacing: -0.3,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1917",
    marginBottom: 10,
    fontFamily: "Inter",
  },
  packageInfo: {
    fontSize: 15,
    fontWeight: "500",
    color: "#57534e",
    marginBottom: 24,
    fontFamily: "Inter",
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#800000",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    height: 48,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },

  // Event date display styles
  eventDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(128, 0, 0, 0.08)",
    borderRadius: 20,
    marginHorizontal: 30,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.12)',
  },
  eventDateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#800000",
    marginLeft: 10,
    fontFamily: "Inter",
  },
  eventDateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#800000",
    marginLeft: 6,
    fontFamily: "Inter",
  },

  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    marginHorizontal: 30,
    marginBottom: 100,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});

export default CustomerDetailsScreen;