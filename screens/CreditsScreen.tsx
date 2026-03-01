import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';

type Nav = StackNavigationProp<RootStackParamList>;

const PACKAGES = [
    {
        id: 'starter',
        name: 'Starter',
        credits: '30 Credits',
        price: '$4.99',
        priceId: 'price_1T6FjuBEbGms3xR9H8GPjvc9',
        desc: 'Perfect to try out',
        emoji: '✨',
        highlight: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        credits: '100 Credits',
        price: '$9.99',
        priceId: 'price_1T6FkPBEbGms3xR9ShZckU5V',
        desc: 'Most popular',
        emoji: '🚀',
        highlight: true,
    },
    {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        credits: '∞ Credits / mo',
        price: '$19.99/mo',
        priceId: 'price_1T6Fm1BEbGms3xR9pQeWNc9m',
        desc: 'For power users',
        emoji: '💎',
        highlight: false,
    },
];

const STRIPE_PK = 'pk_live_51LkOuEBEbGms3xR9JTdVWIjs3QUDQSRD8eaZaDOra0O21kAMpi3v0DHU9BpShynjK3SMsQHL7MAz6bs7WGRcvKnl000VVy6jn0';

import { Linking, Platform, Alert as RNAlert } from 'react-native';

export default function CreditsScreen() {
    const navigation = useNavigation<Nav>();

    const handleBuy = async (pkgId: string, priceId: string) => {
        let paymentUrl = '';
        if (pkgId === 'starter') paymentUrl = `https://buy.stripe.com/test_starter`;
        else if (pkgId === 'pro') paymentUrl = `https://buy.stripe.com/test_pro`;
        else paymentUrl = `https://buy.stripe.com/test_premium`;

        if (Platform.OS === 'web') {
            const proceed = window.confirm(`Proceed to Stripe for package ${pkgId}?`);
            if (proceed) window.open(paymentUrl, '_blank');
        } else {
            RNAlert.alert(
                'Confirm Purchase',
                `Redirecting to Stripe Checkout for Price ID: ${priceId}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Proceed', onPress: () => Linking.openURL(paymentUrl) }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Get Credits</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.purple]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.heroBadge}
                >
                    <Text style={s.heroEmoji}>💳</Text>
                    <Text style={s.heroText}>Top up your credits</Text>
                    <Text style={s.heroSub}>Each generation uses 1 credit</Text>
                </LinearGradient>

                {/* Packages */}
                {PACKAGES.map((pkg) => (
                    <View key={pkg.id} style={[s.card, pkg.highlight && s.cardHighlight]}>
                        {pkg.highlight && (
                            <View style={s.popularBadge}>
                                <Text style={s.popularText}>MOST POPULAR</Text>
                            </View>
                        )}
                        <View style={s.cardRow}>
                            <Text style={s.pkgEmoji}>{pkg.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.pkgName, pkg.highlight && s.pkgNameHL]}>{pkg.name}</Text>
                                <Text style={s.pkgCredits}>{pkg.credits}</Text>
                                <Text style={s.pkgDesc}>{pkg.desc}</Text>
                            </View>
                            <TouchableOpacity
                                style={[s.buyBtn, pkg.highlight && s.buyBtnHL]}
                                onPress={() => handleBuy(pkg.id, pkg.priceId)}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.buyText, pkg.highlight && s.buyTextHL]}>{pkg.price}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <Text style={s.note}>
                    Credits never expire. Secure payments via Stripe.{'\n'}
                    Questions? Contact us at hello@drawreal.ai
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingVertical: 14,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: theme.colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    backIcon: { fontSize: 20, color: theme.colors.textPrimary },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 19, color: theme.colors.textPrimary },
    content: { padding: 20, paddingBottom: 40 },
    heroBadge: {
        borderRadius: theme.radius.lg, padding: 28,
        alignItems: 'center', marginBottom: 28,
    },
    heroEmoji: { fontSize: 40, marginBottom: 8 },
    heroText: { fontFamily: theme.fonts.bold, fontSize: 22, color: '#fff', marginBottom: 4 },
    heroSub: { fontFamily: theme.fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
    card: {
        borderRadius: theme.radius.lg, padding: 20,
        borderWidth: 1.5, borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg, marginBottom: 16,
        shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    },
    cardHighlight: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    popularBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
        alignSelf: 'flex-start', marginBottom: 12,
    },
    popularText: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#fff', letterSpacing: 1 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    pkgEmoji: { fontSize: 32 },
    pkgName: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.textPrimary },
    pkgNameHL: { color: theme.colors.primary },
    pkgCredits: { fontFamily: theme.fonts.medium, fontSize: 14, color: theme.colors.textSecondary },
    pkgDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
    buyBtn: {
        borderRadius: theme.radius.lg, paddingHorizontal: 18, paddingVertical: 12,
        backgroundColor: theme.colors.fieldGray,
    },
    buyBtnHL: { backgroundColor: theme.colors.primary },
    buyText: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.textPrimary },
    buyTextHL: { color: '#fff' },
    note: {
        fontFamily: theme.fonts.regular, fontSize: 12,
        color: theme.colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 8,
    },
});
