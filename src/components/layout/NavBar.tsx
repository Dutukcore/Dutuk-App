import navBarStyle from "@/css/navBarStyle";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";
import RouteAssist from "@/components/ui/RouteAssist";

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-Dimensions.get("window").width * 0.6)).current;
  const handleNavBarVisibility = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -Dimensions.get("window").width * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (visible) {
    return (
      <Animated.View style={[navBarStyle.container, { transform: [{ translateX: slideAnim }] }]}>
        <Pressable onPress={handleNavBarVisibility}>
          <Text style={navBarStyle.innerNavButtonText}>=</Text>
        </Pressable>
        <RouteAssist path="/profilePages/legal" text="Legal" />
        <RouteAssist path="/profilePages/profileSettings" text="Profile Settings" />
        <RouteAssist path="/profilePages/message" text="Chat" />
      </Animated.View>
    );
  } else {
    return (
      <View style={navBarStyle.collapsedButton}>
        <Pressable onPress={handleNavBarVisibility}>
          <Text style={navBarStyle.outerNavButtonText}>=</Text>
        </Pressable>
      </View>
    );
  }
};

export default NavBar;
