import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * A premium full-screen overlay component to show when internet connection is lost.
 * This blocks the entire app interaction and displays a clean, professional message.
 */
export const OfflineFallback = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Feather name="wifi-off" size={48} color="#800000" />
                    <View style={styles.pulseRing} />
                </View>

                <Text style={styles.title}>No Internet Connection</Text>
                <Text style={styles.subtitle}>
                    Dutuk Vendor requires an active internet connection to manage your orders and availability.
                </Text>

                <View style={styles.statusBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.statusText}>Searching for connection...</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Please check your Wi-Fi or cellular data settings.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: height,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    pulseRing: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#800000',
        opacity: 0.1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A0A0A0',
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        paddingHorizontal: 40,
    },
    footerText: {
        fontSize: 13,
        color: '#999999',
        textAlign: 'center',
    },
});
