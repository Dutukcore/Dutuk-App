import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{title:"History"}} />
        <Stack.Screen name="pastEarnings" options={{title:"Past Earnings"}} />
        <Stack.Screen name="pastEvents" options={{title:"Past Events"}} />
        <Stack.Screen name="pastPayments" options={{title:"Past Payments"}} />
        <Stack.Screen name="pastReviews" options={{title:"Past Reviews"}} />
    </Stack>
  );
}
