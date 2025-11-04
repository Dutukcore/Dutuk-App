import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Bell, Calendar, Clock, Edit, FileText, User } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  // Demo orders - set to empty array to show empty state
  const orders = [
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
  ];

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
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom } // Account for bottom nav (80px) + safe area + extra space
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Orders Title */}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Orders</Text>
            <FileText width={24} height={24} stroke="#000000" />
          </View>
        </View>

        {orders.length === 0 ? (
          /* Empty State - Only show when no orders */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStatePlaceholder}>
              <FileText width={60} height={60} stroke="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Your orders will appear here once customers start booking your services
              </Text>
            </View>
          </View>
        ) : (
          /* Orders List */
          <View style={styles.ordersContainer}>
          <Pressable 
          style={styles.orderCard}
          onPress={() => router.push({
            pathname: '/orders/customerApproval',
            params: {
              orderId: '55D90',
              title: 'Birthday Party',
              customerName: 'Bodhi Dharmar',
              packageType: 'Premium Package',
              customerEmail: 'bodhi.dharmar@example.com',
              customerPhone: '+1 (555) 123-4567'
            }
          })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#55D90</Text>
            <View style={styles.headerActions}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
              <Pressable style={styles.editButton}>
                <Edit width={16} height={16} stroke="#FFFFFF" />
              </Pressable>
            </View>
          </View>
          
          <Text style={styles.eventTitle}>Birthday Party</Text>
          <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">Bodhi Dharmar</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Calendar width={16} height={16} stroke="#666666" />
              <Text style={styles.dateText}>15-10-2025</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock width={16} height={16} stroke="#666666" />
              <Text style={styles.timeText}>7:00am - 4pm</Text>
            </View>
          </View>
        </Pressable>

        <Pressable 
          style={styles.orderCard}
          onPress={() => router.push({
            pathname: '/orders/customerDetails',
            params: {
              orderId: '55D90',
              title: 'Birthday Party',
              customerName: 'Praveen Kumar',
              packageType: 'Business Package',
              customerEmail: 'praveen.kumar@example.com',
              customerPhone: '+1 (555) 987-6543'
            }
          })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#55D90</Text>
            <View style={styles.headerActions}>
              <View style={styles.approvedBadge}>
                <Text style={styles.approvedText}>Approved</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.eventTitle}>Birthday Party</Text>
          <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">Praveen Kumar</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Calendar width={16} height={16} stroke="#666666" />
              <Text style={styles.dateText}>13-10-2025</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock width={16} height={16} stroke="#666666" />
              <Text style={styles.timeText}>7:00am - 4pm</Text>
            </View>
          </View>
        </Pressable>

        <Pressable 
          style={styles.orderCard}
          onPress={() => router.push({
            pathname: '/orders/customerDetails',
            params: {
              orderId: '55D90',
              title: 'Marriage Function',
              customerName: 'Mohan Raj',
              packageType: 'Premium Package',
              customerEmail: 'mohan.raj@example.com',
              customerPhone: '+1 (555) 456-7890'
            }
          })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#55D90</Text>
            <View style={styles.headerActions}>
              <View style={styles.doneBadge}>
                <Text style={styles.doneText}>Done</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.eventTitle}>Marriage Function</Text>
          <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">Mohan Raj</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Calendar width={16} height={16} stroke="#666666" />
              <Text style={styles.dateText}>11-10-2025</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock width={16} height={16} stroke="#666666" />
              <Text style={styles.timeText}>7:00am - 4pm</Text>
            </View>
          </View>
        </Pressable>
        </View>
        )}
      </ScrollView>

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
    backgroundColor: '#F3F3F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#F3F3F3',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Base padding, actual padding is added dynamically
  },
  bottomNavContainer: {
    backgroundColor: '#F3F3F3',
    paddingTop: 10,
  },
  leftIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 300,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  ordersContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 15,
    fontFamily: 'Inter',
  },
  orderCard: {
    width: 353,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 11.3448,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '400',
    color: '#999999',
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
    backgroundColor: '#CCCCCC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    fontFamily: 'Inter',
  },
  approvedBadge: {
    backgroundColor: '#BCFF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Inter',
  },
  doneBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  editButton: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Inter',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    fontFamily: 'Inter',
  },
});

export default OrdersScreen;