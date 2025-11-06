import upcomingEvents from "@/dummy_data/upcomingEvents";
import { FlatList, StyleSheet, Text, View } from "react-native";

const UpcomingEvents = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={upcomingEvents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>

            <View style={styles.footerRow}>
              <View style={styles.row}>
                <Text>📅</Text>
                <Text style={styles.footerText}>{item.from}</Text>
              </View>
              <View style={styles.row}>
                <Text>➡️</Text>
                
                <Text style={styles.footerText}>{item.to}</Text>
              </View>
            </View>

            <Text style={styles.info}>💰 Estimated Cost: ₹{item.cost}</Text>
            <Text style={styles.info}>🔮 Expectations: {item.expectation}</Text>
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