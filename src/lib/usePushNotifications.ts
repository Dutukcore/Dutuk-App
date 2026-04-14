import { useAuthStore } from '@/store/useAuthStore';
import logger from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// =====================================================
// CONFIGURATION
// =====================================================

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// =====================================================
// TYPES
// =====================================================

export interface PushNotificationState {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    loading: boolean;
    error: string | null;
}

// =====================================================
// HOOK: usePushNotifications
// =====================================================

/**
 * Handles Expo Push Notifications for the vendor app
 * - Requests permissions
 * - Gets Expo Push Token
 * - Stores token in Supabase
 * - Listens for incoming notifications
 * 
 * @returns Object with push token, notification state, and register function
 */
export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    // Register for push notifications
    const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            // Check if device (not simulator)
            if (!Device.isDevice) {
                logger.log('Push notifications only work on physical devices');
                setError('Push notifications require a physical device');
                return null;
            }

            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                logger.log('Push notification permissions not granted');
                setError('Permission to receive notifications was denied');
                return null;
            }

            // Get Expo Push Token
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId: projectId,
            });
            const token = tokenResponse.data;

            // Configure for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            // Store token in Supabase
            const user = useAuthStore.getState().user;
            if (user?.id) {
                await storePushToken(user.id, token);
            }

            setExpoPushToken(token);
            logger.log('Push notification token obtained');
            return token;
        } catch (err: any) {
            logger.error('Error registering for push notifications');
            setError(err.message || 'Failed to register for push notifications');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Store push token in Supabase
    const storePushToken = async (userId: string, token: string) => {
        try {
            const platform = Platform.OS === 'ios' ? 'ios' : 'android';
            const deviceName = Device.modelName || 'Unknown Device';

            // Upsert token (insert or update if exists)
            const { error: upsertError } = await supabase
                .from('push_tokens')
                .upsert(
                    {
                        user_id: userId,
                        token: token,
                        platform: platform,
                        device_name: deviceName,
                        is_active: true,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: 'user_id,token',
                    }
                );

            if (upsertError) {
                logger.error('Error storing push token');
            }
        } catch (err) {
            logger.error('Error storing push token');
        }
    };

    // Remove push token from Supabase (on logout)
    const removePushToken = useCallback(async () => {
        if (!expoPushToken) return;

        try {
            const user = useAuthStore.getState().user;
            if (user?.id) {
                await supabase
                    .from('push_tokens')
                    .update({ is_active: false })
                    .eq('user_id', user.id)
                    .eq('token', expoPushToken);
            }
        } catch (err) {
            logger.error('Error removing push token');
        }
    }, [expoPushToken]);

    // Initialize listeners
    useEffect(() => {
        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                setNotification(notification);
                logger.log('Notification received');
            }
        );

        // Listen for notification responses (user taps notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                logger.log('Notification response received');
                const data = response.notification.request.content.data;

                // Handle navigation based on notification type
                if (data?.type === 'new_message') {
                    // TODO: Navigate to chat conversation
                    logger.log('Navigate to conversation');
                } else if (data?.type === 'order_accepted') {
                    // TODO: Navigate to orders
                    logger.log('Navigate to orders');
                }
            }
        );

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // Auto-register on mount
    useEffect(() => {
        registerForPushNotifications();
    }, [registerForPushNotifications]);

    return {
        expoPushToken,
        notification,
        loading,
        error,
        registerForPushNotifications,
        removePushToken,
    };
}

// =====================================================
// HELPER: Send local notification (for testing)
// =====================================================

export async function sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: 'default',
        },
        trigger: null, // Immediate
    });
}
