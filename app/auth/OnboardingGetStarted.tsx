import logger from '@/lib/logger';
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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import KeyboardSafeView from "@/components/layout/KeyboardSafeView";

const OnboardingGetStarted = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update company name in the companies table
        const { error } = await supabase
          .from("companies")
          .update({ company: name.trim() })
          .eq("user_id", user.id);

        if (error) {
          logger.error("Error updating company name:", error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to save your name. Please try again.'
          });
          setLoading(false);
          return;
        }
      }

      // Navigate to categories onboarding step
      router.push('/auth/OnboardingCategories');
    } catch (error) {
      logger.error("Error in onboarding:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip to next step without saving
    router.push('/auth/OnboardingCategories');
  };

  return (
    <View style={styles.container}>
      {/* Soft mesh background */}
      <View style={styles.meshBackground} />
      <View style={styles.patternOverlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button and progress */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#1c1917" />
          </Pressable>

          {/* Progress Indicator - Step 1 of 3 */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActiveCurrent]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>
        </View>

        <KeyboardSafeView 
          scrollable={true}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.stepLabel}>STEP 01</Text>
            <Text style={styles.title}>Let's get{'\n'}started</Text>
            <Text style={styles.subtitle}>
              Tell us who you are so we can personalize your dashboard.
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>YOUR NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alexander Mitchell"
              placeholderTextColor="#d6d3d1"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </KeyboardSafeView>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
              (!name.trim() || loading) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.5)" />
              </>
            )}
          </Pressable>

          <Pressable onPress={handleSkip} disabled={loading}>
            <Text style={styles.skipText}>I'll do this later</Text>
          </Pressable>
        </View>
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
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 0.5,
    borderColor: 'rgba(245, 245, 244, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    width: 24,
    height: 4,
    backgroundColor: '#e7e5e4',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#800000',
  },
  progressActiveCurrent: {
    width: 40,
    backgroundColor: '#800000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 60,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#1c1917',
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#78716c',
    lineHeight: 26,
    marginTop: 16,
    maxWidth: 280,
  },
  inputSection: {
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a8a29e',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#1c1917',
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 64,
  },
  continueButton: {
    height: 60,
    backgroundColor: '#800000',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a8a29e',
    textAlign: 'center',
    marginTop: 16,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: 'rgba(231, 229, 228, 0.6)',
    borderRadius: 3,
  },
});

export default OnboardingGetStarted;