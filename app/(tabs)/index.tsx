import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Bell, Calendar, User } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/BottomNavigation';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left Icons Group */}
          <View style={styles.leftIconsGroup}>
            {/* Notification Bell */}
            <Pressable style={styles.headerIcon}>
              <Bell width={24} height={24} stroke="#000000" />
            </Pressable>
            
            {/* Calendar Icon */}
            <Pressable style={styles.headerIcon}>
              <Calendar width={24} height={24} stroke="#000000" />
            </Pressable>
          </View>
          
          {/* Profile Icon */}
          <Pressable style={styles.profileIcon}>
            <View style={styles.profileImagePlaceholder}>
              <User width={24} height={24} stroke="#CCCCCC" />
            </View>
          </Pressable>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonSubtitle}>
            We're working hard to bring you an amazing experience.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for bottom navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 15,
  },
  leftIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  comingSoonSubtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'Inter',
  },
});

export default HomeScreen;