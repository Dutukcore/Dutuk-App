import logger from '@/lib/logger';
import { useVendorStore } from '@/store/useVendorStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

const StatusBadge = memo(({ status }: { status: string }) => {
  const badgeConfigs = {
    pending: { bg: 'rgba(128, 0, 0, 0.08)', text: '#800000' },
    approved: { bg: '#34C75915', text: '#34C759' },
    completed: { bg: '#1c1917', text: '#FFFFFF' },
    rejected: { bg: '#FF3B30', text: '#FFFFFF' }
  };
  const config = (badgeConfigs as any)[status] || badgeConfigs.pending;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.text }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
});

const OrderPreviewCard = memo(({ order }: { order: any }) => {
  return (
    <Pressable
      style={styles.orderPreviewCard}
      onPress={() => router.push({
        pathname: order.status === 'pending'
          ? '/orders/customerApproval'
          : '/orders/customerDetails',
        params: { orderId: order.id }
      })}
    >
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderIdText}>#{order.id.substring(0, 8).toUpperCase()}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.orderTitleText} numberOfLines={1}>{order.title}</Text>
      <Text style={styles.orderCustomerText} numberOfLines={1}>{order.customerName}</Text>
      <View style={styles.orderCardFooter}>
        <View style={styles.orderDateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#57534e" />
          <Text style={styles.orderDateText}>{order.date}</Text>
        </View>
        {Boolean(order.amount) && (
          <Text style={styles.orderAmountText}>₹{order.amount}</Text>
        )}
      </View>
    </Pressable>
  );
});

const ManageEventCard = memo(({ item, onPress }: { item: any, onPress: (id: string) => void }) => {
  const FALLBACK_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  const imageUri = item.image_url || item.banner_url || "";
  return (
    <Pressable
      style={styles.manageCardSmall}
      onPress={() => onPress(item.id)}
    >
      <Image
        source={imageUri ? { uri: imageUri } : { uri: FALLBACK_IMAGE }}
        style={styles.manageCardImageSmall}
        cachePolicy="disk"
        transition={200}
      />
      <Text style={styles.manageCardTitleSmall} numberOfLines={1}>{item.event}</Text>
    </Pressable>
  );
});

const ReviewCard = memo(({ review }: { review: any }) => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {review.customer?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.customer?.full_name || 'Anonymous'}</Text>
            <Text style={styles.reviewEventName}>{review.order?.title || 'Event'}</Text>
          </View>
        </View>
        <View style={styles.reviewRatingBadge}>
          <Ionicons name="star" size={14} color="#FFC13C" />
          <Text style={styles.reviewRatingText}>{review.rating}</Text>
        </View>
      </View>
      {Boolean(review.review) && (
        <Text style={styles.reviewText} numberOfLines={3}>
          "{review.review}"
        </Text>
      )}
    </View>
  );
});

const Home = () => {
  // Store state with optimized selection
  const {
    allEvents,
    company,
    requestsCount,
    pendingInquiries,
    calendarDates,
    reviewStats,
    reviews,
    fetchAll,
    isHydrated,
    orders,
    ordersLoading,
    newOrderCount,
    realtimeStatus,
  } = useVendorStore(
    useShallow((s) => ({
      allEvents: s.allEvents,
      company: s.company,
      requestsCount: s.requestsCount,
      pendingInquiries: s.pendingInquiries,
      calendarDates: s.calendarDates,
      reviewStats: s.reviewStats,
      reviews: s.reviews,
      fetchAll: s.fetchAll,
      isHydrated: s.isHydrated,
      orders: s.orders,
      ordersLoading: s.ordersLoading,
      newOrderCount: s.newOrderCount,
      realtimeStatus: s.realtimeStatus,
    }))
  );

  const FRESH_MS = 20_000;

  useFocusEffect(
    useCallback(() => {
      const { lastFetchedAt, realtimeStatus } = useVendorStore.getState();
      const stale = !lastFetchedAt || Date.now() - lastFetchedAt > FRESH_MS;

      if (realtimeStatus === 'SUBSCRIBED' && !stale) {
        logger.log('Home focus: realtime healthy + data fresh — skipping refetch');
        return;
      }

      logger.log('Home tab focused — refreshing orders');
      useVendorStore.getState().fetchOrders().catch(e =>
        logger.warn('Focus refetch failed:', e)
      );
    }, [])
  );

  const [refreshing, setRefreshing] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(false);

  const FALLBACK_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  const profileImageUrl = company?.logo_url || FALLBACK_IMAGE;

  const manageableEvents = useMemo(() => {
    return allEvents.filter((evt) => evt.status !== 'completed');
  }, [allEvents]);

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const earnableOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved');
    const totalEarnings = earnableOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const thisMonthOrders = earnableOrders.filter(o => {
      if (!o.rawEventDate) return false;
      const d = new Date(o.rawEventDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const thisMonthEarnings = thisMonthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const completedCount = orders.filter(o => o.status === 'completed').length;

    return {
      totalEarnings,
      thisMonthEarnings,
      pastServicesCount: completedCount,
      thisMonthServicesCount: thisMonthOrders.length,
      avgRating: reviewStats.averageRating || 0,
      totalReviews: reviewStats.totalReviews || 0,
    };
  }, [orders, reviewStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } catch (error) {
      logger.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  const sections = useMemo(() => [
    { type: 'ORDERS' },
    { type: 'ANALYTICS' },
    { type: 'SERVICES' },
    { type: 'REVIEWS' }
  ], []);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <View style={styles.leftIcons}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/notifications' as any)}>
              <Ionicons name="notifications-outline" size={26} color="#1c1917" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => router.push("/calendar" as any)}>
              <Ionicons name="calendar-outline" size={26} color="#1c1917" />
            </Pressable>
          </View>

          <Pressable style={styles.profileIcon} onPress={() => router.push("/profile")}>
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.profileImage}
              cachePolicy="disk"
              transition={200}
              onLoadStart={() => setProfileImageLoading(true)}
              onLoadEnd={() => setProfileImageLoading(false)}
            />
            {Boolean(profileImageLoading) && (
              <View style={styles.profileImageLoadingOverlay}>
                <ActivityIndicator color="#800000" size="small" />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Home</Text>
      </View>
    </>
  );

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'ORDERS':
        return (
          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerTitleGroup}>
                <Text style={styles.sectionTitle}>New Orders</Text>
                <View style={[styles.orderCountBadge, newOrderCount > 0 && styles.newOrderBadge]}>
                  <Text style={[styles.orderCountText, newOrderCount > 0 && styles.newOrderText]}>{orders.length}</Text>
                </View>
                {newOrderCount > 0 && <View style={styles.redDot} />}
                <View style={[
                  styles.liveIndicator,
                  realtimeStatus === 'SUBSCRIBED' ? styles.liveIndicatorActive : styles.liveIndicatorReconnecting
                ]}>
                  <View style={[
                    styles.liveDot,
                    realtimeStatus === 'SUBSCRIBED' ? styles.liveDotActive : styles.liveDotReconnecting
                  ]} />
                  <Text style={[
                    styles.liveText,
                    realtimeStatus === 'SUBSCRIBED' ? styles.liveTextActive : styles.liveTextReconnecting
                  ]}>
                    {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Reconnecting…'}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => router.push('/orders/allOrders' as any)}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyOrdersCard}>
                <Ionicons name="file-tray-outline" size={44} color="#a8a29e" />
                <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
                <Text style={styles.emptyOrdersSubtitle}>
                  Customer orders will appear here when they book your services
                </Text>
              </View>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={orders.slice(0, 5)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <OrderPreviewCard order={item} />}
                contentContainerStyle={styles.ordersScrollContent}
                ListFooterComponent={
                  orders.length > 5 ? (
                    <Pressable
                      style={styles.viewAllOrdersCard}
                      onPress={() => router.push('/orders/allOrders' as any)}
                    >
                      <Ionicons name="arrow-forward-circle-outline" size={40} color="#800000" />
                      <Text style={styles.viewAllOrdersText}>View All</Text>
                      <Text style={styles.viewAllOrdersCount}>+{orders.length - 5} more</Text>
                    </Pressable>
                  ) : null
                }
              />
            )}
          </View>
        );
      case 'ANALYTICS':
        return (
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Analytics & Performance</Text>

            <View style={styles.analyticsRow}>
              <View style={styles.analyticsCard}>
                <View style={styles.analyticsIconContainer}>
                  <Ionicons name="wallet-outline" size={28} color="#34C759" />
                </View>
                <Text style={styles.analyticsLabel}>Total Earnings</Text>
                <Text style={styles.analyticsValue}>₹{analytics.totalEarnings.toFixed(2)}</Text>
                <Text style={styles.analyticsSubtext}>All time</Text>
              </View>

              <View style={styles.analyticsCard}>
                <View style={[styles.analyticsIconContainer, { backgroundColor: 'rgba(128, 0, 0, 0.08)' }]}>
                  <Ionicons name="trending-up-outline" size={28} color="#800000" />
                </View>
                <Text style={styles.analyticsLabel}>This Month</Text>
                <Text style={styles.analyticsValue}>₹{analytics.thisMonthEarnings.toFixed(2)}</Text>
                <Text style={styles.analyticsSubtext}>{analytics.thisMonthServicesCount} services</Text>
              </View>
            </View>

            <View style={styles.analyticsRow}>
              <View style={styles.analyticsCard}>
                <View style={[styles.analyticsIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.08)' }]}>
                  <Ionicons name="calendar-outline" size={28} color="#007AFF" />
                </View>
                <Text style={styles.analyticsLabel}>Past Services</Text>
                <Text style={styles.analyticsValue}>{analytics.pastServicesCount}</Text>
                <Text style={styles.analyticsSubtext}>Completed</Text>
              </View>

              <View style={styles.analyticsCard}>
                <View style={[styles.analyticsIconContainer, { backgroundColor: 'rgba(255, 193, 60, 0.08)' }]}>
                  <Ionicons name="star" size={28} color="#FFC13C" />
                </View>
                <Text style={styles.analyticsLabel}>Rating</Text>
                <Text style={styles.analyticsValue}>{analytics.avgRating.toFixed(1)} ⭐</Text>
                <Text style={styles.analyticsSubtext}>{analytics.totalReviews} reviews</Text>
              </View>
            </View>
          </View>
        );
      case 'SERVICES':
        return allEvents.length === 0 ? (
          <View style={styles.createEventSection}>
            <Pressable
              style={styles.createEventCTA}
              onPress={() => router.push('/event/manage/createStepOne')}
            >
              <View style={styles.createEventIconCircle}>
                <Ionicons name="add-circle" size={56} color="#800000" />
              </View>
              <View style={styles.createEventTextContainer}>
                <Text style={styles.createEventTitle}>Create New Service</Text>
                <Text style={styles.createEventSubtitle}>
                  Set up a new service to showcase to customers
                </Text>
              </View>
              <View style={styles.createEventArrow}>
                <Ionicons name="arrow-forward" size={24} color="#800000" />
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.manageEventsWrapper}>
            <View style={styles.manageEventsHeader}>
              <Text style={styles.subsectionTitle}>Your Services</Text>
              <View style={styles.headerActions}>
                <Pressable onPress={() => router.push('/event')}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </Pressable>
              </View>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={manageableEvents.slice(0, 3)}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.manageEventsScroll}
              ListHeaderComponent={
                <Pressable
                  style={styles.addEventCardSmall}
                  onPress={() => router.push('/event/manage/createStepOne')}
                >
                  <View style={styles.addEventCardImageSmall}>
                    <Ionicons name="add-circle" size={40} color="#800000" />
                    <Text style={styles.addEventLabel}>add new service</Text>
                  </View>
                </Pressable>
              }
              renderItem={({ item }) => (
                <ManageEventCard
                  item={item}
                  onPress={(id) => router.push(`/event/manage/${id}`)}
                />
              )}
            />
          </View>
        );
      case 'REVIEWS':
        return (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push("/reviews")}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#800000" />
              </Pressable>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReviewsCard}>
                <Ionicons name="star-outline" size={44} color="#FFC13C" />
                <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtitle}>
                  Customer reviews will appear here after completed services
                </Text>
              </View>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={reviews.slice(0, 5)}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.reviewsScrollContent}
                renderItem={({ item: review }: { item: any }) => (
                  <ReviewCard review={review} />
                )}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.type}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#800000"
            colors={["#800000"]}
            progressBackgroundColor="#faf8f5"
          />
        }
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
    paddingTop: 16,
    paddingHorizontal: 0, // Adjusted for FlatList header
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 0, 0.12)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  // Order Section Styles
  ordersSection: {
    marginBottom: 48,
    marginLeft: -28,
    marginRight: -28,
    overflow: 'visible',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 28,
  },
  orderCountBadge: {
    backgroundColor: 'rgba(128, 0, 0, 0.1)',
    paddingHorizontal: 10,
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newOrderBadge: {
    backgroundColor: '#FF3B30',
  },
  newOrderText: {
    color: '#FFFFFF',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    top: -2,
    right: -2,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#800000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
  },
  manageEventsWrapper: {
    marginBottom: 48,
  },
  manageEventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addEventCardSmall: {
    width: 110,
    marginRight: 16,
  },
  addEventCardImageSmall: {
    width: 110,
    height: 140,
    borderRadius: 24,
    backgroundColor: 'rgba(128, 0, 0, 0.04)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(128, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addEventLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#800000',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manageCardSmall: {
    width: 110,
    marginRight: 16,
  },
  manageCardImageSmall: {
    width: 110,
    height: 140,
    borderRadius: 24,
    backgroundColor: '#e7e5e4',
  },
  manageCardTitleSmall: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1917',
  },
  orderCountText: {
    color: '#800000',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyOrdersCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
  },
  emptyOrdersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 16,
  },
  emptyOrdersSubtitle: {
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ordersScrollContent: {
    paddingLeft: 28,
    paddingRight: 28,
    paddingVertical: 4,
  },
  orderPreviewCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a8a29e',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
  },
  orderCustomerText: {
    fontSize: 14,
    color: '#57534e',
    marginBottom: 16,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.04)',
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDateText: {
    fontSize: 13,
    color: '#57534e',
    fontWeight: '500',
  },
  orderAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#800000',
  },
  viewAllOrdersCard: {
    width: 160,
    backgroundColor: 'rgba(128, 0, 0, 0.03)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(128, 0, 0, 0.2)',
  },
  viewAllOrdersText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  viewAllOrdersCount: {
    fontSize: 12,
    color: '#800000',
    fontWeight: '600',
  },

  // Analytics Styles
  analyticsSection: {
    marginBottom: 48,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.04)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a8a29e',
    marginBottom: 4,
  },
  analyticsSubtext: {
    fontSize: 12,
    color: '#57534e',
  },

  // Reviews Styles
  reviewsSection: {
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#800000',
  },
  reviewsScrollContent: {
    paddingVertical: 4,
  },
  reviewCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.04)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#800000',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  reviewEventName: {
    fontSize: 12,
    color: '#a8a29e',
  },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 193, 60, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFC13C',
  },
  reviewText: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyReviewsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
  },
  emptyReviewsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 16,
  },
  emptyReviewsSubtitle: {
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  liveIndicatorActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  liveIndicatorReconnecting: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveDotActive: {
    backgroundColor: '#34C759',
  },
  liveDotReconnecting: {
    backgroundColor: '#FF9500',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveTextActive: {
    color: '#34C759',
  },
  liveTextReconnecting: {
    color: '#FF9500',
  },
  manageEventsScroll: {
    paddingVertical: 4,
  },
  createEventSection: {
    marginBottom: 56,
  },
  createEventCTA: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.04)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  createEventIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(128, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createEventTextContainer: {
    flex: 1,
  },
  createEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
  },
  createEventSubtitle: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 20,
  },
  createEventArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;