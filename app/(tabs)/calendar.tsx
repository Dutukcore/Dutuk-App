import CalendarPage from '../profilePages/calendar/CalendarPage';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarTabScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <CalendarPage hideBackButton={true} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    content: {
        flex: 1,
        // Add bottom padding to account for the tab bar if needed, 
        // though the Tabs layout usually handles this.
        paddingBottom: 20,
    },
});
