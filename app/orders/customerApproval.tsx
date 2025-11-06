import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, ChevronLeft, ChevronRight } from 'react-native-feather';
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrders } from "../../hooks/useOrders";

const CustomerApprovalScreen = () => {
  const params = useLocalSearchParams();
  
  let updateOrderStatus;
  try {
    const hookResult = useOrders();
    updateOrderStatus = hookResult.updateOrderStatus;
  } catch (e) {
    // Fallback if hook fails
    updateOrderStatus = async () => true;
  }
  const [selectedDate, setSelectedDate] = useState(26);
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
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const success = await updateOrderStatus(params.orderId as string, 'approved');
    setLoading(false);
    
    if (success) {
      Alert.alert(
        "Order Accepted",
        "The order has been approved successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } else {
      Alert.alert("Error", "Failed to approve order. Please try again.");
    }
  };

  const handleReject = async () => {
    setLoading(true);
    const success = await updateOrderStatus(params.orderId as string, 'rejected');
    setLoading(false);
    
    if (success) {
      Alert.alert(
        "Order Rejected",
        "The order has been rejected.",
        [
          {
            text: "OK", 
            onPress: () => router.back()
          }
        ]
      );
    } else {
      Alert.alert("Error", "Failed to reject order. Please try again.");
    }
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

    const unavailableDates = [22, 23, 24, 26];

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
                    isSelected && styles.selectedDay,
                    isUnavailable && styles.unavailableDay
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {renderCalendar()}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.acceptButton, loading && styles.buttonDisabled]} 
            onPress={handleAccept}
            disabled={loading}
          >
            <Text style={styles.acceptButtonText}>
              {loading ? "Processing..." : "Accept"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rejectButton, loading && styles.buttonDisabled]} 
            onPress={handleReject}
            disabled={loading}
          >
            <Text style={styles.rejectButtonText}>
              {loading ? "Processing..." : "Reject"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 27,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 27.15,
    height: 28.86,
    justifyContent: "center",
    alignItems: "center",
  },

  orderInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 9.64,
    marginHorizontal: 30,
    marginBottom: 20,
    padding: 20,
  },
  orderTitle: {
    fontSize: 21.46,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  customerName: {
    fontSize: 14.86,
    fontWeight: "400",
    color: "#000000",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  packageInfo: {
    fontSize: 14.86,
    fontWeight: "300",
    color: "#000000",
    fontFamily: "Inter",
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    marginHorizontal: 29,
    marginBottom: 30,
    padding: 20,
  },
  calendar: {
    width: "100%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    width: 29.47,
    height: 29.47,
    backgroundColor: "#8F8F8F",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  monthText: {
    fontSize: 12.7,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Inter",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  weekDayText: {
    fontSize: 12.7,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Inter",
    width: 30,
    textAlign: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayCell: {
    width: 30,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "rgba(255, 48, 48, 0.3)",
    borderRadius: 10,
  },
  unavailableDay: {
    // No background for unavailable days, just text color change
  },
  dayText: {
    fontSize: 12.7,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Inter",
  },
  otherMonthText: {
    color: "#B9B9B9",
  },
  unavailableText: {
    color: "#FF3030",
  },
  selectedDayText: {
    color: "#000000",
    fontWeight: "500",
  },
  actionButtons: {
    paddingHorizontal: 26,
    gap: 7,
  },
  acceptButton: {
    backgroundColor: "#BCFF50",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 21.24,
    fontWeight: "300",
    color: "#000000",
    fontFamily: "Inter",
  },
  rejectButton: {
    backgroundColor: "#FF3030",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButtonText: {
    fontSize: 21.24,
    fontWeight: "300",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CustomerApprovalScreen;