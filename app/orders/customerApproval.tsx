import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Calendar as CalendarIcon } from 'react-native-feather';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useOrders } from "../../hooks/useOrders";
import UnifiedCalendar from "../../components/UnifiedCalendar";
import { buildOrderBookingMarkedDates } from "../../utils/calendarAvailability";

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
  const [loading, setLoading] = useState(false);

  // Create initial date for calendar
  const initialDate = new Date(parsedEventDate.year, parsedEventDate.month, parsedEventDate.day);
  
  // Create the booked event date string
  const bookedEventDateString = `${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-${String(parsedEventDate.day).padStart(2, '0')}`;
  
  // Orders page: ONLY show the user-selected booking date with maroon indicator
  // NO availability or unavailability information (that's for Calendar page only)
  const markedDates = buildOrderBookingMarkedDates(bookedEventDateString);

  const handleDayPress = (day: number, dateString: string) => {
    setSelectedDate(day);
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

        {/* Calendar - Read-only, showing ONLY the user-selected booking date */}
        <View style={styles.calendarContainer}>
          <UnifiedCalendar
            initialDate={initialDate}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            disabled={true}
          />
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
    backgroundColor: "#faf8f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    fontFamily: "Inter",
  },

  // Notes styles
  notesContainer: {
    backgroundColor: "rgba(255, 248, 231, 0.95)",
    borderRadius: 20,
    marginHorizontal: 30,
    marginBottom: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 10,
    fontFamily: "Inter",
    letterSpacing: 0.3,
  },
  notesText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#78350F",
    lineHeight: 22,
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
    marginBottom: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  actionButtons: {
    paddingHorizontal: 30,
    gap: 14,
  },
  acceptButton: {
    backgroundColor: "#34C759",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  rejectButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CustomerApprovalScreen;