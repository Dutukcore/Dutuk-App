import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const EventPage = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Manage all your events</Text>
      </View>
      
      <View style={styles.content}>
        <Pressable 
          style={styles.card} 
          onPress={() => router.push("/event/upcomingEvents")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#80000015' }]}>
            <Ionicons name="calendar-outline" size={28} color="#800000" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Upcoming Events</Text>
            <Text style={styles.cardDescription}>View future scheduled events</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
        </Pressable>

        <Pressable 
          style={styles.card} 
          onPress={() => router.push("/event/currentEvents")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FF950015' }]}>
            <Ionicons name="time-outline" size={28} color="#FF9500" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Current Events</Text>
            <Text style={styles.cardDescription}>Events in progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
        </Pressable>

        <Pressable 
          style={styles.card} 
          onPress={() => router.push("/event/pastEvents")}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#34C75915' }]}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#34C759" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Past Events</Text>
            <Text style={styles.cardDescription}>Completed event history</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
        </Pressable>
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
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
  },
  content: {
    paddingHorizontal: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#57534e',
    fontWeight: '400',
  },
});

export default EventPage;