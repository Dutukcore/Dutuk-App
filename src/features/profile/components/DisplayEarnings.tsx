import { ScrollView, StyleSheet, Text, View } from 'react-native';

type EarningProp = {
    id: string;
    vendor_id: string;
    event_id?: string;
    event_name?: string;
    amount: number;
    earning_date: string;
    payment_id?: string;
    notes?: string;
    created_at: string;
};

type EarningsProp = {
    earnings: EarningProp[];
};

const DisplayEarnings = ({ earnings }: EarningsProp) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <ScrollView style={styles.container}>
            {earnings.length === 0 ? (
                <Text style={styles.noEarningsText}>No past earnings to display.</Text>
            ) : (
                earnings.map((earning, index) => {
                    return (
                        <View key={earning.id || index} style={styles.card}>
                            <Text style={styles.eventName}>
                                {earning.event_name || 'Unnamed Event'}
                            </Text>

                            <View style={styles.netEarningsRow}>
                                <Text style={styles.netEarningsLabel}>Earnings:</Text>
                                <Text style={styles.netEarningsAmount}>
                                    ₹{earning.amount.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.separator} />

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Date: </Text>
                                {formatDate(earning.earning_date)}
                            </Text>

                            {earning.notes && (
                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Notes: </Text>
                                    {earning.notes}
                                </Text>
                            )}

                            {earning.event_id && (
                                <Text style={styles.eventDate}>
                                    Event ID: {earning.event_id.substring(0, 8)}...
                                </Text>
                            )}
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F7FCF7', // Very light green-grey background
        padding: 15,
    },
    card: {
        backgroundColor: '#FFFFFF', // Pure white cards
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Android shadow
        borderWidth: 1,
        borderColor: '#E6F0E6', // Subtle light green border
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50', // Dark blue-grey for main titles
        marginBottom: 5,
    },
    serviceText: {
        fontSize: 15,
        color: '#607D8B', // Medium grey for secondary info
        marginBottom: 10,
    },
    detailText: {
        fontSize: 15,
        color: '#495057',
        lineHeight: 20,
    },
    label: {
        fontWeight: '600',
        color: '#34495E',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap', // Allow wrapping if space is tight
    },
    grossAmount: {
        fontWeight: 'bold',
        color: '#1A6B3D', // Strong green for gross
    },
    commissionText: {
        fontWeight: 'bold',
        color: '#D35400', // Orange for commission (negative impact)
    },
    netEarningsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#EBF5EE', // Light background for net earnings row
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    netEarningsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A6B3D', // Dark green
    },
    netEarningsAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28A745', // Bright green for net earnings
    },
    separator: {
        height: 1,
        backgroundColor: '#ECEFF1',
        marginVertical: 15,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    statusText: {
        fontWeight: 'bold',
    },
    statusFullyPaid: {
        color: '#28A745', // Green
    },
    statusPartiallyPaid: {
        color: '#FFC107', // Amber
    },
    statusUnpaid: {
        color: '#DC3545', // Red
    },
    outstandingAmount: {
        fontWeight: 'bold',
        color: '#DC3545', // Red for outstanding
    },
    invoiceText: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 5,
    },
    eventDate: {
        fontSize: 13,
        color: '#9E9E9E',
        textAlign: 'right',
        marginTop: 5,
    },
    noEarningsText: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
});

export default DisplayEarnings;