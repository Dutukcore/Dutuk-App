import {
    acceptInquiry,
    EventInquiry,
    getPendingInquiries,
    getVendorInquiries,
    rejectInquiry
} from "@/hooks/useEventInquiries";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InquiriesScreen = () => {
    const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'PENDING'>('PENDING');

    const loadInquiries = async () => {
        try {
            // Get vendor profile ID (user_profiles.id, not auth user id)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!profile) return;

            const data = filter === 'PENDING'
                ? await getPendingInquiries(profile.id)
                : await getVendorInquiries(profile.id);

            setInquiries(data);
        } catch (err) {
            console.error("Error loading inquiries:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadInquiries();
        }, [filter])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadInquiries();
    };

    const handleAccept = async (inquiry: EventInquiry) => {
        Alert.alert(
            "Accept Inquiry",
            `Accept booking for "${inquiry.planned_event?.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Accept",
                    style: "default",
                    onPress: async () => {
                        setActionLoading(inquiry.id);
                        const success = await acceptInquiry(inquiry.id);
                        setActionLoading(null);
                        if (success) {
                            Alert.alert("Success", "Inquiry accepted!");
                            loadInquiries();
                        } else {
                            Alert.alert("Error", "Failed to accept inquiry");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (inquiry: EventInquiry) => {
        Alert.alert(
            "Reject Inquiry",
            `Are you sure you want to reject this booking for "${inquiry.planned_event?.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        setActionLoading(inquiry.id);
                        const success = await rejectInquiry(inquiry.id);
                        setActionLoading(null);
                        if (success) {
                            Alert.alert("Done", "Inquiry rejected");
                            loadInquiries();
                        } else {
                            Alert.alert("Error", "Failed to reject inquiry");
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string }> = {
            PENDING: { bg: '#FEF3C7', text: '#D97706' },
            ACCEPTED: { bg: '#D1FAE5', text: '#059669' },
            REJECTED: { bg: '#FEE2E2', text: '#DC2626' },
            CONFIRMED: { bg: '#DBEAFE', text: '#2563EB' },
        };
        const style = styles[status] || styles.PENDING;
        return (
            <View style={[badgeStyles.badge, { backgroundColor: style.bg }]}>
                <Text style={[badgeStyles.text, { color: style.text }]}>{status}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerTitle}>Event Inquiries</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <Pressable
                    style={[styles.filterTab, filter === 'PENDING' && styles.filterTabActive]}
                    onPress={() => setFilter('PENDING')}
                >
                    <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
                        Pending
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
                    onPress={() => setFilter('ALL')}
                >
                    <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
                        All
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#4F0000" style={styles.loader} />
                ) : inquiries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="mail-open-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Inquiries</Text>
                        <Text style={styles.emptyText}>
                            {filter === 'PENDING'
                                ? "You don't have any pending inquiries"
                                : "No inquiries yet"}
                        </Text>
                    </View>
                ) : (
                    inquiries.map((inquiry) => (
                        <View key={inquiry.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.eventTitle}>
                                    {inquiry.planned_event?.title || 'Event'}
                                </Text>
                                {getStatusBadge(inquiry.status)}
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.infoText}>
                                    {inquiry.planned_event?.event_date
                                        ? formatDate(inquiry.planned_event.event_date)
                                        : 'Date TBD'}
                                </Text>
                            </View>

                            {inquiry.quoted_price && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="cash-outline" size={16} color="#666" />
                                    <Text style={styles.infoText}>
                                        ₹{Number(inquiry.quoted_price).toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            )}

                            {inquiry.status === 'PENDING' && (
                                <View style={styles.actionRow}>
                                    <Pressable
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleReject(inquiry)}
                                        disabled={actionLoading === inquiry.id}
                                    >
                                        {actionLoading === inquiry.id ? (
                                            <ActivityIndicator size="small" color="#DC2626" />
                                        ) : (
                                            <>
                                                <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                                                <Text style={styles.rejectText}>Reject</Text>
                                            </>
                                        )}
                                    </Pressable>

                                    <Pressable
                                        style={[styles.actionButton, styles.acceptButton]}
                                        onPress={() => handleAccept(inquiry)}
                                        disabled={actionLoading === inquiry.id}
                                    >
                                        {actionLoading === inquiry.id ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                                <Text style={styles.acceptText}>Accept</Text>
                                            </>
                                        )}
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    filterTabActive: {
        backgroundColor: '#4F0000',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loader: {
        marginTop: 60,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    rejectButton: {
        backgroundColor: '#FEE2E2',
    },
    acceptButton: {
        backgroundColor: '#4F0000',
    },
    rejectText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#DC2626',
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

const badgeStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default InquiriesScreen;
