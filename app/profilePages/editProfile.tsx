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

  const handleProfileImageUpload = async () => {
    try {
      setUploadingImage(true);
      
      Toast.show({
        type: 'info',
        text1: 'Uploading...',
        text2: 'Compressing and uploading image...'
      });
      
      const imageUrl = await pickAndUploadImage({
        bucket: "profile-images",
        folder: "profile",
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
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

      {/* Profile Row */}
      <View style={styles.avatarRow}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: companyData.logoUrl }} style={styles.avatar} />
          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#FFF" size="large" />
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.companyName}>{companyData.name || "Company Name"}</Text>
          <Text style={styles.tagline}>{companyData.mail || "No email set"}</Text>

          <View style={styles.buttonRow}>
            <Pressable 
              style={[styles.primaryBtn, uploadingImage && { opacity: 0.6 }]} 
              onPress={handleProfileImageUpload}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Change Profile</Text>
              )}
            </Pressable>

            <Pressable style={styles.outlinedBtn}>
              <Text style={styles.outlinedBtnText}>Customize Banner</Text>
            </Pressable>
          </View>
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
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  backIcon: {
    marginRight: 10,
  },

  headerText: {
    fontSize: 26,
    fontWeight: "700",
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  tagline: {
    fontSize: 13,
    color: "#444",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  primaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "black",
  },

  primaryBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 15,
  },

  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },

  textarea: {
    height: 90,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },

  saveButton: {
    marginTop: 25,
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
