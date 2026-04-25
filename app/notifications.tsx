/**
 * In-App Notification Center
 * Shows all vendor notifications: new orders, quote requests, messages, reviews
 */
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'new_order' | 'order_approved' | 'new_message' | 'quote_request' | 'quote_accepted' | 'review_posted';
  title: string;
  message: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_CONFIG: Record<string, { icon: string; color: string; bg: string; route?: (data: any) => string }> = {
  new_order: {
    icon: 'receipt-outline',
    color: COLORS.primary,
    bg: COLORS.bgMuted,
    route: (d) => d?.order_id ? `/orders/customerApproval?orderId=${d.order_id}` : '/(tabs)/home',
  },
  order_approved: {
    icon: 'checkmark-circle-outline',
    color: COLORS.success,
    bg: COLORS.successBg,
    route: () => '/(tabs)/chat',
  },
  new_message: {
    icon: 'chatbubble-outline',
    color: COLORS.info,
    bg: COLORS.infoBg,
    route: () => '/(tabs)/chat',
  },
  quote_request: {
    icon: 'document-text-outline',
    color: COLORS.warning,
    bg: COLORS.warningBg,
    route: (d) => d?.quotation_id ? `/quotations/${d.quotation_id}` : '/(tabs)/quotations',
  },
  quote_accepted: {
    icon: 'star-outline',
    color: COLORS.gold,
    bg: COLORS.goldLight,
    route: () => '/(tabs)/quotations',
  },
  review_posted: {
    icon: 'star-outline',
    color: COLORS.gold,
    bg: COLORS.goldLight,
    route: () => '/profilePages/profileSettings/history_and_highlights/pastReviews',
  },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

const NotificationItem = ({
  notif,
  onPress,
}: {
  notif: Notification;
  onPress: () => void;
}) => {
  const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.new_order;
  return (
    <Pressable
      style={[styles.notifCard, !notif.is_read && styles.notifCardUnread]}
      onPress={onPress}
    >
      <View style={[styles.notifIconBox, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
          {!notif.is_read && <View style={styles.unreadDot} />}
        </View>
        {notif.message ? (
          <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
        ) : null}
        <Text style={styles.notifTime}>{timeAgo(notif.created_at)}</Text>
      </View>
    </Pressable>
  );
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handlePress = async (notif: Notification) => {
    // Mark as read
    if (!notif.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      );
    }

    // Navigate to relevant screen
    const cfg = NOTIF_CONFIG[notif.type];
    if (cfg?.route) {
      const path = cfg.route(notif.data || {});
      router.push(path as any);
    }
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const sections = useMemo(() => {
    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    const result = [];
    if (unread.length > 0) {
      result.push({ title: 'NEW', data: unread });
    }
    if (read.length > 0) {
      result.push({ title: 'EARLIER', data: read });
    }
    return result;
  }, [notifications]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem notif={item} onPress={() => handlePress(item)} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.groupLabel}>{title}</Text>
          )}
          contentContainerStyle={[
            styles.scrollContent,
            notifications.length === 0 && styles.scrollContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                Order updates, messages, and alerts will appear here
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBase },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['3xl'],
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.primary,
  },
  headerBadge: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  headerBadgeText: { fontSize: 10, fontWeight: TYPOGRAPHY.bold, color: COLORS.bgCard },
  markAllBtn: { paddingHorizontal: SPACING.sm },
  markAllText: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.primaryMid },
  headerRight: { width: 60 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING['3xl'],
    paddingBottom: 100, gap: SPACING.sm,
  },
  scrollContentEmpty: { flex: 1 },

  groupLabel: {
    fontSize: 11, fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textMuted, letterSpacing: 1, marginTop: SPACING.md, marginBottom: 4,
  },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING['4xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary, marginTop: SPACING.xl, textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary,
    textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20,
  },

  // Notification card
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  notifCardUnread: {
    borderColor: COLORS.primaryAlpha(0.15),
    backgroundColor: 'rgba(79,0,0,0.02)',
    ...SHADOW.sm,
  },
  notifIconBox: {
    width: 44, height: 44, borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 3,
  },
  notifTitle: {
    fontSize: TYPOGRAPHY.base, fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary, flex: 1, marginRight: 8,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary,
  },
  notifMessage: {
    fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.medium,
  },
});
