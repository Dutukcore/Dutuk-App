import UnifiedCalendar from "@/features/calendar/components/UnifiedCalendar";
import { buildOrderBookingMarkedDates } from "@/features/calendar/utils/calendarAvailability";
import { supabase } from "@/lib/supabase";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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

  // Parse the event date from params
  const parsedEventDate = React.useMemo(() => {
    if (!params.eventDate) return { day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() };
    const parts = params.eventDate.split(' ');
    if (parts.length >= 3) {
      const monthName = parts[0];
      const day = parseInt(parts[1].replace(',', ''));
      const year = parseInt(parts[2]);
      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) return { day, month: monthIndex, year };
    }
    return { day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() };
  }, [params.eventDate]);

  const [selectedDate, setSelectedDate] = useState(parsedEventDate.day);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('approved');

  // Dispute modal state
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeType, setDisputeType] = useState<'payment' | 'service' | 'cancellation' | 'other'>('payment');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Review modal state (vendor reviews customer)
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const initialDate = new Date(parsedEventDate.year, parsedEventDate.month, parsedEventDate.day);
  const bookedEventDateString = `${parsedEventDate.year}-${String(parsedEventDate.month + 1).padStart(2, '0')}-${String(parsedEventDate.day).padStart(2, '0')}`;
  const markedDates = buildOrderBookingMarkedDates(bookedEventDateString);

  // Load conversation + order data
  useEffect(() => {
    if (!params.orderId) return;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setVendorId(user.id);

      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, status')
        .eq('id', params.orderId)
        .single();

      if (order) {
        setCustomerId(order.customer_id);
        setOrderStatus(order.status);
      }

      const { data: conv } = await supabase
        .from('conversations')
        .select('id, payment_completed')
        .eq('order_id', params.orderId)
        .maybeSingle();

      if (conv) {
        setConversationId(conv.id);
        setPaymentCompleted(conv.payment_completed);
      }
    };
    load();
  }, [params.orderId]);

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleOpenChat = () => {
    if (!conversationId || !customerId) {
      Toast.show({ type: 'error', text1: 'Chat not available', text2: 'Conversation not found for this order.' });
      return;
    }
    router.push({
      pathname: '/chat/conversation',
      params: {
        conversationId,
        customerName: params.customerName || 'Customer',
        customerId,
        paymentCompleted: String(paymentCompleted),
        orderId: params.orderId,
      },
    });
  };

  const handleMarkComplete = async () => {
    Alert.alert(
      'Mark as Completed',
      'Confirm that this event/service has been fully delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const { error } = await supabase
              .from('orders')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', params.orderId);

            if (error) {
              Toast.show({ type: 'error', text1: 'Failed', text2: error.message });
            } else {
              setOrderStatus('completed');
              Toast.show({ type: 'success', text1: 'Order marked as completed ✅' });
            }
          }
        }
      ]
    );
  };

  const handleSubmitDispute = async () => {
    if (!disputeDescription.trim()) {
      Toast.show({ type: 'error', text1: 'Please describe the issue' });
      return;
    }
    if (!customerId || !vendorId) return;
    setSubmittingDispute(true);

    const { error } = await supabase.from('disputes').insert({
      order_id: params.orderId,
      customer_id: customerId,
      vendor_id: vendorId,
      type: disputeType,
      description: disputeDescription.trim(),
    });

    setSubmittingDispute(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to submit dispute', text2: error.message });
    } else {
      setDisputeModalVisible(false);
      setDisputeDescription('');
      Toast.show({ type: 'success', text1: 'Dispute submitted', text2: 'Our team will review it shortly.' });
    }
  };

  const handleSubmitReview = async () => {
    if (!customerId || !vendorId) return;
    setSubmittingReview(true);

    const { error } = await supabase.from('reviews').insert({
      vendor_id: vendorId,
      customer_id: customerId,
      order_id: params.orderId,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setSubmittingReview(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to submit review', text2: error.message });
    } else {
      setReviewModalVisible(false);
      setReviewComment('');
      Toast.show({ type: 'success', text1: 'Review submitted ⭐' });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({ type: 'success', text1: `${type} copied!` });
  };

  const customerEmail = params.customerEmail || "—";
  const customerPhone = params.customerPhone || "—";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color="#000000" />
          </TouchableOpacity>
          {/* Order status badge */}
          <View style={[styles.statusBadge, orderStatus === 'completed' && styles.statusBadgeCompleted]}>
            <Text style={styles.statusBadgeText}>{orderStatus.toUpperCase()}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>{params.title || "Event"}</Text>
          <Text style={styles.customerName}>{params.customerName || "Customer"}</Text>
          <Text style={styles.packageInfo}>Package: {params.packageType || "Basic"}</Text>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactItem} onPress={() => copyToClipboard(customerEmail, "Email")}>
              <Text style={styles.contactText}>{customerEmail}</Text>
              <Feather name="copy" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={() => copyToClipboard(customerPhone, "Phone")}>
              <Text style={styles.contactText}>{customerPhone}</Text>
              <Feather name="copy" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Date */}
        <View style={styles.eventDateContainer}>
          <Feather name="calendar" size={20} color="#7C2A2A" />
          <Text style={styles.eventDateLabel}>Event Date:</Text>
          <Text style={styles.eventDateText}>{params.eventDate || 'Not specified'}</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <UnifiedCalendar
            initialDate={initialDate}
            selectedDate={selectedDate}
            onDayPress={(day) => setSelectedDate(day)}
            markedDates={markedDates}
            disabled={true}
          />
        </View>

        {/* ─── Action Buttons ─── */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Order Actions</Text>

          {/* Open Chat */}
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenChat}>
            <View style={styles.actionIconWrap}>
              <Feather name="message-circle" size={20} color="#800000" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionLabel}>Open Chat</Text>
              <Text style={styles.actionSub}>Message the customer about this booking</Text>
            </View>
          </TouchableOpacity>

          {/* Mark Completed */}
          {orderStatus !== 'completed' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleMarkComplete}>
              <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                <Feather name="check-circle" size={20} color="#16a34a" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionLabel, { color: '#16a34a' }]}>Mark as Completed</Text>
                <Text style={styles.actionSub}>Confirm delivery of this service</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Raise Dispute */}
          <TouchableOpacity style={styles.actionButton} onPress={() => setDisputeModalVisible(true)}>
            <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(239,68,68,0.10)' }]}>
              <Feather name="alert-circle" size={20} color="#dc2626" />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={[styles.actionLabel, { color: '#dc2626' }]}>Raise a Dispute</Text>
              <Text style={styles.actionSub}>Report a payment or service issue</Text>
            </View>
          </TouchableOpacity>

          {/* Leave Review (vendor rates the experience) */}
          {orderStatus === 'completed' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setReviewModalVisible(true)}>
              <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(234,179,8,0.12)' }]}>
                <Feather name="star" size={20} color="#ca8a04" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionLabel, { color: '#ca8a04' }]}>Leave a Review</Text>
                <Text style={styles.actionSub}>Rate your experience with this customer</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ─── Dispute Modal ─── */}
      <Modal visible={disputeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Raise a Dispute</Text>
            <Text style={styles.modalSub}>Describe the issue with this order</Text>

            <Text style={styles.fieldLabel}>Issue Type</Text>
            <View style={styles.typeRow}>
              {(['payment', 'service', 'cancellation', 'other'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, disputeType === t && styles.typeChipSelected]}
                  onPress={() => setDisputeType(t)}
                >
                  <Text style={[styles.typeChipText, disputeType === t && styles.typeChipTextSelected]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Describe what went wrong..."
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={4}
              value={disputeDescription}
              onChangeText={setDisputeDescription}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDisputeModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submittingDispute && { opacity: 0.5 }]}
                onPress={handleSubmitDispute}
                disabled={submittingDispute}
              >
                <Text style={styles.submitBtnText}>{submittingDispute ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Review Modal ─── */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <Text style={styles.modalSub}>Rate your experience with {params.customerName}</Text>

            <Text style={styles.fieldLabel}>Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? "star" : "star-outline"}
                    size={36}
                    color="#ca8a04"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Comment (optional)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Share your experience..."
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submittingReview && { opacity: 0.5 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <Text style={styles.submitBtnText}>{submittingReview ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf8f5" },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 30, paddingTop: 20, paddingBottom: 16,
  },
  backButton: {
    width: 40, height: 40, backgroundColor: 'rgba(255,252,250,0.95)',
    borderRadius: 20, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.08)',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(52,199,89,0.15)',
  },
  statusBadgeCompleted: { backgroundColor: 'rgba(128,0,0,0.12)' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#34C759', letterSpacing: 1 },

  orderInfo: {
    backgroundColor: "rgba(255,255,255,0.98)", borderRadius: 24,
    marginHorizontal: 30, marginBottom: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.06)',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  orderTitle: { fontSize: 24, fontWeight: "700", color: "#800000", marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: "600", color: "#1c1917", marginBottom: 6 },
  packageInfo: { fontSize: 14, color: "#57534e", marginBottom: 20 },
  contactContainer: { gap: 10 },
  contactItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#800000", borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12,
  },
  contactText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },

  eventDateContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(128,0,0,0.08)", borderRadius: 20,
    marginHorizontal: 30, marginBottom: 20, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.12)',
  },
  eventDateLabel: { fontSize: 14, fontWeight: "600", color: "#800000", marginLeft: 10 },
  eventDateText: { fontSize: 14, fontWeight: "700", color: "#800000", marginLeft: 6 },

  calendarContainer: {
    backgroundColor: "rgba(255,255,255,0.98)", borderRadius: 24,
    marginHorizontal: 30, marginBottom: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.06)',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },

  // ── Action Buttons ──
  actionsContainer: { marginHorizontal: 30 },
  actionsTitle: { fontSize: 18, fontWeight: '700', color: '#1c1917', marginBottom: 16 },
  actionButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 20,
    padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.06)',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  actionIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(128,0,0,0.08)',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  actionTextWrap: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#800000', marginBottom: 2 },
  actionSub: { fontSize: 13, color: '#78716c' },

  // ── Modals ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1c1917', marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#78716c', marginBottom: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#57534e', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(128,0,0,0.2)', backgroundColor: 'transparent',
  },
  typeChipSelected: { backgroundColor: '#800000', borderColor: '#800000' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#800000' },
  typeChipTextSelected: { color: '#FFFFFF' },
  textarea: {
    backgroundColor: '#f5f5f4', borderRadius: 16, padding: 16,
    fontSize: 15, color: '#1c1917', minHeight: 100, textAlignVertical: 'top', marginBottom: 24,
  },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f5f5f4',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#57534e' },
  submitBtn: {
    flex: 1, height: 52, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#800000',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default CustomerDetailsScreen;