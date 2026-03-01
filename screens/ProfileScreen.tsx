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
import { useAppTheme } from '../context/ThemeContext';

type Nav = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<Nav>();
    const [totalCreations, setTotalCreations] = useState(0);
    const { isDarkMode, toggleDarkMode, colors } = useAppTheme();
    const s = React.useMemo(() => getStyles(colors), [colors]);

    useEffect(() => {
        loadGenerations().then((g) => setTotalCreations(g.length));
    }, []);



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

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header gradient */}
                <LinearGradient
                    colors={[colors.primary + '22', colors.purple + '11']}
                    style={s.hero}
                >
                    <View style={s.avatar}>
                        <Text style={s.avatarEmoji}>🎨</Text>
                    </View>
                    <Text style={s.name}>Guest User</Text>
                    <Text style={s.sub}>Sign in to sync your creations</Text>
                </LinearGradient>

                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={s.stat}>
                        <Text style={s.statNum}>{totalCreations}</Text>
                        <Text style={s.statLabel}>Creations</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.stat}>
                        <Text style={s.statNum}>0</Text>
                        <Text style={s.statLabel}>Saved</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.stat}>
                        <Text style={s.statNum}>5</Text>
                        <Text style={s.statLabel}>Free Credits</Text>
                    </View>
                </View>

                {/* Credits CTA */}
                <TouchableOpacity
                    style={s.creditsBanner}
                    onPress={() => navigation.navigate('Credits')}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.purple]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={s.creditsBannerInner}
                    >
                        <Text style={s.creditsBannerText}>💳 Get more credits →</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Settings rows */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Settings</Text>

                    <View style={s.row}>
                        <Text style={s.rowIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                        <Text style={s.rowLabel}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>

                    {ROWS.map((row) => (
                        <TouchableOpacity key={row.label} style={s.row} onPress={row.onPress} activeOpacity={0.7}>
                            <Text style={s.rowIcon}>{row.icon}</Text>
                            <Text style={s.rowLabel}>{row.label}</Text>
                            <Text style={s.rowArrow}>›</Text>
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

const getStyles = (colors: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    hero: {
        alignItems: 'center', paddingTop: 32, paddingBottom: 28,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center',
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
        marginBottom: 16,
    },
    avatarEmoji: { fontSize: 36 },
    name: { fontFamily: theme.fonts.bold, fontSize: 22, color: colors.textPrimary },
    sub: { fontFamily: theme.fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 4 },

    statsRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.cardBg, borderRadius: theme.radius.lg,
        marginHorizontal: 20, paddingVertical: 18, paddingHorizontal: 24,
        marginTop: -16,
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 4,
    },
    stat: { alignItems: 'center', flex: 1 },
    statNum: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.textPrimary },
    statLabel: { fontFamily: theme.fonts.medium, fontSize: 12, color: colors.textMuted, marginTop: 2 },
    statDivider: { width: 1, height: '70%', backgroundColor: colors.border },

    creditsBanner: { marginHorizontal: 20, marginTop: 20, borderRadius: theme.radius.lg, overflow: 'hidden' },
    creditsBannerInner: { paddingVertical: 16, alignItems: 'center' },
    creditsBannerText: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#fff' },

    section: { marginTop: 32 },
    sectionTitle: {
        fontFamily: theme.fonts.bold, fontSize: 14, color: colors.textMuted,
        textTransform: 'uppercase', letterSpacing: 1,
        paddingHorizontal: 24, marginBottom: 8,
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 24,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    rowIcon: { fontSize: 20, width: 32 },
    rowLabel: { flex: 1, fontFamily: theme.fonts.medium, fontSize: 15, color: colors.textPrimary },
    rowArrow: { fontFamily: theme.fonts.regular, fontSize: 20, color: colors.textMuted },

    signOutBtn: {
        marginHorizontal: 20, marginTop: 40,
        paddingVertical: 16, borderRadius: theme.radius.full,
        backgroundColor: colors.fieldGray, alignItems: 'center',
    },
    signOutText: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#EF4444' },

    version: {
        fontFamily: theme.fonts.regular, fontSize: 11, color: colors.textMuted,
        textAlign: 'center', marginTop: 20, marginBottom: 40,
    },
});
