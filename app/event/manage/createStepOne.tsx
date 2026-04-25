import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import useImageUpload from "@/features/profile/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const CreateEventStepOne = () => {
    const [selectingImage, setSelectingImage] = useState(false);
    const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");

    const { pickAndUploadImage } = useImageUpload();

    const handleImagePicker = async () => {
        try {
            setSelectingImage(true);
            const imageUrl = await pickAndUploadImage({
                bucket: "event-images",
                folder: "events",
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.8,
            });

            if (imageUrl) {
                setEventImageUrl(imageUrl);
                Toast.show({
                    type: 'success',
                    text1: 'Image Uploaded',
                    text2: 'Event image successfully attached.'
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Selection Failed',
                text2: error?.message || 'Failed to select image.'
            });
        } finally {
            setSelectingImage(false);
        }
    };

    const handleNext = () => {
        if (!eventTitle.trim()) {
            Toast.show({ type: "error", text1: "Title Required", text2: "Please enter an event title." });
            return;
        }
        if (!eventImageUrl) {
            Toast.show({ type: "error", text1: "Image Required", text2: "Please upload an event image." });
            return;
        }

        router.push({
            pathname: '/event/manage/createStepTwo' as any,
            params: {
                eventTitle: eventTitle.trim(),
                eventImageUrl: eventImageUrl,
            }
        });
    };

    return (
        <KeyboardSafeView
            scrollable={true}
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Header Area */}
            <View style={styles.headerArea}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#800000" />
                </Pressable>
                <View>
                    <Text style={styles.pageTitle}>Create Service</Text>
                    <Text style={styles.pageSubtitle}>Step 1: Basics</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '50%' }]} />
            </View>

            <View style={styles.mainContainer}>
                {/* Event Title Input */}
                <View style={styles.inputCard}>
                    <Text style={styles.fieldLabel}>SERVICE TITLE *</Text>
                    <TextInput
                        style={styles.titleInput}
                        value={eventTitle}
                        onChangeText={setEventTitle}
                        placeholder="e.g. Wedding Reception"
                        placeholderTextColor="#999"
                        autoFocus
                    />
                </View>

                {/* Image Section */}
                <Text style={[styles.fieldLabel, { marginLeft: 4, marginTop: 24 }]}>EVENT COVER IMAGE *</Text>
                {eventImageUrl ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: eventImageUrl }} style={styles.imagePreview} />
                        <Pressable style={styles.changeImageBtn} onPress={handleImagePicker}>
                            <Ionicons name="camera" size={20} color="#FFF" />
                            <Text style={styles.changeImageText}>Change Cover</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={styles.uploadBox}
                        onPress={handleImagePicker}
                        disabled={selectingImage}
                    >
                        {selectingImage ? (
                            <ActivityIndicator color="#800000" size="large" />
                        ) : (
                            <>
                                <View style={styles.uploadIconCircle}>
                                    <Ionicons name="image-outline" size={32} color="#800000" />
                                </View>
                                <Text style={styles.uploadTitle}>Choose a Cover Photo</Text>
                                <Text style={styles.uploadSubtitle}>High quality photos attract more views</Text>
                            </>
                        )}
                    </Pressable>
                )}

                <View style={styles.spacer} />

                {/* Footer Actions */}
                <Pressable style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next Step</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </Pressable>

                <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Discard and Go Back</Text>
                </Pressable>
            </View>
        </KeyboardSafeView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    content: { paddingBottom: 40 },
    headerArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        gap: 16,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#800000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#1c1917', letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 14, fontWeight: '600', color: '#800000', marginTop: -2 },

    progressContainer: {
        height: 6, width: '100%', backgroundColor: '#E5E5E5',
    },
    progressBar: {
        height: '100%', backgroundColor: '#800000',
    },

    mainContainer: { padding: 24 },
    inputCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 24,
        shadowColor: '#800000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
        borderWidth: 1, borderColor: 'rgba(128,0,0,0.05)',
    },
    fieldLabel: {
        fontSize: 10, fontWeight: '800', color: '#800000',
        letterSpacing: 1, marginBottom: 12, opacity: 0.8,
    },
    titleInput: {
        fontSize: 18, fontWeight: '700', color: '#1c1917',
        paddingVertical: 8,
    },

    imagePreviewContainer: {
        width: '100%', height: 240, borderRadius: 24, overflow: 'hidden',
        position: 'relative', marginTop: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    changeImageBtn: {
        position: 'absolute', bottom: 16, right: 16,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20,
    },
    changeImageText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

    uploadBox: {
        width: '100%', height: 240, borderRadius: 24, marginTop: 12,
        backgroundColor: '#FFF', borderStyle: 'dashed', borderWidth: 2,
        borderColor: 'rgba(128,0,0,0.2)', alignItems: 'center', justifyContent: 'center',
        padding: 24,
    },
    uploadIconCircle: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#80000010',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    uploadTitle: { fontSize: 18, fontWeight: '800', color: '#1c1917', marginBottom: 4 },
    uploadSubtitle: { fontSize: 14, color: '#777', textAlign: 'center', fontWeight: '500' },

    spacer: { height: 60 },
    nextButton: {
        backgroundColor: '#800000', paddingVertical: 20, borderRadius: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
        shadowColor: '#800000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    },
    nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    cancelBtn: { marginTop: 24, alignItems: 'center' },
    cancelText: { color: '#800000', fontWeight: '700', fontSize: 15, opacity: 0.6 },
});

export default CreateEventStepOne;
