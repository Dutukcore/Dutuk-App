import getReqs from "@/features/orders/services/getRequests";
import logger from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const RequestMenu = () => {
  const [requests, setRequests] = useState<{ event: any; payment: any; id: any }[]>();
  const [loading, setLoading] = useState(true);

  const displayCount = async () => {
    try {
      const id = useAuthStore.getState().userId;
      if (id) {
        const req = await getReqs(id);
        if (req) {
          setRequests(req);
        }
      }
    } catch (err) {
      logger.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      displayCount();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={(
            <View style={styles.header}>
              <Text style={styles.title}>Requests</Text>
              <Text style={styles.subtitle}>Manage customer event requests</Text>
            </View>
          )}
          ListEmptyComponent={(
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={48} color="#800000" />
              </View>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.emptyText}>
                Customer requests will appear here when they submit event inquiries
              </Text>
            </View>
          )}
          renderItem={({ item: req }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: "/requests/seperateRequest",
                  params: {
                    data: req.id
                  }
                });
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={22} color="#800000" />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{req.event}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.paymentContainer}>
                  <Ionicons name="cash-outline" size={18} color="#800000" />
                  <Text style={styles.paymentText}>₹{req.payment}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#57534e',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#57534e',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.06)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#80000010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.06)',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: -0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#80000015',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 12,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
});

export default RequestMenu;