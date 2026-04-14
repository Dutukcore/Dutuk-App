import DisplayPayments from "@/features/profile/components/DisplayPayments";
import { useVendorStore } from "@/store/useVendorStore";
import { View } from "react-native";

const PastPayments = () => {
    const data = useVendorStore((s) => s.payments);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayPayments payments={data} />
        </View>
    );
}

export default PastPayments;