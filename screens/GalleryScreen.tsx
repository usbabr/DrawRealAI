import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image, SafeAreaView, StatusBar,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../constants/theme';
import { loadGenerations, GenerationRecord } from '../lib/storage';
import { RootStackParamList } from '../navigation';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;
type Nav = StackNavigationProp<RootStackParamList>;

const PLACEHOLDER_RECORDS: GenerationRecord[] = [
    {
        id: 'p1',
        originalUri: Image.resolveAssetSource(require('../assets/sample_realistic_before.png')).uri,
        generatedUri: Image.resolveAssetSource(require('../assets/sample_realistic_after.png')).uri,
        style: 'realistic',
        timestamp: Date.now(),
        hint: 'A highly detailed and fluffy golden retriever puppy'
    },
    {
        id: 'p2',
        originalUri: Image.resolveAssetSource(require('../assets/sample_storybook_before.png')).uri,
        generatedUri: Image.resolveAssetSource(require('../assets/sample_storybook_after.png')).uri,
        style: 'storybook',
        timestamp: Date.now(),
        hint: 'A magical glowing wizard tower from a classic fairy tale'
    },
];

export default function GalleryScreen() {
    const navigation = useNavigation<Nav>();
    const { colors, isDarkMode } = useAppTheme();
    const s = React.useMemo(() => getStyles(colors), [colors]);
    const [records, setRecords] = useState<GenerationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGenerations().then((data) => {
            setRecords(data);
            setLoading(false);
        });
    }, []);

    const isEmpty = records.length === 0;
    const displayData = isEmpty ? PLACEHOLDER_RECORDS : records;

    if (loading) {
        return (
            <SafeAreaView style={s.safe}>
                <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    const EmptyHeader = () => (
        <View style={s.empty}>
            <Text style={s.emptyIcon}>🎨</Text>
            <Text style={s.emptyTitle}>No creations yet</Text>
            <Text style={s.emptySub}>Bring a drawing to life and it will appear here!</Text>
            <TouchableOpacity
                style={s.ctaBtn}
                onPress={() => navigation.navigate('Upload')}
                activeOpacity={0.85}
            >
                <Text style={s.ctaText}>Create your first ✨</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 24, width: '100%' }}>
                <Text style={s.examplesTitle}>Community Examples</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={s.header}>
                <Text style={s.headerTitle}>My Creations</Text>
                <Text style={s.count}>{!isEmpty ? `${records.length} total` : ''}</Text>
            </View>
            <FlatList
                data={displayData}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.grid}
                columnWrapperStyle={{ gap: 12 }}
                ListHeaderComponent={isEmpty ? <EmptyHeader /> : null}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.card}
                        activeOpacity={0.85}
                        onPress={() =>
                            navigation.navigate('GalleryDetail', {
                                record: item,
                            })
                        }
                    >
                        <Image source={{ uri: item.generatedUri }} style={s.thumb} resizeMode="cover" />
                        <View style={s.cardMeta}>
                            <Text style={s.cardStyle}>{item.style}</Text>
                            <Text style={s.cardDate}>
                                {new Date(item.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 22, color: colors.textPrimary },
    count: { fontFamily: theme.fonts.medium, fontSize: 13, color: colors.textMuted },
    grid: { padding: 18, gap: 12 },
    card: {
        width: ITEM_SIZE, borderRadius: theme.radius.lg, overflow: 'hidden',
        backgroundColor: colors.cardBg,
        shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    },
    thumb: { width: ITEM_SIZE, height: ITEM_SIZE },
    cardMeta: {
        paddingHorizontal: 10, paddingVertical: 8,
        flexDirection: 'row', justifyContent: 'space-between',
    },
    cardStyle: { fontFamily: theme.fonts.bold, fontSize: 12, color: colors.textPrimary, textTransform: 'capitalize' },
    cardDate: { fontFamily: theme.fonts.regular, fontSize: 11, color: colors.textMuted },
    empty: { alignItems: 'center', paddingVertical: 10, gap: 12 },
    emptyIcon: { fontSize: 64 },
    emptyTitle: { fontFamily: theme.fonts.bold, fontSize: 22, color: colors.textPrimary },
    emptySub: { fontFamily: theme.fonts.regular, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
    ctaBtn: {
        backgroundColor: colors.primary, borderRadius: theme.radius.lg,
        paddingHorizontal: 28, paddingVertical: 16, marginTop: 8,
    },
    ctaText: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#fff' },
    examplesTitle: {
        fontFamily: theme.fonts.bold, fontSize: 16, color: colors.textMuted,
        textAlign: 'left', marginTop: 10, marginLeft: 4
    }
});
