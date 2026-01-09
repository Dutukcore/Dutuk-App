import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'react-native-feather';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useOrders } from "../../hooks/useOrders";

const CustomerApprovalScreen = () => {
  const params = useLocalSearchParams<{
    orderId: string;
    title: string;
    customerName: string;
    packageType: string;
    customerEmail: string;
    customerPhone: string;
    eventDate: string;
    notes: string;
  }>();
  const { updateOrderStatus, getOrders } = useOrders();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Parse the event date from params (format: "January 20, 2026")
  const parsedEventDate = useMemo(() => {
    if (!params.eventDate) {
      const now = new Date();
      return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
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

    // Fallback to current date
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  }, [params.eventDate]);

  const [selectedDate, setSelectedDate] = useState(parsedEventDate.day);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(parsedEventDate.month);
  const [currentYear, setCurrentYear] = useState(parsedEventDate.year);
  const [currentMonth, setCurrentMonth] = useState(`${months[parsedEventDate.month]} ${parsedEventDate.year}`);
  const [loading, setLoading] = useState(false);

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


  const handleAccept = async () => {
    if (!params.orderId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Order ID is missing.'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await updateOrderStatus(params.orderId as string, 'approved');

      if (success) {
        // Refresh orders list
        await getOrders();

        Toast.show({
          type: 'success',
          text1: 'Booking Accepted!',
          text2: 'Redirecting to chat...'
        });

        // Navigate to chat with this customer after a short delay
        setTimeout(() => {
          router.replace({
            pathname: '/(tabs)/chat',
          });
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Approve',
          text2: 'Unable to approve order. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!params.orderId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Order ID is missing.'
      });
      return;
    }

    // Show confirmation dialog before rejecting
    Alert.alert(
      "Reject Order",
      "Are you sure you want to reject this order? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await updateOrderStatus(params.orderId as string, 'rejected');

              if (success) {
                // Refresh orders list
                await getOrders();

                Toast.show({
                  type: 'success',
                  text1: 'Order Rejected',
                  text2: 'The order has been rejected.'
                });

                // Navigate back after a short delay
                setTimeout(() => {
                  router.back();
                }, 1500);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Failed to Reject',
                  text2: 'Unable to reject order. Please try again.'
                });
              }
            } catch (error) {
              console.error('Error rejecting order:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An unexpected error occurred. Please try again.'
              });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

        {/* Customer Notes - NEW */}
        {params.notes && params.notes.trim() !== '' && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>📝 Customer Notes</Text>
            <Text style={styles.notesText}>{params.notes}</Text>
          </View>
        )}

        {/* Event Date Display */}
        <View style={styles.eventDateContainer}>
          <CalendarIcon width={20} height={20} stroke="#7C2A2A" />
          <Text style={styles.eventDateLabel}>Event Date:</Text>
          <Text style={styles.eventDateText}>{params.eventDate || 'Not specified'}</Text>
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
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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

  // Notes styles
  notesContainer: {
    backgroundColor: "#FFF8E7",
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  notesText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#78350F",
    lineHeight: 20,
    fontFamily: "Inter",
  },

  // Event date display styles
  eventDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 42, 42, 0.08)",
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  eventDateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7C2A2A",
    marginLeft: 8,
    fontFamily: "Inter",
  },
  eventDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C2A2A",
    marginLeft: 4,
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