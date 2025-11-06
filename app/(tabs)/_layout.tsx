import { Tabs } from "expo-router";
import React from "react";
import { Home, FileText, User } from 'react-native-feather';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          height: 80,
          paddingBottom: 16,
          paddingTop: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12.701,
          fontWeight: '400',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home 
              width={24} 
              height={24} 
              stroke={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <FileText 
              width={24} 
              height={24} 
              stroke={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User 
              width={24} 
              height={24} 
              stroke={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }} 
      />
    </Tabs>
  );
}