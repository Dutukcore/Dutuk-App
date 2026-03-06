import KeyboardSafeView from "@/components/KeyboardSafeView";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
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
import Toast from "react-native-toast-message";

const QUICK_FILL_REGIONS = [
  'Chennai, Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Madurai, Tamil Nadu',
  'Tiruchirappalli, Tamil Nadu',
  'Salem, Tamil Nadu',
  'Tirunelveli, Tamil Nadu',
];

const OnboardingLocation = () => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Please enable location access in your device settings.'
        });
        setGeoLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocode) {
        // Build a detailed address with street/area/sublocality
        const parts = [
          geocode.name,
          geocode.street,
          geocode.district || geocode.subregion,
          geocode.city,
          geocode.region,
          geocode.postalCode,
        ].filter(Boolean);

        // Remove duplicates (some fields repeat the same value)
        const uniqueParts = [...new Set(parts)];
        const locationString = uniqueParts.join(', ') || 'Unknown location';
        setLocation(locationString);

        Toast.show({
          type: 'success',
          text1: 'Location Found',
          text2: locationString,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not determine your location. Please enter manually.'
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Failed to get your location. Please enter manually.'
      });
    } finally {
      setGeoLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && location.trim()) {
        const { error } = await supabase
          .from("companies")
          .update({
            service_area: location.trim(),
            address: location.trim(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating location:", error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to save your location. Please try again.'
          });
          setLoading(false);
          return;
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Setup Complete!',
        text2: 'Your vendor profile is ready.'
      });

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error("Error in onboarding:", error);
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

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActiveCurrent]} />
          </View>

          <View style={{ width: 40 }} />
        </View>

        <KeyboardSafeView
          scrollable={true}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.stepLabel}>STEP 03</Text>
            <Text style={styles.title}>Where is your{'\n'}business located?</Text>
            <Text style={styles.subtitle}>
              Tell us where you operate so we can connect you with local clients.
            </Text>
          </View>



          {/* Search Input */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter your business address..."
                placeholderTextColor="#a8a29e"
                value={location}
                onChangeText={setLocation}
                multiline={false}
              />

              {location.length > 0 && (
                <Pressable onPress={() => setLocation("")} style={styles.clearIconButton}>
                  <Ionicons name="close-circle" size={20} color="#a8a29e" />
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.geoIconButton,
                geoLoading && styles.geoIconButtonDisabled,
                pressed && styles.geoIconButtonPressed,
              ]}
              onPress={handleUseCurrentLocation}
              disabled={geoLoading}
            >
              {geoLoading ? (
                <ActivityIndicator size="small" color="#800000" />
              ) : (
                <Ionicons name="navigate" size={20} color="#800000" />
              )}
            </Pressable>
          </View>

          {/* Quick Fill Regions */}
          <View style={styles.regionsSection}>
            <Text style={styles.regionsLabel}>QUICK FILL</Text>
            <View style={styles.regionsGrid}>
              {QUICK_FILL_REGIONS.map((region) => (
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
        </KeyboardSafeView>

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
    paddingHorizontal: 32,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 28,
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
  locationCard: {
    height: 130,
    backgroundColor: '#fafaf9',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 0, 0, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  locationCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  locationCardDecor: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(128, 0, 0, 0.04)',
    borderRadius: 20,
    transform: [{ rotate: '12deg' }],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    borderWidth: 1.5,
    borderColor: '#e7e5e4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 'auto',
    minHeight: 64,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1c1917',
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearIconButton: {
    padding: 8,
  },
  geoIconButton: {
    backgroundColor: 'rgba(128, 0, 0, 0.08)',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoIconButtonDisabled: {
    opacity: 0.5,
  },
  geoIconButtonPressed: {
    backgroundColor: 'rgba(128, 0, 0, 0.15)',
    transform: [{ scale: 0.96 }],
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