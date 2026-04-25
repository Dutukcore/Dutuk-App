import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Your Services", headerShown: false }} />
            <Stack.Screen name="manage/create" options={{ title: "Create Service", headerShown: false }} />
            <Stack.Screen name="manage/createStepOne" options={{ title: "Create Service Step 1", headerShown: false }} />
            <Stack.Screen name="manage/createStepTwo" options={{ title: "Create Service Step 2", headerShown: false }} />
            <Stack.Screen name="manage/[eventId]" options={{ title: "Manage Service", headerShown: false }} />
        </Stack>
    );
};
export default Layout;