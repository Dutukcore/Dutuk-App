import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface QuotationRequest {
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
  // Whether vendor has already responded
  has_responded?: boolean;
  my_response?: {
    id: string;
    proposed_price: number;
    status: 'pending' | 'accepted' | 'declined';
  } | null;
}

type FilterType = 'new' | 'responded' | 'closed';

const FilterTab = ({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterTab, active && styles.filterTabActive]}
  >
    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
      {label}
    </Text>
    {count > 0 && (
      <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
        <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </Pressable>
);

const QuotationCard = ({
  item,
  onPress,
}: {
  item: QuotationRequest;
  onPress: () => void;
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date flexible';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = () => {
    if (!item.budget_min && !item.budget_max) return 'Budget not specified';
    if (item.budget_min && item.budget_max)
      return `₹${item.budget_min.toLocaleString()} – ₹${item.budget_max.toLocaleString()}`;
    if (item.budget_min) return `From ₹${item.budget_min.toLocaleString()}`;
    return `Up to ₹${item.budget_max?.toLocaleString()}`;
  };

  const responseStatus = item.my_response?.status;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.eventTypeBadge}>
          <Ionicons name="sparkles-outline" size={12} color={COLORS.primaryMid} />
          <Text style={styles.eventTypeText}>
            {item.event_type || 'General Event'}
          </Text>
        </View>
        {item.has_responded && responseStatus ? (
          <View
            style={[
              styles.statusPill,
              responseStatus === 'accepted' && styles.statusPillAccepted,
              responseStatus === 'declined' && styles.statusPillDeclined,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                responseStatus === 'accepted' && styles.statusPillTextAccepted,
                responseStatus === 'declined' && styles.statusPillTextDeclined,
              ]}
            >
              {responseStatus === 'accepted'
                ? '✓ Accepted'
                : responseStatus === 'declined'
                ? '✗ Declined'
                : '⏳ Responded'}
            </Text>
          </View>
        ) : item.status === 'open' ? (
          <View style={styles.newBadge}>
            <View style={styles.newDot} />
            <Text style={styles.newBadgeText}>New Request</Text>
          </View>
        ) : null}
      </View>

      {/* Details */}
      <View style={styles.cardDetailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.primaryLight} />
          <Text style={styles.detailText}>{formatDate(item.event_date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={15} color={COLORS.primaryLight} />
          <Text style={styles.detailText}>
            {item.guest_count ? `${item.guest_count} guests` : 'Guests TBD'}
          </Text>
        </View>
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        <Ionicons name="wallet-outline" size={16} color={COLORS.gold} />
        <Text style={styles.budgetText}>{formatBudget()}</Text>
      </View>

      {/* Description */}
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.postedAt}>
          {new Date(item.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        {!item.has_responded && item.status === 'open' && (
          <View style={styles.respondCta}>
            <Text style={styles.respondCtaText}>Send Quote</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.bgCard} />
          </View>
        )}
        {item.has_responded && item.my_response?.proposed_price && (
          <Text style={styles.myPriceText}>
            Your quote: ₹{item.my_response.proposed_price.toLocaleString()}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default function QuotationsScreen() {
  const [filter, setFilter] = useState<FilterType>('new');
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotations = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: allRequests, error } = await supabase
      .from('quotation_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error || !allRequests) {
      setLoading(false);
      return;
    }

    // Fetch vendor's own responses
    const { data: myResponses } = await supabase
      .from('quotation_responses')
      .select('id, request_id, quoted_price, status')
      .eq('vendor_id', user.id);

    const responseMap = new Map(
      (myResponses || []).map((r) => [r.request_id, r])
    );

    const enriched: QuotationRequest[] = allRequests.map((req) => ({
      ...req,
      has_responded: responseMap.has(req.id),
      my_response: responseMap.has(req.id)
        ? {
            id: responseMap.get(req.id)!.id,
            proposed_price: responseMap.get(req.id)!.quoted_price,
            status: responseMap.get(req.id)!.status,
          }
        : null,
    }));

    setRequests(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQuotations();
    setRefreshing(false);
  }, [fetchQuotations]);

  const newRequests = requests.filter((r) => !r.has_responded && r.status === 'open');
  const responded = requests.filter((r) => r.has_responded);
  const closed = requests.filter((r) => r.status === 'closed');

  const displayed =
    filter === 'new' ? newRequests : filter === 'responded' ? responded : closed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quotations</Text>
          <Text style={styles.headerSubtitle}>Respond to customer quote requests</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <FilterTab
          label="New"
          count={newRequests.length}
          active={filter === 'new'}
          onPress={() => setFilter('new')}
        />
        <FilterTab
          label="Responded"
          count={responded.length}
          active={filter === 'responded'}
          onPress={() => setFilter('responded')}
        />
        <FilterTab
          label="Closed"
          count={closed.length}
          active={filter === 'closed'}
          onPress={() => setFilter('closed')}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            displayed.length === 0 && styles.scrollContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {displayed.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>
                {filter === 'new'
                  ? 'No new quote requests'
                  : filter === 'responded'
                  ? "You haven't responded to any quotes yet"
                  : 'No closed requests'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'new'
                  ? 'New requests from customers will appear here'
                  : 'Responded quotes will show up here'}
              </Text>
            </View>
          ) : (
            displayed.map((item) => (
              <QuotationCard
                key={item.id}
                item={item}
                onPress={() =>
                  router.push({
                    pathname: '/quotations/[id]' as any,
                    params: { id: item.id },
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  header: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING['3xl'],
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: TYPOGRAPHY.medium,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING['3xl'],
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.textWhite,
  },
  filterBadge: {
    backgroundColor: COLORS.bgMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  filterBadgeTextActive: {
    color: COLORS.textWhite,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING['3xl'],
    paddingBottom: 100,
    gap: SPACING.md,
  },
  scrollContentEmpty: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['4xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS['2xl'],
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.bgMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventTypeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primaryMid,
    textTransform: 'capitalize',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  newBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success,
  },
  statusPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusPillAccepted: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  statusPillDeclined: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  statusPillText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
  },
  statusPillTextAccepted: { color: COLORS.success },
  statusPillTextDeclined: { color: COLORS.error },

  cardDetailsGrid: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  budgetText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  postedAt: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.medium,
  },
  respondCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  respondCtaText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  myPriceText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
});
