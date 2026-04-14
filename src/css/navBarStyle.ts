import { StyleSheet } from "react-native";

const navBarStyle = StyleSheet.create({


    outerNavButtonText:{
    fontSize:46,
    textAlign:'center',
    color:'#a8a29e'
    },
    innerNavButtonText:{
    fontSize:46,
    borderBottomWidth:2,
    borderBottomColor:'#e7e5e4',
    borderTopWidth:2,
    borderTopColor:'#e7e5e4',
    color:'#57534e'
    },

  container: {
    height: '100%',
    width: '60%',
    backgroundColor:'#fffcfa', 
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    paddingHorizontal: 20,
    position: 'absolute',
    zIndex: 10,
    flex:1,
    gap:10

    
  },
  links: {
    paddingVertical: 14,
    marginVertical: 8,
    fontSize: 18,
    color: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    width: '100%',
    textAlign: 'left',
  },
  collapsedButton: {    
    position:'absolute',
  top: 40,
  zIndex: 20,
  padding: 10,
  borderRadius: 10,
  elevation: 8,
  shadowColor: '#FFF',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  width:60,
  shadowRadius: 3.5,
}

});
export default navBarStyle;