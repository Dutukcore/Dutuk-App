import { PortfolioItem, usePortfolio } from '@/hooks/usePortfolio';
import { toast, Toasts } from '@backpackapp-io/react-native-toast';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
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
const GRID_GAP = 8;
const GRID_COLUMNS = 2;
const IMAGE_SIZE = (width - 32 - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;

const EVENT_TYPES = [
    'Wedding',
    'Birthday',
    'Corporate',
    'Concert',
    'Festival',
    'Private Party',
    'Other',
];

const PortfolioPage = () => {
    const {
        items,
        loading,
        error,
        uploading,
        refetch,
        pickAndUploadImage,
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

    const openDetailModal = (item: PortfolioItem) => {
        setSelectedItem(item);
        setEditTitle(item.title || '');
        setEditDescription(item.description || '');
        setEditEventType(item.event_type || '');
        setShowDetailModal(true);
    };

    const handleAddImage = async () => {
        const result = await pickAndUploadImage();
        if (result) {
            toast.success('Image added to portfolio!');
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
                    onPress={handleAddImage}
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
                }
            >
                {loading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading portfolio...</Text>
                    </View>
                )}

                {!loading && items.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={64} color="#007AFF" />
                        <Text style={styles.emptyTitle}>No portfolio images</Text>
                        <Text style={styles.emptySubtitle}>
                            Showcase your past work to attract more customers
                        </Text>
                        <Pressable
                            style={[styles.emptyAddButton, uploading && styles.addButtonDisabled]}
                            onPress={handleAddImage}
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

                {/* Image Grid */}
                {items.length > 0 && (
                    <View style={styles.grid}>
                        {items.map((item) => (
                            <Pressable
                                key={item.id}
                                style={styles.gridItem}
                                onPress={() => openDetailModal(item)}
                            >
                                <Image source={{ uri: item.image_url }} style={styles.gridImage} />
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
                                <ActivityIndicator size="small" color="#007AFF" />
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
        backgroundColor: '#F3F3F3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    addButton: {
        padding: 8,
        backgroundColor: '#007AFF',
        borderRadius: 20,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    emptyAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    emptyAddButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
    },
    gridItem: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E5E5',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 12,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalCancel: {
        fontSize: 16,
        color: '#666',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    modalSave: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    quickActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    quickActionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    deleteActionButton: {
        backgroundColor: '#FFE5E5',
    },
    deleteActionText: {
        color: '#FF3B30',
    },
    formGroup: {
        padding: 16,
        paddingTop: 0,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    formInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    formTextArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    eventTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    eventTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    eventTypeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    eventTypeButtonText: {
        fontSize: 14,
        color: '#666',
    },
    eventTypeButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default PortfolioPage;
