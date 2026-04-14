import { StyleSheet } from "react-native";

const authPageStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSection: {
    padding: 20,
    alignItems: "center",
  },
  assistText: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    marginTop: 20,
    marginLeft: 35,
  },
});

export default authPageStyle;
