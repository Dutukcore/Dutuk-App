import getCurrentEvents from "@/hooks/getCurrentEvents";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

type Event = {
  id: string;
  event: string;
  start_date: string;
  end_date: string;
  payment: number;
  status: string;
  customer_name?: string;
  company_name: string;
};

const CurrentEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await getCurrentEvents();
    setEvents(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading current events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ongoing events</Text>
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.event}</Text>
            <Text style={styles.text}>
              <Ionicons name="calendar-outline" size={20} color="black" /> 
              {' '}{formatDate(item.start_date)} → {formatDate(item.end_date)}
            </Text>
            <Text style={styles.text}>
              <Ionicons name="cash-outline" size={20} color="black" />
              {' '}Total Cost: ₹{item.payment.toFixed(2)}
            </Text>
            <Text style={styles.text}>🟢 Status: {item.status}</Text>
            {item.customer_name && (
              <Text style={styles.text}>
                <Ionicons name="person-outline" size={20} color="black" />
                {' '}{item.customer_name}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", padding: 16 },
  centerContent: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#ffffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: "600" },
  text: { marginTop: 4, color: "#333" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default CurrentEvents;
