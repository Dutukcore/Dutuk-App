import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy } from 'react-native-feather';
import { SafeAreaView } from "react-native-safe-area-context";

const CustomerDetailsScreen = () => {
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(24);
  const [currentMonth, setCurrentMonth] = useState("October 2025");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October = 9 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonthIndex = currentMonthIndex;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
      if (currentMonthIndex === 0) newYear = currentYear - 1;
    } else {
      newMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
      if (currentMonthIndex === 11) newYear = currentYear + 1;
    }

    setCurrentMonthIndex(newMonthIndex);
    setCurrentYear(newYear);
    setCurrentMonth(`${months[newMonthIndex]} ${newYear}`);
  };

  const customerEmail = params.customerEmail as string || "customer@example.com";
  const customerPhone = params.customerPhone as string || "1234567890";

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `${type} copied to clipboard!`);
  };

  const renderCalendar = () => {
    // Get the first day of the month and number of days
    const firstDay = new Date(currentYear, currentMonthIndex, 1);
    const lastDay = new Date(currentYear, currentMonthIndex + 1, 0);
    const daysInCurrentMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    // Generate calendar grid
    const calendarDays = [];
    const totalCells = 42; // 6 rows × 7 days

    // Previous month's trailing days
    const prevMonth = new Date(currentYear, currentMonthIndex - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false
      });
    }

    // Next month's leading days
    const remainingCells = totalCells - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    // Create weeks array
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    const unavailableDates = [22, 23, 26];

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('prev')}>
            <ChevronLeft width={18} height={18} stroke="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('next')}>
            <ChevronRight width={18} height={18} stroke="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((dayObj, dayIndex) => {
              const { day, isCurrentMonth } = dayObj;
              const isUnavailable = unavailableDates.includes(day) && isCurrentMonth;
              const isSelected = day === selectedDate && isCurrentMonth;
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay
                  ]}
                  onPress={() => isCurrentMonth && !isUnavailable && setSelectedDate(day)}
                >
                  <Text style={[
                    styles.dayText,
                    !isCurrentMonth && styles.otherMonthText,
                    isUnavailable && styles.unavailableText,
                    isSelected && styles.selectedDayText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
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

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {renderCalendar()}
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
  calendar: {
    width: "100%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  navButton: {
    width: 36,
    height: 36,
    backgroundColor: "#800000",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },

  monthText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1c1917",
    fontFamily: "Inter",
    letterSpacing: -0.2,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#57534e",
    fontFamily: "Inter",
    width: 30,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayCell: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#800000",
    borderRadius: 15,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1c1917",
    fontFamily: "Inter",
  },
  otherMonthText: {
    color: "#d6d3d1",
  },
  unavailableText: {
    color: "#FF3B30",
    fontWeight: "700",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default CustomerDetailsScreen;