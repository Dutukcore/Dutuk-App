import KeyboardSafeView from "@/components/KeyboardSafeView";
import registerUser from "@/hooks/useRegisterUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields'
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters'
      });
      return;
    }

    setLoading(true);
    try {
      await registerUser(email.trim().toLowerCase(), password);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Soft mesh background */}
      <View style={styles.meshBackground} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardSafeView
          scrollable={true}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Header */}
          <View style={styles.logoSection}>
            <View style={styles.sparkleContainer}>
              <Ionicons name="sparkles" size={24} color="#800000" />
            </View>
            <Text style={styles.logoText}>DUTUK</Text>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>VENDOR PORTAL</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our premium vendor network</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#a8a29e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#d6d3d1"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#a8a29e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#d6d3d1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#a8a29e" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#d6d3d1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#a8a29e"
                  />
                </Pressable>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/auth/UserLogin')}>
              <Text style={styles.loginLink}>Log In</Text>
            </Pressable>
          </View>

          {/* Footer Tagline */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>ELEVATE YOUR PRESENCE</Text>
          </View>
        </KeyboardSafeView>
      </SafeAreaView>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    // Approximation of soft mesh gradient
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  sparkleContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f5f5f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1917',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  portalBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: 'rgba(250, 250, 249, 0.5)',
  },
  portalBadgeText: {
    color: '#a8a29e',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#1c1917',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 8,
  },
  formCard: {
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a8a29e',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 15,
    color: '#1c1917',
  },
  eyeButton: {
    padding: 4,
  },
  signupButton: {
    height: 56,
    backgroundColor: '#800000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    color: '#78716c',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#800000',
  },
  footer: {
    marginTop: 32,
    marginBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#a8a29e',
    letterSpacing: 3,
    opacity: 0.6,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: '#e7e5e4',
    borderRadius: 3,
  },
});

export default Register;