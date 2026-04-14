import logger from '@/lib/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Check if we're in a server-side rendering context
const isServerSide = typeof window === 'undefined';

// Auth storage adapter
// ─────────────────────────────────────────────────────────────────────────────
// We deliberately use AsyncStorage here (NOT MMKV) for two reasons:
// 1. Supabase auth only stores ~3 small tokens — async perf is irrelevant.
// 2. react-native-mmkv v4 returns a C++ HybridObject whose native methods
//    are not accessible via CommonJS require() or conditional access inside
//    function closures, causing "storage.delete is not a function" crashes.
// Zustand state (larger, sync-required) continues to use MMKV separately.
const createSafeStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => window.localStorage?.getItem(key) ?? null,
      setItem: async (key: string, value: string) => window.localStorage?.setItem(key, value),
      removeItem: async (key: string) => window.localStorage?.removeItem(key),
    };
  }
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        logger.warn('Storage getItem error:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        logger.warn('Storage setItem error:', error);
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        logger.warn('Storage removeItem error:', error);
      }
    },
  };
};

// Custom fetch with timeout for storage operations
const createCustomFetch = () => (url: RequestInfo | URL, options: RequestInit = {}) => {
  const controller = new AbortController();
  const urlString = typeof url === 'string' ? url : url.toString();
  const isStorageRequest = urlString.includes('/storage/');
  const timeoutDuration = isStorageRequest ? 30000 : 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

// Singleton instance - only created on client side
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates or returns the Supabase client instance.
 * Returns a no-op client during SSR to prevent hydration issues.
 */
const getSupabaseClient = (): SupabaseClient => {
  // During SSR, return a mock client that does nothing
  if (isServerSide) {
    // Return a proxy that returns safe defaults for any property access
    return new Proxy({} as SupabaseClient, {
      get: (target, prop) => {
        // For auth methods, return safe async functions
        if (prop === 'auth') {
          return new Proxy({}, {
            get: () => async () => ({ data: null, error: null }),
          });
        }
        // For database methods (from, rpc, etc.)
        if (prop === 'from' || prop === 'rpc') {
          return () => new Proxy({}, {
            get: () => () => new Proxy({}, {
              get: () => () => Promise.resolve({ data: null, error: null }),
            }),
          });
        }
        // For storage methods
        if (prop === 'storage') {
          return new Proxy({}, {
            get: () => () => new Proxy({}, {
              get: () => () => Promise.resolve({ data: null, error: null }),
            }),
          });
        }
        return undefined;
      },
    });
  }

  // Create singleton instance on client
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: createSafeStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-client-info': 'dutuk-frontend@1.0.0',
        },
        fetch: createCustomFetch(),
      },
    });
  }

  return supabaseInstance;
};

// Export a getter that ensures we always get the correct instance
export const supabase: SupabaseClient = getSupabaseClient();
