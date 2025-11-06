import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Bell, Calendar, Clock, Edit, FileText, User } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
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
              console.log('Notifications pressed');
            }}
          >
            <Bell width={24} height={24} stroke="#000000" />
          </Pressable>
          
          {/* Calendar Icon */}
          <Pressable 
            style={styles.headerIcon}
            onPress={() => {
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
        contentContainerStyle={styles.scrollContent}
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
              onPress={() => router.push({
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
  scrollContent: {
    paddingBottom: 20,
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
  orderCard: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
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