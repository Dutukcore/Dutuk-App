import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type ReviewProp = {
    reviewid: string;
    associatedeventname: string;
    associatedeventid: string;
    reviewername: string;
    rating: number;
    reviewtext: string;
    reviewdate: string;
};

type ReviewsProp = {
    reviews: ReviewProp[];
};

const DisplayReviews = ({ reviews }: ReviewsProp) => {
    return (
        <ScrollView style={styles.container}>
            {reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>No past reviews to display.</Text>
            ) : (
                reviews.map((review, index) => (
                    <View key={review.reviewid || index} style={styles.card}>
                        <Text style={styles.eventName}>{review.associatedeventname}</Text>

                        <Text style={styles.reviewerName}>Reviewed by: {review.reviewername}</Text>

                        <View style={styles.ratingContainer}>
                            <Text style={styles.ratingText}>{`Rating: ${review.rating}`}</Text>
                            <Text style={styles.stars}>
                                {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                            </Text>
                        </View>

                        <View style={styles.separator} />

                        <Text style={styles.reviewTextHeader}>Review:</Text>
                        <Text style={styles.reviewText}>{review.reviewtext}</Text>

                        <Text style={styles.reviewDate}>
                            {`Reviewed on: ${review.reviewdate}`}
                        </Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
};



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F7F9FC', 
        padding: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
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
        borderColor: '#E8EBF2', // Subtle light border
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50', // Dark blue-grey for main titles
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 15,
        color: '#607D8B', // Medium grey for secondary info
        marginBottom: 10,
        fontStyle: 'italic',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginRight: 8,
    },
    stars: {
        fontSize: 18,
        color: '#FFD700', // Gold color for stars
    },
    separator: {
        height: 1,
        backgroundColor: '#ECEFF1', // Very light separator line
        marginVertical: 15,
    },
    reviewTextHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495E', // Slightly darker for section headers
        marginBottom: 5,
    },
    reviewText: {
        fontSize: 15,
        color: '#495057', // Regular text color
        lineHeight: 22,
        marginBottom: 10,
    },
    reviewDate: {
        fontSize: 13,
        color: '#9E9E9E', // Lighter grey for dates
        textAlign: 'right',
        marginTop: 5,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#7F8C8D', // Neutral grey for informative text
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
});

export default DisplayReviews;