import { Stack } from "expo-router";

const Layout = ()=>{
    return(
        <Stack>
            <Stack.Screen name="index" options={{title:"Events"}} />
            <Stack.Screen name="pastEvents" options={{title:"Past Events"}} />
            <Stack.Screen name="currentEvents" options={{title:"Current Events"}} />
            <Stack.Screen name="upcomingEvents" options={{title:"Upcoming Events"}} />
        </Stack>
    )
}
export default Layout;