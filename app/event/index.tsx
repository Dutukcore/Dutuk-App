import { useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string, text: string }> = {
    upcoming: { bg: '#007AFF10', text: '#007AFF' },
    ongoing: { bg: '#FF950010', text: '#FF9500' },
    completed: { bg: '#34C75910', text: '#34C759' },
    cancelled: { bg: '#FF3B3010', text: '#FF3B30' },
  };
  const config = configs[status] || configs.upcoming;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.text }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const EventPage = () => {
  const events = useVendorStore((s) => s.allEvents);
  const loading = useVendorStore((s) => s.eventsLoading);
  const fetchEvents = useVendorStore((s) => s.fetchEvents);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading your services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1c1917" />
          </Pressable>
          <View>
            <Text style={styles.title}>Your Services</Text>
            <Text style={styles.subtitle}>{events.length} services created</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={48} color="#d6d3d1" />
            </View>
            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptyText}>You haven't created any services yet.</Text>
          </View>
        }
        renderItem={({ item }: { item: any }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/event/manage/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.event || item.title}</Text>
              <StatusBadge status={item.status} />
            </View>

            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#57534e" />
              <Text style={styles.infoText}>
                {item.date && Array.isArray(item.date) ? (
                  item.date.length > 1
                    ? `${formatDate(item.date[0])} - ${formatDate(item.date[1])}`
                    : formatDate(item.date[0])
                ) : (
                  formatDate(item.event_date || item.created_at)
                )}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <Ionicons name="time-outline" size={14} color="#a8a29e" />
                <Text style={styles.footerDate}>Created {formatDate(item.created_at)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.04)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#800000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#a8a29e',
    marginTop: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 40,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1c1917',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.04)',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDate: {
    fontSize: 12,
    color: '#a8a29e',
    fontWeight: '400',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#faf8f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f5f5f4',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#a8a29e',
    textAlign: 'center',
  },
});

export default EventPage;