import { StyleSheet } from "react-native";

const authButtonStyle = StyleSheet.create({
  button: {
    width: 250,
    height: 75,
    backgroundColor: "#800000",
    justifyContent: "center",
    borderRadius: 50,
    elevation: 10,
    margin: 5,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  buttonSecondary: {
    width: 250,
    height: 75,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderColor: '#e7e5e4',
    justifyContent: "center",
    borderRadius: 50,
    elevation: 10,
    margin: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default authButtonStyle;
