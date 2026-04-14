import logger from '@/lib/logger';
import { zustandMMKVStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from './useAuthStore';

// =====================================================
// TYPES
// =====================================================

export interface Order {
    id: string;
    title: string;
    customerName: string;
    packageType: string;
    customerEmail: string;
    customerPhone: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    date: string;
    rawEventDate: string;
    amount?: number;
    notes?: string;
    isNew?: boolean;
}

export interface StoredDate {
    date: string;
    status: 'available' | 'unavailable';
    event?: string;
    description?: string;
}

export interface Conversation {
    id: string;
    customer_id: string;
    vendor_id: string;
    event_id: string | null;
    order_id: string | null;
    booking_status: string | null;
    terms_accepted_by_customer: boolean;
    terms_accepted_at: string | null;
    payment_completed: boolean;
    payment_completed_at: string | null;
    booking_id: string | null;
    last_message_at: string;
    last_message_preview: string | null;
    created_at: string;
    updated_at: string;
    customer_name: string | null;
    customer_avatar: string | null;
    customer_email: string | null;
    vendor_name: string | null;
    vendor_avatar: string | null;
    vendor_company: string | null;
    vendor_email: string | null;
}

export interface ConversationWithUnread extends Conversation {
    unread_count: number;
}

interface VendorState {
    // Company
    company: any | null;
    companyLoading: boolean;

    // Events (single fetch, derived views)
    allEvents: any[];
    eventsLoading: boolean;

    // Orders
    orders: Order[];
    ordersLoading: boolean;
    newOrderCount: number;

    // Calendar dates
    calendarDates: StoredDate[];

    // Requests count
    requestsCount: number;
    pendingInquiries: number;

    // Reviews
    reviews: any[];
    reviewStats: {
        totalReviews: number;
        averageRating: number;
        ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number; }
    };

    // Global
    lastFetchedAt: number | null;
    isHydrated: boolean;

    reviewsLoading: boolean;
    earnings: any[];
    earningsLoading: boolean;
    payments: any[];
    paymentsLoading: boolean;

    // Chat
    conversations: ConversationWithUnread[];
    conversationsLoading: boolean;

    // Actions
    fetchAll: () => Promise<void>;
    fetchCritical: () => Promise<void>;
    fetchCompany: () => Promise<void>;
    fetchEvents: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    fetchCalendarDates: () => Promise<void>;
    fetchRequestsCount: () => Promise<void>;
    fetchReviews: (limit?: number) => Promise<void>;
    fetchEarnings: () => Promise<void>;
    fetchPayments: () => Promise<void>;
    fetchConversations: () => Promise<void>;
    setOrders: (orders: Order[]) => void;
    addEvent: (event: any) => void;
    removeEvent: (eventId: string) => void;
    incrementNewOrderCount: () => void;
    resetNewOrderCount: () => void;
    updateOrderInStore: (orderId: string, updates: Partial<Order>) => void;
    updateEventInStore: (eventId: string, updates: Partial<any>) => void;
}

// =====================================================
// HELPERS
// =====================================================

const transformOrder = (order: any, isNew: boolean = false): Order => ({
    id: order.id,
    title: order.title,
    customerName: order.customer_name,
    packageType: order.package_type || 'Standard Package',
    customerEmail: order.customer_email || '',
    customerPhone: order.customer_phone || '',
    status: order.status,
    date: order.event_date ? new Date(order.event_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Date TBD',
    rawEventDate: order.event_date || '',
    amount: order.amount,
    notes: order.notes,
    isNew,
});

// =====================================================
// STORE
/* Population is typically handled via fetchAll() during app initialization.
 */
export const useVendorStore = create<VendorState>()(
    persist(
        (set, get) => ({
            company: null,
            companyLoading: false,
            allEvents: [],
            eventsLoading: false,
            orders: [],
            ordersLoading: false,
            newOrderCount: 0,
            calendarDates: [],
            requestsCount: 0,
            pendingInquiries: 0,
            reviews: [],
            reviewStats: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            lastFetchedAt: null,
            isHydrated: false,
            reviewsLoading: false,
            earnings: [],
            earningsLoading: false,
            payments: [],
            paymentsLoading: false,
            conversations: [],
            conversationsLoading: false,

            fetchEarnings: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                set({ earningsLoading: true });
                const { data, error } = await supabase
                    .from('earnings')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('earning_date', { ascending: false });

                if (error) {
                    logger.error('Error fetching earnings:', error);
                    set({ earningsLoading: false });
                } else {
                    set({ earnings: data || [], earningsLoading: false });
                }
            },

            fetchPayments: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                set({ paymentsLoading: true });
                const { data, error } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('vendor_id', userId)
                    .eq('payment_status', 'completed')
                    .order('payment_date', { ascending: false });

                if (error) {
                    logger.error('Error fetching payments:', error);
                    set({ paymentsLoading: false });
                } else {
                    set({ payments: data || [], paymentsLoading: false });
                }
            },

            fetchConversations: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                set({ conversationsLoading: true });
                const { data: conversationsData, error } = await supabase
                    .from('conversations_with_users')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('last_message_at', { ascending: false });

                if (error) {
                    logger.error('Error fetching conversations:', error);
                    set({ conversationsLoading: false });
                    return;
                }

                // Fetch unread counts in parallel
                const { data: unreadData } = await supabase
                    .rpc('get_unread_count', { user_id_param: userId });

                const conversationsWithUnread = (conversationsData || []).map((conv: any) => ({
                    ...conv,
                    unread_count: unreadData?.find((u: any) => u.conversation_id === conv.id)?.unread_count || 0,
                }));

                set({ conversations: conversationsWithUnread, conversationsLoading: false });
            },

            fetchAll: async () => {
                await get().fetchCritical();
            },

            fetchCritical: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                logger.log('Fetching critical vendor data...');

                // Phase 1: Critical data for tab display
                await Promise.allSettled([
                    get().fetchCompany(),
                    get().fetchEvents(),
                    get().fetchOrders(),
                    get().fetchCalendarDates(),
                    get().fetchConversations(),
                ]);

                set({ lastFetchedAt: Date.now(), isHydrated: true });
                logger.log('Critical vendor data hydration complete');

                // Phase 2: Deferred data (non-blocking)
                Promise.allSettled([
                    get().fetchRequestsCount(),
                    get().fetchReviews(10),
                    get().fetchEarnings(),
                    get().fetchPayments(),
                ]);
            },

            fetchCompany: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ companyLoading: true });

                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    logger.error('Error fetching company info:', error);
                }

                set({ company: data || null, companyLoading: false });
            },

            fetchEvents: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ eventsLoading: true });

                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    logger.error('Error fetching events:', error);
                }

                set({ allEvents: data || [], eventsLoading: false });
            },

            fetchOrders: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;
                set({ ordersLoading: true });

                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    logger.error('Error fetching orders:', error);
                }

                const transformedOrders = (data || []).map(o => transformOrder(o, false));
                set({ orders: transformedOrders, ordersLoading: false });
            },

            fetchCalendarDates: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                const { data, error } = await supabase
                    .from('dates')
                    .select('date, status, event, description')
                    .eq('user_id', userId)
                    .order('date', { ascending: true });

                if (error && error.code !== 'PGRST116') {
                    logger.error('Error fetching calendar dates:', error);
                }

                const formattedDates: StoredDate[] = (data || []).map(d => ({
                    date: d.date,
                    status: (d.status as 'available' | 'unavailable') || 'unavailable',
                    event: d.event || undefined,
                    description: d.description || undefined,
                }));

                set({ calendarDates: formattedDates });
            },

            fetchRequestsCount: async () => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                // Count pending orders as "requests awaiting action"
                const { count: pendingCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('vendor_id', userId)
                    .eq('status', 'pending');

                // Count new quotation requests
                const { data: companyData } = await supabase
                    .from('companies')
                    .select('id')
                    .eq('user_id', userId)
                    .single();

                let quoteCount = 0;
                if (companyData?.id) {
                    const { count } = await supabase
                        .from('quotation_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'open');
                    quoteCount = count || 0;
                }

                set({
                    requestsCount: (pendingCount || 0) + quoteCount,
                    pendingInquiries: pendingCount || 0,
                });
            },

            fetchReviews: async (limit?: number) => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                let query = supabase
                    .from('reviews')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (limit) query = query.limit(limit);

                const { data, error } = await query;
                if (error) {
                    logger.error('Error fetching reviews:', error);
                }

                const reviewsList = data || [];

                // Calculate stats
                let stats = {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };

                if (reviewsList.length > 0) {
                    const sum = reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0);
                    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    reviewsList.forEach((r: any) => {
                        const rating = Math.floor(r.rating);
                        if (rating >= 1 && rating <= 5) {
                            (dist as any)[rating]++;
                        }
                    });
                    stats = {
                        totalReviews: reviewsList.length,
                        averageRating: Math.round((sum / reviewsList.length) * 10) / 10,
                        ratingDistribution: dist
                    };
                }

                set({ reviews: reviewsList, reviewStats: stats });
            },

            setOrders: (orders) => set({ orders }),
            incrementNewOrderCount: () => set((s) => ({ newOrderCount: s.newOrderCount + 1 })),
            resetNewOrderCount: () => set({ newOrderCount: 0 }),
            addEvent: (event) => set((s) => ({
                allEvents: [event, ...s.allEvents],
            })),

            removeEvent: (eventId) => set((s) => ({
                allEvents: s.allEvents.filter((e) => e.id !== eventId),
            })),

            updateOrderInStore: (orderId, updates) => set((s) => ({
                orders: s.orders.map((o: Order) => o.id === orderId ? { ...o, ...updates } : o),
            })),

            updateEventInStore: (eventId, updates) => set((s) => ({
                allEvents: s.allEvents.map((e: any) => e.id === eventId ? { ...e, ...updates } : e),
            })),
        }),
        {
            name: 'dutuk-vendor-data-storage',
            storage: createJSONStorage(() => zustandMMKVStorage),
        }
    )
);

// =====================================================
// SELECTORS
// =====================================================

export const useUpcomingEvents = () => useVendorStore(useShallow((s) => s.allEvents.filter((e: any) => e.status === 'upcoming')));
export const useOngoingEvents = () => useVendorStore(useShallow((s) => s.allEvents.filter((e: any) => e.status === 'ongoing')));
export const useCompletedEvents = () => useVendorStore(useShallow((s) => s.allEvents.filter((e: any) => e.status === 'completed')));
export const useManageableEvents = () => useVendorStore(useShallow((s) => s.allEvents.filter((e: any) => e.status !== 'completed')));
