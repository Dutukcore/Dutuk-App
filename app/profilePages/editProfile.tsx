import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const EditProfileScreen = () => {
  const name = "The Event Company";
  const tagline = `"We plan, you party." 🎉🥳`;
  const description = `"We plan, you party." 🎉🥳 from scratch`;
  const address = "No 5, 100 feet road,  Velachery, Chennai";
  const phone = "908002915424";
  const avatar =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="chevron-back" size={26} style={styles.backIcon} />
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      {/* Profile Row */}
      <View style={styles.avatarRow}>
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.profileInfo}>
          <Text style={styles.companyName}>{name}</Text>
          <Text style={styles.tagline}>{tagline}</Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Change Profile</Text>
            </Pressable>

            <Pressable style={styles.outlinedBtn}>
              <Text style={styles.outlinedBtnText}>Customize Banner</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Basic Info</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.textarea} value={description} multiline />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} />

        <Text style={styles.label}>Phone number</Text>
        <TextInput style={styles.input} value={phone} />

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  backIcon: {
    marginRight: 10,
  },

  headerText: {
    fontSize: 26,
    fontWeight: "700",
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  tagline: {
    fontSize: 13,
    color: "#444",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  primaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "black",
  },

  primaryBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  outlinedBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
  },

  outlinedBtnText: {
    color: "black",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 15,
  },

  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },

  textarea: {
    height: 90,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },

  saveButton: {
    marginTop: 25,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
