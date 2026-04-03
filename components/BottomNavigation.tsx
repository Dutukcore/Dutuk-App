import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Calendar, Home, MessageCircle, Plus, User } from 'react-native-feather';

interface BottomNavigationProps {
  activeTab: 'home' | 'orders' | 'chat' | 'profile' | 'calendar';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab }) => {
  const handleHome = () => router.replace('/(tabs)/home' as any);
  const handleOrders = () => {
    if (activeTab !== 'orders') router.replace('/(tabs)/orders' as any);
  };
  const handleProfile = () => {
    if (activeTab !== 'profile') router.replace('/(tabs)/profile' as any);
  };
  const handleCreateEvent = () => {
    router.push('/event/manage/createStepOne' as any);
  };

  return (
    <View style={styles.bottomNavbar}>
      {/* Home */}
      <Pressable style={styles.navItem} onPress={handleHome}>
        <Home
          width={24}
          height={24}
          stroke={activeTab === 'home' ? "#800000" : "#a8a29e"}
        />
        <Text style={[styles.navLabel, { color: activeTab === 'home' ? '#800000' : '#a8a29e' }]}>
          Home
        </Text>
      </Pressable>

      {/* Chat */}
      <Pressable style={styles.navItem} onPress={() => router.replace('/(tabs)/chat' as any)}>
        <MessageCircle
          width={24}
          height={24}
          stroke={activeTab === 'chat' ? "#800000" : "#a8a29e"}
        />
        <Text style={[styles.navLabel, { color: activeTab === 'chat' ? '#800000' : '#a8a29e' }]}>
          Chat
        </Text>
      </Pressable>

      {/* CENTER PLUS BUTTON - ELEVATED via FLEX */}
      <View style={styles.plusContainer}>
        <Pressable
          style={styles.centerPlusButton}
          onPress={handleCreateEvent}
          data-testid="create-event-plus-button"
        >
          <View style={styles.plusIconContainer}>
            <Plus width={28} height={28} stroke="#FFFFFF" strokeWidth={3} />
          </View>
        </Pressable>
      </View>

      {/* Calendar */}
      <Pressable style={styles.navItem} onPress={() => router.replace('/(tabs)/calendar' as any)}>
        <Calendar
          width={24}
          height={24}
          stroke={activeTab === 'calendar' ? "#800000" : "#a8a29e"}
        />
        <Text style={[styles.navLabel, { color: activeTab === 'calendar' ? '#800000' : '#a8a29e' }]}>
          Calendar
        </Text>
      </Pressable>

      {/* Profile */}
      <Pressable style={styles.navItem} onPress={handleProfile}>
        <User
          width={24}
          height={24}
          stroke={activeTab === 'profile' ? "#800000" : "#a8a29e"}
        />
        <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#800000' : '#a8a29e' }]}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    paddingHorizontal: 8, // Reduced padding for better item spacing
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#a8a29e',
    marginTop: 4,
  },
  plusContainer: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlusButton: {
    marginTop: -48, // Elevate it above the bar
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  plusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});

export default BottomNavigation;