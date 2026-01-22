import getCompanyInfo from '@/hooks/useGetCompanyInfo';
import { useOrders } from '@/hooks/useOrders';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Bell, Calendar, Edit, FileText } from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
            <Bell width={22} height={22} stroke="#1c1917" />
          </Pressable>

          {/* Calendar Icon */}
          <Pressable
            style={styles.headerIcon}
            onPress={() => {
              router.push('/profilePages/calender/CalendarPage');
            }}
          >
            <Calendar width={22} height={22} stroke="#1c1917" />
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
            </View>
            <Text style={styles.headerSubtitle}>
              Manage your bookings and requests
            </Text>
          </View>
        )}
        ListEmptyComponent={(
          loading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#800000" />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStatePlaceholder}>
                <FileText width={64} height={64} stroke="#e7e5e4" />
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
                  customerPhone: item.customerPhone,
                  eventDate: item.date, // Pass the formatted date
                  notes: item.notes || ''
                }
              })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderIdLabel}>ORDER</Text>
                  <Text style={styles.orderId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
                </View>
                <View style={styles.headerActions}>
                  {displayStatus === 'pending' && (
                    <View style={styles.pendingBadge}><Text style={styles.pendingText}>PENDING</Text></View>
                  )}
                  {displayStatus === 'approved' && (
                    <View style={styles.approvedBadge}><Text style={styles.approvedText}>APPROVED</Text></View>
                  )}
                  {displayStatus === 'done' && (
                    <View style={styles.doneBadge}><Text style={styles.doneText}>COMPLETED</Text></View>
                  )}
                  {displayStatus === 'rejected' && (
                    <View style={styles.rejectedBadge}><Text style={styles.rejectedText}>REJECTED</Text></View>
                  )}
                </View>
              </View>

              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">{item.customerName}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Calendar width={16} height={16} stroke="#57534e" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                {item.amount ? (
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>₹{item.amount}</Text>
                  </View>
                ) : null}
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
    backgroundColor: '#fffcfa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fffcfa',
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  leftIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 46,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#1c1917',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
    marginTop: 4,
  },
  emptyStateContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStatePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 48,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
  },
  orderCard: {
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderIdContainer: {
    flexDirection: 'column',
  },
  orderIdLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a8a29e',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.8,
  },
  approvedBadge: {
    backgroundColor: '#BCFF50',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  approvedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: 0.8,
  },
  doneBadge: {
    backgroundColor: '#1c1917',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  rejectedBadge: {
    backgroundColor: '#FF5050',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rejectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#57534e',
    fontWeight: '500',
  },
  amountContainer: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.2,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#57534e',
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
  },
});

export default OrdersScreen;