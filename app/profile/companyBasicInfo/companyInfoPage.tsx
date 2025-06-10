import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CompanyInfoPage = () => {
  const [editable, setEditable] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, editable && styles.inputEditable]}
          placeholder="Company name"
          editable={editable}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditable(!editable)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CompanyInfoPage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#e9e9e9",
  },
  inputEditable: {
    backgroundColor: "#ffffff",
    borderColor: "#007BFF",
  },
  editButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
  },
  editText: {
    color: "white",
    fontSize: 16,
  },
});
