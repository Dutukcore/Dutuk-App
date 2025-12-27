import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Bell, Calendar, Clock, Edit, FileText, User } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrders } from '@/hooks/useOrders';
import getCompanyInfo from '@/hooks/useGetCompanyInfo';
import Toast from 'react-native-toast-message';

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const { orders, loading, getOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png");

  // Fetch orders when component mounts
  useEffect(() => {
    loadOrders();
    loadProfileImage();
  }, []);

  const loadOrders = async () => {
    try {
      await getOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load orders. Please try again.'
      });
    }
  };

  const loadProfileImage = async () => {
    try {
      const companyInfo = await getCompanyInfo();
      if (companyInfo?.logo_url) {
        setProfileImageUrl(companyInfo.logo_url);
      }
    } catch (error) {
      console.error('Failed to load profile image:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    await loadProfileImage();
    setRefreshing(false);
  };

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
          <Image 
            source={{ uri: profileImageUrl }} 
            style={styles.profileImage}
          />
        </Pressable>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={(
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Orders</Text>
              <FileText width={24} height={24} stroke="#000000" />
            </View>
          </View>
        )}
        ListEmptyComponent={(
          loading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#000000" />
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
              </View>
            </View>
          )
        )}
        renderItem={({ item }) => {
          const goTo = item.status === 'pending' ? '/orders/customerApproval' : '/orders/customerDetails';
          
          // Map status for display - use type assertion for comparison
          const status = item.status as string;
          const displayStatus = status === 'completed' ? 'done' : status;
          
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
                  customerPhone: item.customerPhone
                }
              })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
                <View style={styles.headerActions}>
                  {displayStatus === 'pending' && (
                    <View style={styles.pendingBadge}><Text style={styles.pendingText}>Pending</Text></View>
                  )}
                  {displayStatus === 'approved' && (
                    <View style={styles.approvedBadge}><Text style={styles.approvedText}>Approved</Text></View>
                  )}
                  {displayStatus === 'done' && (
                    <View style={styles.doneBadge}><Text style={styles.doneText}>Done</Text></View>
                  )}
                  {displayStatus === 'rejected' && (
                    <View style={styles.rejectedBadge}><Text style={styles.rejectedText}>Rejected</Text></View>
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
                {item.amount && (
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>${item.amount}</Text>
                  </View>
                )}
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  rejectedBadge: {
    backgroundColor: '#FF5050',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter',
  },
  amountContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
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