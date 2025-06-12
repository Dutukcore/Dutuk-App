import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  DimensionValue,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import authButtonStyle from "../css/authButtonStyle";

type ButtonColorType = "button" | "buttonSecondary";

export type ValidRoute = Parameters<typeof router.push>[0];

type AuthButtonProps = {
  buttonText: string;
  route?: ValidRoute;
  buttonColorType?: ButtonColorType;
  navigationType?: "push" | "replace";
  onPress?: () => void;
  width?: DimensionValue;
  height?: DimensionValue;
};

const AuthButton: React.FC<AuthButtonProps> = ({
  buttonText,
  route,
  buttonColorType = "button",
  navigationType = "push",
  onPress,
  width,
  height,
}) => {
  const animatedScale = useRef(new Animated.Value(1)).current;

  const baseStyle = authButtonStyle[buttonColorType];
  const buttonStyle: StyleProp<ViewStyle> = {
    ...baseStyle,
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
  };

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.85,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start(() => {
      onPress?.();

      if (route) {
        navigationType === "replace" ? router.replace(route) : router.push(route);
      }
    });
  };

  return (
    <View>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1} 
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <Animated.View style={[buttonStyle, { transform: [{ scale: animatedScale }] }]}>
          <Text style={authButtonStyle.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default AuthButton;