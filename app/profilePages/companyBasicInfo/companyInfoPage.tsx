import AuthButton from "@/features/auth/components/AuthButton";
import EditableInputField from "@/components/ui/EditableInputField";
import useCompanyInfo from "@/features/profile/hooks/useCompanyInfo";
import { useVendorStore } from "@/store/useVendorStore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

const CompanyInfoPage = () => {
  const companyData = useVendorStore((s) => s.company);

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

  useEffect(() => {
    if (companyData) {
      setCompany(companyData.company || "");
      setMail(companyData.mail || "");
      setPhone(companyData.phone || "");
      setAddress(companyData.address || "");
      setWebsite(companyData.website || "");
    }
  }, [companyData]);

  const handlePress = async () => {
    await useCompanyInfo({ company, mail, phone, address, website });
    Alert.alert("Company Information Updated", "Successfully updated");
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.headerStyle}>Company Basic Info</Text>
      <EditableInputField
        placeholder="Company name"
        value={company}
        editable={companyEditable}
        onTextChange={setCompany}
        onToggleEdit={() => setCompanyEditable(!companyEditable)}
      />
      <EditableInputField
        placeholder="Mail"
        editable={mailEditable}
        value={mail}
        onTextChange={setMail}
        onToggleEdit={() => setMailEditable(!mailEditable)}
      />
      <EditableInputField
        placeholder="Phone number"
        value={phone}
        editable={phoneEditable}
        onTextChange={setPhone}
        onToggleEdit={() => setPhoneEditable(!phoneEditable)}
      />
      <EditableInputField
        placeholder="Address"
        value={address}
        editable={addressEditable}
        onTextChange={setAddress}
        onToggleEdit={() => setAddressEditable(!addressEditable)}
      />
      <EditableInputField
        placeholder="Website"
        value={website}
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
