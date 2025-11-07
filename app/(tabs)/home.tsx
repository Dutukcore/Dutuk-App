import getCount from "@/hooks/companyRequests/getRequestsCount";
import getUser from "@/hooks/getUser";
import getAllEvents from "@/hooks/getAllEvents";
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

type Event = {
  id: string;
  event: string;
  start_date: string;
  end_date: string;
  status: string;
  payment: number;
};

const Home = () => {
  const [requests, setRequests] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');

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
      
      // Create marked dates object for calendar
      const marked: any = {};
      allEvents.forEach((event: Event) => {
        const startDate = event.start_date?.split('T')[0];
        const endDate = event.end_date?.split('T')[0];
        
        if (startDate) {
          marked[startDate] = {
            marked: true,
            dotColor: event.status === 'upcoming' ? '#007AFF' : event.status === 'ongoing' ? '#FF9500' : '#34C759',
          };
        }
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      displayCount();
      loadEvents();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcons}>
            {/* Left group */}
            <View style={styles.leftIcons}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={28} color="#000000" />
              </Pressable>
              <Pressable style={styles.iconButton}  onPress={() => router.push("/profilePages/calender/CalendarPage")}>
                <Ionicons name="calendar-outline" size={28} color="#000000" />
              </Pressable>
            </View>

            {/* Right group */}
            <Pressable style={styles.profileIcon}  onPress={() => router.push("/profilePages/editProfile")}>
              <View style={styles.profileImagePlaceholder} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Home</Text>
          <Ionicons name="home" size={37} color="#000000" style={styles.titleIcon} />
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#000000',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#000000',
              textDisabledColor: '#d9e1e8',
              dotColor: '#007AFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#007AFF',
              monthTextColor: '#000000',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12
            }}
            style={styles.calendar}
          />
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
            <Pressable 
              style={styles.addMoreButton}
              onPress={() => router.push("/event")}
            >
              <Text style={styles.addMoreText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
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
              <View style={[styles.eventIconContainer, { backgroundColor: '#007AFF20' }]}>
                <Ionicons name="calendar-outline" size={32} color="#007AFF" />
              </View>
              <Text style={styles.eventCardTitle}>Upcoming Events</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'upcoming').length} events
              </Text>
              <Text style={styles.eventCardDescription}>
                Plan and prepare for your scheduled events
              </Text>
            </Pressable>

            {/* Ongoing Events Card */}
            <Pressable 
              style={styles.eventCard}
              onPress={() => router.push("/event/currentEvents")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#FF950020' }]}>
                <Ionicons name="time-outline" size={32} color="#FF9500" />
              </View>
              <Text style={styles.eventCardTitle}>Ongoing Events</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'ongoing').length} events
              </Text>
              <Text style={styles.eventCardDescription}>
                Events currently in progress
              </Text>
            </Pressable>

            {/* Completed Events Card */}
            <Pressable 
              style={styles.eventCard}
              onPress={() => router.push("/profilePages/profileSettings/history_and_highlights/pastEvents")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#34C75920' }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color="#34C759" />
              </View>
              <Text style={styles.eventCardTitle}>Completed</Text>
              <Text style={styles.eventCardCount}>
                {events.filter(e => e.status === 'completed').length} events
              </Text>
              <Text style={styles.eventCardDescription}>
                Successfully completed events
              </Text>
            </Pressable>

            {/* All Events Card */}
            <Pressable 
              style={styles.eventCard}
              onPress={() => router.push("/event")}
            >
              <View style={[styles.eventIconContainer, { backgroundColor: '#8E8E9320' }]}>
                <Ionicons name="grid-outline" size={32} color="#8E8E93" />
              </View>
              <Text style={styles.eventCardTitle}>All Events</Text>
              <Text style={styles.eventCardCount}>
                {events.length} total
              </Text>
              <Text style={styles.eventCardDescription}>
                View complete event history
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Requests Section */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable 
            style={styles.requestsCard} 
            onPress={() => router.push("/requests/menu")}
          >
            <View style={styles.requestsContent}>
              <Ionicons name="document-text-outline" size={24} color="#007AFF" />
              <View style={styles.requestsText}>
                <Text style={styles.requestsTitle}>Pending Requests</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.requestsCount}>{requests ?? 0} new requests</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length}
              </Text>
              <Text style={styles.statLabel}>Active Events</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 28,
    paddingBottom: 20,
    backgroundColor: '#F3F3F3',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginLeft: -30,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FEFEFE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FEFEFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#CCCCCC',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    color: '#000000',
    marginRight: 15,
  },
  titleIcon: {
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  calendarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 30,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 16,
    paddingBottom: 10,
  },
  eventsSection: {
    marginBottom: 30,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 4,
  },
  eventsScrollContent: {
    paddingRight: 28,
  },
  eventCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  eventCardCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 8,
  },
  eventCardDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  requestsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  requestsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestsText: {
    marginLeft: 15,
    flex: 1,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  requestsCount: {
    fontSize: 14,
    color: '#666666',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default Home;
