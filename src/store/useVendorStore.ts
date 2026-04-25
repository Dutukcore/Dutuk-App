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
    order_id: string; // Now guaranteed by NOT NULL constraint
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
    status: 'ACTIVE' | 'COMPLETED'; // NEW
    ended_at: string | null; // NEW
    customer_name: string | null;
    customer_avatar: string | null;
    customer_email: string | null;
    vendor_name: string | null;
    vendor_avatar: string | null;
    vendor_company: string | null;
    vendor_email: string | null;
    order_status: 'pending' | 'approved' | 'completed' | 'rejected'; // NEW (from view)
    completion_requested_at: string | null; // NEW (from view)
    completed_at: string | null; // NEW (from view)
}

export interface ConversationWithUnread extends Conversation {
    unread_count: number;
}

export interface Company {
    id: string;
    user_id: string;
    company: string;
    description: string | null;
    logo_url: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    created_at: string;
}

export interface VendorEvent {
    id: string;
    vendor_id: string;
    title: string;
    description: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    created_at: string;
    event_date?: string;
}

export interface Review {
    id: string;
    vendor_id: string;
    customer_id: string;
    order_id: string | null;
    rating: number;
    comment: string | null;
    response: string | null;
    response_at: string | null;
    created_at: string;
    customer?: {
        full_name: string | null;
        avatar_url: string | null;
    };
    order?: {
        title: string | null;
        event_date: string | null;
    };
}

export interface Earning {
    id: string;
    vendor_id: string;
    order_id: string;
    amount: number;
    earning_date: string;
    status: string;
}

export interface Payment {
    id: string;
    vendor_id: string;
    order_id: string;
    amount: number;
    payment_status: string;
    payment_date: string;
}

interface VendorState {
    // Company
    company: Company | null;
    companyLoading: boolean;

    // Events (single fetch, derived views)
    allEvents: VendorEvent[];
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
    reviews: Review[];
    reviewStats: {
        totalReviews: number;
        averageRating: number;
        ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number; }
    };

    // Global
    lastFetchedAt: number | null;
    isHydrated: boolean;

    reviewsLoading: boolean;
    earnings: Earning[];
    earningsLoading: boolean;
    payments: Payment[];
    paymentsLoading: boolean;

    // Chat
    conversations: ConversationWithUnread[];
    conversationsLoading: boolean;

    // Realtime health
    realtimeStatus: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | null;

    /** Incremented whenever a realtime event mutates `orders`.
     *  Used by fetchOrders() to detect and survive fetch/realtime races. */
    ordersRevision: number;
    bumpOrdersRevision: () => void;

    // Actions
    fetchAll: () => Promise<void>;
    fetchCritical: () => Promise<void>;
    fetchCompany: () => Promise<void>;
    fetchEvents: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    fetchCalendarDates: () => Promise<void>;
    fetchRequestsCount: () => Promise<void>;
    fetchReviews: (limit?: number) => Promise<void>;
    replyToReview: (reviewId: string, response: string) => Promise<void>;
    fetchEarnings: () => Promise<void>;
    fetchPayments: () => Promise<void>;
    fetchConversations: () => Promise<void>;
    setOrders: (orders: Order[]) => void;
    addEvent: (event: VendorEvent) => void;
    removeEvent: (eventId: string) => void;
    incrementNewOrderCount: () => void;
    resetNewOrderCount: () => void;
    updateOrderInStore: (orderId: string, updates: Partial<Order>) => void;
    removeOrderFromStore: (orderId: string) => void;
    updateEventInStore: (eventId: string, updates: Partial<VendorEvent>) => void;
    setRealtimeStatus: (status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | null) => void;
}

// =====================================================
// HELPERS
// =====================================================

export const transformOrder = (order: any, isNew: boolean = false): Order => ({
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
            realtimeStatus: null,
            ordersRevision: 0,
            bumpOrdersRevision: () => set((s) => ({ ordersRevision: s.ordersRevision + 1 })),

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

                // Snapshot the revision *before* issuing the query.
                const revBefore = get().ordersRevision;
                set({ ordersLoading: true });

                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('vendor_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    logger.error('Error fetching orders:', error);
                    set({ ordersLoading: false });
                    return;
                }

                const fetched = (data || []).map(o => transformOrder(o, false));

                // If realtime mutated `orders` while this SELECT was in flight,
                // merge instead of replace — realtime rows win for their id.
                const { ordersRevision: revAfter, orders: liveOrders } = get();
                if (revAfter !== revBefore) {
                    const byId = new Map<string, Order>();
                    // Fetched (stable baseline)
                    for (const o of fetched) byId.set(o.id, o);
                    // Live realtime rows override / add
                    for (const o of liveOrders) byId.set(o.id, { ...byId.get(o.id), ...o });

                    // Preserve created_at ordering from the fetched list, but prepend
                    // any live rows that weren't in the fetch snapshot.
                    const fetchedIds = new Set(fetched.map(o => o.id));
                    const extras = liveOrders.filter(o => !fetchedIds.has(o.id));

                    set({
                        orders: [...extras, ...fetched.map(o => byId.get(o.id)!)],
                        ordersLoading: false,
                        lastFetchedAt: Date.now(),
                    });
                    logger.log(`fetchOrders: merged ${extras.length} realtime row(s) into fetch result`);
                    return;
                }

                set({
                    orders: fetched,
                    ordersLoading: false,
                    lastFetchedAt: Date.now(),
                });
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
                    .select('*, customer:customer_profiles(full_name, avatar_url), order:orders(title, event_date)')
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

            replyToReview: async (reviewId: string, response: string) => {
                const userId = useAuthStore.getState().userId;
                if (!userId) return;

                const { error } = await supabase
                    .from('reviews')
                    .update({
                        response: response,
                        response_at: new Date().toISOString(),
                    })
                    .eq('id', reviewId)
                    .eq('vendor_id', userId);

                if (error) {
                    logger.error('Error replying to review:', error);
                    throw error;
                }

                // Optimistically update the store
                set((s) => ({
                    reviews: s.reviews.map((r: any) =>
                        r.id === reviewId
                            ? { ...r, response, response_at: new Date().toISOString() }
                            : r
                    ),
                }));
            },

            setOrders: (orders) => set({ orders: [...orders] }),
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

            removeOrderFromStore: (orderId) => set((s) => ({
                orders: s.orders.filter((o: Order) => o.id !== orderId),
            })),

            updateEventInStore: (eventId, updates) => set((s) => ({
                allEvents: s.allEvents.map((e: any) => e.id === eventId ? { ...e, ...updates } : e),
            })),

            setRealtimeStatus: (status) => set({ realtimeStatus: status }),
        }),
        {
            name: 'dutuk-vendor-data-storage',
            storage: createJSONStorage(() => zustandMMKVStorage),
            // IMPORTANT: Only persist expensive-to-fetch stable data.
            // Exclude live/volatile state so realtime mutations are never
            // overwritten by a stale MMKV snapshot on hydration.
            partialize: (state) => ({
                company: state.company,
                allEvents: state.allEvents,
                calendarDates: state.calendarDates,
                reviews: state.reviews,
                reviewStats: state.reviewStats,
                earnings: state.earnings,
                payments: state.payments,
                lastFetchedAt: state.lastFetchedAt,
                // Excluded: orders, conversations, realtimeStatus, newOrderCount
                // These must always be fetched fresh to reflect the live state.
            }),
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
