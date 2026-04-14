import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
    id: 'dutuk-vendor-storage',
});

/**
 * Zustand persist middleware storage adapter for MMKV
 * Provides synchronous read/write capability (10x faster than bridge-based AsyncStorage)
 */
export const zustandMMKVStorage = {
    getItem: (name: string): string | null => {
        const value = storage.getString(name);
        return value ?? null;
    },
    setItem: (name: string, value: string): void => {
        storage.set(name, value);
    },
    removeItem: (name: string): void => {
        storage.delete(name);
    },
};
