import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const DocumentVerificationScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>

        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={22}
            color="black"
          />
          <Text style={styles.headerText}>Document Verification</Text>
        </View>
      </View>

      {/* Centered Coming Soon */}
      <View style={styles.centerContent}>
        <Text style={styles.soonText}>Coming Soon</Text>
      </View>
    </View>
  );
};

export default DocumentVerificationScreen;

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
  },

  soonText: {
    fontSize: 22,
    color: "gray",
  },
});
