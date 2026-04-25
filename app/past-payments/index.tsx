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

const PastPayments = () => {
    // This is a placeholder as the real payment transaction table might be different
    const { orders, fetchOrders } = useVendorStore(useShallow((state) => ({
        orders: state.orders,
        fetchOrders: state.fetchOrders,
    })));

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                await fetchOrders();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="receipt-outline" size={24} color="#800000" />
            </View>
            <View style={styles.details}>
                <Text style={styles.serviceName}>{item.title}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.amount}>₹{item.payment.toLocaleString('en-IN')}</Text>
                <Text style={styles.successText}>Successful</Text>
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
                    <Text style={styles.headerTitle}>Transaction History</Text>
                    <Text style={styles.headerSubtitle}>Manage your payments and receipts</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={orders.filter(o => o.payment > 0)}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="card-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No payments yet</Text>
                            <Text style={styles.emptyText}>Detailed payment transactions will appear here.</Text>
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
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#80000010',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    details: { flex: 1 },
    serviceName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    amountContainer: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '800', color: '#111827' },
    successText: { fontSize: 10, color: '#166534', fontWeight: '700', marginTop: 2 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, marginTop: 8 }
});

export default PastPayments;
