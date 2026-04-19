import logger from '@/lib/logger';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    err: Error | null;
}

/**
 * Root-level error boundary that catches any render-time JS exceptions.
 * Without this, any undefined field access on a Supabase row mid-render
 * produces a blank white screen in release builds with no feedback.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { err: null };

    static getDerivedStateFromError(err: Error): State {
        return { err };
    }

    componentDidCatch(err: Error, info: React.ErrorInfo) {
        logger.error('[ErrorBoundary] Caught render error:', err?.message, info.componentStack);
        // TODO: forward to Sentry / Bugsnag
    }

    render() {
        if (this.state.err) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.subtitle}>
                        The app encountered an unexpected error.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.setState({ err: null })}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FDFDFD',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});
