import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ChatSupportScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>

        <View style={styles.titleRow}>
          <Ionicons name="chatbubbles-outline" size={22} color="black" />
          <Text style={styles.headerText}>Chat Support</Text>
        </View>
      </View>

      {/* Centered Coming Soon */}
      <View style={styles.centerContent}>
        <Ionicons name="chatbubbles-outline" size={80} color="#CCCCCC" />
        <Text style={styles.soonText}>Chat Support – Coming Soon!</Text>
        <Text style={styles.subText}>
          We're working on bringing you instant support through chat.
        </Text>
      </View>
    </View>
  );
};

export default ChatSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  backButton: {
    paddingRight: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 8,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  soonText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },

  subText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginTop: 5,
  },
});
