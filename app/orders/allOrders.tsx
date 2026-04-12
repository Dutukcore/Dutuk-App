import { useVendorStore } from '@/store/useVendorStore';
import logger from '@/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const StatusBadge = ({ status }: { status: string }) => {
    const badgeConfigs = {
        pending: { bg: 'rgba(128, 0, 0, 0.08)', text: '#800000' },
        approved: { bg: '#34C75915', text: '#34C759' },
        completed: { bg: '#1c1917', text: '#FFFFFF' },
        rejected: { bg: '#FF3B30', text: '#FFFFFF' }
    };
    const config = (badgeConfigs as any)[status] || badgeConfigs.pending;
    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.text }]}>
                {status.toUpperCase()}
            </Text>
        </View>
    );
};

const AllOrdersScreen = () => {
    const orders = useVendorStore((s) => s.orders);
    const loading = useVendorStore((s) => s.ordersLoading);
    const fetchAll = useVendorStore((s) => s.fetchAll);

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchAll();
        } catch (error) {
            logger.error('Failed to refresh orders:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to refresh orders. Please try again.'
            });
        } finally {
            setRefreshing(false);
        }
    }, [fetchAll]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1c1917" />
                </Pressable>
                <Text style={styles.headerTitle}>All Orders</Text>
                <View style={{ width: 44 }} /> {/* Spacing for alignment */}
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListHeaderComponent={(
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            Total {orders.length} orders
                        </Text>
                    </View>
                )}
                ListEmptyComponent={(
                    loading ? (
                        <View style={styles.emptyStateContainer}>
                            <ActivityIndicator size="large" color="#800000" />
                            <Text style={styles.loadingText}>Loading orders...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="file-tray-outline" size={64} color="#e7e5e4" />
                            <Text style={styles.emptyStateTitle}>No Orders Found</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                You don't have any bookings at the moment.
                            </Text>
                        </View>
                    )
                )}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.orderCard}
                        onPress={() => router.push({
                            pathname: item.status === 'pending' ? '/orders/customerApproval' : '/orders/customerDetails',
                            params: {
                                orderId: item.id,
                                title: item.title,
                                customerName: item.customerName,
                                packageType: item.packageType,
                                customerEmail: item.customerEmail,
                                customerPhone: item.customerPhone,
                                eventDate: item.date,
                                notes: item.notes ?? '',
                            }
                        })}
                    >
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.orderIdLabel}>ORDER</Text>
                                <Text style={styles.orderId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
                            </View>
                            <StatusBadge status={item.status} />
                        </View>

                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text style={styles.customerName}>{item.customerName}</Text>

                        <View style={styles.cardFooter}>
                            <View style={styles.dateContainer}>
                                <Ionicons name="calendar-outline" size={16} color="#57534e" />
                                <Text style={styles.dateText}>{item.date}</Text>
                            </View>
                            {item.amount && (
                                <Text style={styles.amountText}>₹{item.amount}</Text>
                            )}
                        </View>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 0, 0, 0.04)',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.08)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#800000',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryContainer: {
        marginBottom: 20,
    },
    summaryText: {
        fontSize: 14,
        color: '#57534e',
        fontWeight: '600',
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderIdLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#a8a29e',
        letterSpacing: 1,
        marginBottom: 2,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1917',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 6,
    },
    customerName: {
        fontSize: 14,
        color: '#57534e',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 0, 0, 0.04)',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#1c1917',
        fontWeight: '500',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#800000',
    },
    emptyStateContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#57534e',
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginTop: 16,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#57534e',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default AllOrdersScreen;
