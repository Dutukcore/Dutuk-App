import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import getCompanyInfo from "@/hooks/useGetCompanyInfo";
import useCompanyInfo from "@/hooks/useCompanyInfo";
import useImageUpload from "@/hooks/useImageUpload";
import Toast from "react-native-toast-message";

const EditProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    mail: "",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"
  });

  const { pickImage, uploadImage } = useImageUpload();

  // Fetch company data on mount
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      const data = await getCompanyInfo();
      
      if (data) {
        setCompanyData({
          name: data.company || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          mail: data.mail || "",
          logoUrl: data.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"
        });
      }
    } catch (error) {
      console.error("Failed to load company info:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load company information.'
      });
    } finally {
      setLoading(false);
    }
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
          type: 'success',
          text1: 'Image Selected',
          text2: 'Now click "Upload Image" to save it.'
        });
      }
    } catch (error: any) {
      console.error("Failed to select profile image:", error);
      Toast.show({
        type: 'error',
        text1: 'Selection Failed',
        text2: error?.message || 'Failed to select image. Please try again.'
      });
    } finally {
      setSelectingImage(false);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!selectedImageUri) {
      Toast.show({
        type: 'error',
        text1: 'No Image Selected',
        text2: 'Please select an image first.'
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      Toast.show({
        type: 'info',
        text1: 'Uploading...',
        text2: 'Uploading image to server...'
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
          type: 'success',
          text1: 'Success',
          text2: 'Profile image updated successfully!'
        });
      }
    } catch (error: any) {
      console.error("Failed to upload profile image:", error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.message || 'Failed to upload profile image. Please try again.'
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
          type: 'error',
          text1: 'Validation Error',
          text2: 'Company name is required.'
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
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Company information saved successfully!'
      });
      
      // Optionally go back after saving
      // router.back();
    } catch (error) {
      console.error("Failed to save company info:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save company information.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        
        <Pressable onPress={() => router.back()} >  
          <Ionicons name="chevron-back" size={26} style={styles.backIcon} /> 
        </Pressable>
        
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      {/* Profile Image Section */}
      <View style={styles.profileImageSection}>
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
          </View>
        </View>

        <View style={styles.profileTextInfo}>
          <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
            {companyData.name || "Company Name"}
          </Text>
          <Text style={styles.tagline} numberOfLines={1} ellipsizeMode="tail">
            {companyData.mail || "No email set"}
          </Text>
        </View>

        <View style={styles.imageButtonsContainer}>
          <Pressable 
            style={[styles.primaryBtn, (selectingImage || uploadingImage) && styles.buttonDisabled]} 
            onPress={handleProfileImageSelect}
            disabled={selectingImage || uploadingImage}
          >
            {selectingImage ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="image-outline" size={16} color="#FFF" />
                <Text style={styles.primaryBtnText}>
                  {selectedImageUri ? "Change" : "Select"}
                </Text>
              </>
            )}
          </Pressable>

          {selectedImageUri && (
            <Pressable 
              style={[styles.uploadBtn, uploadingImage && styles.buttonDisabled]} 
              onPress={handleProfileImageUpload}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFF" />
                  <Text style={styles.uploadBtnText}>Upload</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Basic Info</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Company Name *</Text>
        <TextInput 
          style={styles.input} 
          value={companyData.name}
          onChangeText={(text) => setCompanyData({...companyData, name: text})}
          placeholder="Enter company name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          value={companyData.mail}
          onChangeText={(text) => setCompanyData({...companyData, mail: text})}
          placeholder="company@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={styles.textarea} 
          value={companyData.description}
          onChangeText={(text) => setCompanyData({...companyData, description: text})}
          placeholder="Tell customers about your company..."
          multiline 
        />

        <Text style={styles.label}>Address</Text>
        <TextInput 
          style={styles.input} 
          value={companyData.address}
          onChangeText={(text) => setCompanyData({...companyData, address: text})}
          placeholder="Company address"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          value={companyData.phone}
          onChangeText={(text) => setCompanyData({...companyData, phone: text})}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Website</Text>
        <TextInput 
          style={styles.input} 
          value={companyData.website}
          onChangeText={(text) => setCompanyData({...companyData, website: text})}
          placeholder="https://yourwebsite.com"
          keyboardType="url"
          autoCapitalize="none"
        />

        <Pressable 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f5",
    paddingHorizontal: 28,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },

  backIcon: {
    marginRight: 12,
    color: '#800000',
  },

  headerText: {
    fontSize: 32,
    fontWeight: "700",
    color: '#800000',
    letterSpacing: -0.5,
  },

  profileImageSection: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 18,
  },

  avatarWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E5E5",
    borderWidth: 3,
    borderColor: "#faf8f5",
  },

  profileTextInfo: {
    alignItems: "center",
    marginBottom: 18,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    width: "100%",
    color: '#1c1917',
    letterSpacing: -0.3,
  },

  tagline: {
    fontSize: 13,
    color: "#57534e",
    textAlign: "center",
    width: "100%",
    fontWeight: '400',
  },

  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#800000",
    minWidth: 100,
    justifyContent: "center",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#800000",
    minWidth: 100,
    justifyContent: "center",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },

  uploadBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  outlinedBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
  },

  outlinedBtnText: {
    color: "black",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: '#1c1917',
    letterSpacing: -0.3,
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
    color: "#1c1917",
    letterSpacing: -0.1,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(128, 0, 0, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: "#fff",
    color: '#1c1917',
  },

  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: "rgba(128, 0, 0, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    color: '#1c1917',
  },

  saveButton: {
    marginTop: 28,
    backgroundColor: "#800000",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },

  saveButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#57534e",
    fontWeight: '500',
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 0, 0, 0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
