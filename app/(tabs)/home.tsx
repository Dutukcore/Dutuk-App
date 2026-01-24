import placeholderImage from "@/assets/avatar.jpg";
import getCount from "@/hooks/companyRequests/getRequestsCount";
import getAllEvents from "@/hooks/getAllEvents";
import getUser from "@/hooks/getUser";
import getCompanyInfo from "@/hooks/useGetCompanyInfo";
import { useVendorReviews } from "@/hooks/useVendorReviews";
import { getPendingInquiriesCount } from "@/hooks/useEventInquiries";
import { CalendarDate, getCalendarDates } from '@/utils/calendarStorage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import UnifiedCalendar from '@/components/UnifiedCalendar';

type Event = {
  id: string;
  event: string;
  start_date: string;
  end_date: string;
  status: string;
  payment: number;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
};

const Home = () => {
  const [requests, setRequests] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png");
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [pendingInquiries, setPendingInquiries] = useState<number>(0);

  // Reviews data
  const { reviews: recentReviews, stats: reviewStats, refetch: refetchReviews } = useVendorReviews(3);

  const manageableEvents = useMemo(() => {
    return events.filter((evt) => evt.status !== 'completed');
  }, [events]);

  const displayCount = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      if (user?.id) {
        const count = await getCount(user.id.toString());
        setRequests(typeof count === "number" ? count : 0);
      }
    } catch (error) {
      console.error('Failed to load requests count:', error);
      setRequests(0);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      setEvents(allEvents);

      // Load calendar dates from AsyncStorage
      const storedCalendarDates = await getCalendarDates();
      setCalendarDates(storedCalendarDates);

      // Create marked dates object for UnifiedCalendar
      const marked: any = {};

      // First, add events with hasEvent flag and color
      allEvents.forEach((event: Event) => {
        const startDate = event.start_date?.split('T')[0];

        if (startDate) {
          marked[startDate] = {
            hasEvent: true,
            eventColor: event.status === 'upcoming' ? '#007AFF' : event.status === 'ongoing' ? '#FF9500' : '#34C759',
          };
        }
      });

      // Then, add calendar availability dates
      storedCalendarDates.forEach((calDate: CalendarDate) => {
        if (calDate.status === 'unavailable') {
          // Unavailable dates: red text
          marked[calDate.date] = {
            ...marked[calDate.date], // Preserve event markers if they exist
            unavailable: true,
          };
        } else if (calDate.status === 'available') {
          // Available dates: black circle with white text
          marked[calDate.date] = {
            ...marked[calDate.date], // Preserve event markers if they exist
            available: true,
          };
        }
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to load events:', error);
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

  const handleImageLoadStart = (eventId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [eventId]: true }));
  };

  const handleImageLoadEnd = (eventId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [eventId]: false }));
  };

  const handleImageLoadError = (eventId: string) => {
    console.error(`Failed to load image for event ${eventId}`);
    setImageLoadingStates(prev => ({ ...prev, [eventId]: false }));
  };

  const loadInquiriesCount = async () => {
    try {
      const count = await getPendingInquiriesCount();
      setPendingInquiries(count);
    } catch (error) {
      console.error('Failed to load inquiries count:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload all data
      await Promise.all([
        displayCount(),
        loadEvents(),
        loadProfileImage(),
        loadInquiriesCount()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      displayCount();
      loadEvents();
      loadProfileImage();
      loadInquiriesCount();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
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
      >
        <View style={styles.header}>
          <View style={styles.headerIcons}>
            {/* Left group */}
            <View style={styles.leftIcons}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={26} color="#1c1917" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => router.push("/profilePages/calender/CalendarPage")}>
                <Ionicons name="calendar-outline" size={26} color="#1c1917" />
              </Pressable>
            </View>

            {/* Right group */}
            <Pressable style={styles.profileIcon} onPress={() => router.push("/profilePages/editProfile")}>
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
                onLoadStart={() => setProfileImageLoading(true)}
                onLoadEnd={() => setProfileImageLoading(false)}
                onError={() => {
                  setProfileImageLoading(false);
                  setProfileImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png");
                }}
              />
              {profileImageLoading && (
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

        {/* Calendar Section - FOCAL POINT */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Your Calendar</Text>
            <Pressable onPress={() => router.push("/profilePages/calender/CalendarPage")}>
              <Text style={styles.calendarLink}>Manage</Text>
            </Pressable>
          </View>
          <View style={styles.calendarWrapper}>
            <UnifiedCalendar
              onDayPress={(day, dateString) => {
                setSelectedDate(dateString);
              }}
              markedDates={markedDates}
            />
          </View>
        </View>

        {/* Manage Events Section */}
        <View style={styles.manageSection}>
          <View style={styles.manageHeader}>
            <Text style={styles.sectionTitle}>Manage Events</Text>
            <Pressable
              style={styles.createButton}
              onPress={() => router.push("/event/manage/create")}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>

          {manageableEvents.length === 0 ? (
            <Pressable
              style={styles.emptyManageCard}
              onPress={() => router.push("/event/manage/create")}
            >
              <Ionicons name="calendar-outline" size={40} color="#800000" />
              <Text style={styles.emptyManageTitle}>Create your first event</Text>
              <Text style={styles.emptyManageSubtitle}>
                Start building your event portfolio and showcase it to customers.
              </Text>
            </Pressable>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.manageScrollContent}
            >
              {manageableEvents.map((item) => {
                const imageUri = item.image_url || item.banner_url || "";
                const isImageLoading = imageLoadingStates[item.id] || false;
                return (
                  <Pressable
                    key={item.id}
                    style={styles.manageCard}
                    onPress={() => router.push(`/event/manage/${item.id}`)}
                  >
                    <View style={styles.imageContainer}>
                      {imageUri ? (
                        <>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.manageCardImage}
                            onLoadStart={() => handleImageLoadStart(item.id)}
                            onLoadEnd={() => handleImageLoadEnd(item.id)}
                            onError={() => handleImageLoadError(item.id)}
                          />
                          {isImageLoading && (
                            <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator color="#800000" size="large" />
                            </View>
                          )}
                        </>
                      ) : (
                        <Image
                          source={placeholderImage}
                          style={styles.manageCardImage}
                        />
                      )}
                    </View>
                    <View style={styles.manageCardContent}>
                      <Text style={styles.manageCardTitle}>{item.event}</Text>
                      {item.description ? (
                        <Text style={styles.manageCardDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : (
                        <Text style={styles.manageCardDescriptionMuted}>No description yet</Text>
                      )}
                      <View style={styles.manageCardFooter}>
                        <View style={[styles.manageStatusBadge, 
                          item.status === 'upcoming' && styles.statusUpcoming,
                          item.status === 'ongoing' && styles.statusOngoing
                        ]}>
                          <Text style={[styles.manageStatusText,
                            item.status === 'upcoming' && styles.statusUpcomingText,
                            item.status === 'ongoing' && styles.statusOngoingText
                          ]}>{item.status}</Text>
                        </View>
                        <Text style={styles.managePaymentText}>₹{item.payment?.toFixed(2) ?? "0.00"}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                style={[styles.manageCard, styles.manageAddMoreCard]}
                onPress={() => router.push("/event/manage/create")}
              >
                <View style={styles.manageAddIconWrapper}>
                  <Ionicons name="add-circle-outline" size={48} color="#800000" />
                </View>
                <Text style={styles.manageAddMoreText}>Add Event</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => router.push("/event")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#800000" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScrollContent}
          >
            {/* Upcoming Events Card */}
            <Pressable
              style={styles.eventCard}
              onPress={() => router.push("/event/upcomingEvents")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#80000015' }]}>
                <Ionicons name="calendar-outline" size={28} color="#800000" />
              </View>
              <Text style={styles.eventCardTitle}>Upcoming</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'upcoming').length}
              </Text>
              <Text style={styles.eventCardDescription}>
                Events scheduled ahead
              </Text>
            </Pressable>

            {/* Ongoing Events Card */}
            <Pressable
              style={styles.eventCard}
              onPress={() => router.push("/event/currentEvents")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#FF950015' }]}>
                <Ionicons name="time-outline" size={28} color="#FF9500" />
              </View>
              <Text style={styles.eventCardTitle}>Ongoing</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'ongoing').length}
              </Text>
              <Text style={styles.eventCardDescription}>
                Currently in progress
              </Text>
            </Pressable>

            {/* Completed Events Card */}
            <Pressable
              style={styles.eventCard}
              onPress={() => router.push("/profilePages/profileSettings/history_and_highlights/pastEvents")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#34C75915' }]}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#34C759" />
              </View>
              <Text style={styles.eventCardTitle}>Completed</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'completed').length}
              </Text>
              <Text style={styles.eventCardDescription}>
                Successfully delivered
              </Text>
            </Pressable>

            {/* All Events Card */}
            <Pressable
              style={styles.eventCard}
              onPress={() => router.push("/event")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#a8a29e15' }]}>
                <Ionicons name="grid-outline" size={28} color="#57534e" />
              </View>
              <Text style={styles.eventCardTitle}>All Events</Text>
              <Text style={styles.eventCardCount}>
                {events.length}
              </Text>
              <Text style={styles.eventCardDescription}>
                Complete history
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Requests Section */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <Pressable
            style={styles.requestsCard}
            onPress={() => router.push("/requests/menu")}
          >
            <View style={styles.requestsContent}>
              <View style={styles.requestsIconWrapper}>
                <Ionicons name="document-text-outline" size={22} color="#800000" />
              </View>
              <View style={styles.requestsText}>
                <Text style={styles.requestsTitle}>Pending Requests</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#800000" />
                ) : (
                  <Text style={styles.requestsCount}>{requests ?? 0} new</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
          </Pressable>

          {/* Event Inquiries Card */}
          <Pressable
            style={styles.requestsCard}
            onPress={() => router.push("/requests/inquiries")}
          >
            <View style={styles.requestsContent}>
              <View style={styles.requestsIconWrapper}>
                <Ionicons name="mail-outline" size={22} color="#800000" />
                {pendingInquiries > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {pendingInquiries > 99 ? '99+' : pendingInquiries}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.requestsText}>
                <Text style={styles.requestsTitle}>Event Inquiries</Text>
                <Text style={styles.requestsCount}>
                  {pendingInquiries} pending
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {events.filter(e => {
                  const eventDate = new Date(e.start_date);
                  const currentDate = new Date();
                  return eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => router.push("/profilePages/profileSettings/history_and_highlights/pastReviews")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#800000" />
            </Pressable>
          </View>

          {recentReviews.length === 0 ? (
            <View style={styles.emptyReviewsCard}>
              <Ionicons name="star-outline" size={44} color="#FFC13C" />
              <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
              <Text style={styles.emptyReviewsSubtitle}>
                Customer reviews will appear here after completed events
              </Text>
            </View>
          ) : (
            <>
              {/* Reviews Stats */}
              <View style={styles.reviewsStatsCard}>
                <View style={styles.reviewsRating}>
                  <Text style={styles.reviewsRatingNumber}>{reviewStats.averageRating || '—'}</Text>
                  <View style={styles.reviewsStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={reviewStats.averageRating >= star ? "star" : reviewStats.averageRating >= star - 0.5 ? "star-half" : "star-outline"}
                        size={20}
                        color="#FFC13C"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewsCountText}>{reviewStats.totalReviews} reviews</Text>
                </View>
              </View>

              {/* Recent Reviews List */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reviewsScrollContent}
              >
                {recentReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerInitial}>
                            {review.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>{review.customer_name}</Text>
                          <Text style={styles.reviewEventName}>{review.event_name || 'Event'}</Text>
                        </View>
                      </View>
                      <View style={styles.reviewRatingBadge}>
                        <Ionicons name="star" size={14} color="#FFC13C" />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    {review.review && (
                      <Text style={styles.reviewText} numberOfLines={3}>
                        "{review.review}"
                      </Text>
                    )}
                    {review.verified_booking && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                        <Text style={styles.verifiedText}>Verified Booking</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 28,
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
    resizeMode: 'cover',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  // Calendar Section - FOCAL POINT with premium treatment
  calendarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 56,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.04)',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
  },
  calendarLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  calendarWrapper: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    paddingTop: 8,
  },
  eventsSection: {
    marginBottom: 56,
    marginLeft: -28,
    marginRight: -28,
    overflow: 'visible',
  },
  manageSection: {
    marginBottom: 56,
    marginLeft: -28,
    marginRight: -28,
    overflow: 'visible',
  },
  manageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 28,
    paddingRight: 28,
    minHeight: 48,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#800000',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyManageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    marginHorizontal: 28,
  },
  emptyManageTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
  },
  emptyManageSubtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  manageScrollContent: {
    paddingLeft: 28,
    paddingRight: 28,
    paddingVertical: 10,
  },
  manageCard: {
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    marginRight: 18,
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#faf8f5',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 252, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageCardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  manageCardContent: {
    padding: 24,
    gap: 12,
  },
  manageCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  manageCardDescription: {
    fontSize: 14,
    color: '#57534e',
    lineHeight: 22,
    fontWeight: '400',
  },
  manageCardDescriptionMuted: {
    fontSize: 14,
    color: '#a8a29e',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  manageCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.06)',
  },
  manageStatusBadge: {
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  manageStatusText: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#57534e',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statusUpcoming: {
    backgroundColor: '#007AFF10',
  },
  statusUpcomingText: {
    color: '#007AFF',
  },
  statusOngoing: {
    backgroundColor: '#FF950010',
  },
  statusOngoingText: {
    color: '#FF9500',
  },
  managePaymentText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.3,
  },
  manageAddMoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(128, 0, 0, 0.02)',
  },
  manageAddIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  manageAddMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#800000',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 28,
    paddingRight: 28,
    minHeight: 48,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(128, 0, 0, 0.06)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#800000',
    marginRight: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  eventsScrollContent: {
    paddingLeft: 28,
    paddingRight: 28,
    paddingVertical: 10,
  },
  eventCard: {
    width: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 26,
    marginRight: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  eventIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  eventCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  eventCardCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#800000',
    marginBottom: 12,
    letterSpacing: -1.2,
  },
  eventCardDescription: {
    fontSize: 13,
    color: '#57534e',
    lineHeight: 19,
    fontWeight: '400',
  },
  requestsSection: {
    marginBottom: 56,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  requestsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 22,
    padding: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  requestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestsIconWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(128, 0, 0, 0.08)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#faf8f5',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  requestsText: {
    marginLeft: 18,
    flex: 1,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  requestsCount: {
    fontSize: 14,
    color: '#57534e',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 56,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#800000',
    marginBottom: 10,
    letterSpacing: -1.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#57534e',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Reviews Section Styles
  reviewsSection: {
    marginBottom: 56,
    marginLeft: -28,
    marginRight: -28,
    overflow: 'visible',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingLeft: 28,
    paddingRight: 28,
  },
  emptyReviewsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    marginHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyReviewsTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
  },
  emptyReviewsSubtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  reviewsStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 36,
    marginHorizontal: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  reviewsRating: {
    alignItems: 'center',
  },
  reviewsRatingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -2,
  },
  reviewsStarsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 12,
  },
  reviewsCountText: {
    fontSize: 13,
    color: '#57534e',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  reviewsScrollContent: {
    paddingLeft: 28,
    paddingRight: 28,
  },
  reviewCard: {
    width: 310,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 24,
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFC13C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 60, 0.2)',
  },
  reviewerInitial: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.1,
  },
  reviewEventName: {
    fontSize: 12,
    color: '#57534e',
    marginTop: 3,
    fontWeight: '500',
  },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 60, 0.2)',
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
    marginLeft: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#292524',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.06)',
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default Home;