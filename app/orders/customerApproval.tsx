import UnifiedCalendar from "@/features/calendar/components/UnifiedCalendar";
import { buildOrderBookingMarkedDates } from "@/features/calendar/utils/calendarAvailability";
import { useOrders } from "@/features/orders/hooks/useOrders";
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CustomerApprovalScreen = () => {
  const params = useLocalSearchParams<{
    orderId: string;
    title?: string;
    customerName?: string;
    packageType?: string;
    customerEmail?: string;
    customerPhone?: string;
    amount?: string | number;
    notes?: string;
    eventDate?: string;
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

  const [orderData, setOrderData] = useState<{
    title?: string;
    notes?: string;
    amount?: number;
    customerName?: string;
    status?: string;
  }>({});

  // Load order data
  useEffect(() => {
    if (!params.orderId) return;
    const load = async () => {
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, status, title, notes, amount, customer_name')
        .eq('id', params.orderId)
        .single();

      if (order) {
        setOrderData({
          title: order.title,
          notes: order.notes,
          amount: order.amount,
          customerName: order.customer_name,
          status: order.status
        });
      }
    };
    load();
  }, [params.orderId]);

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
      logger.error('Error accepting order:', error);
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
              logger.error('Error rejecting order:', error);
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
            <Feather name="arrow-left" size={18} color="#000000" />
          </TouchableOpacity>
          {/* Order status badge */}
          <View style={[
            styles.statusBadge,
            (orderData.status === 'completed' || orderData.status === 'approved' || !orderData.status) ? styles.statusBadgePositive : styles.statusBadgePending
          ]}>
            <Text style={[
              styles.statusBadgeText,
              (orderData.status === 'completed' || orderData.status === 'approved' || !orderData.status) ? styles.statusBadgeTextPositive : styles.statusBadgeTextPending
            ]}>{(orderData.status || "pending").toUpperCase()}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>{orderData.title || params.title || "Event"}</Text>

          {/* About Event */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionLabel}>About the event</Text>
          <Text style={styles.notesText}>{orderData.notes || params.notes || "No additional notes provided."}</Text>

          {/* Amount */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionLabel}>Amount</Text>
          <Text style={styles.amountText}>
            {orderData.amount || params.amount ? `₹${orderData.amount || params.amount}` : "Not Specified"}
          </Text>
        </View>

        {/* Event Date Display */}
        <View style={styles.eventDateContainer}>
          <Feather name="calendar" size={20} color="#7C2A2A" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  statusBadgePositive: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#dcfce7" },
  statusBadgePending: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fef3c7" },
  statusBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  statusBadgeTextPositive: { color: "#166534" },
  statusBadgeTextPending: { color: "#92400e" },

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
    fontSize: 28,
    fontWeight: "800",
    color: "#800000",
    marginBottom: 20,
    letterSpacing: -0.8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#a8a29e",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 16,
    color: "#44403c",
    lineHeight: 24,
    fontWeight: "400",
  },
  amountText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1c1917",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(128,0,0,0.04)",
    marginVertical: 20,
  },

  // Notes styles

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