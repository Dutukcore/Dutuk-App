import DisplayEvents from "@/features/events/components/DisplayEvents";
import { useCompletedEvents } from "@/store/useVendorStore";
import { View } from "react-native";

const PastEvents = () => {
    const data = useCompletedEvents();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayEvents events={data} />
        </View>
    );
}

export default PastEvents;