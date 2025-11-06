import getCount from "@/hooks/companyRequests/getRequestsCount";
import getUser from "@/hooks/getUser";
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
  const [requests, setRequests] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      displayCount();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={32} color="#000000" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={31} color="#000000" />
          </Pressable>
          <View style={styles.profileIcon}>
            <View style={styles.profileImagePlaceholder} />
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Home</Text>
          <Ionicons name="home" size={37} color="#000000" style={styles.titleIcon} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={styles.actionCard}
            onPress={() => router.push("/profilePages/calender/CalendarPage")}
          >
            <Ionicons name="calendar-outline" size={40} color="#007AFF" />
            <Text style={styles.actionTitle}>Calendar</Text>
            <Text style={styles.actionSubtitle}>Manage your schedule</Text>
          </Pressable>

          <Pressable 
            style={styles.actionCard}
            onPress={() => router.push("/event")}
          >
            <Ionicons name="star-outline" size={40} color="#FF9500" />
            <Text style={styles.actionTitle}>Events</Text>
            <Text style={styles.actionSubtitle}>View all events</Text>
          </Pressable>
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
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Active Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
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
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FEFEFE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#CCCCCC',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
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
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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