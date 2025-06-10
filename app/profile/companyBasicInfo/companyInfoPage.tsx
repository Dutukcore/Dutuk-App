import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const companyInfoPage = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        style={style.input}
        placeholder="Company name"
        editable={false}
      />
      <TextInput style={style.input} placeholder="Mail" editable={false} />
      <TextInput style={style.input} placeholder="Address" editable={false} />
      <TextInput
        style={style.input}
        placeholder="Phone number"
        editable={false}
      />
      <TextInput style={style.input} placeholder="Website" editable={false} />
    </View>
  );
};

export default companyInfoPage;

const style = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    margin: 15,
    width: 250,
  },
});
