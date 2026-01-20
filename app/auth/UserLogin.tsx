import googleLogin from "@/hooks/useGoogleAuth";
import loginUser from "@/hooks/useLoginUser";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', email.trim().toLowerCase());
      await loginUser(email.trim().toLowerCase(), password.trim());
    } catch (error) {
      console.error('Login error in component:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await googleLogin();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Google authentication failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Soft gradient background */}
      <LinearGradient
        colors={['#F7F8FA', '#F7F8FA', 'rgba(255, 230, 230, 0.5)']}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Log In</Text>
            <Text style={styles.headerSubtitle}>Welcome back to your account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="example@vendor.com"
                placeholderTextColor="#a8a29e"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <Pressable>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </Pressable>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#a8a29e"
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

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Auth Button */}
            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled
              ]}
              onPress={handleGoogleAuth}
              disabled={loading}
            >
              <Image 
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New User? </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text style={styles.signupLink}>Sign Up here</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#1c1917',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#78716c',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 25,
    elevation: 3,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78716c',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1c1917',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '500',
    color: '#800000',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  loginButton: {
    height: 52,
    backgroundColor: '#800000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f5f5f4',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#a8a29e',
    marginHorizontal: 16,
  },
  googleButton: {
    height: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44403c',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#57534e',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#800000',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: 'rgba(168, 162, 158, 0.4)',
    borderRadius: 3,
  },
});

export default UserLogin;