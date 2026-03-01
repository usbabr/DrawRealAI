import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, StatusBar, Image, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList>;

export default function AuthScreen() {
    const navigation = useNavigation<Nav>();
    const { colors, isDarkMode } = useAppTheme();

    const continueAsGuest = async () => {
        await AsyncStorage.setItem('drawreal_guest', '1');
        navigation.replace('Main');
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#FFFFFF', '#F9FAFB', '#F0FDF4']}
                style={s.bg}
            >
                {/* Decorative circles */}
                <View style={s.circle1} />
                <View style={s.circle2} />

                {/* Logo */}
                <View style={s.logoArea}>
                    <Image source={require('../assets/logo_transparent.png')} style={s.mainLogoImage} resizeMode="contain" />
                    <Text style={[s.tagline, { color: colors.textSecondary }]}>Turn children's drawings into{'\n'}stunning AI masterpieces ✨</Text>
                </View>

                {/* Feature pills */}
                <View style={s.pills}>
                    {['🎨 4 Art Styles', '⚡ 5 Sec Results', '📱 Save & Share'].map((f) => (
                        <View key={f} style={s.pill}>
                            <Text style={s.pillText}>{f}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA */}
                <View style={s.ctaArea}>
                    {/* Google stub */}
                    <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}
                        onPress={continueAsGuest}>
                        <Text style={s.googleText}>🔑  Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Apple stub */}
                    <TouchableOpacity style={s.appleBtn} activeOpacity={0.85}
                        onPress={continueAsGuest}>
                        <Text style={s.appleText}> Continue with Apple</Text>
                    </TouchableOpacity>

                    {/* Guest */}
                    <TouchableOpacity onPress={continueAsGuest} activeOpacity={0.7}>
                        <Text style={s.guestText}>Continue as Guest →</Text>
                    </TouchableOpacity>

                    <Text style={s.terms}>
                        By continuing you agree to our{' '}
                        <Text style={{ color: theme.colors.primary }}>Terms</Text> &amp;{' '}
                        <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text>
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    bg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF', // Assuming auth screen stays light or we can use colors.background dynamically
    },
    circle1: {
        position: 'absolute', top: -width * 0.4, right: -width * 0.2,
        width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6,
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
    },
    circle2: {
        position: 'absolute', top: width * 0.8, left: -width * 0.4,
        width: width, height: width, borderRadius: width * 0.5,
        backgroundColor: 'rgba(74, 222, 128, 0.08)',
    },
    logoArea: { alignItems: 'center', marginTop: width * 0.3, marginBottom: 40 },
    mainLogoImage: { width: 240, height: 72, marginBottom: 16 },
    tagline: {
        fontFamily: theme.fonts.regular, fontSize: 16,
        color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24,
    },
    pills: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
    pill: {
        backgroundColor: theme.colors.white,
        borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
        borderWidth: 1, borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    pillText: { fontFamily: theme.fonts.medium, fontSize: 13, color: theme.colors.textPrimary },
    ctaArea: { gap: 14 },
    googleBtn: {
        backgroundColor: '#fff', borderRadius: theme.radius.lg,
        paddingVertical: 18, alignItems: 'center',
        borderWidth: 1.5, borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 4,
    },
    googleText: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.textPrimary },
    appleBtn: {
        backgroundColor: theme.colors.textPrimary,
        borderRadius: theme.radius.lg, paddingVertical: 18, alignItems: 'center',
    },
    appleText: { fontFamily: theme.fonts.bold, fontSize: 16, color: '#fff' },
    guestText: {
        fontFamily: theme.fonts.medium, fontSize: 15,
        color: theme.colors.textMuted, textAlign: 'center',
    },
    terms: {
        fontFamily: theme.fonts.regular, fontSize: 11,
        color: theme.colors.textMuted, textAlign: 'center',
    },
});
