import { useOrderNotifications } from '@/hooks/OrderNotificationContext';
import { Tabs } from "expo-router";
import { Text, View } from 'react-native';
import { FileText, Home, MessageCircle, User } from 'react-native-feather';

// Custom tab icon with badge for orders
function OrdersTabIcon({ color, focused, badgeCount }: { color: string; focused: boolean; badgeCount: number }) {
  return (
    <View style={{ position: 'relative' }}>
      <FileText
        width={24}
        height={24}
        stroke={color}
        strokeWidth={focused ? 2.5 : 2}
      />
      {badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -10,
            backgroundColor: '#FF3B30',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { newOrderCount, markOrdersAsSeen } = useOrderNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarActiveTintColor: '#7C2A2A',
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
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
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
            <OrdersTabIcon color={color} focused={focused} badgeCount={newOrderCount} />
          ),
        }}
        listeners={{
          tabPress: () => {
            // Clear notification count when orders tab is pressed
            markOrdersAsSeen();
          },
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