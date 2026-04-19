import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMMKV } from 'react-native-mmkv';
import logger from './logger';

// Attempt MMKV init; fall back to AsyncStorage on OEMs
// where the C++ native module fails to load.
let mmkv: ReturnType<typeof createMMKV> | null = null;
try {
    mmkv = createMMKV({ id: 'dutuk-vendor-storage' });
} catch (e) {
    logger.error('MMKV init failed, falling back to AsyncStorage', e);
}

/** The raw MMKV instance (null if init failed). */
export const storage = mmkv;

/**
 * Zustand persist middleware storage adapter.
 * Synchronous when MMKV is available (10x faster than bridge-based AsyncStorage).
 * Falls back to AsyncStorage-compatible async adapter if MMKV failed to initialise.
 */
export const zustandMMKVStorage = mmkv
    ? {
        getItem: (name: string): string | null => {
            return mmkv!.getString(name) ?? null;
        },
        setItem: (name: string, value: string): void => {
            mmkv!.set(name, value);
        },
        removeItem: (name: string): void => {
            mmkv!.remove(name);
        },
    }
    : {
        getItem: (name: string) => AsyncStorage.getItem(name),
        setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
        removeItem: (name: string) => AsyncStorage.removeItem(name),
    };
