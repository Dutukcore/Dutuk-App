import AuthButton from "@/components/AuthButton";
import EditableInputField from "@/components/EditableInputField";
import useCompanyInfo from "@/hooks/useCompanyInfo";
import getCompanyInfo from "@/hooks/useGetCompanyInfo";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

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
    useCompanyInfo({ company, mail, phone, address, website });
    Alert.alert("Company Information Updated","Successfully updated");
  };
  useEffect(()=>{
    fetchInfo();
  },[])

  const fetchInfo = async()=>{
    let fetched = await getCompanyInfo();
    if(fetched && fetched.company){
      setCompany(fetched.company);
      setMail(fetched.mail);
      setPhone(fetched.phone);
      setAddress(fetched.address);
      setWebsite(fetched.website);
    }
  }

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
