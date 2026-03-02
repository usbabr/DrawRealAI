import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';
import { useAppTheme } from '../context/ThemeContext';
import { getCredits, CREDITS_KEY } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = StackNavigationProp<RootStackParamList>;

export default function CreditsScreen() {
    const navigation = useNavigation<Nav>();
    const { colors } = useAppTheme();
    const s = React.useMemo(() => getStyles(colors), [colors]);

    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
                    setLoading(false);
                    return;
                }
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                }
            } catch (e: any) {
                console.warn('Error fetching offerings:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchOfferings();
    }, []);

    const handleBuy = async (pkg: PurchasesPackage) => {
        if (purchasing) return;
        setPurchasing(true);
        try {
            const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);
            if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
                // Success - grant local credits (Demo: giving 50 credits per purchase)
                const current = await getCredits();
                await AsyncStorage.setItem(CREDITS_KEY, (current + 50).toString());
                Alert.alert('Success', 'Credits have been added to your account!');
                navigation.goBack();
            } else {
                Alert.alert('Purchased', 'Thanks for your purchase!');
                navigation.goBack();
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert('Payment Error', e.message);
            }
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle={colors.background === '#1A1A1A' ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backIcon}>✕</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Get Credits</Text>
                <View style={s.backBtn} />
            </View>

            <ScrollView contentContainerStyle={s.content}>
                <Text style={s.title}>DrawReal AI Credits</Text>
                <Text style={s.subtitle}>Generate beautiful AI artwork.</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : packages.length === 0 ? (
                    <Text style={[s.subtitle, { marginTop: 40 }]}>No internet connection or App Store packages are currently unavailable.</Text>
                ) : (
                    <View style={s.packages}>
                        {packages.map((pkg, i) => {
                            const isPro = pkg.identifier.includes('pro') || pkg.identifier.includes('50');
                            return (
                                <TouchableOpacity
                                    key={pkg.identifier}
                                    style={[s.card, isPro && s.cardHighlight]}
                                    onPress={() => handleBuy(pkg)}
                                    activeOpacity={0.8}
                                    disabled={purchasing}
                                >
                                    {isPro && (
                                        <LinearGradient
                                            colors={[colors.primary, colors.purple]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={s.popularBadge}
                                        >
                                            <Text style={s.popularText}>BEST VALUE</Text>
                                        </LinearGradient>
                                    )}
                                    <View style={s.cardTop}>
                                        <Text style={s.cardEmoji}>{isPro ? '🚀' : '✨'}</Text>
                                        <View>
                                            <Text style={s.cardName}>{pkg.product.title.replace(' (DrawReal AI)', '')}</Text>
                                            <Text style={s.cardDesc}>{pkg.product.description}</Text>
                                        </View>
                                    </View>
                                    <View style={s.cardBottom}>
                                        <Text style={s.cardPrice}>{pkg.product.priceString}</Text>
                                        <View style={[s.buyBtn, isPro && s.buyBtnHighlight]}>
                                            <Text style={[s.buyBtnText, isPro && s.buyBtnTextHighlight]}>
                                                Buy Now
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
            <Text style={s.note}>
                Credits never expire. Secure payments via Stripe.{'\n'}
                Questions? Contact us at hello@drawreal.ai
            </Text>
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingVertical: 14,
        backgroundColor: colors.background,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    backIcon: { fontSize: 20, color: colors.textPrimary },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 19, color: colors.textPrimary },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontFamily: theme.fonts.bold, fontSize: 24, color: colors.textPrimary, marginBottom: 8 },
    subtitle: { fontFamily: theme.fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 24 },
    packages: { gap: 16 },
    card: {
        borderRadius: theme.radius.lg, padding: 20,
        borderWidth: 1.5, borderColor: colors.border,
        backgroundColor: colors.cardBg, marginBottom: 16,
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    },
    cardHighlight: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    popularBadge: {
        backgroundColor: colors.primary,
        borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
        alignSelf: 'flex-start', marginBottom: 12,
    },
    popularText: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#fff', letterSpacing: 1 },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    cardEmoji: { fontSize: 32 },
    cardName: { fontFamily: theme.fonts.bold, fontSize: 17, color: colors.textPrimary },
    cardDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: colors.textMuted },
    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
    cardPrice: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.textPrimary },
    buyBtn: {
        borderRadius: theme.radius.lg, paddingHorizontal: 18, paddingVertical: 12,
        backgroundColor: colors.fieldGray,
    },
    buyBtnHighlight: { backgroundColor: colors.primary },
    buyBtnText: { fontFamily: theme.fonts.bold, fontSize: 14, color: colors.textPrimary },
    buyBtnTextHighlight: { color: '#fff' },
    note: {
        fontFamily: theme.fonts.regular, fontSize: 12,
        color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: -15, paddingBottom: 20
    },
});
