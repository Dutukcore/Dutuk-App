import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type EditableInputType = {
  placeholder: string;
  editable: boolean;
  onToggleEdit: () => void;
};

const EditableInputField: React.FC<EditableInputType> = ({
  placeholder,
  editable,
  onToggleEdit,
}) => {
  return (
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, editable && styles.inputEditable]}
        placeholder={placeholder}
        editable={editable}
      />
      <TouchableOpacity style={styles.editButton} onPress={onToggleEdit}>
        <Text style={styles.editText}>📝</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditableInputField;

const styles = StyleSheet.create({
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
    backgroundColor: "black",
    borderRadius: 8,
  },
  editText: {
    color: "white",
    fontSize: 16,
  },
});
