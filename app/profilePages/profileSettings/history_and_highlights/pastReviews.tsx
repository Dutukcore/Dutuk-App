import DisplayReviews from "@/features/profile/components/DisplayReviews";
import { useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

const PastReviews = () => {
    const { reviews, fetchReviews } = useVendorStore(useShallow((state) => ({
        reviews: state.reviews,
        fetchReviews: state.fetchReviews
    })));

    const [loading, setLoading] = useState(!reviews || reviews.length === 0);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Don't await if we already have data
                if (reviews && reviews.length > 0) {
                    fetchReviews(); // Background refresh
                } else {
                    await fetchReviews();
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <View style={styles.safeArea}>
            {/* Fallback Header if native one is missing or non-interactive */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={20}>
                    <Ionicons name="chevron-back" size={28} color="#800000" />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                        <Text style={styles.loadingText}>Fetching your reviews...</Text>
                    </View>
                ) : (
                    <DisplayReviews reviews={reviews} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8EBF2',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    backText: {
        fontSize: 16,
        color: '#800000',
        marginLeft: 4,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#57534e',
    }
});

export default PastReviews;