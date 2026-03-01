import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Animated, Easing, SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { generateFromDrawing, uriToDataUrl, DrawingStyle } from '../lib/fal';
import { RootStackParamList } from '../navigation';

type LoadingRouteProp = RouteProp<RootStackParamList, 'Loading'>;

const FACTS = [
    '✏️ AI sees every line your child drew',
    '🎨 Your result is one of a kind',
    '✨ Turning imagination into reality',
    '🌟 Almost there...',
    '🖼️ Making magic happen',
];

export default function LoadingScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<LoadingRouteProp>();
    const { originalUri, style, hint } = route.params;

    const [factIndex, setFactIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Spinning animation
    const spin = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Spin animation
        Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();

        // Rotate facts
        const interval = setInterval(() => {
            setFactIndex((i) => (i + 1) % FACTS.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        runGeneration();
    }, []);

    const runGeneration = async () => {
        try {
            const dataUrl = await uriToDataUrl(originalUri);
            const generatedUri = await generateFromDrawing(dataUrl, style as DrawingStyle, hint);
            navigation.replace('Result', { originalUri, generatedUri, style });
        } catch (e: any) {
            setError(e?.message ?? 'Something went wrong. Please try again.');
        }
    };

    const spinInterpolate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
            <View style={styles.container}>

                {error ? (
                    // Error state
                    <View style={styles.errorBox}>
                        <Text style={styles.errorEmoji}>😕</Text>
                        <Text style={styles.errorTitle}>Something went wrong</Text>
                        <Text style={styles.errorMsg}>{error}</Text>
                        <Text style={styles.errorHint} onPress={() => navigation.goBack()}>
                            ← Go back and try again
                        </Text>
                    </View>
                ) : (
                    // Loading state
                    <>
                        {/* Spinning ring */}
                        <View style={styles.ringWrapper}>
                            <Animated.View
                                style={[styles.ring, { transform: [{ rotate: spinInterpolate }] }]}
                            />
                            <Animated.View style={[styles.emojiCenter, { transform: [{ scale: pulse }] }]}>
                                <Text style={styles.centerEmoji}>🎨</Text>
                            </Animated.View>
                        </View>

                        <Text style={styles.title}>Bringing your drawing to life...</Text>
                        <Text style={styles.subtitle}>This takes about 10–20 seconds</Text>

                        {/* Progress bar */}
                        <View style={styles.progressBar}>
                            <Animated.View style={styles.progressFill} />
                        </View>

                        {/* Rotating fact */}
                        <Text style={styles.fact}>{FACTS[factIndex]}</Text>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.white },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: 20,
    },

    // Ring
    ringWrapper: {
        width: 140, height: 140,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    ring: {
        position: 'absolute',
        width: 140, height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: 'transparent',
        borderTopColor: theme.colors.primary,
        borderRightColor: theme.colors.purple,
    },
    emojiCenter: {
        width: 90, height: 90,
        borderRadius: 45,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
    },
    centerEmoji: { fontSize: 40 },

    // Text
    title: {
        fontFamily: theme.fonts.bold,
        fontSize: 20,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: theme.fonts.regular,
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },

    // Progress
    progressBar: {
        width: '100%', height: 4,
        backgroundColor: theme.colors.fieldGray,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '60%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
    },

    // Fact
    fact: {
        fontFamily: theme.fonts.medium,
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 8,
    },

    // Error
    errorBox: { alignItems: 'center', gap: 12, padding: theme.spacing.lg },
    errorEmoji: { fontSize: 52 },
    errorTitle: {
        fontFamily: theme.fonts.bold,
        fontSize: 20,
        color: theme.colors.textPrimary,
    },
    errorMsg: {
        fontFamily: theme.fonts.regular,
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    errorHint: {
        fontFamily: theme.fonts.semiBold,
        fontSize: 14,
        color: theme.colors.primary,
        marginTop: 8,
    },
});
