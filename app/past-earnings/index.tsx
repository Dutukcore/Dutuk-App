import { useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";

const PastEarnings = () => {
    const { orders, fetchOrders } = useVendorStore(useShallow((state) => ({
        orders: state.orders,
        fetchOrders: state.fetchOrders,
    })));

    const [loading, setLoading] = useState(!orders || orders.length === 0);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                await fetchOrders();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Filter for completed/paid orders only for earnings
    const earningsData = orders.filter(o => o.status === 'completed' || o.payment > 0);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderTitle}>{item.title}</Text>
                <Text style={styles.amount}>₹{item.payment.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>PAID</Text>
                </View>
            </View>
        </View>
    ), []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1c1917" />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>Past Earnings</Text>
                    <Text style={styles.headerSubtitle}>History of your successful payouts</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={earningsData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No earnings yet</Text>
                            <Text style={styles.emptyText}>Your income from completed services will appear here.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    backButton: { marginRight: 15, padding: 8, backgroundColor: '#F3F4F6', borderRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
    headerSubtitle: { fontSize: 13, color: '#6B7280' },
    listContent: { padding: 16 },
    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    orderTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
    amount: { fontSize: 18, fontWeight: '800', color: '#166534' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 13, color: '#9CA3AF' },
    statusBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700', color: '#166534' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, marginTop: 8 }
});

export default PastEarnings;
