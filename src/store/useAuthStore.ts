import logger from '@/lib/logger';
import { zustandMMKVStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;           // Supabase User object
    userId: string | null;      // Shortcut
    isAuthenticated: boolean;
    provider: string | null;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    setUser: (user: any | null) => void;
    logout: () => Promise<void>;
}

/**
 * Auth Store: The single source of truth for user identity.
 * Replaces 46+ redundant network calls to Supabase Auth API.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            userId: null,
            isAuthenticated: false,
            provider: null,
            isLoading: true,

            initialize: async () => {
                try {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) throw sessionError;

                    if (session?.user) {
                        set({
                            user: session.user,
                            userId: session.user.id,
                            provider: session.user.app_metadata.provider || null,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        logger.log('Auth initialized: User found');
                    } else {
                        set({ isLoading: false });
                        logger.log('Auth initialized: No active session');
                    }
                } catch (err: any) {
                    logger.error('Error initializing auth store');
                    set({ isLoading: false });
                }

                // Listen for auth changes (login/logout)
                supabase.auth.onAuthStateChange((event, session) => {
                    logger.log(`Auth event: ${event}`);
                    set({
                        user: session?.user ?? null,
                        userId: session?.user?.id ?? null,
                        provider: session?.user?.app_metadata.provider || null,
                        isAuthenticated: !!session?.user,
                        isLoading: false,
                    });
                });
            },

            setUser: (user) => {
                set({
                    user,
                    userId: user?.id ?? null,
                    provider: user?.app_metadata.provider || null,
                    isAuthenticated: !!user,
                });
            },

            logout: async () => {
                try {
                    await supabase.auth.signOut();
                    set({ user: null, userId: null, provider: null, isAuthenticated: false });
                    logger.log('User logged out from store');
                } catch (err) {
                    logger.error('Error during logout');
                }
            },
        }),
        {
            name: 'dutuk-auth-storage',
            storage: createJSONStorage(() => zustandMMKVStorage),
        }
    )
);
