import getPastEvents from "@/hooks/getPastEvents";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PastEvent = {
  id: string;
  event: string;
  customer_name?: string;
  start_date: string;
  end_date: string;
  payment?: number;
  status?: string;
};

const HistoryScreen = () => {
  const navigation = useNavigation();

  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPastEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);
    if (!start || !end || startLabel === endLabel) {
      return startLabel;
    }
    return `${startLabel} → ${endLabel}`;
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "No payment info";
    return `₹${value.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: PastEvent }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>{item.id}</Text>
        {item.status && <Text style={styles.status}>{item.status}</Text>}
      </View>

      <Text style={styles.cardTitle}>{item.event || "Untitled Event"}</Text>
      <Text style={styles.cardName}>{item.customer_name || "Unknown customer"}</Text>

      <View style={styles.footerRow}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color="black" />
          <Text style={styles.footerText}>{formatDateRange(item.start_date, item.end_date)}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="cash-outline" size={20} color="black" />
          <Text style={styles.footerText}>{formatCurrency(item.payment)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading past events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
         <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No past events</Text>
          </View>
        }
      />
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    padding: 16,
    paddingTop: 40,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  backArrow: {
    fontSize: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardId: {
    color: "gray",
  },
  status: {
    color: "#007AFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardName: {
    color: "gray",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#444",
  },
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

