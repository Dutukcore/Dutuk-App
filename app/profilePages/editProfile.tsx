import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import useCompanyInfo from "@/features/profile/hooks/useCompanyInfo";
import useImageUpload from "@/features/profile/hooks/useImageUpload";
import logger from '@/lib/logger';
import { supabase } from "@/lib/supabase";
import { useVendorStore } from "@/store/useVendorStore";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Map category icon names (from DB) to Ionicons equivalents
const ICON_MAP: { [key: string]: string } = {
  'heart': 'heart-outline',
  'camera': 'camera-outline',
  'video': 'videocam-outline',
  'utensilscrossed': 'restaurant-outline',
  'restaurant': 'restaurant-outline',
  'music': 'musical-notes-outline',
  'flower2': 'flower-outline',
  'mappin': 'location-outline',
  'speaker': 'volume-high-outline',
  'cake': 'gift-outline',
  'briefcase': 'briefcase-outline',
  'brush': 'brush-outline',
};

const DEFAULT_CATEGORIES = [
  { id: 'f1', name: 'Photography', icon: 'camera' },
  { id: 'f2', name: 'Videography', icon: 'video' },
  { id: 'f3', name: 'Catering', icon: 'utensilscrossed' },
  { id: 'f4', name: 'Music & DJ', icon: 'music' },
  { id: 'f5', name: 'Decor', icon: 'heart' },
  { id: 'f6', name: 'Floral', icon: 'flower2' },
  { id: 'f7', name: 'Event Planner', icon: 'briefcase' },
  { id: 'f8', name: 'Gifts', icon: 'cake' },
  { id: 'f9', name: 'Hair & Makeup', icon: 'brush' },
];

const EditProfileScreen = () => {
  const companyStoreData = useVendorStore((s) => s.company);
  const loading = useVendorStore((s) => s.companyLoading);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    mail: "",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png",
  });

  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);

  const { pickImage, uploadImage } = useImageUpload();

  // Sync with store on mount or store change
  useEffect(() => {
    if (companyStoreData) {
      setCompanyData({
        name: companyStoreData.company || "",
        description: companyStoreData.description || "",
        address: companyStoreData.address || "",
        phone: companyStoreData.phone || "",
        website: companyStoreData.website || "",
        mail: companyStoreData.mail || "",
        logoUrl: companyStoreData.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png",
      });
      if (companyStoreData.category) {
        setSelectedCategories(companyStoreData.category);
      }
    }
  }, [companyStoreData]);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      setFetchingCategories(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, icon")
          .is("parent_id", null)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setAvailableCategories(data);
        } else {
          logger.log("Categories empty in DB, using fallbacks.");
          setAvailableCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        logger.error("Error fetching categories:", error);
        setAvailableCategories(DEFAULT_CATEGORIES);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };


  const handleProfileImageSelect = async () => {
    try {
      setSelectingImage(true);

      const imageUri = await pickImage({
        bucket: "profile-images",
        folder: "profile",
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
      });

      if (imageUri) {
        setSelectedImageUri(imageUri);
        Toast.show({
          type: "success",
          text1: "Image Selected",
          text2: 'Now click "Upload Image" to save it.',
        });
      }
    } catch (error: any) {
      logger.error("Failed to select profile image:", error);
      Toast.show({
        type: "error",
        text1: "Selection Failed",
        text2: error?.message || "Failed to select image. Please try again.",
      });
    } finally {
      setSelectingImage(false);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!selectedImageUri) {
      Toast.show({
        type: "error",
        text1: "No Image Selected",
        text2: "Please select an image first.",
      });
      return;
    }

    try {
      setUploadingImage(true);

      Toast.show({
        type: "info",
        text1: "Uploading...",
        text2: "Uploading image to server...",
      });

      const imageUrl = await uploadImage(selectedImageUri, {
        bucket: "profile-images",
        folder: "profile",
      });

      if (imageUrl) {
        // Update local state
        setCompanyData({ ...companyData, logoUrl: imageUrl });

        // Update in database
        await useCompanyInfo({
          company: companyData.name,
          mail: companyData.mail,
          phone: companyData.phone,
          address: companyData.address,
          website: companyData.website,
          description: companyData.description,
          logo_url: imageUrl,
        });

        // Clear selected image after successful upload
        setSelectedImageUri(null);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile image updated successfully!",
        });
      }
    } catch (error: any) {
      logger.error("Failed to upload profile image:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2:
          error?.message || "Failed to upload profile image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!companyData.name.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Company name is required.",
        });
        setSaving(false);
        return;
      }

      await useCompanyInfo({
        company: companyData.name,
        mail: companyData.mail,
        phone: companyData.phone,
        address: companyData.address,
        website: companyData.website,
        description: companyData.description,
        logo_url: companyData.logoUrl,
        category: selectedCategories,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Company information saved successfully!",
      });

      // Optionally go back after saving
      // router.back();
    } catch (error) {
      logger.error("Failed to save company info:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save company information.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Please enable location access in your device settings.",
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
        const parts = [
          geocode.name,
          geocode.street,
          geocode.district || geocode.subregion,
          geocode.city,
          geocode.region,
          geocode.postalCode,
        ].filter(Boolean);
        const uniqueParts = [...new Set(parts)];
        const locationString = uniqueParts.join(", ") || "Unknown location";
        setCompanyData({ ...companyData, address: locationString });

        Toast.show({
          type: "success",
          text1: "Location Found",
          text2: locationString,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not determine your location.",
        });
      }
    } catch (error) {
      logger.error("Error getting location:", error);
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Failed to get your location. Please enter manually.",
      });
    } finally {
      setGeoLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardSafeView
        scrollable={true}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#1c1917" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 52 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: selectedImageUri || companyData.logoUrl }}
                style={styles.avatar}
              />
              {(uploadingImage || selectingImage) && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#FFF" size="large" />
                </View>
              )}
              <Pressable
                style={styles.editBadge}
                onPress={handleProfileImageSelect}
              >
                <Ionicons name="camera" size={18} color="#FFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileTextInfo}>
            <Text
              style={styles.companyName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {companyData.name || "Company Name"}
            </Text>
            <Text style={styles.tagline} numberOfLines={1} ellipsizeMode="tail">
              {companyData.mail || "No email set"}
            </Text>
          </View>

          {selectedImageUri && (
            <Pressable
              style={[
                styles.uploadButton,
                uploadingImage && styles.buttonDisabled,
              ]}
              onPress={handleProfileImageUpload}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Upload New Logo</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionHeader}>Business Details</Text>

          <View style={styles.premiumCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#a8a29e"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={companyData.name}
                  onChangeText={(text) =>
                    setCompanyData({ ...companyData, name: text })
                  }
                  placeholder="Enter business name"
                  placeholderTextColor="#a8a29e"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#a8a29e"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={companyData.mail}
                  onChangeText={(text) =>
                    setCompanyData({ ...companyData, mail: text })
                  }
                  placeholder="business@example.com"
                  placeholderTextColor="#a8a29e"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textareaWrapper]}>
                <TextInput
                  style={styles.textarea}
                  value={companyData.description}
                  onChangeText={(text) =>
                    setCompanyData({ ...companyData, description: text })
                  }
                  placeholder="Tell customers about your services..."
                  placeholderTextColor="#a8a29e"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Categories</Text>
              <Text style={styles.inputHint}>Select the types of services you provide</Text>
              <View style={styles.categoriesContainer}>
                {fetchingCategories ? (
                  <ActivityIndicator size="small" color="#800000" />
                ) : (
                  availableCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.name);
                    const dbIcon = (cat.icon || '').toLowerCase();
                    const iconName = ICON_MAP[dbIcon] || 'ellipse-outline';

                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => toggleCategory(cat.name)}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                        ]}
                      >
                        <Ionicons
                          name={iconName as any}
                          size={16}
                          color={isSelected ? "#FFF" : "#800000"}
                          style={styles.chipIcon}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextSelected,
                          ]}
                        >
                          {cat.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={14} color="#FFF" style={styles.chipCheck} />
                        )}
                      </Pressable>
                    );
                  })
                )}
              </View>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Location & Contact</Text>

          <View style={styles.premiumCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.addressRow}>
                <View style={[styles.inputWrapper, styles.addressAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.addressInput]}
                    value={companyData.address}
                    onChangeText={(text) =>
                      setCompanyData({ ...companyData, address: text })
                    }
                    placeholder="Physical business location"
                    placeholderTextColor="#a8a29e"
                    multiline
                  />
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#a8a29e"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={companyData.phone}
                  onChangeText={(text) =>
                    setCompanyData({ ...companyData, phone: text })
                  }
                  placeholder="+91 00000 00000"
                  placeholderTextColor="#a8a29e"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color="#a8a29e"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={companyData.website}
                  onChangeText={(text) =>
                    setCompanyData({ ...companyData, website: text })
                  }
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor="#a8a29e"
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.saveButtonDisabled,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Profile Changes</Text>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardSafeView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f5",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf8f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#57534e",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1c1917",
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 52,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(128, 0, 0, 0.08)",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 38,
    height: 38,
    backgroundColor: "#800000",
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 0, 0, 0.4)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  profileTextInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1c1917",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#78716c",
    fontWeight: "500",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#800000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
    elevation: 4,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  formContainer: {
    paddingHorizontal: 28,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a8a29e",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  premiumCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(128, 0, 0, 0.04)",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#44403c",
    marginBottom: 10,
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingRight: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafaf9",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#f5f5f4",
    paddingHorizontal: 16,
    minHeight: 56,
  },
  textareaWrapper: {
    height: 120,
    alignItems: "flex-start",
    paddingTop: 12,
  },
  addressAreaWrapper: {
    flex: 1,
    minHeight: 56,
    paddingVertical: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1c1917",
    fontWeight: "500",
  },
  addressInput: {
    textAlignVertical: "top",
    paddingVertical: 12,
    flex: 1,
  },
  textarea: {
    flex: 1,
    fontSize: 15,
    color: "#1c1917",
    fontWeight: "500",
    textAlignVertical: "top",
  },
  geoIconButton: {
    backgroundColor: "rgba(128, 0, 0, 0.08)",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  geoIconButtonDisabled: {
    opacity: 0.5,
  },
  geoIconButtonPressed: {
    backgroundColor: "rgba(128, 0, 0, 0.15)",
    transform: [{ scale: 0.96 }],
  },
  saveButton: {
    backgroundColor: "#800000",
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  saveButtonDisabled: {
    backgroundColor: "#a8a29e",
    shadowOpacity: 0.1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputHint: {
    fontSize: 12,
    color: "#78716c",
    marginBottom: 12,
    marginLeft: 4,
    marginTop: -4,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fafaf9",
    borderWidth: 1,
    borderColor: "#f5f5f4",
    marginBottom: 4,
  },
  categoryChipSelected: {
    backgroundColor: "#800000",
    borderColor: "#800000",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#57534e",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  chipCheck: {
    marginLeft: 4,
  },
  chipIcon: {
    marginRight: 6,
  },
});
