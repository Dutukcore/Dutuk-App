import getUpcomingEvents from "@/hooks/getUpcomingEvents";
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
  description?: string;
  customer_name?: string;
  company_name: string;
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await getUpcomingEvents();
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
        <Text style={styles.loadingText}>Loading upcoming events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming events</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.event}</Text>

            <View style={styles.footerRow}>
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={20} color="black" />
                <Text style={styles.footerText}>{formatDate(item.start_date)}</Text>
                <Text>-</Text>
                <Text style={styles.footerText}>{formatDate(item.end_date)}</Text>
              </View>
            </View>

            <Text style={styles.info}>
              <Ionicons name="cash-outline" size={20} color="black" /> 
              {' '}Estimated Cost: ₹{item.payment.toFixed(2)}
            </Text>
            
            {item.customer_name && (
              <Text style={styles.info}>
                <Ionicons name="person-outline" size={20} color="black" /> 
                {' '}Customer: {item.customer_name}
              </Text>
            )}

            {item.description && (
              <Text style={styles.info}>
                <Ionicons name="information-circle-outline" size={20} color="black" /> 
                {' '}{item.description}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    padding: 16,
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  footerRow: {
    flexDirection: "column",      // ⬅️ stack vertically
    alignItems: "flex-start",     // ⬅️ left-aligned like bulletin notes
    gap: 6,                        // ⬅️ small spacing between items
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  footerText: {
    color: "#444",
  },

  info: {
    marginTop: 6,
    color: "#333",
  },
});


export default UpcomingEvents;