import { ScrollView, StyleSheet, Text, View } from 'react-native';

type EventProp = {
    eventNameType: string;
    eventDates: {
        startDate: string; 
        endDate: string;
    };
    eventTimes: {
        startTime: string;
        endTime: string;
    };
    eventLocation: {
        venueName?: string;
        fullAddress: string;
    };
    customerName: string;
    customerContactInformation: {
        email: string;
        phoneNumber: string;
    };
};

type EventsProp = {
    events: EventProp[]; 
};

const DisplayEvents = ({ events }: EventsProp) => {
    return (
        <ScrollView style={styles.container}>
            {events.length === 0 ? (
                <Text style={styles.noEventsText}>No past events to display.</Text>
            ) : (
                events.map((event, index) => (
                    <View key={index} style={styles.card}>
                        {/* Event Name */}
                        <Text style={styles.eventName}>{event.eventNameType}</Text>

                        {/* Date */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Date: </Text>
                            {`${event.eventDates.startDate}`}
                            {event.eventDates.startDate !== event.eventDates.endDate && (
                                <Text>{` to ${event.eventDates.endDate}`}</Text>
                            )}
                        </Text>

                        {/* Time */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Time: </Text>
                            <Text>{`${event.eventTimes.startTime} - ${event.eventTimes.endTime}`}</Text>
                        </Text>

                        {/* Location */}
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Location: </Text>
                            {event.eventLocation.venueName && (
                                <Text>{`${event.eventLocation.venueName}, `}</Text>
                            )}
                            <Text>{event.eventLocation.fullAddress}</Text>
                        </Text>

                        {/* Customer Information */}
                        <View style={styles.separator} />
                        <Text style={styles.customerHeader}>Customer Details:</Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Name: </Text>
                            <Text>{event.customerName}</Text>
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Email: </Text>
                            <Text>{event.customerContactInformation.email}</Text>
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.label}>Phone: </Text>
                            <Text>{event.customerContactInformation.phoneNumber}</Text>
                        </Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
};



const styles = StyleSheet.create({
    container: {
        margin:10,
        backgroundColor: '#F5F7FA', 
        padding: 10,
        marginBottom:40
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000', 
        shadowOffset: {
            width: 0,
            height: 2,
        },
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