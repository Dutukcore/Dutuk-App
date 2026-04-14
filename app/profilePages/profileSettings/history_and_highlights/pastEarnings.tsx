import DisplayEarnings from "@/features/profile/components/DisplayEarnings";
import { useVendorStore } from "@/store/useVendorStore";
import { View } from "react-native";

const PastEarnings = () => {
    const data = useVendorStore((s) => s.earnings);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayEarnings earnings={data} />
        </View>
    );
}

export default PastEarnings;