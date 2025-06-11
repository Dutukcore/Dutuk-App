import EditableInputField from "@/components/EditableInputField";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const CompanyInfoPage = () => {
  const [companyEditable, setCompanyEditable] = useState(false);
  const [mailEditable, setMailEditable] = useState(false);
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [addressEditable, setAddressEditable] = useState(false);
  const [websiteEditable, setWebsiteEditable] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.headerStyle}>Company Basic Info</Text>
      <EditableInputField
        editable={companyEditable}
        onToggleEdit={() => setCompanyEditable(!companyEditable)}
        placeholder="Company name"
      />
      <EditableInputField
        editable={mailEditable}
        onToggleEdit={() => setMailEditable(!mailEditable)}
        placeholder="Mail"
      />
      <EditableInputField
        editable={phoneEditable}
        onToggleEdit={() => setPhoneEditable(!phoneEditable)}
        placeholder="Phone number"
      />
      <EditableInputField
        editable={addressEditable}
        onToggleEdit={() => setAddressEditable(!addressEditable)}
        placeholder="Address"
      />
      <EditableInputField
        editable={websiteEditable}
        onToggleEdit={() => setWebsiteEditable(!websiteEditable)}
        placeholder="Website"
      />
    </View>
  );
};

export default CompanyInfoPage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    marginTop: 150,
  },
  headerStyle: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 50,
  },
});
