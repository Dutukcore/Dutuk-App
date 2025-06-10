import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CompanyInfoPage = () => {
  const [company, setCompany] = useState(false);
  const [mail, setMail] = useState(false);
  const [phone, setPhone] = useState(false);
  const [address, setAddress] = useState(false);
  const [website, setWebsite] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.headerStyle}>Company Basic Info</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, company && styles.inputEditable]}
          placeholder="Company name"
          editable={company}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setCompany(!company)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>📝</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, mail && styles.inputEditable]}
          placeholder="Mail"
          editable={mail}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setMail(!mail)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>📝</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, address && styles.inputEditable]}
          placeholder="Address"
          editable={address}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setAddress(!address)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>📝</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, phone && styles.inputEditable]}
          placeholder="Phone Number"
          editable={phone}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setPhone(!phone)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>📝</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, website && styles.inputEditable]}
          placeholder="Website"
          editable={website}
        />
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setWebsite(!website)}
        >
          {/* A edit emoji */}
          <Text style={styles.editText}>📝</Text>
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
    backgroundColor: "black",
    borderRadius: 8,
  },
  editText: {
    color: "white",
    fontSize: 16,
  },
  headerStyle: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 50,
  },
});
