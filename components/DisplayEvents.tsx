import { ScrollView, StyleSheet, Text, View } from 'react-native';

type FlatEventProp = {
    id: number;
    user_id: string;
    eventnametype: string;
    startdate: string;
    enddate: string;
    starttime: string;
    endtime: string;
    venuename?: string | null;
    fulladdress: string;
    customername: string;
    customeremail: string;
    customerphonenumber: string;
};

type EventsProp = {
    events: FlatEventProp[];
};

const DisplayEvents = ({ events }: EventsProp) => {
    return (
        <ScrollView style={styles.container}>
            {events.length === 0 ? (
                <Text style={styles.noEventsText}>No past events to display.</Text>
            ) : (
                events.map((event) => (
                    <View key={event.id} style={styles.card}>
                        {/* Event Name */}
                        <Text style={styles.eventName}>{event.eventnametype}</Text>

                        {/* Date */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Date: </Text>
                            {event.startdate}
                            {event.startdate !== event.enddate && (
                                <Text>{` to ${event.enddate}`}</Text>
                            )}
                        </Text>

                        {/* Time */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Time: </Text>
                            {`${event.starttime} - ${event.endtime}`}
                        </Text>

                        {/* Location */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Location: </Text>
                            {event.venuename && (
                                <Text>{`${event.venuename}, `}</Text>
                            )}
                            {event.fulladdress}
                        </Text>

                        {/* Customer Info */}
                        <View style={styles.separator} />
                        <Text style={styles.customerHeader}>Customer Details:</Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Name: </Text>
                            {event.customername}
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Email: </Text>
                            {event.customeremail}
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Phone: </Text>
                            {event.customerphonenumber}
                        </Text>
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
