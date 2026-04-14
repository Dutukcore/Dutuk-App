import { StyleSheet } from "react-native";

const resetPasswordStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdfdfd",
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: "bold",
    fontSize: 45,
    color: "#222",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  loadingText: {
    fontWeight: "bold",
    fontSize: 50,
    color: "#777",
  },
  button: {
  backgroundColor: '#007AFF',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 10,
  marginTop: 16,
  alignItems: 'center',
  width: '100%',
  maxWidth: 400,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});

export default resetPasswordStyles;