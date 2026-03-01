import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Share,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';
import { saveGeneration } from '../lib/storage';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ACTION_BUTTONS = [
    { key: 'save', icon: 'save', label: 'Save' },
    { key: 'share', icon: 'share', label: 'Share' },
    { key: 'restyle', icon: 'cached', label: 'Restyle' },
    { key: 'print', icon: 'print', label: 'Print' },
];

const STYLE_LABELS: Record<string, string> = {
    realistic: 'Realistic Style 🌿',
    storybook: 'Storybook Style 📚',
    anime: 'Anime Style ✨',
    watercolor: 'Watercolor Style 🎨',
};

export default function ResultScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<ResultRouteProp>();
    const { originalUri, generatedUri, style } = route.params;

    // Auto-save generation to local history
    useEffect(() => {
        if (generatedUri && generatedUri !== 'placeholder') {
            saveGeneration({ originalUri, generatedUri, style }).catch(console.warn);
        }
    }, []);

    // Demo: show original on left, placeholder on right until AI is wired
    const isPlaceholder = generatedUri === 'placeholder';
    const afterUri = isPlaceholder
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRW5Mb-layqGkFPvura_3ROM7ki8HzoVv2iGPj7whMrQ2koVJnSW9yDQvBE6o4Q1n8GqWVnCSePbEeM21L8qxxWNWRv4HxTX1WhpqJGXOMDLIp-ugonvOAodTQGg1K2lt-gNkpxasiANMAbC-2Qs1EJYpShdmKWVXHqkiEgsGoOCeWSWmlhXcl587ZaJr_1nBuqZsQm8Gvtc77C7HtNmEqyBFcAnyCBrEbPJKkJ9xxxynMuyn6x3ztZyG3hmiGHC_vsUgQmvlfXTC9'
        : generatedUri;

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this amazing AI transformation of my child\'s drawing! Made with DrawReal AI 🎨✨',
            });
        } catch (e) { }
    };

    const handleSave = async () => {
        if (Platform.OS === 'web') {
            const link = document.createElement('a');
            link.href = afterUri;
            link.download = `DrawRealAI_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Download started! ✨');
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to save photos.');
                return;
            }

            // @ts-ignore
            const fileUri = `${FileSystem.documentDirectory}drawreal_${Date.now()}.jpg`;
            const { uri } = await FileSystem.downloadAsync(afterUri, fileUri);
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('Success', 'Saved to gallery! ✨');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    const handleAction = (key: string) => {
        if (key === 'share') handleShare();
        if (key === 'save') handleSave();
        if (key === 'restyle') navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>✨ Here It Is!</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Before / After Comparison Card */}
                <View style={styles.comparisonCard}>
                    <View style={styles.comparisonInner}>
                        {/* Before */}
                        <View style={styles.halfPanel}>
                            <Image source={{ uri: originalUri }} style={styles.panelImage} resizeMode="cover" />
                            <View style={[styles.panelBadge, { left: 16 }]}>
                                <Text style={styles.panelBadgeText}>Before</Text>
                            </View>
                        </View>

                        {/* After */}
                        <View style={styles.halfPanel}>
                            <Image source={{ uri: afterUri }} style={styles.panelImage} resizeMode="cover" />
                            <View style={[styles.panelBadge, { right: 16, backgroundColor: theme.colors.primary }]}>
                                <Text style={[styles.panelBadgeText, { color: theme.colors.textPrimary }]}>After</Text>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerHandle}>
                                <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Style Badge */}
                <View style={styles.badgeRow}>
                    <View style={styles.styleBadge}>
                        <Text style={styles.styleBadgeText}>{STYLE_LABELS[style] ?? 'AI Style'}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    {ACTION_BUTTONS.map((btn) => (
                        <View key={btn.key} style={{ alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleAction(btn.key)}
                                activeOpacity={0.75}
                            >
                                <MaterialIcons
                                    name={btn.icon as any}
                                    size={24}
                                    color={btn.key === 'restyle' ? theme.colors.purple : theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                            <Text style={styles.actionLabel}>{btn.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Credits */}
                <Text style={styles.credits}>2 credits remaining</Text>

                <TouchableOpacity style={styles.shareBanner} onPress={handleShare} activeOpacity={0.85}>
                    <View style={styles.shareBannerLeft}>
                        <Text style={{ fontSize: 24 }}>🎁</Text>
                        <Text style={styles.shareBannerText}>Share & get 1 free credit</Text>
                    </View>
                    <View style={styles.shareSmallBtn}>
                        <Text style={styles.shareSmallBtnText}>Share</Text>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: theme.fonts.bold,
        fontSize: 19,
        color: theme.colors.textPrimary,
    },
    content: { padding: theme.spacing.lg, gap: 16 },

    // Comparison
    comparisonCard: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        height: (width - 40) * 1.25, // 4/5 aspect ratio
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    comparisonInner: {
        flex: 1,
        flexDirection: 'row',
        position: 'relative',
    },
    halfPanel: { flex: 1, position: 'relative' },
    panelImage: { width: '100%', height: '100%' },
    panelBadge: {
        position: 'absolute',
        top: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: theme.radius.full,
    },
    panelBadgeText: {
        fontFamily: theme.fonts.bold,
        fontSize: 10,
        color: theme.colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    divider: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: '50%',
        width: 3,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -1.5,
    },
    dividerHandle: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.white,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3,
        borderColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },

    // Style Badge
    badgeRow: { alignItems: 'center' },
    styleBadge: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.primaryBorder,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
    },
    styleBadgeText: {
        fontFamily: theme.fonts.semiBold,
        fontSize: 13,
        color: theme.colors.textPrimary,
    },

    // Actions
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    actionBtn: {
        width: 56, height: 56,
        borderRadius: 16,
        backgroundColor: theme.colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: {
        fontFamily: theme.fonts.medium,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },

    // Credits
    credits: {
        fontFamily: theme.fonts.medium,
        fontSize: 12,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },

    // Share banner
    shareBanner: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.primaryBorder,
        borderRadius: theme.radius.lg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shareBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shareBannerText: {
        fontFamily: theme.fonts.semiBold,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    shareSmallBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
    },
    shareSmallBtnText: {
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        color: theme.colors.textPrimary,
    },
});
