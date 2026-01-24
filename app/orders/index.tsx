import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Bell, Calendar, Clock, Edit, FileText, User } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  // No artificial delays; render immediately
  // Demo orders in state - set to [] to show empty state
  const [orders] = useState([
    {
      id: '55D90',
      title: 'Birthday Party',
      customerName: 'Bodhi Dharmar',
      status: 'pending',
      date: '15-10-2025',
      time: '7:00am - 4pm'
    },
    {
      id: '55D90',
      title: 'Birthday Party', 
      customerName: 'Praveen Kumar',
      status: 'approved',
      date: '13-10-2025',
      time: '7:00am - 4pm'
    },
    {
      id: '55D90',
      title: 'Marriage Function',
      customerName: 'Mohan Raj', 
      status: 'done',
      date: '11-10-2025',
      time: '7:00am - 4pm'
    }
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        {/* Left Icons Group */}
        <View style={styles.leftIconsGroup}>
          {/* Notification Bell */}
          <Pressable 
            style={styles.headerIcon}
            onPress={() => {
              // Navigate to notifications or show notification panel
              console.log('Notifications pressed');
            }}
          >
            <Bell width={24} height={24} stroke="#000000" />
          </Pressable>
          
          {/* Calendar Icon */}
          <Pressable 
            style={styles.headerIcon}
            onPress={() => {
              // Navigate to calendar page
              router.push('/profilePages/calender/CalendarPage');
            }}
          >
            <Calendar width={24} height={24} stroke="#000000" />
          </Pressable>
        </View>
        
        {/* Profile Icon */}
        <Pressable 
          style={styles.profileIcon}
          onPress={() => {
            // Navigate to profile page
            router.push('/profilePages/profile');
          }}
        >
          <View style={styles.profileImagePlaceholder}>
            <User width={24} height={24} stroke="#CCCCCC" />
          </View>
        </Pressable>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        ListHeaderComponent={(
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Orders</Text>
              <FileText width={24} height={24} stroke="#000000" />
            </View>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStatePlaceholder}>
              <FileText width={60} height={60} stroke="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Your orders will appear here once customers start booking your services
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const goTo = item.status === 'pending' ? '/orders/customerApproval' : '/orders/customerDetails';
          return (
            <Pressable
              style={styles.orderCard}
              
              onPress={ () =>  router.push({
                pathname: goTo,
                params: {
                  orderId: item.id,
                  title: item.title,
                  customerName: item.customerName,
                  packageType: item.status === 'approved' ? 'Business Package' : 'Premium Package',
                  customerEmail: 'example@example.com',
                  customerPhone: '+1 (555) 000-0000'
                }
              })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item.id}</Text>
                <View style={styles.headerActions}>
                  {item.status === 'pending' && (
                    <View style={styles.pendingBadge}><Text style={styles.pendingText}>Pending</Text></View>
                  )}
                  {item.status === 'approved' && (
                    <View style={styles.approvedBadge}><Text style={styles.approvedText}>Approved</Text></View>
                  )}
                  {item.status === 'done' && (
                    <View style={styles.doneBadge}><Text style={styles.doneText}>Done</Text></View>
                  )}
                  <Pressable style={styles.editButton}>
                    <Edit width={16} height={16} stroke="#FFFFFF" />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">{item.customerName}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Calendar width={16} height={16} stroke="#666666" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock width={16} height={16} stroke="#666666" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
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
  scrollView: {
    flex: 1,
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
  ordersContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 20,
    fontFamily: 'Inter',
    letterSpacing: -0.4,
  },
  orderCard: {
    width: 353,
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
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a8a29e',
    fontFamily: 'Inter',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    justifyContent: 'flex-end',
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
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: '#800000',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#57534e',
    fontFamily: 'Inter',
  },
});

export default OrdersScreen;