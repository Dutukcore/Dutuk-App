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
        backgroundColor: '#faf8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: 'transparent',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#800000',
        letterSpacing: -0.5,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: 'transparent',
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(128, 0, 0, 0.08)',
    },
    filterTabActive: {
        backgroundColor: '#800000',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#800000',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterTextActive: {
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 28,
        paddingBottom: 48,
    },
    loader: {
        marginTop: 80,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginTop: 20,
        letterSpacing: -0.3,
    },
    emptyText: {
        fontSize: 14,
        color: '#57534e',
        marginTop: 12,
        fontWeight: '400',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        flex: 1,
        letterSpacing: -0.3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#57534e',
        fontWeight: '400',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 0, 0, 0.06)',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 20,
    },
    rejectButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    acceptButton: {
        backgroundColor: '#800000',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    rejectText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF3B30',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

const badgeStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
});

export default InquiriesScreen;
