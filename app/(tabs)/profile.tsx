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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Background */}
        <View style={styles.headerBackground}>
          <View style={styles.headerGradient} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image - FOCAL POINT */}
          <Pressable style={styles.profileImageContainer} onPress={() => {
        router.push('/profilePages/editProfile');
          }}>
            <Image
              source={{ uri: companyData.logoUrl }}
              style={styles.profileImage}
            />
            <View style={styles.profileImageBorder} />
          </Pressable>

          {/* Company Info */}
          <Text style={styles.companyName}>
            {companyData.name || "No name"}
          </Text>
          <Text style={styles.companyTagline}>
            {companyData.description || "No description"}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]} 
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
              <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={22} color="#FF3030" />
            </View>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerBackground: {
    height: 180,
    marginBottom: 0,
  },
  headerGradient: {
    flex: 1,
    backgroundColor: '#800000',
    opacity: 0.05,
  },
  profileSection: {
    backgroundColor: '#faf8f5',
    paddingHorizontal: 28,
    paddingTop: 0,
    paddingBottom: 36,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: -60,
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
  },
  profileImageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#faf8f5',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#800000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  companyTagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    marginHorizontal: 28,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.04)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(128, 0, 0, 0.08)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#a8a29e',
  },
  logoutContainer: {
    marginHorizontal: 28,
    marginBottom: 28,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 48, 48, 0.2)',
    shadowColor: '#FF3030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logoutIconContainer: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3030',
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;