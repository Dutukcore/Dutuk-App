import KeyboardSafeView from "@/components/layout/KeyboardSafeView";
import PricingItemEditor from "@/features/events/components/PricingItemEditor";
import createEvent from "@/features/events/services/createEvent";
import useImageUpload from "@/features/profile/hooks/useImageUpload";
import { createEmptyPricingItem, PricingItem } from "@/types/pricing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

const CreateEventScreen = () => {
  const [saving, setSaving] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([
    createEmptyPricingItem(0),
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calendar Modal State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');

  const { pickAndUploadImage } = useImageUpload();

  const updatePricingItem = (index: number, updated: PricingItem) => {
    setPricingItems((prev) => { const next = [...prev]; next[index] = updated; return next; });
  };
  const deletePricingItem = (index: number) => {
    setPricingItems((prev) => prev.filter((_, i) => i !== index));
  };
  const addPricingItem = () => {
    setPricingItems((prev) => [...prev, createEmptyPricingItem(prev.length)]);
  };

  const openCalendar = (mode: 'start' | 'end') => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };

  const onDateSelect = (day: { dateString: string }) => {
    if (calendarMode === 'start') {
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
    setShowCalendar(false);
  };

  const validatePricingItems = (): boolean => {
    for (let i = 0; i < pricingItems.length; i++) {
      const item = pricingItems[i];
      if (!item.label.trim()) {
        Toast.show({ type: "error", text1: `Item ${i + 1}: Label required` }); return false;
      }
      if (item.pricing_type === "fixed" && (!item.price || item.price <= 0)) {
        Toast.show({ type: "error", text1: `Item ${i + 1}: Price must be > ₹0` }); return false;
      }
      if (item.pricing_type === "range") {
        if (!item.price_min || item.price_min <= 0) {
          Toast.show({ type: "error", text1: `Item ${i + 1}: Min price must be > ₹0` }); return false;
        }
        if (item.price_max !== undefined && item.price_max < item.price_min) {
          Toast.show({ type: "error", text1: `Item ${i + 1}: Max must be ≥ Min` }); return false;
        }
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    try {
      setSelectingImage(true);
      const imageUrl = await pickAndUploadImage({
        bucket: "event-images",
        folder: "events",
      });
      if (imageUrl) setEventImageUrl(imageUrl);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Selection Failed', text2: error?.message });
    } finally {
      setSelectingImage(false);
    }
  };

  const handleSave = async () => {
    if (!eventName.trim()) {
      Toast.show({ type: "error", text1: "Title Required", text2: "Please enter an event title." });
      return;
    }
    if (!eventImageUrl) {
      Toast.show({ type: "error", text1: "Image Required", text2: "Please upload an event cover photo." });
      return;
    }
    if (!validatePricingItems()) return;

    setSaving(true);
    try {
      await createEvent({
        event: eventName.trim(),
        description: description.trim() || undefined,
        pricingItems,
        status: "upcoming",
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        image_url: eventImageUrl,
      });

      Toast.show({ type: "success", text1: "Event Created", text2: "Your event has been successfully added." });
      router.back();
    } catch (error) {
      Toast.show({ type: "error", text1: "Creation Failed", text2: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardSafeView scrollable={true} style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerArea}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#800000" />
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>Create Event</Text>
          <Text style={styles.pageSubtitle}>All-in-one Editor</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Cover Image Section */}
        <Text style={styles.fieldLabel}>EVENT COVER PHOTO *</Text>
        {eventImageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: eventImageUrl }} style={styles.imagePreview} />
            <Pressable style={styles.changeImageBtn} onPress={handleImagePicker}>
              <Ionicons name="camera" size={20} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.uploadBox} onPress={handleImagePicker} disabled={selectingImage}>
            {selectingImage ? (
              <ActivityIndicator color="#800000" size="large" />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color="#800000" />
                <Text style={styles.uploadText}>Select Cover Image</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>EVENT TITLE *</Text>
          <TextInput
            style={styles.titleInput}
            value={eventName}
            onChangeText={setEventName}
            placeholder="e.g. Wedding Reception"
            placeholderTextColor="#999"
          />

          <View style={{ height: 24 }} />

          <Text style={styles.fieldLabel}>TIMELINE</Text>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateBtn} onPress={() => openCalendar('start')}>
              <Ionicons name="calendar-outline" size={16} color="#800000" />
              <Text style={[styles.dateText, !startDate && styles.dateTextEmpty]}>
                {startDate || "Start Date"}
              </Text>
            </Pressable>
            <Ionicons name="arrow-forward" size={14} color="#CCC" />
            <Pressable style={styles.dateBtn} onPress={() => openCalendar('end')}>
              <Ionicons name="calendar-outline" size={16} color="#800000" />
              <Text style={[styles.dateText, !endDate && styles.dateTextEmpty]}>
                {endDate || "End Date (Opt.)"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 32 }]}>PRICING BREAKDOWN *</Text>
        {pricingItems.map((item, index) => (
          <PricingItemEditor
            key={item.tempId || item.id || String(index)}
            item={item}
            onUpdate={(u) => updatePricingItem(index, u)}
            onDelete={() => deletePricingItem(index)}
            isOnlyItem={pricingItems.length === 1}
          />
        ))}

        <Pressable style={styles.addItemBtn} onPress={addPricingItem}>
          <Ionicons name="add-circle" size={20} color="#800000" />
          <Text style={styles.addItemText}>Add Another Pricing Item</Text>
        </Pressable>

        <View style={{ marginTop: 32 }}>
          <Text style={styles.fieldLabel}>ADDITIONAL NOTES</Text>
          <TextInput
            style={styles.multiline}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Share more information about this event..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={{ height: 40 }} />

        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Event</Text>
          )}
        </Pressable>
      </View>

      <Modal visible={showCalendar} transparent={true} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
          <View style={styles.calendarCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {calendarMode === 'start' ? 'Start' : 'End'} Date</Text>
              <Pressable onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#800000" />
              </Pressable>
            </View>
            <Calendar
              onDayPress={onDateSelect}
              markedDates={{ [calendarMode === 'start' ? startDate : endDate]: { selected: true, selectedColor: '#800000' } }}
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
  content: { paddingBottom: 40 },
  headerArea: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
    paddingTop: 60, paddingBottom: 24, gap: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1c1917' },
  pageSubtitle: { fontSize: 12, fontWeight: '700', color: '#800000', marginTop: -2, opacity: 0.6 },

  mainContainer: { padding: 24 },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#800000', letterSpacing: 1.5, marginBottom: 12, marginLeft: 2 },

  imagePreviewContainer: {
    width: '100%', height: 180, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 32,
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  changeImageBtn: {
    position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10, borderRadius: 20,
  },
  uploadBox: {
    width: '100%', height: 180, borderRadius: 24, backgroundColor: '#FFF',
    borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(128,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  uploadText: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#800000' },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4,
    shadowColor: '#800000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  titleInput: { fontSize: 16, fontWeight: '700', color: '#1c1917', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 10 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAF8F5',
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0',
  },
  dateText: { fontSize: 13, fontWeight: '700', color: '#1c1917' },
  dateTextEmpty: { color: '#BBB', fontWeight: '500' },

  addItemBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, backgroundColor: '#80000008', borderRadius: 18,
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(128,0,0,0.2)',
  },
  addItemText: { fontSize: 15, fontWeight: '700', color: '#800000' },

  multiline: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, minHeight: 100, fontSize: 15,
    elevation: 2, textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: '#800000', paddingVertical: 20, borderRadius: 24, alignItems: 'center',
    shadowColor: '#800000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  calendarCard: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#800000' },
});

export default CreateEventScreen;