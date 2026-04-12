/**
 * Services Catalogue Management Screen
 * Vendors manage their service offerings with the 3-model pricing system.
 * Uses useServices hook (vendor_services table).
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useServices, Service, CreateServiceParams } from '@/hooks/useServices';

type PricingModel = 'starting' | 'range' | 'quote';

interface ServiceForm {
  name: string;
  description: string;
  category: string;
  pricing_model: PricingModel;
  min_price: string;
  max_price: string;
  usp_tags: string;
  is_active: boolean;
}

const PRICING_MODEL_OPTIONS: { value: PricingModel; label: string; desc: string; icon: string }[] = [
  { value: 'starting', label: 'Starting Price', desc: 'Minimum starting rate', icon: 'pricetag-outline' },
  { value: 'range', label: 'Budget Range', desc: 'Min–max price range', icon: 'stats-chart-outline' },
  { value: 'quote', label: 'Quote-Based', desc: 'Custom pricing per request', icon: 'chatbubble-ellipses-outline' },
];

const CATEGORIES = [
  'Photography', 'Catering', 'Decoration', 'Entertainment',
  'Venue', 'Transport', 'Makeup & Beauty', 'Audio/Visual', 'Planning', 'Other',
];

const PricingModelSelector = ({
  value,
  onChange,
}: {
  value: PricingModel;
  onChange: (v: PricingModel) => void;
}) => (
  <View style={styles.pricingModelRow}>
    {PRICING_MODEL_OPTIONS.map((opt) => (
      <Pressable
        key={opt.value}
        style={[styles.pricingModelCard, value === opt.value && styles.pricingModelCardActive]}
        onPress={() => onChange(opt.value)}
      >
        <Ionicons
          name={opt.icon as any}
          size={22}
          color={value === opt.value ? COLORS.bgCard : COLORS.primaryMid}
        />
        <Text style={[styles.pricingModelLabel, value === opt.value && styles.pricingModelLabelActive]}>
          {opt.label}
        </Text>
        <Text style={[styles.pricingModelDesc, value === opt.value && styles.pricingModelDescActive]}>
          {opt.desc}
        </Text>
      </Pressable>
    ))}
  </View>
);

const ServiceCard = ({
  service,
  onEdit,
  onToggle,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const renderPrice = () => {
    switch (service.pricing_model) {
      case 'starting':
        return service.min_price ? `Starting from ₹${service.min_price.toLocaleString()}` : 'Price TBD';
      case 'range':
        return service.min_price && service.max_price
          ? `₹${service.min_price.toLocaleString()} – ₹${service.max_price.toLocaleString()}`
          : 'Price TBD';
      case 'quote':
        return '💬 Quote-Based';
    }
  };

  return (
    <View style={[styles.serviceCard, !service.is_active && styles.serviceCardInactive]}>
      <View style={styles.serviceCardHeader}>
        <View style={styles.serviceCardTitle}>
          <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
          {service.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{service.category}</Text>
            </View>
          )}
        </View>
        <Switch
          value={service.is_active}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primaryAlpha(0.3) }}
          thumbColor={service.is_active ? COLORS.primary : '#d6d3d1'}
          ios_backgroundColor={COLORS.border}
        />
      </View>

      {service.description ? (
        <Text style={styles.serviceDescription} numberOfLines={2}>{service.description}</Text>
      ) : null}

      <View style={styles.servicePriceRow}>
        <Ionicons
          name={service.pricing_model === 'quote' ? 'chatbubble-ellipses-outline' : 'wallet-outline'}
          size={14}
          color={COLORS.gold}
        />
        <Text style={styles.servicePrice}>{renderPrice()}</Text>
      </View>

      {service.usp_tags && service.usp_tags.length > 0 && (
        <View style={styles.uspTagsRow}>
          {service.usp_tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.uspTag}>
              <Text style={styles.uspTagText}>✦ {tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.serviceCardFooter}>
        <Pressable style={styles.editBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={15} color={COLORS.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={15} color={COLORS.error} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  category: '',
  pricing_model: 'starting',
  min_price: '',
  max_price: '',
  usp_tags: '',
  is_active: true,
};

export default function ServicesCatalogueScreen() {
  const { services, loading, refetch, createService, updateService, deleteService, toggleServiceActive } = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      pricing_model: service.pricing_model,
      min_price: service.min_price?.toString() || '',
      max_price: service.max_price?.toString() || '',
      usp_tags: (service.usp_tags || []).join(', '),
      is_active: service.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter a service name.');
      return;
    }

    setSaving(true);

    const payload: CreateServiceParams = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category || undefined,
      pricing_model: form.pricing_model,
      min_price: form.min_price ? Number(form.min_price) : undefined,
      max_price: form.max_price ? Number(form.max_price) : undefined,
      usp_tags: form.usp_tags
        ? form.usp_tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined,
      is_active: form.is_active,
    };

    let success = false;
    if (editingId) {
      success = await updateService(editingId, payload);
    } else {
      const created = await createService(payload);
      success = !!created;
    }

    if (success) {
      setShowForm(false);
    } else {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }

    setSaving(false);
  };

  const handleDelete = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Delete "${service.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => deleteService(service.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>My Services</Text>
          <Text style={styles.headerSubtitle}>{services.length} in catalogue</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={22} color={COLORS.bgCard} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            services.length === 0 && styles.scrollContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No services yet</Text>
              <Text style={styles.emptySubtitle}>Add services so customers can see your offerings</Text>
              <Pressable style={styles.emptyAddBtn} onPress={openCreate}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.bgCard} />
                <Text style={styles.emptyAddBtnText}>Add Service</Text>
              </Pressable>
            </View>
          ) : (
            services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onEdit={() => openEdit(s)}
                onToggle={() => toggleServiceActive(s.id)}
                onDelete={() => handleDelete(s)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowForm(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.primary} />
              </Pressable>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Service' : 'New Service'}</Text>
              <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={COLORS.bgCard} /> : <Text style={styles.saveBtnText}>Save</Text>}
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Service Name *</Text>
                <TextInput style={styles.textInput} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))}
                  placeholder="e.g. Wedding Photography Package" placeholderTextColor={COLORS.textMuted} />
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput style={[styles.textInput, styles.textArea]} value={form.description}
                  onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  placeholder="What does this service include?" placeholderTextColor={COLORS.textMuted}
                  multiline numberOfLines={4} textAlignVertical="top" />
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Pressable style={styles.textInput} onPress={() => setShowCategoryPicker(true)}>
                  <Text style={form.category ? styles.inputText : styles.inputPlaceholder}>
                    {form.category || 'Select a category'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
                </Pressable>
              </View>

              {/* Pricing Model */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Pricing Model</Text>
                <PricingModelSelector value={form.pricing_model} onChange={v => setForm(f => ({ ...f, pricing_model: v }))} />
              </View>

              {/* Price Fields */}
              {form.pricing_model !== 'quote' && (
                <View style={styles.priceFieldsRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>{form.pricing_model === 'starting' ? 'Starting Price (₹)' : 'Min Price (₹)'}</Text>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.currencyPre}>₹</Text>
                      <TextInput style={styles.priceInput} value={form.min_price}
                        onChangeText={v => setForm(f => ({ ...f, min_price: v }))}
                        placeholder="10000" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
                    </View>
                  </View>
                  {form.pricing_model === 'range' && (
                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>Max Price (₹)</Text>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.currencyPre}>₹</Text>
                        <TextInput style={styles.priceInput} value={form.max_price}
                          onChangeText={v => setForm(f => ({ ...f, max_price: v }))}
                          placeholder="50000" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* USP Tags */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>USP Tags (comma separated, max 3)</Text>
                <TextInput style={styles.textInput} value={form.usp_tags}
                  onChangeText={v => setForm(f => ({ ...f, usp_tags: v }))}
                  placeholder="e.g. 5-hour coverage, Drone shots, Same-day edit"
                  placeholderTextColor={COLORS.textMuted} />
                <Text style={styles.fieldHint}>These appear as badges on your vendor card</Text>
              </View>

              {/* Active toggle */}
              <View style={styles.activeToggleRow}>
                <View>
                  <Text style={styles.fieldLabel}>Visible to customers</Text>
                  <Text style={styles.fieldHint}>Toggle off to temporarily hide</Text>
                </View>
                <Switch value={form.is_active} onValueChange={v => setForm(f => ({ ...f, is_active: v }))}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryAlpha(0.3) }}
                  thumbColor={form.is_active ? COLORS.primary : '#d6d3d1'} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Category Picker */}
        <Modal visible={showCategoryPicker} transparent animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Category</Text>
              <ScrollView>
                {CATEGORIES.map(cat => (
                  <Pressable key={cat}
                    style={[styles.pickerItem, form.category === cat && styles.pickerItemActive]}
                    onPress={() => { setForm(f => ({ ...f, category: cat })); setShowCategoryPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, form.category === cat && styles.pickerItemTextActive]}>{cat}</Text>
                    {form.category === cat && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING['3xl'], paddingTop: SPACING.md, paddingBottom: SPACING.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.primary, letterSpacing: -0.3, textAlign: 'center' },
  headerSubtitle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.medium, textAlign: 'center' },
  addBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', ...SHADOW.md,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING['3xl'], paddingBottom: 100, gap: SPACING.md },
  scrollContentEmpty: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING['4xl'] },
  emptyTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginTop: SPACING.xl, textAlign: 'center' },
  emptySubtitle: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.lg, borderRadius: RADIUS.xl, marginTop: SPACING['2xl'], ...SHADOW.md,
  },
  emptyAddBtnText: { fontSize: TYPOGRAPHY.base, fontWeight: TYPOGRAPHY.bold, color: COLORS.bgCard },
  serviceCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS['2xl'], padding: SPACING['2xl'], borderWidth: 1, borderColor: COLORS.border, ...SHADOW.md },
  serviceCardInactive: { opacity: 0.55 },
  serviceCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.sm },
  serviceCardTitle: { flex: 1, marginRight: SPACING.md },
  serviceName: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginBottom: 4 },
  categoryTag: { backgroundColor: COLORS.bgMuted, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.border },
  categoryTagText: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.semibold, color: COLORS.primaryMid },
  serviceDescription: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  servicePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.goldLight, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.md, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  servicePrice: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  uspTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  uspTag: { backgroundColor: 'rgba(79,0,0,0.05)', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(79,0,0,0.08)' },
  uspTagText: { fontSize: 11, fontWeight: TYPOGRAPHY.semibold, color: COLORS.primaryMid },
  serviceCardFooter: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.bgMuted, paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  editBtnText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.primary },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)', backgroundColor: 'rgba(255,59,48,0.05)' },
  deleteBtnText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.error },
  modalContainer: { flex: 1, backgroundColor: COLORS.bgBase },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING['3xl'], paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalCloseBtn: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.bgMuted, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: 8, borderRadius: RADIUS.xl, ...SHADOW.sm, minWidth: 60, alignItems: 'center' },
  saveBtnText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold, color: COLORS.bgCard },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: SPACING['3xl'], paddingVertical: SPACING['2xl'], gap: SPACING.xl, paddingBottom: 80 },
  fieldGroup: { gap: SPACING.sm },
  fieldLabel: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary },
  fieldHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  textInput: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textArea: { minHeight: 100 },
  inputText: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, flex: 1 },
  inputPlaceholder: { fontSize: TYPOGRAPHY.base, color: COLORS.textMuted, flex: 1 },
  pricingModelRow: { flexDirection: 'row', gap: SPACING.sm },
  pricingModelCard: { flex: 1, alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard, gap: 4 },
  pricingModelCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  pricingModelLabel: { fontSize: 11, fontWeight: TYPOGRAPHY.bold, color: COLORS.primaryMid, textAlign: 'center' },
  pricingModelLabelActive: { color: COLORS.bgCard },
  pricingModelDesc: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', lineHeight: 12 },
  pricingModelDescActive: { color: 'rgba(255,255,255,0.7)' },
  priceFieldsRow: { flexDirection: 'row', gap: SPACING.md },
  priceInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, height: 48 },
  currencyPre: { fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold, color: COLORS.primary, marginRight: 4 },
  priceInput: { flex: 1, fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  activeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bgCard, padding: SPACING.xl, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerContent: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS['3xl'], borderTopRightRadius: RADIUS['3xl'], padding: SPACING['3xl'], maxHeight: '60%' },
  pickerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  pickerItemActive: { backgroundColor: COLORS.bgMuted, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md },
  pickerItemText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.medium },
  pickerItemTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.bold },
});
