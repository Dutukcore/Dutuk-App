import { supabase } from "@/utils/supabase";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import BottomNavigation from '../../components/BottomNavigation';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => router.push('/editProfile' as any)
    },
    {
      icon: 'document-text-outline',
      title: 'Document Verification',
      onPress: () => router.push('/documentVerification' as any)
    },
    {
      icon: 'time-outline',
      title: 'History',
      onPress: () => router.push('/history' as any)
    },
    {
      icon: 'help-circle-outline',
      title: 'Help Center',
      onPress: () => router.push('/helpCenter' as any)
    }
  ];

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
        router.replace('/auth/UserLogin');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom } // Account for bottom nav (80px) + safe area + extra space
        ]}
        showsVerticalScrollIndicator={false}
      >
        <>
        {/* Header Background */}
        <View style={styles.headerBackground}>
          <Pressable style={styles.bannerPlaceholder} onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Image upload feature will be available soon'
            });
          }}>
            <Ionicons name="image-outline" size={40} color="#CCCCCC" />
            <Text style={styles.bannerPlaceholderText}>Add Cover Photo</Text>
          </Pressable>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <Pressable style={styles.profileImageContainer} onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Profile image upload will be available soon'
            });
          }}>
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person-outline" size={40} color="#CCCCCC" />
            </View>
          </Pressable>

          {/* Company Info */}
          <Text style={styles.companyName}>Your Company Name</Text>
          <Text style={styles.companyTagline}>Add your company tagline here</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color="#000000" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17.59} color="#000000" />
            </Pressable>
          ))}

          {/* Logout Item */}
          <Pressable style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={21} color="#FF3030" />
              <Text style={[styles.menuItemText, { color: '#FF3030' }]}>Log out</Text>
            </View>
            <Ionicons name="chevron-forward" size={17.59} color="#FF0000" />
          </Pressable>
        </View>
        </>
      </ScrollView>

      {/* Bottom Navigation - Fixed */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigation activeTab="profile" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding to allow scrolling past bottom navigation (80px nav + 40px extra)
  },
  bottomNavContainer: {
    backgroundColor: '#F3F3F3',
    paddingTop: 10,
  },
  headerBackground: {
    height: 166,
    marginHorizontal: -14,
  },
  bannerPlaceholder: {
    width: 425,
    height: 166,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    marginTop: 8,
  },
  profileSection: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 35,
    paddingTop: 0,
    paddingBottom: 30,
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    width: 101,
    height: 101,
    borderRadius: 50.5,
    borderWidth: 3,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginTop: -50,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 26.3272,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 8,
  },
  companyTagline: {
    fontSize: 15.612,
    fontWeight: '300',
    color: '#000000',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 27,
    paddingVertical: 10,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16.3083,
    fontWeight: '300',
    color: '#000000',
    marginLeft: 28,
  },

});

export default ProfileScreen;