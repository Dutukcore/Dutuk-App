import AuthButton from "@/components/AuthButton";
import EditableInputField from "@/components/EditableInputField";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const CompanyInfoPage = () => {
  const [companyEditable, setCompanyEditable] = useState(false);
  const [mailEditable, setMailEditable] = useState(false);
  const [phoneEditable, setPhoneEditable] = useState(false);
  const [addressEditable, setAddressEditable] = useState(false);
  const [websiteEditable, setWebsiteEditable] = useState(false);

  const [company, setCompany] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const handlePress = () => {
    console.log(company);
    console.log(mail);
    console.log(phone);
    console.log(address);
    console.log(website);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.headerStyle}>Company Basic Info</Text>
      <EditableInputField
        placeholder="Company name"
        editable={companyEditable}
        onTextChange={setCompany}
        onToggleEdit={() => setCompanyEditable(!companyEditable)}
      />
      <EditableInputField
        placeholder="Mail"
        editable={mailEditable}
        onTextChange={setMail}
        onToggleEdit={() => setMailEditable(!mailEditable)}
      />
      <EditableInputField
        placeholder="Phone number"
        editable={phoneEditable}
        onTextChange={setPhone}
        onToggleEdit={() => setPhoneEditable(!phoneEditable)}
      />
      <EditableInputField
        placeholder="Address"
        editable={addressEditable}
        onTextChange={setAddress}
        onToggleEdit={() => setAddressEditable(!addressEditable)}
      />
      <EditableInputField
        placeholder="Website"
        editable={websiteEditable}
        onTextChange={setWebsite}
        onToggleEdit={() => setWebsiteEditable(!websiteEditable)}
      />
      <AuthButton
        buttonText="Save changes"
        height={75}
        width={150}
        onPress={() => handlePress()}
      />
    </View>
  );
};

export default CompanyInfoPage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 150,
  },
  headerStyle: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 50,
  },
});
