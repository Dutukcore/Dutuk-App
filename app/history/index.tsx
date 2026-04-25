import RouteAssist from '@/components/ui/RouteAssist';
import { StyleSheet, Text, View } from 'react-native';
const HistoryMenu = () => {
  return (
    <View style={historyMenuStyles.container}>
      <View style={historyMenuStyles.headerContainer}>
        <Text style={historyMenuStyles.headerText}>Activity & Insights</Text>
      </View>
      <View style={historyMenuStyles.optionsView}>
        <RouteAssist path="/past-services" text='Past Services' />
        <RouteAssist path="/past-earnings" text='Past Earnings' />
        <RouteAssist path="/past-payments" text='Past Payments' />
        <RouteAssist path="/reviews" text='Past Reviews' />
      </View>
    </View>
  )
}
const historyMenuStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  optionsView: {
    gap: 15,
  },

});

export default HistoryMenu;