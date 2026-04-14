import PricingBadges from "@/features/events/components/PricingBadges";
import { useCompletedEvents, useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type PastEvent = {
  id: string;
  event: string;
  customer_name?: string;
  start_date: string;
  end_date: string;
  payment?: number;
  status?: string;
};

const PastEvents = () => {
  const events = useCompletedEvents();
  const loading = useVendorStore((s) => s.eventsLoading);
  const fetchEvents = useVendorStore((s) => s.fetchEvents);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);
    if (!start || !end || startLabel === endLabel) {
      return startLabel;
    }
    return `${startLabel} → ${endLabel}`;
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "No payment info";
    return `₹${value.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: PastEvent }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.event || "Untitled Event"}</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>

      {item.customer_name && (
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#57534e" />
          <Text style={styles.infoText}>{item.customer_name}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color="#57534e" />
        <Text style={styles.infoText}>{formatDateRange(item.start_date, item.end_date)}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="cash-outline" size={18} color="#800000" style={{ marginBottom: 4 }} />
        <PricingBadges
          pricingSummary={(item as any).pricing_summary}
          fallbackPayment={item.payment}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading past events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Past Events</Text>
        <Text style={styles.subtitle}>Completed event history</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#34C759" />
            </View>
            <Text style={styles.emptyTitle}>No past events</Text>
            <Text style={styles.emptyText}>Completed events will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default PastEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
  },
  listContent: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#57534e',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#57534e',
    fontWeight: '400',
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.06)',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#34C75915',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
  },
});