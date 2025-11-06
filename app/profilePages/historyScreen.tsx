import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HistoryItem {
  id: string;
  title: string;
  name: string;
  date: string;
  time: string;
  rating: number;
}

const DATA: HistoryItem[] = [
  {
    id: "#55D90",
    title: "Birthday Party",
    name: "Praveen Kumar",
    date: "13-10-2025",
    time: "7:00am - 4pm",
    rating: 4.5,
  },
  {
    id: "#52D90",
    title: "Marriage Function",
    name: "Mohan Raj",
    date: "13-10-2025",
    time: "7:00am - 4pm",
    rating: 4.5,
  },
  {
    id: "#52D90-1",
    title: "Birthday Party",
    name: "Mark Antony",
    date: "13-10-2025",
    time: "7:00am - 4pm",
    rating: 4.0,
  },
];

export default function HistoryScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>{item.id}</Text>
        <Text style={styles.rating}>★ {item.rating}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardName}>{item.name}</Text>

      <View style={styles.footerRow}>
        <View style={styles.row}>
          <Text>📅</Text>
          <Text style={styles.footerText}>{item.date}</Text>
        </View>
        <View style={styles.row}>
          <Text>⏰</Text>
          <Text style={styles.footerText}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.header}>History</Text>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    padding: 16,
    paddingTop: 40,
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
  rating: {
    color: "red",
    fontWeight: "600",
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
});
