import EditableInputField from "@/components/EditableInputField";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const CompanyInfoPage = () => {
  const [company, setCompany] = useState(false);
  const [mail, setMail] = useState(false);
  const [phone, setPhone] = useState(false);
  const [address, setAddress] = useState(false);
  const [website, setWebsite] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.headerStyle}>Company Basic Info</Text>
      <EditableInputField
        editable={company}
        onToggleEdit={() => setCompany(!company)}
        placeholder="Company name"
      />
      <EditableInputField
        editable={mail}
        onToggleEdit={() => setMail(!mail)}
        placeholder="Mail"
      />
      <EditableInputField
        editable={phone}
        onToggleEdit={() => setPhone(!phone)}
        placeholder="Phone number"
      />
      <EditableInputField
        editable={address}
        onToggleEdit={() => setAddress(!address)}
        placeholder="Address"
      />
      <EditableInputField
        editable={website}
        onToggleEdit={() => setWebsite(!website)}
        placeholder="Website"
      />
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
  headerStyle: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 50,
  },
});
