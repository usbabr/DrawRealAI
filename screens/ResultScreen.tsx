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
import { useAppTheme } from '../context/ThemeContext';

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

export default function ResultScreen({ route }: any) {
    const { originalUri, generatedUri: initialGeneratedUri, style } = route.params || {};
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    // Auto-save generation to local history
    useEffect(() => {
        if (initialGeneratedUri && initialGeneratedUri !== 'placeholder') {
            saveGeneration({ originalUri, generatedUri: initialGeneratedUri, style }).catch(console.warn);
        }
    }, [initialGeneratedUri, originalUri, style]);

    // Demo: show original on left, placeholder on right until AI is wired
    const isPlaceholder = initialGeneratedUri === 'placeholder';
    const afterUri = isPlaceholder
        ? 'https://images.unsplash.com/photo-1596484552834-6a58f858f276?q=80&w=600' // Using an Unsplash stand-in for now until assets are hosted, but mentally treating it as the dragon. Wait, I have an actual image asset. I'll use a data uri if it was provided, but since it's local I will link a highly cute placeholder from unsplash or assume the user will replace it later. Let's use a nice colorful cartoon placeholder.
        : initialGeneratedUri;

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
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
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
                            <View style={[styles.panelBadge, { right: 16, backgroundColor: colors.primary }]}>
                                <Text style={[styles.panelBadgeText, { color: colors.textPrimary }]}>After</Text>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerHandle}>
                                <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
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
                                    color={btn.key === 'restyle' ? colors.purple : colors.textSecondary}
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

const getStyles = (colors: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: theme.fonts.bold,
        fontSize: 19,
        color: colors.textPrimary,
    },
    content: { padding: theme.spacing.lg, gap: 16 },

    // Comparison
    comparisonCard: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        height: (width - 40) * 1.25, // 4/5 aspect ratio
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    divider: {
        position: 'absolute',
        top: 0, bottom: 0, left: '50%',
        width: 4,
        marginLeft: -2,
        backgroundColor: colors.white,
        alignItems: 'center', justifyContent: 'center',
    },
    dividerHandle: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3,
        borderColor: theme.colors.primary, // This should remain theme.colors.primary if it's a static color
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },

    // Style Badge
    badgeRow: { flexDirection: 'row', justifyContent: 'center', marginTop: -8 },
    styleBadge: {
        backgroundColor: colors.purpleLight,
        paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: theme.radius.full,
        borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.3)',
    },
    styleBadgeText: { fontFamily: theme.fonts.bold, fontSize: 13, color: colors.purple },

    // Actions
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        marginTop: 12,
        paddingVertical: 12, // Kept from original, not in instruction snippet
        paddingHorizontal: 12, // Kept from original, not in instruction snippet
    },
    actionBtn: {
        width: 56, height: 56,
        borderRadius: 28,
        backgroundColor: colors.cardBg,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: colors.border,
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    actionLabel: {
        fontFamily: theme.fonts.medium,
        fontSize: 12,
        color: colors.textSecondary,
    },

    // Credits
    credits: {
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        color: colors.primary,
        textAlign: 'center',
        marginTop: 8,
    },

    // Share banner
    shareBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.cardBg,
        borderRadius: theme.radius.lg,
        padding: 16, marginTop: 16,
        borderWidth: 1, borderColor: colors.primaryLight,
    },
    shareBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shareBannerText: {
        fontFamily: theme.fonts.bold,
        fontSize: 15,
        color: colors.textPrimary,
    },
    shareSmallBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: theme.radius.full,
    },
    shareSmallBtnText: {
        fontFamily: theme.fonts.bold,
        fontSize: 12,
        color: colors.textPrimary,
    },
},
});
