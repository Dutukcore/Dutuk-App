import { PortfolioItem, usePortfolio } from '@/hooks/usePortfolio';
import { toast, Toasts } from '@backpackapp-io/react-native-toast';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_COLUMNS = 2;
const IMAGE_SIZE = (width - 40 - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;

const EVENT_TYPES = [
    'Wedding',
    'Birthday',
    'Corporate',
    'Concert',
    'Festival',
    'Private Party',
    'Other',
];

// Helper to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(url);
};

const PortfolioPage = () => {
    const {
        items,
        loading,
        error,
        uploading,
        refetch,
        pickAndUploadImage,
        pickAndUploadVideo,
        updateItem,
        deleteItem,
        toggleFeatured,
    } = usePortfolio();

    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editEventType, setEditEventType] = useState('');

    // Show error toast when error state changes
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const openDetailModal = (item: PortfolioItem) => {
        setSelectedItem(item);
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditEventType(item.event_type || '');
        setShowDetailModal(true);
    };

    const handleAddMedia = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Add Photo', 'Add Video'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        const result = await pickAndUploadImage();
                        if (result) {
                            toast.success('Photo added to portfolio!');
                        } else if (error) {
                            toast.error(error);
                        }
                    } else if (buttonIndex === 2) {
                        const result = await pickAndUploadVideo();
                        if (result) {
                            toast.success('Video added to portfolio!');
                        } else if (error) {
                            toast.error(error);
                        }
                    }
                }
            );
        } else {
            // Android - show alert with options
            Alert.alert(
                'Add to Portfolio',
                'Choose what to add',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Photo',
                        onPress: async () => {
                            const result = await pickAndUploadImage();
                            if (result) {
                                toast.success('Photo added to portfolio!');
                            } else if (error) {
                                toast.error(error);
                            }
                        },
                    },
                    {
                        text: 'Video',
                        onPress: async () => {
                            const result = await pickAndUploadVideo();
                            if (result) {
                                toast.success('Video added to portfolio!');
                            } else if (error) {
                                toast.error(error);
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleSaveDetails = async () => {
        if (!selectedItem) return;

        setSaving(true);
        const success = await updateItem(selectedItem.id, {
            title: editTitle.trim() || undefined,
            description: editDescription.trim() || undefined,
            event_type: editEventType || undefined,
        });
        setSaving(false);

        if (success) {
            toast.success('Details saved!');
            setShowDetailModal(false);
        } else {
            toast.error('Failed to save details');
        }
    };

    const handleToggleFeatured = async () => {
        if (!selectedItem) return;

        const success = await toggleFeatured(selectedItem.id);
        if (success) {
            toast.success(selectedItem.is_featured ? 'Removed from featured' : 'Added to featured');
            setSelectedItem({ ...selectedItem, is_featured: !selectedItem.is_featured });
        }
    };

    const handleDelete = () => {
        if (!selectedItem) return;

        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteItem(selectedItem.id);
                        if (success) {
                            toast.success('Image deleted');
                            setShowDetailModal(false);
                        } else {
                            toast.error('Failed to delete image');
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Toasts />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text style={styles.headerTitle}>Portfolio</Text>
                <Pressable
                    onPress={handleAddMedia}
                    style={[styles.addButton, uploading && styles.addButtonDisabled]}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="add" size={24} color="#fff" />
                    )}
                </Pressable>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" colors={["#800000"]} />
                }
            >
                {loading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                        <Text style={styles.loadingText}>Loading portfolio...</Text>
                    </View>
                )}

                {!loading && items.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={64} color="#800000" />
                        <Text style={styles.emptyTitle}>No portfolio images</Text>
                        <Text style={styles.emptySubtitle}>
                            Showcase your past work to attract more customers
                        </Text>
                        <Pressable
                            style={[styles.emptyAddButton, uploading && styles.addButtonDisabled]}
                            onPress={handleAddMedia}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.emptyAddButtonText}>Add Image</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* Media Grid */}
                {items.length > 0 && (
                    <View style={styles.grid}>
                        {items.map((item) => (
                            <Pressable
                                key={item.id}
                                style={styles.gridItem}
                                onPress={() => openDetailModal(item)}
                            >
                                {isVideoUrl(item.image_url) ? (
                                    <View style={styles.videoContainer}>
                                        <Image source={{ uri: item.image_url }} style={styles.gridImage} />
                                        <View style={styles.playIconContainer}>
                                            <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                                        </View>
                                    </View>
                                ) : (
                                    <Image source={{ uri: item.image_url }} style={styles.gridImage} />
                                )}
                                {item.is_featured && (
                                    <View style={styles.featuredBadge}>
                                        <Ionicons name="star" size={12} color="#FFC13C" />
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Pressable onPress={() => setShowDetailModal(false)}>
                            <Text style={styles.modalCancel}>Close</Text>
                        </Pressable>
                        <Text style={styles.modalTitle}>Image Details</Text>
                        <Pressable onPress={handleSaveDetails} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#800000" />
                            ) : (
                                <Text style={styles.modalSave}>Save</Text>
                            )}
                        </Pressable>
                    </View>

                    {selectedItem && (
                        <ScrollView style={styles.modalContent}>
                            {/* Image Preview */}
                            <Image source={{ uri: selectedItem.image_url }} style={styles.previewImage} />

                            {/* Quick Actions */}
                            <View style={styles.quickActions}>
                                <Pressable style={styles.quickActionButton} onPress={handleToggleFeatured}>
                                    <Ionicons
                                        name={selectedItem.is_featured ? 'star' : 'star-outline'}
                                        size={20}
                                        color={selectedItem.is_featured ? '#FFC13C' : '#666'}
                                    />
                                    <Text style={styles.quickActionText}>
                                        {selectedItem.is_featured ? 'Featured' : 'Feature'}
                                    </Text>
                                </Pressable>

                                <Pressable style={[styles.quickActionButton, styles.deleteActionButton]} onPress={handleDelete}>
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                    <Text style={[styles.quickActionText, styles.deleteActionText]}>Delete</Text>
                                </Pressable>
                            </View>

                            {/* Form Fields */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Title (optional)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    placeholder="e.g., Summer Wedding 2024"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description (optional)</Text>
                                <TextInput
                                    style={[styles.formInput, styles.formTextArea]}
                                    value={editDescription}
                                    onChangeText={setEditDescription}
                                    placeholder="Describe this event..."
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Event Type</Text>
                                <View style={styles.eventTypeGrid}>
                                    {EVENT_TYPES.map((type) => (
                                        <Pressable
                                            key={type}
                                            style={[
                                                styles.eventTypeButton,
                                                editEventType === type && styles.eventTypeButtonActive,
                                            ]}
                                            onPress={() => setEditEventType(editEventType === type ? '' : type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.eventTypeButtonText,
                                                    editEventType === type && styles.eventTypeButtonTextActive,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(128, 0, 0, 0.06)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#800000',
        letterSpacing: -0.3,
    },
    addButton: {
        padding: 10,
        backgroundColor: '#800000',
        borderRadius: 24,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    loadingText: {
        marginTop: 16,
        color: '#57534e',
        fontSize: 15,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1c1917',
        marginTop: 24,
        letterSpacing: -0.3,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#57534e',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
    emptyAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#800000',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 28,
        marginTop: 32,
        gap: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    emptyAddButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    gridItem: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#e7e5e4',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.06)',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    playIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(128, 0, 0, 0.3)',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 0, 0, 0.06)',
    },
    modalCancel: {
        fontSize: 16,
        color: '#57534e',
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#800000',
        letterSpacing: -0.2,
    },
    modalSave: {
        fontSize: 16,
        color: '#800000',
        fontWeight: '700',
    },
    modalContent: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: 280,
        resizeMode: 'cover',
        backgroundColor: '#e7e5e4',
    },
    quickActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 0, 0, 0.06)',
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: 'rgba(128, 0, 0, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.08)',
    },
    quickActionText: {
        fontSize: 14,
        color: '#57534e',
        fontWeight: '600',
    },
    deleteActionButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        borderColor: 'rgba(255, 59, 48, 0.15)',
    },
    deleteActionText: {
        color: '#FF3B30',
    },
    formGroup: {
        padding: 20,
        paddingTop: 0,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 10,
        marginTop: 20,
        letterSpacing: 0.3,
    },
    formInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1c1917',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.08)',
    },
    formTextArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    eventTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    eventTypeButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.12)',
    },
    eventTypeButtonActive: {
        backgroundColor: '#800000',
        borderColor: '#800000',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    eventTypeButtonText: {
        fontSize: 14,
        color: '#57534e',
        fontWeight: '600',
    },
    eventTypeButtonTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default PortfolioPage;
