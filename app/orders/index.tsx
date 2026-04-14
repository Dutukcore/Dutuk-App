import logger from '@/lib/logger';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Bell, Calendar, FileText, RefreshCw, User } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useOrders } from '@/features/orders/hooks/useOrders';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const { orders, loading, getOrders } = useOrders();

  useEffect(() => {
    getOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { badge: styles.pendingBadge, text: styles.pendingText, label: 'Pending' };
      case 'approved': return { badge: styles.approvedBadge, text: styles.approvedText, label: 'Approved' };
      case 'completed': return { badge: styles.doneBadge, text: styles.doneText, label: 'Done' };
      case 'rejected': return { badge: styles.rejectedBadge, text: styles.rejectedText, label: 'Rejected' };
      case 'cancelled': return { badge: styles.rejectedBadge, text: styles.rejectedText, label: 'Cancelled' };
      default: return { badge: styles.pendingBadge, text: styles.pendingText, label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        {/* Left Icons Group */}
        <View style={styles.leftIconsGroup}>
          <Pressable
            style={styles.headerIcon}
            onPress={() => logger.log('Notifications pressed')}
          >
            <Bell width={24} height={24} stroke="#000000" />
          </Pressable>

          <Pressable
            style={styles.headerIcon}
            onPress={() => router.push('/profilePages/calendar/CalendarPage')}
          >
            <Calendar width={24} height={24} stroke="#000000" />
          </Pressable>
        </View>

        {/* Profile Icon */}
        <Pressable
          style={styles.profileIcon}
          onPress={() => router.push('/profilePages/profile')}
        >
          <View style={styles.profileImagePlaceholder}>
            <User width={24} height={24} stroke="#CCCCCC" />
          </View>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        onRefresh={getOrders}
        refreshing={loading}
        ListHeaderComponent={(
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Orders</Text>
              <FileText width={24} height={24} stroke="#000000" />
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#800000" />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStatePlaceholder}>
                <FileText width={60} height={60} stroke="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Your orders will appear here once customers start booking your services
                </Text>
                <Pressable style={styles.refreshButton} onPress={getOrders}>
                  <RefreshCw width={16} height={16} stroke="#800000" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </Pressable>
              </View>
            </View>
          )
        }
        renderItem={({ item }) => {
          const goTo = item.status === 'pending' ? '/orders/customerApproval' : '/orders/customerDetails';
          const statusStyle = getStatusStyle(item.status);

          return (
            <Pressable
              style={styles.orderCard}
              onPress={() => router.push({
                pathname: goTo,
                params: {
                  orderId: item.id,
                  title: item.title,
                  customerName: item.customerName,
                  packageType: item.packageType,
                  customerEmail: item.customerEmail,
                  customerPhone: item.customerPhone,
                  eventDate: item.date,
                  notes: item.notes ?? '',
                }
              })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                <View style={styles.headerActions}>
                  <View style={statusStyle.badge}>
                    <Text style={statusStyle.text}>{statusStyle.label}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">
                {item.customerName}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Calendar width={16} height={16} stroke="#666666" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                {item.amount != null && (
                  <Text style={styles.amountText}>
                    ₹{Number(item.amount).toLocaleString('en-IN')}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* Bottom Navigation - Fixed */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigation activeTab="orders" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomNavContainer: {
    backgroundColor: '#faf8f5',
    paddingTop: 10,
  },
  leftIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255, 252, 250, 0.95)',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 0, 0.12)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e7e5e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 30,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#800000',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
  },
  emptyStateContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#57534e',
    fontFamily: 'Inter',
  },
  emptyStatePlaceholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 48,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(128, 0, 0, 0.06)',
    borderRadius: 20,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#800000',
    fontFamily: 'Inter',
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 30,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a8a29e',
    fontFamily: 'Inter',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  approvedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  approvedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  doneBadge: {
    backgroundColor: 'rgba(128, 0, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rejectedBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rejectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    fontFamily: 'Inter',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#57534e',
    fontFamily: 'Inter',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.06)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#57534e',
    fontFamily: 'Inter',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#800000',
    fontFamily: 'Inter',
  },
});

export default OrdersScreen;