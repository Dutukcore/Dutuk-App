import getCompanyInfo from "@/hooks/useGetCompanyInfo";
import { supabase } from "@/utils/supabase";
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"
  });

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      onPress: () => router.push('/profilePages/editProfile')
    },
    {
      icon: 'briefcase-outline',
      title: 'Portfolio',
      subtitle: 'Showcase your work',
      onPress: () => router.push('/profilePages/portfolio')
    },
    {
      icon: 'document-text-outline',
      title: 'Document Verification',
      subtitle: 'Verify your credentials',
      onPress: () => router.push('/profilePages/documentVerificationScreen')
    },
    {
      icon: 'time-outline',
      title: 'History',
      subtitle: 'View past activities',
      onPress: () => router.push('/profilePages/historyScreen')
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Chat Support',
      subtitle: 'Get help from our team',
      onPress: () => router.push('/profilePages/chatSupport')
    },
  ];

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompanyInfo();
    }, [])
  );

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      const data = await getCompanyInfo();

      if (data) {
        setCompanyData({
          name: data.company?.trim() || "",
          description: data.description?.trim() || "",
          logoUrl: data.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"
        });
      }
    } catch (error) {
      console.error("Failed to load company info:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load company information.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to logout'
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logged out successfully'
        });
        // Redirect to welcome screen (consistent entry point)
        router.replace('/');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout'
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={{ marginTop: 16, color: '#57534e', fontSize: 15, fontWeight: '500' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Spacer - minimalist feel */}
        <View style={styles.headerSpacer} />

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Pressable
            style={styles.avatarContainer}
            onPress={() => {
              router.push("/profilePages/editProfile");
            }}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: companyData.logoUrl }}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={14} color="#FFF" />
              </View>
            </View>
          </Pressable>

          {/* Company Info */}
          <View style={styles.profileTextInfo}>
            <Text
              style={styles.companyName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {companyData.name || "No name"}
            </Text>
            <Text
              style={styles.companyTagline}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {companyData.description || "No description"}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionHeader}>Account & Settings</Text>
          <View style={styles.premiumCard}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={22} color="#800000" />
                  </View>
                  <View style={styles.menuItemTextContainer}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={22} color="#FF3030" />
            </View>
            <Text style={styles.logoutText}>Log out Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSpacer: {
    height: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    backgroundColor: "#800000",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  profileTextInfo: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#800000",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  companyTagline: {
    fontSize: 15,
    fontWeight: "500",
    color: "#57534e",
    textAlign: "center",
    lineHeight: 22,
  },
  menuContainer: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a8a29e",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  premiumCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(128, 0, 0, 0.04)",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 0, 0, 0.04)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: "rgba(128, 0, 0, 0.02)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(128, 0, 0, 0.08)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1917",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#a8a29e",
  },
  logoutContainer: {
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 48, 48, 0.1)",
    shadowColor: "#FF3030",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
    backgroundColor: "#fffafa",
  },
  logoutIconContainer: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF3030",
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;