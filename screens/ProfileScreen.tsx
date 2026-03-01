import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, StatusBar, Alert, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { loadGenerations } from '../lib/storage';
import { RootStackParamList } from '../navigation';

type Nav = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<Nav>();
    const [totalCreations, setTotalCreations] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadGenerations().then((g) => setTotalCreations(g.length));
        AsyncStorage.getItem('drawreal_theme').then((t) => {
            if (t === 'dark') setIsDarkMode(true);
        });
    }, []);

    const toggleDarkMode = async () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        await AsyncStorage.setItem('drawreal_theme', nextMode ? 'dark' : 'light');
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('drawreal_guest');
                    navigation.replace('Auth');
                },
            },
        ]);
    };

    const ROWS = [
        { icon: '💳', label: 'Get Credits', onPress: () => navigation.navigate('Credits') },
        { icon: '🔔', label: 'Notifications', onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon!') },
        { icon: '⭐', label: 'Rate DrawReal AI', onPress: () => Alert.alert('Thank you!', 'App Store rating coming soon!') },
        { icon: '🔒', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy', 'Available at drawreal.ai/privacy') },
        { icon: '📧', label: 'Contact Support', onPress: () => Alert.alert('Support', 'Email us at hello@drawreal.ai') },
    ];

    // Dynamic Colors based on Dark Mode
    const bgColor = isDarkMode ? '#111827' : theme.colors.white;
    const cardBg = isDarkMode ? '#1F2937' : theme.colors.white;
    const txtPrimary = isDarkMode ? '#F9FAFB' : theme.colors.textPrimary;
    const txtMuted = isDarkMode ? '#9CA3AF' : theme.colors.textMuted;
    const borderColor = isDarkMode ? '#374151' : theme.colors.border;

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: bgColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header gradient */}
                <LinearGradient
                    colors={[theme.colors.primary + '22', theme.colors.purple + '11']}
                    style={s.hero}
                >
                    <View style={[s.avatar, { backgroundColor: cardBg }]}>
                        <Text style={s.avatarEmoji}>🎨</Text>
                    </View>
                    <Text style={[s.name, { color: txtPrimary }]}>Guest User</Text>
                    <Text style={[s.sub, { color: txtMuted }]}>Sign in to sync your creations</Text>
                </LinearGradient>

                {/* Stats */}
                <View style={[s.statsRow, { backgroundColor: cardBg }]}>
                    <View style={s.stat}>
                        <Text style={[s.statNum, { color: txtPrimary }]}>{totalCreations}</Text>
                        <Text style={[s.statLabel, { color: txtMuted }]}>Creations</Text>
                    </View>
                    <View style={[s.statDivider, { backgroundColor: borderColor }]} />
                    <View style={s.stat}>
                        <Text style={[s.statNum, { color: txtPrimary }]}>0</Text>
                        <Text style={[s.statLabel, { color: txtMuted }]}>Saved</Text>
                    </View>
                    <View style={[s.statDivider, { backgroundColor: borderColor }]} />
                    <View style={s.stat}>
                        <Text style={[s.statNum, { color: txtPrimary }]}>5</Text>
                        <Text style={[s.statLabel, { color: txtMuted }]}>Free Credits</Text>
                    </View>
                </View>

                {/* Credits CTA */}
                <TouchableOpacity
                    style={s.creditsBanner}
                    onPress={() => navigation.navigate('Credits')}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.purple]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={s.creditsBannerInner}
                    >
                        <Text style={s.creditsBannerText}>💳 Get more credits →</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Settings rows */}
                <View style={s.section}>
                    <Text style={[s.sectionTitle, { color: txtMuted }]}>Settings</Text>

                    <View style={[s.row, { borderBottomColor: borderColor }]}>
                        <Text style={s.rowIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                        <Text style={[s.rowLabel, { color: txtPrimary }]}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>

                    {ROWS.map((row) => (
                        <TouchableOpacity key={row.label} style={[s.row, { borderBottomColor: borderColor }]} onPress={row.onPress} activeOpacity={0.7}>
                            <Text style={s.rowIcon}>{row.icon}</Text>
                            <Text style={[s.rowLabel, { color: txtPrimary }]}>{row.label}</Text>
                            <Text style={[s.rowArrow, { color: txtMuted }]}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign out */}
                <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
                    <Text style={s.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={s.version}>DrawReal AI v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.white },
    hero: {
        alignItems: 'center', paddingTop: 32, paddingBottom: 28,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: theme.colors.white,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    avatarEmoji: { fontSize: 36 },
    name: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.textPrimary, marginBottom: 4 },
    sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textMuted },
    statsRow: {
        flexDirection: 'row', backgroundColor: theme.colors.white,
        marginHorizontal: 20, marginTop: -1,
        borderRadius: theme.radius.lg, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    stat: { flex: 1, alignItems: 'center' },
    statNum: { fontFamily: theme.fonts.bold, fontSize: 24, color: theme.colors.textPrimary },
    statLabel: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: theme.colors.border },
    creditsBanner: { marginHorizontal: 20, marginTop: 16, borderRadius: theme.radius.lg, overflow: 'hidden' },
    creditsBannerInner: { paddingVertical: 16, alignItems: 'center' },
    creditsBannerText: { fontFamily: theme.fonts.bold, fontSize: 16, color: '#fff' },
    section: { marginTop: 24, marginHorizontal: 20 },
    sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    rowIcon: { fontSize: 20, marginRight: 14 },
    rowLabel: { flex: 1, fontFamily: theme.fonts.medium, fontSize: 15, color: theme.colors.textPrimary },
    rowArrow: { fontSize: 22, color: theme.colors.textMuted },
    signOutBtn: { margin: 20, padding: 16, alignItems: 'center', borderRadius: theme.radius.lg, backgroundColor: '#FEE2E2' },
    signOutText: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#EF4444' },
    version: { textAlign: 'center', fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, marginBottom: 32 },
});
