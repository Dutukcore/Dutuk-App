import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import Toast from "react-native-toast-message";

const POPULAR_REGIONS = [
  'London, UK',
  'New York, NY',
  'Paris, FR',
  'Dubai, UAE',
  'Mumbai, IN',
  'Singapore',
];

const OnboardingLocation = () => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && location.trim()) {
        // Update company location in the companies table
        const { error } = await supabase
          .from("companies")
          .update({ location: location.trim() })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating location:", error);
          // Continue anyway, location is optional
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Setup Complete!',
        text2: 'Your vendor profile is ready.'
      });

      // Navigate to home - onboarding complete
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error("Error in onboarding:", error);
      // Continue to home anyway
      router.replace('/(tabs)/home');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegion = (region: string) => {
    setLocation(region);
  };

  const handleSkip = () => {
    Toast.show({
      type: 'success',
      text1: 'Setup Complete!',
      text2: 'You can update your location later in settings.'
    });
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* Mesh background */}
      <View style={styles.meshBackground} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#1c1917" />
          </Pressable>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.stepLabel}>STEP 02</Text>
            <Text style={styles.title}>Where is your{'\n'}business located?</Text>
            <Text style={styles.subtitle}>
              Tell us where you operate so we can connect you with local clients.
            </Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="location-outline" size={22} color="#a8a29e" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for your city or region..."
              placeholderTextColor="#a8a29e"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Popular Regions */}
          <View style={styles.regionsSection}>
            <Text style={styles.regionsLabel}>POPULAR REGIONS</Text>
            <View style={styles.regionsGrid}>
              {POPULAR_REGIONS.map((region) => (
                <Pressable
                  key={region}
                  style={({ pressed }) => [
                    styles.regionChip,
                    location === region && styles.regionChipActive,
                    pressed && styles.regionChipPressed
                  ]}
                  onPress={() => handleSelectRegion(region)}
                >
                  <Text style={[
                    styles.regionChipText,
                    location === region && styles.regionChipTextActive
                  ]}>
                    {region}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Use Current Location Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationCardDecor} />
            <View style={styles.locationCardContent}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="navigate" size={24} color="#800000" />
              </View>
              <Text style={styles.locationCardText}>Use current location</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={loading}
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 245, 244, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    width: 32,
    height: 4,
    backgroundColor: '#e7e5e4',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#800000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#1c1917',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#78716c',
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 280,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    borderWidth: 1.5,
    borderColor: '#e7e5e4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1c1917',
  },
  regionsSection: {
    marginBottom: 32,
  },
  regionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a8a29e',
    letterSpacing: 2,
    marginBottom: 16,
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 50,
  },
  regionChipActive: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  regionChipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  regionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44403c',
  },
  regionChipTextActive: {
    color: '#ffffff',
  },
  locationCard: {
    height: 160,
    backgroundColor: '#fafaf9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f5f5f4',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 32,
  },
  locationCardDecor: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(231, 229, 228, 0.3)',
    borderRadius: 20,
    transform: [{ rotate: '12deg' }],
  },
  locationCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  locationCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716c',
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f4',
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
    opacity: 0.6,
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
    backgroundColor: '#e7e5e4',
    borderRadius: 3,
  },
});

export default OnboardingLocation;
