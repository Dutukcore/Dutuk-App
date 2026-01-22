import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { FileText, Home, User } from 'react-native-feather';

interface BottomNavigationProps {
  activeTab: 'home' | 'orders' | 'profile';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab }) => {
  const handleHome = () => router.replace('/(tabs)/home' as any);
  const handleOrders = () => {
    if (activeTab !== 'orders') router.replace('/(tabs)/orders' as any);
  };
  const handleProfile = () => {
    if (activeTab !== 'profile') router.replace('/(tabs)/profile' as any);
  };

  return (
    <View style={styles.bottomNavbar}>
      <Pressable 
        style={styles.navItem} 
        onPress={handleHome}
      >
        <Home 
          width={24} 
          height={24} 
          stroke={activeTab === 'home' ? "#800000" : "#a8a29e"} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'home' ? '#800000' : '#a8a29e' }
        ]}>
          Home
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.navItem} 
        onPress={handleOrders}
      >
        <FileText 
          width={24} 
          height={24} 
          stroke={activeTab === 'orders' ? "#800000" : "#a8a29e"} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'orders' ? '#800000' : '#a8a29e' }
        ]}>
          Orders
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.navItem} 
        onPress={handleProfile}
      >
        <User 
          width={24} 
          height={24} 
          stroke={activeTab === 'profile' ? "#800000" : "#a8a29e"} 
        />
        <Text style={[
          styles.navLabel, 
          { color: activeTab === 'profile' ? '#800000' : '#a8a29e' }
        ]}>
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 4,
  },
  navLabel: {
    fontSize: 12.701,
    fontWeight: '400',
    color: '#a8a29e',
    marginTop: 4,
  },
});

export default BottomNavigation;