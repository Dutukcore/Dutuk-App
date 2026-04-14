import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ValidRoute } from "./AuthButton";

type AuthAssistProp = {
  AssistText: string;
  route: ValidRoute;
  LinkText: string;
};

const AuthAssist = ({ AssistText, route, LinkText }: AuthAssistProp) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", margin: 5 }}>
      <Text>{AssistText}</Text>
      <Pressable onPress={() => router.push(route)}>
        <Text style={{ color: "blue" }}>{LinkText}</Text>
      </Pressable>
    </View>
  );
};

export default AuthAssist;
