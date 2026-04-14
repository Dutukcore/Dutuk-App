import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import PricingItemEditor from "@/features/events/components/PricingItemEditor";
import deleteEvent from "@/features/events/services/deleteEvent";
import updateEvent, { UpdateEventPayload } from "@/features/events/services/updateEvent";
import { getEventPricing } from "@/features/events/hooks/useEventPricing";
import useImageUpload from "@/features/profile/hooks/useImageUpload";
import { useVendorStore } from "@/store/useVendorStore";
import { createEmptyPricingItem, PricingItem } from "@/types/pricing";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Calendar } from "react-native-calendars";
import Toast from "react-native-toast-message";

// NOTE: 'completed' intentionally excluded — events can only complete via customer confirmation
const STATUSES = ["upcoming", "ongoing", "cancelled"] as const;

type ManageFormState = {
  event: string;
  description: string;
  status: (typeof STATUSES)[number];
  startDate: string;
  endDate: string;
};

const ManageEventScreen = () => {
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = useMemo(() => {
    const raw = params.eventId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.eventId]);

  const allEvents = useVendorStore((s) => s.allEvents);
  const eventsLoading = useVendorStore((s) => s.eventsLoading);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [formState, setFormState] = useState<ManageFormState>({
    event: "",
    description: "",
    status: "upcoming",
    startDate: "",
    endDate: "",
  });
  const [initialFormState, setInitialFormState] = useState<ManageFormState | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([createEmptyPricingItem(0)]);
  const [initialPricingItems, setInitialPricingItems] = useState<PricingItem[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Calendar Modal State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');

  const { pickAndUploadImage } = useImageUpload();

  const hasUnsavedChanges = useMemo(() => {
    if (!initialFormState) return false;
    const formChanged =
      formState.event !== initialFormState.event ||
      formState.description !== initialFormState.description ||
      formState.status !== initialFormState.status ||
      formState.startDate !== initialFormState.startDate ||
      formState.endDate !== initialFormState.endDate;
    const imageChanged = eventImageUrl !== initialImageUrl;
    const pricingChanged = JSON.stringify(pricingItems) !== JSON.stringify(initialPricingItems);
    return formChanged || imageChanged || pricingChanged;
  }, [formState, eventImageUrl, initialFormState, initialImageUrl, pricingItems, initialPricingItems]);

  useEffect(() => {
    if (eventId && allEvents.length > 0) {
      const data = allEvents.find((e) => e.id === eventId);
      if (data) {
        const loadedFormState = {
          event: data.event || "",
          description: data.description || "",
          status: (STATUSES.includes(data.status) ? data.status : "upcoming") as ManageFormState["status"],
          startDate: data.start_date || "",
          endDate: data.end_date || "",
        };
        setFormState(loadedFormState);
        setInitialFormState(loadedFormState);
        if (data.image_url) {
          setEventImageUrl(data.image_url);
          setInitialImageUrl(data.image_url);
        }

        setPricingLoading(true);
        getEventPricing(eventId)
          .then((items) => {
            if (items.length > 0) {
              setPricingItems(items);
              setInitialPricingItems(items);
            } else if (data.payment && data.payment > 0) {
              const seed: PricingItem = { ...createEmptyPricingItem(0), label: 'Service', pricing_type: 'fixed', price: data.payment };
              setPricingItems([seed]);
              setInitialPricingItems([]);
            }
          })
          .finally(() => setPricingLoading(false));
      }
    }
  }, [eventId, allEvents]);

  const handleImagePicker = async () => {
    try {
      setSelectingImage(true);
      const imageUrl = await pickAndUploadImage({ bucket: "event-images", folder: "events" });
      if (imageUrl) setEventImageUrl(imageUrl);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Upload Failed' });
    } finally {
      setSelectingImage(false);
    }
  };

  const openCalendar = (mode: 'start' | 'end') => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };

  const onDateSelect = (day: { dateString: string }) => {
    if (calendarMode === 'start') setFormState(p => ({ ...p, startDate: day.dateString }));
    else setFormState(p => ({ ...p, endDate: day.dateString }));
    setShowCalendar(false);
  };

  const handleSave = async () => {
    if (!eventId || !formState.event.trim()) return;
    setSaving(true);
    try {
      const updates: UpdateEventPayload = {
        event: formState.event.trim(),
        description: formState.description.trim() || null,
        status: formState.status,
        pricingItems,
        image_url: eventImageUrl,
        date: formState.startDate ? [formState.startDate, formState.endDate].filter(Boolean) as string[] : undefined
      };
      await updateEvent(eventId, updates);
      Toast.show({ type: "success", text1: "Event Updated" });
      router.back();
    } catch (error) {
      Toast.show({ type: "error", text1: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!eventId) return;
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          setDeleting(true);
          try {
            await deleteEvent(eventId);
            Toast.show({ type: "success", text1: "Event Deleted" });
            router.push("/(tabs)/home");
          } catch (error) {
            Toast.show({ type: "error", text1: "Delete Failed" });
          } finally { setDeleting(false); }
        }
      }
    ]);
  };

  if (pricingLoading || (eventsLoading && !initialFormState)) {
    return (
      <View style={styles.center}><ActivityIndicator color="#800000" size="large" /></View>
    );
  }

  return (
    <KeyboardSafeView scrollable style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerArea}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#800000" /></Pressable>
        <View>
          <Text style={styles.pageTitle}>Manage Event</Text>
          <Text style={styles.pageSubtitle}>{formState.event || "Edit Details"}</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Cover Image */}
        <View style={styles.imageCard}>
          {eventImageUrl ? (
            <Image source={{ uri: eventImageUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderBox}><Ionicons name="image-outline" size={40} color="#CCC" /></View>
          )}
          <Pressable style={styles.editImageBtn} onPress={handleImagePicker}>
            <Ionicons name="camera" size={18} color="#FFF" />
            <Text style={styles.editImageText}>Change Cover</Text>
          </Pressable>
        </View>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>EVENT TITLE</Text>
          <TextInput
            style={styles.titleInput}
            value={formState.event}
            onChangeText={(t) => setFormState(p => ({ ...p, event: t }))}
            placeholder="Event Name"
          />

          <Text style={[styles.fieldLabel, { marginTop: 24 }]}>STATUS</Text>
          <View style={styles.statusRow}>
            {STATUSES.map(s => (
              <Pressable
                key={s}
                style={[styles.statusChip, formState.status === s && styles.statusActive]}
                onPress={() => setFormState(p => ({ ...p, status: s }))}
              >
                <Text style={[styles.statusText, formState.status === s && styles.statusTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <Text style={[styles.fieldLabel, { marginTop: 32, marginLeft: 2 }]}>TIMELINE</Text>
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateBtn} onPress={() => openCalendar('start')}>
              <Ionicons name="calendar-outline" size={16} color="#800000" />
              <Text style={[styles.dateText, !formState.startDate && styles.dateEmpty]}>{formState.startDate || "Start Date"}</Text>
            </Pressable>
            <Ionicons name="arrow-forward" size={14} color="#CCC" />
            <Pressable style={styles.dateBtn} onPress={() => openCalendar('end')}>
              <Ionicons name="calendar-outline" size={16} color="#800000" />
              <Text style={[styles.dateText, !formState.endDate && styles.dateEmpty]}>{formState.endDate || "End Date"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Pricing */}
        <Text style={[styles.fieldLabel, { marginTop: 32, marginLeft: 2 }]}>PRICING ITEMS</Text>
        {pricingItems.map((item, index) => (
          <PricingItemEditor
            key={item.id || item.tempId || String(index)}
            item={item}
            onUpdate={(u) => setPricingItems(p => { const n = [...p]; n[index] = u; return n; })}
            onDelete={() => setPricingItems(p => p.filter((_, i) => i !== index))}
            isOnlyItem={pricingItems.length === 1}
          />
        ))}
        <Pressable style={styles.addItemBtn} onPress={() => setPricingItems(p => [...p, createEmptyPricingItem(p.length)])}>
          <Ionicons name="add-circle" size={20} color="#800000" />
          <Text style={styles.addItemText}>Add Another Item</Text>
        </Pressable>

        {/* Description */}
        <Text style={[styles.fieldLabel, { marginTop: 32, marginLeft: 2 }]}>DESCRIPTION</Text>
        <TextInput
          style={styles.multiline}
          multiline
          numberOfLines={4}
          value={formState.description}
          onChangeText={(t) => setFormState(p => ({ ...p, description: t }))}
          placeholder="Event description..."
        />

        <View style={{ height: 40 }} />

        {/* Actions */}
        <Pressable style={[styles.saveBtn, !hasUnsavedChanges && styles.saveDisabled]} onPress={handleSave} disabled={saving || !hasUnsavedChanges}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </Pressable>

        <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={styles.deleteText}>Delete Event</Text>
        </Pressable>
      </View>

      <Modal visible={showCalendar} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowCalendar(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {calendarMode === 'start' ? 'Start' : 'End'} Date</Text>
              <Pressable onPress={() => setShowCalendar(false)}><Ionicons name="close" size={24} color="#800000" /></Pressable>
            </View>
            <Calendar
              onDayPress={onDateSelect}
              markedDates={{ [calendarMode === 'start' ? formState.startDate : formState.endDate]: { selected: true, selectedColor: '#800000' } }}
              theme={{ selectedDayBackgroundColor: '#800000', todayTextColor: '#800000', arrowColor: '#800000' }}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardSafeView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf8f5" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 60 },
  headerArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1c1917' },
  pageSubtitle: { fontSize: 12, fontWeight: '700', color: '#800000', opacity: 0.6 },
  mainContainer: { padding: 24 },
  imageCard: { width: '100%', height: 200, borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { width: '100%', height: '100%', backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  editImageBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  editImageText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#800000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#800000', letterSpacing: 1.5, marginBottom: 12 },
  titleInput: { fontSize: 16, fontWeight: '700', color: '#1c1917', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  statusActive: { backgroundColor: '#800000', borderColor: '#800000' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'capitalize' },
  statusTextActive: { color: '#FFF' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAF8F5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  dateText: { fontSize: 13, fontWeight: '700', color: '#1c1917' },
  dateEmpty: { color: '#BBB', fontWeight: '500' },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#80000008', borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(128,0,0,0.2)' },
  addItemText: { fontSize: 14, fontWeight: '700', color: '#800000' },
  multiline: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, minHeight: 120, fontSize: 15, elevation: 2, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#800000', paddingVertical: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#800000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
  saveDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  deleteBtn: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  deleteText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#800000' },
});

export default ManageEventScreen;
