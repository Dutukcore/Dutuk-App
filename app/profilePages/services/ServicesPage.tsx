import { CreateServiceParams, Service, useServices } from '@/features/profile/hooks/useServices';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Toast from 'react-native-toast-message';

const PRICE_TYPES = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'starting_from', label: 'Starting From' },
    { value: 'hourly', label: 'Per Hour' },
    { value: 'per_event', label: 'Per Event' },
    { value: 'custom', label: 'Custom/Negotiable' },
];

const ServicesPage = () => {
    const {
        services,
        loading,
        error,
        refetch,
        createService,
        updateService,
        deleteService,
        toggleServiceActive,
    } = useServices();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formPriceType, setFormPriceType] = useState<Service['price_type']>('fixed');
    const [formDuration, setFormDuration] = useState('');

    const resetForm = () => {
        setFormName('');
        setFormDescription('');
        setFormPrice('');
        setFormPriceType('fixed');
        setFormDuration('');
        setEditingService(null);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormName(service.name);
        setFormDescription(service.description || '');
        setFormPrice(service.price?.toString() || '');
        setFormPriceType(service.price_type);
        setFormDuration(service.duration_hours?.toString() || '');
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            Toast.show({ type: 'error', text1: 'Please enter a service name' });
            return;
        }

        setSaving(true);

        const params: CreateServiceParams = {
            name: formName.trim(),
            description: formDescription.trim() || undefined,
            price: formPrice ? parseFloat(formPrice) : undefined,
            price_type: formPriceType,
            duration_hours: formDuration ? parseInt(formDuration) : undefined,
        };

        try {
            if (editingService) {
                const success = await updateService(editingService.id, params);
                if (success) {
                    Toast.show({ type: 'success', text1: 'Service updated!' });
                    setShowAddModal(false);
                    resetForm();
                } else {
                    Toast.show({ type: 'error', text1: 'Failed to update service' });
                }
            } else {
                const result = await createService(params);
                if (result) {
                    Toast.show({ type: 'success', text1: 'Service created!' });
                    setShowAddModal(false);
                    resetForm();
                } else {
                    Toast.show({ type: 'error', text1: 'Failed to create service' });
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (service: Service) => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${service.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteService(service.id);
                        if (success) {
                            Toast.show({ type: 'success', text1: 'Service deleted' });
                        } else {
                            Toast.show({ type: 'error', text1: 'Failed to delete service' });
                        }
                    },
                },
            ]
        );
    };

    const handleToggleActive = async (service: Service) => {
        const success = await toggleServiceActive(service.id);
        if (success) {
            Toast.show({ type: 'success', text1: service.is_active ? 'Service hidden' : 'Service visible' });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const formatPrice = (service: Service) => {
        if (!service.price) return 'Price on request';
        const priceStr = `₹${service.price.toLocaleString()}`;
        switch (service.price_type) {
            case 'starting_from':
                return `From ${priceStr}`;
            case 'hourly':
                return `${priceStr}/hr`;
            case 'per_event':
                return `${priceStr}/event`;
            default:
                return priceStr;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text style={styles.headerTitle}>My Services</Text>
                <Pressable onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#fff" />
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
                        <Text style={styles.loadingText}>Loading services...</Text>
                    </View>
                )}

                {!loading && services.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="briefcase-outline" size={64} color="#007AFF" />
                        <Text style={styles.emptyTitle}>No services yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your services to show customers what you offer
                        </Text>
                        <Pressable style={styles.emptyAddButton} onPress={() => setShowAddModal(true)}>
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.emptyAddButtonText}>Add Service</Text>
                        </Pressable>
                    </View>
                )}

                {services.map((service) => (
                    <View key={service.id} style={[styles.serviceCard, !service.is_active && styles.serviceCardInactive]}>
                        <View style={styles.serviceHeader}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                {!service.is_active && (
                                    <View style={styles.hiddenBadge}>
                                        <Text style={styles.hiddenBadgeText}>Hidden</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                        </View>

                        {service.description && (
                            <Text style={styles.serviceDescription} numberOfLines={2}>
                                {service.description}
                            </Text>
                        )}

                        {service.duration_hours && (
                            <View style={styles.durationBadge}>
                                <Ionicons name="time-outline" size={14} color="#666" />
                                <Text style={styles.durationText}>{service.duration_hours} hours</Text>
                            </View>
                        )}

                        <View style={styles.serviceActions}>
                            <Pressable style={styles.actionButton} onPress={() => openEditModal(service)}>
                                <Ionicons name="pencil" size={18} color="#007AFF" />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </Pressable>

                            <Pressable style={styles.actionButton} onPress={() => handleToggleActive(service)}>
                                <Ionicons name={service.is_active ? 'eye-off' : 'eye'} size={18} color="#666" />
                                <Text style={styles.actionButtonText}>{service.is_active ? 'Hide' : 'Show'}</Text>
                            </Pressable>

                            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(service)}>
                                <Ionicons name="trash" size={18} color="#FF3B30" />
                                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </Pressable>
                        <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'New Service'}</Text>
                        <Pressable onPress={handleSave} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#007AFF" />
                            ) : (
                                <Text style={styles.modalSave}>Save</Text>
                            )}
                        </Pressable>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Service Name *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formName}
                                onChangeText={setFormName}
                                placeholder="e.g., Wedding Photography"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={[styles.formInput, styles.formTextArea]}
                                value={formDescription}
                                onChangeText={setFormDescription}
                                placeholder="Describe what this service includes..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.formLabel}>Price (₹)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formPrice}
                                    onChangeText={setFormPrice}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.formLabel}>Duration (hours)</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={formDuration}
                                    onChangeText={setFormDuration}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Price Type</Text>
                            <View style={styles.priceTypeGrid}>
                                {PRICE_TYPES.map((type) => (
                                    <Pressable
                                        key={type.value}
                                        style={[
                                            styles.priceTypeButton,
                                            formPriceType === type.value && styles.priceTypeButtonActive,
                                        ]}
                                        onPress={() => setFormPriceType(type.value as Service['price_type'])}
                                    >
                                        <Text
                                            style={[
                                                styles.priceTypeButtonText,
                                                formPriceType === type.value && styles.priceTypeButtonTextActive,
                                            ]}
                                        >
                                            {type.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
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
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceCardInactive: {
        opacity: 0.7,
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    serviceInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    serviceName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    hiddenBadge: {
        backgroundColor: '#FF950020',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    hiddenBadgeText: {
        fontSize: 11,
        color: '#FF9500',
        fontWeight: '600',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    durationText: {
        fontSize: 13,
        color: '#666',
    },
    serviceActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#666',
    },
    deleteButton: {},
    deleteButtonText: {
        color: '#FF3B30',
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
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    formRow: {
        flexDirection: 'row',
    },
    priceTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priceTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    priceTypeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    priceTypeButtonText: {
        fontSize: 14,
        color: '#666',
    },
    priceTypeButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default ServicesPage;
