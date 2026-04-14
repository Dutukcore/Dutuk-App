// BACKEND INTEGRATION ENABLED - USING SUPABASE FOR DATABASE SYNC
import UnifiedCalendar from "@/features/calendar/components/UnifiedCalendar";
import { DateStatus, removeDate, storeDateWithStatus } from "@/features/calendar/hooks/useStoreDates";
import { useVendorStore } from '@/store/useVendorStore';
import { buildAvailabilityMarkedDates } from "@/features/calendar/utils/calendarAvailability";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from 'react-native-toast-message';

// Helper function to check if a date is in the past
const isPastDate = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString);
  return checkDate < today;
};

const CalendarPage = ({ hideBackButton = false }: { hideBackButton?: boolean }) => {
  const calendarDates = useVendorStore((s) => s.calendarDates);
  const fetchCalendarDates = useVendorStore((s) => s.fetchCalendarDates);
  const isHydrated = useVendorStore((s) => s.isHydrated);
  const [isSaving, setIsSaving] = useState(false);

  // Convert calendar dates to marked dates format for UnifiedCalendar
  // Using shared utility - this is the SINGLE SOURCE OF TRUTH for availability logic
  const markedDates = buildAvailabilityMarkedDates(calendarDates);

  const handleDayPress = async (day: number, dateString: string) => {
    // Validate: Cannot mark past dates
    if (isPastDate(dateString)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Date',
        text2: 'Cannot mark dates in the past',
        position: 'bottom',
      });
      return;
    }

    const existingDate = calendarDates.find(d => d.date === dateString);

    if (existingDate) {
      // Date exists - show options
      Alert.alert(
        'Update Date',
        `Current status: ${existingDate.status}\n\nWhat would you like to do?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Toggle Status',
            onPress: async () => {
              setIsSaving(true);
              const newStatus: DateStatus =
                existingDate.status === 'available' ? 'unavailable' : 'available';
              const success = await storeDateWithStatus(
                dateString,
                newStatus,
                existingDate.event,
                existingDate.description
              );
              if (success) {
                await fetchCalendarDates(); // Reload from database via store
                Toast.show({
                  type: 'success',
                  text1: 'Status Updated',
                  text2: `Date marked as ${newStatus}`,
                  position: 'bottom',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to update date status',
                  position: 'bottom',
                });
              }
              setIsSaving(false);
            },
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              setIsSaving(true);
              const success = await removeDate(dateString);
              if (success) {
                await fetchCalendarDates(); // Reload from database via store
                Toast.show({
                  type: 'success',
                  text1: 'Date Removed',
                  text2: 'Date marking has been removed',
                  position: 'bottom',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to remove date',
                  position: 'bottom',
                });
              }
              setIsSaving(false);
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      // New date - show status selection
      Alert.alert(
        'Mark Date',
        'Select availability status:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Available',
            onPress: async () => {
              setIsSaving(true);
              const success = await storeDateWithStatus(dateString, 'available');
              if (success) {
                await fetchCalendarDates(); // Reload from database via store
                Toast.show({
                  type: 'success',
                  text1: 'Date Marked',
                  text2: 'Date marked as available',
                  position: 'bottom',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to save date',
                  position: 'bottom',
                });
              }
              setIsSaving(false);
            },
          },
          {
            text: 'Unavailable',
            style: 'default',
            onPress: async () => {
              setIsSaving(true);
              const success = await storeDateWithStatus(dateString, 'unavailable');
              if (success) {
                await fetchCalendarDates(); // Reload from database via store
                Toast.show({
                  type: 'success',
                  text1: 'Date Marked',
                  text2: 'Date marked as unavailable',
                  position: 'bottom',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to save date',
                  position: 'bottom',
                });
              }
              setIsSaving(false);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  if (!isHydrated) {
    return (
      <View style={style.container}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={style.loadingText}>Loading Calendar...</Text>
      </View>
    );
  }

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={style.container}>
      {/* Back Button */}
      {!hideBackButton && (
        <Pressable
          style={style.backButton}
          onPress={() => router.back()}
          data-testid="calendar-back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#000000ff" />
        </Pressable>
      )}

      <View style={style.headerContainer}>
        <View style={style.titleRow}>
          <Text style={style.headerTitle}>Manage Availability</Text>
          <Ionicons name="calendar-outline" size={24} color="#800000" />
        </View>
        <Text style={style.headerSubtitle}>
          Tap a date to mark your availability and keep your schedule up to date
        </Text>
      </View>

      <View style={style.legendContainer}>
        <View style={[style.legendChip, { backgroundColor: '#1c1917' }]}>
          <View style={[style.legendDot, { backgroundColor: '#FFFFFF' }]} />
          <Text style={style.legendChipText}>Available</Text>
        </View>
        <View style={[style.legendChip, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF3B30' }]}>
          <View style={[style.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={[style.legendChipText, { color: '#FF3B30' }]}>Unavailable</Text>
        </View>
      </View>

      <View style={style.calendarCard}>
        <UnifiedCalendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          minDate={minDate}
        />
      </View>

      <View style={style.instructionContainer}>
        <View style={style.syncIndicator}>
          <Ionicons name="cloud-done" size={16} color="#34C759" />
          <Text style={style.instructionText}>
            Cloud Syched
          </Text>
        </View>
      </View>

      {isSaving && (
        <View style={style.savingOverlay}>
          <ActivityIndicator size="small" color="#800000" />
          <Text style={style.savingText}>Syncing...</Text>
        </View>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#faf8f5',
    paddingVertical: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    marginTop: 20, // Reduced from 100
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '85%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarCard: {
    width: '92%',
    maxWidth: 400,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.04)',
    marginBottom: 20,
  },
  instructionContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  instructionText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#57534e',
    fontWeight: '500',
  },
  savingOverlay: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.08)',
  },
  savingText: {
    fontSize: 14,
    color: '#800000',
    fontWeight: '700',
  },
});

export default CalendarPage;