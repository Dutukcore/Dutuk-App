import KeyboardSafeView from "@/components/KeyboardSafeView";
import useImageUpload from "@/hooks/useImageUpload";
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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");

    const { pickAndUploadImage } = useImageUpload();

    const handleImagePicker = async () => {
        try {
            setSelectingImage(true);

            // Using the existing pickAndUploadImage from useImageUpload.ts
            // Note: IMPLEMENTATION_PLAN_TWO_STEP_EVENT_CREATION.md suggested pickImage/uploadImage 
            // but useImageUpload.ts provides pickAndUploadImage.
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
        // Validation
        if (!eventTitle.trim()) {
            Toast.show({
                type: "error",
                text1: "Title Required",
                text2: "Please enter an event title.",
            });
            return;
        }

        if (!eventImageUrl) {
            Toast.show({
                type: "error",
                text1: "Image Required",
                text2: "Please upload an event image.",
            });
            return;
        }

        // Navigate to Step 2 with params
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
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressStep}>
                    <View style={[styles.progressCircle, styles.progressActive]}>
                        <Text style={styles.progressNumber}>1</Text>
                    </View>
                    <Text style={[styles.progressLabel, styles.progressLabelActive]}>Basic Info</Text>
                </View>
                <View style={styles.progressLine} />
                <View style={styles.progressStep}>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressNumber}>2</Text>
                    </View>
                    <Text style={styles.progressLabel}>Details</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step 1: Basic Information</Text>

                {/* Event Title */}
                <Text style={styles.label}>Event Title *</Text>
                <TextInput
                    style={styles.input}
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    placeholder="e.g. Wedding Reception"
                    data-testid="event-title-input"
                />

                {/* Event Image */}
                <Text style={styles.label}>Event Image *</Text>
                {eventImageUrl ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image
                            source={{ uri: eventImageUrl }}
                            style={styles.imagePreview}
                        />
                        <Pressable
                            style={styles.changeImageButton}
                            onPress={handleImagePicker}
                            disabled={selectingImage}
                        >
                            <Text style={styles.changeImageText}>Change Image</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        style={styles.uploadButton}
                        onPress={handleImagePicker}
                        disabled={selectingImage}
                        data-testid="select-image-button"
                    >
                        {selectingImage ? (
                            <ActivityIndicator color="#007AFF" size="large" />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={40} color="#007AFF" />
                                <Text style={styles.uploadButtonText}>Select Event Image</Text>
                                <Text style={styles.uploadButtonSubtext}>Tap to choose from gallery</Text>
                            </>
                        )}
                    </Pressable>
                )}
            </View>

            {/* Next Button */}
            <Pressable
                style={styles.nextButton}
                onPress={handleNext}
                data-testid="next-button"
            >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Cancel Button */}
            <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
        </KeyboardSafeView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#faf8f5",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        marginTop: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    progressActive: {
        backgroundColor: '#800000',
    },
    progressNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    progressLabel: {
        fontSize: 12,
        color: '#999',
    },
    progressLabelActive: {
        color: '#800000',
        fontWeight: '600',
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 8,
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: '#800000',
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
        color: "#1c1917",
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        fontSize: 14,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FF',
        marginTop: 8,
    },
    uploadButtonText: {
        marginTop: 12,
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
    },
    uploadButtonSubtext: {
        marginTop: 4,
        color: '#666666',
        fontSize: 13,
    },
    imagePreviewContainer: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        backgroundColor: '#F0F0F0',
    },
    uploadImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#800000',
        padding: 12,
        marginTop: 8,
    },
    uploadImageButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    changeImageButton: {
        backgroundColor: '#800000',
        padding: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    changeImageText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#800000',
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 16,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: '#800000',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CreateEventStepOne;
