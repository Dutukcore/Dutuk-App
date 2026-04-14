import RouteAssist from '@/components/ui/RouteAssist';
import { StyleSheet, Text, View } from 'react-native';
const HistoryMenu = ()=>{
    return(
        <View style={historyMenuStyles.container}>
            <View style={historyMenuStyles.headerContainer}>
               <Text style={historyMenuStyles.headerText}>History and Highlights</Text> 
            </View>
            <View style={historyMenuStyles.optionsView}>
            <RouteAssist path="/profilePages/profileSettings/history_and_highlights/pastEvents" text='Past Events'/>
            <RouteAssist path="/profilePages/profileSettings/history_and_highlights/pastEarnings" text='Past Earnings'/>
            <RouteAssist path="/profilePages/profileSettings/history_and_highlights/pastPayments" text='Past Payments'/>
            <RouteAssist path="/profilePages/profileSettings/history_and_highlights/pastReviews" text='Past Reviews'/>
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
    marginTop:50,
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