import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type PaymentProp = {
    id: string;
    vendor_id: string;
    customer_id: string;
    customer_name?: string;
    event_id?: string;
    event_name?: string;
    amount: number;
    payment_method?: string;
    payment_status: string;
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
};

type PaymentsProp = {
    payments: PaymentProp[];
};

const DisplayPayments = ({ payments }: PaymentsProp) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })} at ${date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    };

    return (
        <ScrollView style={styles.container}>
            {payments.length === 0 ? (
                <Text style={styles.noPaymentsText}>No past payments to display.</Text>
            ) : (
                payments.map((payment, index) => {
                    return (
                        <View key={payment.id || index} style={styles.card}>
                            <Text style={styles.eventName}>
                                {payment.event_name || 'Payment'}
                            </Text>
                            
                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Customer: </Text>
                                {payment.customer_name || 'N/A'}
                            </Text>

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Amount: </Text>
                                <Text style={styles.amountText}>₹{payment.amount.toFixed(2)}</Text>
                            </Text>

                            <View style={styles.separator} />

                            {payment.payment_method && (
                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Method: </Text>
                                    {payment.payment_method}
                                </Text>
                            )}

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Status: </Text>
                                <Text style={[
                                    styles.statusText,
                                    payment.payment_status === 'completed' ? styles.statusSuccess : styles.statusOther
                                ]}>
                                    {payment.payment_status}
                                </Text>
                            </Text>

                            {payment.transaction_id && (
                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Transaction ID: </Text>
                                    {payment.transaction_id}
                                </Text>
                            )}

                            <Text style={styles.paymentDate}>
                                {payment.payment_date 
                                    ? `Paid on: ${formatDate(payment.payment_date)}`
                                    : `Created: ${formatDateTime(payment.created_at)}`
                                }
                            </Text>
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
        color: '#286047', // Dark green for main titles
        marginBottom: 8,
    },
    detailText: {
        fontSize: 15,
        color: '#4F6C5B', // Medium green-grey for details
        marginBottom: 4,
        lineHeight: 20,
    },
    label: {
        fontWeight: '600', // Slightly bolder for labels
        color: '#3A574A',
    },
    amountText: {
        fontWeight: 'bold',
        color: '#1E88E5', // Blue for amount
    },
    netReceiptText: {
        fontWeight: 'bold',
        color: '#2E7D32', // Darker green for net amount
    },
    separator: {
        height: 1,
        backgroundColor: '#DDEEDD', // Very light separator line
        marginVertical: 15,
    },
    statusText: {
        fontWeight: 'bold',
    },
    statusSuccess: {
        color: '#28A745', // Green for successful
    },
    statusOther: {
        color: '#FFC107', // Amber for other statuses like 'Pending'/'Failed' (though usually 'Successful' for past)
    },
    paymentDate: {
        fontSize: 13,
        color: '#888888', // Lighter grey for dates
        textAlign: 'right',
        marginTop: 5,
    },
    noPaymentsText: {
        fontSize: 16,
        color: '#7F8C8D', // Neutral grey for informative text
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
});

export default DisplayPayments;