import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type PaymentProp = {
    paymentid: string;
    associatedbookingid: string;
    associatedeventname: string;
    paymentdate: string;
    amountpaid: number;
    paymentmethod: string;
    paymenttype: string;
    status: string;
    payername: string;
    vendornetreceipt?: number;
};

type PaymentsProp = {
    payments: PaymentProp[];
};

const DisplayPayments = ({ payments }: PaymentsProp) => {
    return (
        <ScrollView style={styles.container}>
            {payments.length === 0 ? (
                <Text style={styles.noPaymentsText}>No past payments to display.</Text>
            ) : (
                payments.map((payment, index) => {
                    const displayDate = new Date(payment.paymentdate);

                    return (
                        <View key={payment.paymentid || index} style={styles.card}>
                            <Text style={styles.eventName}>{payment.associatedeventname}</Text>
                            
                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Payer: </Text>
                                {payment.payername}
                            </Text>

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Amount: </Text>
                                <Text style={styles.amountText}>₹{payment.amountpaid.toFixed(2)}</Text>
                            </Text>

                            {payment.vendornetreceipt !== undefined && (
                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Net Received: </Text>
                                    <Text style={styles.netReceiptText}>₹{payment.vendornetreceipt.toFixed(2)}</Text>
                                </Text>
                            )}

                            <View style={styles.separator} />

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Type: </Text>
                                {payment.paymenttype}
                            </Text>

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Method: </Text>
                                {payment.paymentmethod}
                            </Text>

                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Status: </Text>
                                <Text style={[
                                    styles.statusText,
                                    payment.status === 'Successful' ? styles.statusSuccess : styles.statusOther
                                ]}>
                                    {payment.status}
                                </Text>
                            </Text>

                            <Text style={styles.paymentDate}>
                                {`Paid on: ${displayDate.toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })} at ${displayDate.toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}`}
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