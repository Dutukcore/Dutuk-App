import React, { ReactNode } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface KeyboardSafeViewProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  enableOnAndroid?: boolean;
  extraScrollHeight?: number;
}

/**
 * Global keyboard-aware wrapper component
 * 
 * Features:
 * - Automatically adjusts content when keyboard appears
 * - Platform-specific handling (iOS: padding, Android: height)
 * - Dismisses keyboard on outside tap
 * - Ensures focused input is always visible
 * - Supports both scrollable and non-scrollable content
 * 
 * Usage:
 * <KeyboardSafeView scrollable={true}>
 *   <YourContent />
 * </KeyboardSafeView>
 */
const KeyboardSafeView: React.FC<KeyboardSafeViewProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  enableOnAndroid = true,
  extraScrollHeight = 20,
}) => {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (scrollable) {
    return (
      <KeyboardAwareScrollView
        style={[styles.container, style]}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        enableOnAndroid={enableOnAndroid}
        extraScrollHeight={extraScrollHeight}
        // Smooth animation
        enableAutomaticScroll
        enableResetScrollToCoords
        // Bottom spacing when keyboard is open
        bottomOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  // Non-scrollable mode - wrap in Pressable to dismiss keyboard on tap
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={dismissKeyboard}
      accessible={false}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default KeyboardSafeView;
