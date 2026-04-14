import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface QuotationDetail {
  id: string;
  customer_id: string;
  event_type: string | null;
  event_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  guest_count: number | null;
  description: string | null;
  status: 'open' | 'closed';
  created_at: string;
}

interface MyResponse {
  id: string;
  proposed_price: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [myResponse, setMyResponse] = useState<MyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [proposedPrice, setProposedPrice] = useState('');
  const [message, setMessage] = useState('');

  const fetchQuotation = useCallback(async () => {
    if (!id) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: req } = await supabase
      .from('quotation_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (req) setQuotation(req);

    const { data: response } = await supabase
      .from('quotation_responses')
      .select('*')
      .eq('request_id', id)
      .eq('vendor_id', user.id)
      .maybeSingle();

    if (response) {
      setMyResponse(response);
      setProposedPrice(response.quoted_price?.toString() || '');
      setMessage(response.message || '');
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handleSubmit = async () => {
    if (!proposedPrice || isNaN(Number(proposedPrice)) || Number(proposedPrice) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid proposed price.');
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (myResponse) {
      // Update existing response
      const { error } = await supabase
        .from('quotation_responses')
        .update({
          quoted_price: Number(proposedPrice),
          message: message.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', myResponse.id);

      if (error) {
        Alert.alert('Error', 'Failed to update your quote. Please try again.');
      } else {
        Alert.alert('Quote Updated', 'Your quote has been updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } else {
      // Insert new response
      const { error } = await supabase.from('quotation_responses').insert({
        request_id: id,
        vendor_id: user.id,
        quoted_price: Number(proposedPrice),
        message: message.trim(),
        status: 'pending',
      });

      if (error) {
        Alert.alert('Error', 'Failed to send your quote. Please try again.');
      } else {
        Alert.alert(
          '🎉 Quote Sent!',
          'Your quote has been sent to the customer. They will be notified.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }

    setSubmitting(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date flexible';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!quotation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Quotation not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const alreadyResponded = Boolean(myResponse);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Quote Request</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Banner */}
          {alreadyResponded && (
            <View
              style={[
                styles.statusBanner,
                myResponse?.status === 'accepted' && styles.statusBannerAccepted,
                myResponse?.status === 'declined' && styles.statusBannerDeclined,
              ]}
            >
              <Ionicons
                name={
                  myResponse?.status === 'accepted'
                    ? 'checkmark-circle'
                    : myResponse?.status === 'declined'
                    ? 'close-circle'
                    : 'time'
                }
                size={18}
                color={
                  myResponse?.status === 'accepted'
                    ? COLORS.success
                    : myResponse?.status === 'declined'
                    ? COLORS.error
                    : COLORS.warning
                }
              />
              <Text style={styles.statusBannerText}>
                {myResponse?.status === 'accepted'
                  ? 'Customer accepted your quote!'
                  : myResponse?.status === 'declined'
                  ? 'Customer declined your quote'
                  : 'Your quote is pending customer review'}
              </Text>
            </View>
          )}

          {/* Request Details Card */}
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Customer Request</Text>

            <InfoRow
              icon="sparkles-outline"
              label="Event Type"
              value={quotation.event_type || 'General Event'}
            />
            <InfoRow
              icon="calendar-outline"
              label="Event Date"
              value={formatDate(quotation.event_date)}
            />
            <InfoRow
              icon="people-outline"
              label="Guest Count"
              value={quotation.guest_count ? `${quotation.guest_count} guests` : 'Not specified'}
            />
            {(quotation.budget_min || quotation.budget_max) && (
              <InfoRow
                icon="wallet-outline"
                label="Budget"
                value={
                  quotation.budget_min && quotation.budget_max
                    ? `₹${quotation.budget_min.toLocaleString()} – ₹${quotation.budget_max.toLocaleString()}`
                    : quotation.budget_min
                    ? `From ₹${quotation.budget_min.toLocaleString()}`
                    : `Up to ₹${quotation.budget_max?.toLocaleString()}`
                }
                highlight
              />
            )}

            {quotation.description && (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionLabel}>Requirements</Text>
                <Text style={styles.descriptionText}>{quotation.description}</Text>
              </View>
            )}
          </View>

          {/* Response Form */}
          {quotation.status === 'open' && (
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>
                {alreadyResponded ? 'Update Your Quote' : 'Send Your Quote'}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Your Proposed Price (₹) *</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                    placeholder="e.g. 25000"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Message to Customer (optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe what's included in your quote, your experience, availability, etc."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                style={[styles.submitBtn, submitting && styles.submitBtnLoading]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.textWhite} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={alreadyResponded ? 'refresh-outline' : 'send-outline'}
                      size={18}
                      color={COLORS.textWhite}
                    />
                    <Text style={styles.submitBtnText}>
                      {alreadyResponded ? 'Update Quote' : 'Send Quote'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {quotation.status === 'closed' && (
            <View style={styles.closedCard}>
              <Ionicons name="lock-closed-outline" size={28} color={COLORS.textMuted} />
              <Text style={styles.closedText}>This quote request is closed</Text>
              <Text style={styles.closedSubtext}>
                The customer has selected a vendor for this request.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={[styles.infoRow, highlight && styles.infoRowHighlight]}>
    <View style={styles.infoIconBox}>
      <Ionicons
        name={icon}
        size={16}
        color={highlight ? COLORS.gold : COLORS.primaryLight}
      />
    </View>
    <View style={styles.infoTexts}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['3xl'],
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  headerRight: { width: 40 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING['3xl'],
    paddingBottom: 100,
    gap: SPACING.md,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    marginBottom: SPACING.sm,
  },
  statusBannerAccepted: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusBannerDeclined: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  statusBannerText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },

  detailCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS['2xl'],
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
    gap: SPACING.sm,
  },
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS['2xl'],
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
    gap: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoRowHighlight: {
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.semibold,
    marginTop: 1,
  },
  infoValueHighlight: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },

  descriptionBlock: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.bgBase,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  descriptionLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  fieldGroup: { gap: SPACING.sm },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgBase,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    height: 52,
  },
  currencyPrefix: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  messageInput: {
    backgroundColor: COLORS.bgBase,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    minHeight: 120,
    lineHeight: 22,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
    ...SHADOW.md,
  },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },

  closedCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS['2xl'],
    padding: SPACING['5xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closedText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  closedSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
