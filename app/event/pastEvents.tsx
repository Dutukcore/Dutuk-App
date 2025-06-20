import pastEvents from "@/dummy_data/pastEvents";
import { FlatList, StyleSheet, Text, View } from "react-native";

const PastEvents = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={pastEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>📅 {item.from} → {item.to}</Text>
            <Text style={styles.text}>💰 Total Cost: ₹{item.cost}</Text>
            <Text style={styles.text}>✅ Outcome: {item.outcome}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", padding: 16 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#F8D7DA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: "600" },
  text: { marginTop: 4, color: "#333" },
});

export default PastEvents;
