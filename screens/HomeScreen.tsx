import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, SafeAreaView, StatusBar,
    PanResponder, Animated, Platform
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';
import { loadGenerations, GenerationRecord } from '../lib/storage';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList>;

const HERO_BEFORE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEjGJeWtSQVaWAbXDkIeLynt6RIvs9VhTGT-o_vkC6gzX2qPfGCiPgbus0wsIEwdJGBQPtyh5tnSJAOl2jt9Wu0dyf3zTCRLKVRti_xH2wFI4WkmsFb70EJsvzKuu0Nt5sgmj4-ga2ErrcNed1VBMQzi3_k8WIGbsFROFZT9A0liVOzMLHeTDcCygdsSyvRPAno12azbcO7UEr6S5fVDrjwuHsXJJD_T2M7n7snjn-uR1olQPPUaBA49uXJLtDuJadKiTUYGrgoVhp';
const HERO_AFTER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbWnMXDo-qan6bp6dC2VonvN-_4SJsXvKFh-GU6KO9aez7GFjhpKkqEQDkPapQ5Ng7qCqClhBvR76OHTWYRaeQOPJsATCUmCjs9I4tRLrxnAMPawzzcPAekA-9vbwNHvPj0VqEa-lpawdocxdfqvWKeZEfo-kHr7PF96Bx2cK3v6urTV-C3bsTbHaBqvidldJ14n3tj0M3Jc4DOmPWjfFt-qoQ6eYGzVvPAoUbI_Zy2C9xJMnIFQLN7Z0PTqHaxIg806gMSZtguvFC';

const STYLES_LIST = [
    { key: 'realistic', label: 'Realistic', emoji: '📷', desc: 'True-to-life photo', badge: null },
    { key: 'storybook', label: 'Storybook', emoji: '📚', desc: 'Disney/Pixar magic', badge: '✨ POPULAR' },
    { key: 'anime', label: 'Anime', emoji: '⛩️', desc: 'Studio Ghibli vibes', badge: null },
    { key: 'watercolor', label: 'Watercolor', emoji: '🎨', desc: 'Soft painterly art', badge: null },
    { key: 'comic', label: 'Comic', emoji: '💥', desc: 'Bold comic style', badge: '🆕 NEW' },
    { key: 'oilpaint', label: 'Oil Paint', emoji: '🖼️', desc: 'Classic fine art', badge: null },
];

const HERO_H = width - 48; // 1:1 square for better image fitting

// ─── Interactive Before/After Slider ──────────────────────────────────────────
function HeroSlider() {
    const sliderX = useRef(new Animated.Value(width / 2 - 20)).current;
    const pos = useRef(width / 2 - 20);

    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, { moveX }) => {
            const clamped = Math.max(24, Math.min(width - 64, moveX));
            pos.current = clamped;
            sliderX.setValue(clamped);
        },
    })).current;

    return (
        <View style={sl.container}>
            {/* After (base) */}
            <Image source={{ uri: HERO_AFTER }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            {/* Before (clipped) */}
            <Animated.View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: sliderX, overflow: 'hidden' }}>
                <Image source={{ uri: HERO_BEFORE }} style={{ width: width - 48, height: HERO_H }} resizeMode="cover" />
            </Animated.View>

            {/* Drag line */}
            <Animated.View style={[sl.line, { left: sliderX }]} {...pan.panHandlers}>
                <View style={sl.handle}>
                    <MaterialIcons name="auto-fix-high" size={24} color={theme.colors.primary} />
                </View>
            </Animated.View>

            {/* Labels (Bottom) */}
            <View style={[sl.label, { left: 16 }]}><Text style={sl.labelTxt}>Before</Text></View>
            <View style={[sl.label, { right: 16 }]}><Text style={sl.labelTxt}>After</Text></View>
        </View>
    );
}

const sl = StyleSheet.create({
    container: {
        height: HERO_H, borderRadius: 24, overflow: 'hidden', position: 'relative',
        backgroundColor: theme.colors.white, shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8
    },
    label: {
        position: 'absolute', bottom: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99,
    },
    labelTxt: { fontFamily: theme.fonts.medium, fontSize: 10, color: '#fff' },
    line: {
        position: 'absolute', top: 0, bottom: 0, width: 4,
        backgroundColor: '#fff', marginLeft: -2,
        alignItems: 'center', justifyContent: 'center',
    },
    handle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center', marginLeft: -2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
    },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const navigation = useNavigation<Nav>();
    const isFocused = useIsFocused();
    const [selectedStyle, setSelectedStyle] = useState('realistic');
    const [recentItems, setRecentItems] = useState<GenerationRecord[]>([]);

    // Reload recent creations whenever the tab is focused
    useEffect(() => {
        if (isFocused) {
            loadGenerations().then((data) => setRecentItems(data.slice(0, 4)));
        }
    }, [isFocused]);

    const PLACEHOLDER_RECENT = [
        { id: 'p1', generatedUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Zqe_8XMcKvZX8hkH_XX1ldx-By4-gbozmlMYsjZBs8baJEMZgd7-aklwU_hW6tcAAE3cOLOftxkC3sl_evT_HeSYC1jS_Q2l4P0dynX9sSRRraYRFsiStfdyzv1-rTr9o3eCQ6eiCu-U6J8Uo5SMf8kXQqAhHTcahaNry_rsjZUjUqNVRHYVV_2PAiPAb0mxoAQtxB5TjdFlk_esO2cy5F1hrctYJpUfxOGwokKTCGtJCitc0IUrjuw8FspIMTVudBzMU8t-bjLS', style: 'storybook', originalUri: '', timestamp: 0 },
        { id: 'p2', generatedUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFvzwukVmw2loauRD-OFnbh8L4Td4wFQ622ngoqcrT9PoIVJQdJpRlhaS5V0ncysymTtACq-DHFZ956Y87Z1A1S3LWOdt3k5cKaRQtbKeEadeD6nDvhbonJmlAwjQwk21259urL5lYuXKxijoIJe-lSxuB3bUysMMkBTR7WiXeEN8CJI-yIiVYJUTB4xztADvsyq9m64ZJBdivzQAeE8NUTEIzx0Znmpn5-0j9by9awzLSck12OFZiM-DH3-qlAG1NvJHOFRNqfTb', style: 'anime', originalUri: '', timestamp: 0 },
    ];

    const displayRecent = recentItems.length > 0 ? recentItems : PLACEHOLDER_RECENT;

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                {/* Logo */}
                <View style={s.logoBlock}>
                    <Image source={require('../assets/logo_transparent.png')} style={s.logoImage} resizeMode="contain" />
                    <Text style={s.logoTagline}>Your child draws it. AI realizes it.</Text>
                </View>
                {/* Credits */}
                <TouchableOpacity
                    style={s.creditBadge}
                    onPress={() => navigation.navigate('Credits')}
                    activeOpacity={0.85}
                >
                    <Text style={s.creditText}>✦ 3 Credits</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero Before/After Slider */}
                <View style={s.section}>
                    <HeroSlider />
                    <View style={s.heroCaption}>
                        <Text style={s.heroCaptionText}>⬅ Drag to compare before & after</Text>
                    </View>
                </View>

                {/* CTA */}
                <View style={[s.section, { marginTop: 16 }]}>
                    <TouchableOpacity
                        style={s.ctaBtn}
                        onPress={() => navigation.navigate('Upload')}
                        activeOpacity={0.85}
                    >
                        <Text style={s.ctaTxt}>Transform a Drawing</Text>
                        <MaterialIcons name="auto-awesome" size={22} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Style Selector */}
                <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Choose a Style</Text>
                    <Text style={s.sectionBadge}>Magic Styles</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stylesRow}>
                    {STYLES_LIST.map((st) => (
                        <TouchableOpacity
                            key={st.key}
                            style={[s.styleCard, selectedStyle === st.key && s.styleCardActive]}
                            onPress={() => setSelectedStyle(st.key)}
                            activeOpacity={0.8}
                        >
                            <View style={s.badgeContainer}>
                                {st.badge && (
                                    <View style={s.badgePill}>
                                        <Text style={s.badgePillTxt}>{st.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={[s.emojiCircle, selectedStyle === st.key && s.emojiCircleActive]}>
                                <Text style={{ fontSize: 32 }}>{st.emoji}</Text>
                            </View>
                            <Text style={[s.styleName, selectedStyle === st.key && s.styleNameActive]}>{st.label}</Text>
                            <Text style={s.styleDesc}>{st.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent Creations */}
                <View style={[s.sectionHeader, { marginTop: 24 }]}>
                    <Text style={s.sectionTitle}>Recent Creations</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Gallery' as any)} activeOpacity={0.7}>
                        <Text style={s.seeAll}>See all →</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.recentGrid}>
                    {displayRecent.slice(0, 4).map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={s.recentCard}
                            activeOpacity={0.85}
                            onPress={() => item.originalUri ? navigation.navigate('Result', {
                                originalUri: item.originalUri,
                                generatedUri: item.generatedUri,
                                style: item.style,
                            }) : undefined}
                        >
                            <Image source={{ uri: item.generatedUri }} style={s.recentImg} resizeMode="cover" />
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={s.recentOverlay}>
                                <Text style={s.recentStyle}>{item.style}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const CARD_W = (width - 40 - 12) / 2;

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 0,
    },
    // Logo block
    logoBlock: { flexDirection: 'column', justifyContent: 'center' },
    logoImage: { width: 170, height: 51, marginBottom: 2 },
    logoTagline: {
        fontFamily: theme.fonts.regular,
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    creditBadge: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1, borderColor: theme.colors.primaryBorder,
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99,
    },
    creditText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primary },
    scroll: { flex: 1 },
    section: { paddingHorizontal: 20, marginTop: 20 },
    heroCaption: { alignItems: 'center', marginTop: 8 },
    heroCaptionText: { fontFamily: theme.fonts.medium, fontSize: 12, color: theme.colors.textMuted },
    ctaBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        paddingVertical: 18,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    ctaTxt: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.textPrimary },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
    },
    sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textPrimary },
    sectionBadge: { fontFamily: theme.fonts.medium, fontSize: 12, color: theme.colors.textMuted },
    seeAll: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.primary },
    stylesRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
    styleCard: {
        width: 128, height: 160, backgroundColor: theme.colors.cardBg,
        borderRadius: 16, padding: 12,
        alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    styleCardActive: { borderBottomColor: 'rgba(167,139,250,0.4)', borderBottomWidth: 4 },
    badgeContainer: { height: 20, justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 2 },
    emojiCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: theme.colors.fieldGray, alignItems: 'center', justifyContent: 'center',
    },
    emojiCircleActive: { backgroundColor: theme.colors.primaryLight },
    styleName: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.textPrimary },
    styleNameActive: { color: theme.colors.textPrimary },
    styleDesc: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted, textAlign: 'center' },
    badgePill: {
        backgroundColor: theme.colors.purpleLight, borderRadius: 99,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    badgePillTxt: { fontFamily: theme.fonts.bold, fontSize: 9, color: theme.colors.purple },
    recentGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20,
    },
    recentCard: {
        width: CARD_W, height: CARD_W,
        borderRadius: theme.radius.lg, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    },
    recentImg: { width: '100%', height: '100%' },
    recentOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
        padding: 12, justifyContent: 'flex-end',
    },
    recentStyle: { fontFamily: theme.fonts.medium, fontSize: 12, color: '#fff' },
});
