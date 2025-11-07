import { ScrollView, StyleSheet, Text, View } from 'react-native';

type FlatEventProp = {
    id: string;
    vendor_id: string;
    customer_id: string;
    event: string;
    description?: string;
    start_date: string;
    end_date: string;
    customer_name?: string;
    company_name: string;
    payment: number;
    status: string;
    created_at: string;
};

type EventsProp = {
    events: FlatEventProp[];
};

const DisplayEvents = ({ events }: EventsProp) => {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <ScrollView style={styles.container}>
            {events.length === 0 ? (
                <Text style={styles.noEventsText}>No past events to display.</Text>
            ) : (
                events.map((event) => (
                    <View key={event.id} style={styles.card}>
                        {/* Event Name */}
                        <Text style={styles.eventName}>{event.event}</Text>

                        {/* Company */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Company: </Text>
                            {event.company_name}
                        </Text>

                        {/* Date */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Date: </Text>
                            {formatDate(event.start_date)}
                            {event.start_date !== event.end_date && (
                                <Text>{` to ${formatDate(event.end_date)}`}</Text>
                            )}
                        </Text>

                        {/* Payment */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Payment: </Text>
                            ₹{event.payment?.toFixed(2) || '0.00'}
                        </Text>

                        {/* Status */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Status: </Text>
                            {event.status}
                        </Text>

                        {/* Description */}
                        {event.description && (
                            <Text style={styles.detailText}>
                                <Text style={styles.label}>Description: </Text>
                                {event.description}
                            </Text>
                        )}

                        {/* Customer Info */}
                        {event.customer_name && (
                            <>
                                <View style={styles.separator} />
                                <Text style={styles.customerHeader}>Customer Details:</Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Name: </Text>
                                    {event.customer_name}
                                </Text>
                            </>
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
        backgroundColor: '#F5F7FA',
        padding: 10,
        marginBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    eventName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: '#555555',
        marginBottom: 5,
        lineHeight: 22,
    },
    label: {
        fontWeight: '600',
        color: '#333333',
    },
    separator: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 15,
    },
    customerHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444444',
        marginBottom: 10,
    },
    noEventsText: {
        fontSize: 18,
        color: '#777777',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default DisplayEvents;
