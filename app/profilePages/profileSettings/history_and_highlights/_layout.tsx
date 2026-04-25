import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTintColor: '#800000', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="index" options={{ title: "History", headerShown: true }} />
      <Stack.Screen name="pastEarnings" options={{ title: "Past Earnings", headerShown: true }} />
      <Stack.Screen name="pastEvents" options={{ title: "Past Services", headerShown: true }} />
      <Stack.Screen name="pastPayments" options={{ title: "Past Payments", headerShown: true }} />
      <Stack.Screen name="pastReviews" options={{ title: "Past Reviews", headerShown: false }} />
    </Stack>
  );
}
