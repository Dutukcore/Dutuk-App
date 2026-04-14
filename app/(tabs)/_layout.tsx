import BottomNavigation from "@/components/layout/BottomNavigation";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        const { state } = props;
        const currentRoute = state.routes[state.index].name as any;
        return <BottomNavigation activeTab={currentRoute} />;
      }}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        lazy: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="quotations"
        options={{
          title: 'Quotations',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          href: null,
        }}
      />
    </Tabs>
  );
}