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
    { id: 'p1', originalUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Zqe_8XMcKvZX8hkH_XX1ldx-By4-gbozmlMYsjZBs8baJEMZgd7-aklwU_hW6tcAAE3cOLOftxkC3sl_evT_HeSYC1jS_Q2l4P0dynX9sSRRraYRFsiStfdyzv1-rTr9o3eCQ6eiCu-U6J8Uo5SMf8kXQqAhHTcahaNry_rsjZUjUqNVRHYVV_2PAiPAb0mxoAQtxB5TjdFlk_esO2cy5F1hrctYJpUfxOGwokKTCGtJCitc0IUrjuw8FspIMTVudBzMU8t-bjLS', generatedUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEjGJeWtSQVaWAbXDkIeLynt6RIvs9VhTGT-o_vkC6gzX2qPfGCiPgbus0wsIEwdJGBQPtyh5tnSJAOl2jt9Wu0dyf3zTCRLKVRti_xH2wFI4WkmsFb70EJsvzKuu0Nt5sgmj4-ga2ErrcNed1VBMQzi3_k8WIGbsFROFZT9A0liVOzMLHeTDcCygdsSyvRPAno12azbcO7UEr6S5fVDrjwuHsXJJD_T2M7n7snjn-uR1olQPPUaBA49uXJLtDuJadKiTUYGrgoVhp', style: 'storybook', timestamp: Date.now() },
    { id: 'p2', originalUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFvzwukVmw2loauRD-OFnbh8L4Td4wFQ622ngoqcrT9PoIVJQdJpRlhaS5V0ncysymTtACq-DHFZ956Y87Z1A1S3LWOdt3k5cKaRQtbKeEadeD6nDvhbonJmlAwjQwk21259urL5lYuXKxijoIJe-lSxuB3bUysMMkBTR7WiXeEN8CJI-yIiVYJUTB4xztADvsyq9m64ZJBdivzQAeE8NUTEIzx0Znmpn5-0j9by9awzLSck12OFZiM-DH3-qlAG1NvJHOFRNqfTb', generatedUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbWnMXDo-qan6bp6dC2VonvN-_4SJsXvKFh-GU6KO9aez7GFjhpKkqEQDkPapQ5Ng7qCqClhBvR76OHTWYRaeQOPJsATCUmCjs9I4tRLrxnAMPawzzcPAekA-9vbwNHvPj0VqEa-lpawdocxdfqvWKeZEfo-kHr7PF96Bx2cK3v6urTV-C3bsTbHaBqvidldJ14n3tj0M3Jc4DOmPWjfFt-qoQ6eYGzVvPAoUbI_Zy2C9xJMnIFQLN7Z0PTqHaxIg806gMSZtguvFC', style: 'realistic', timestamp: Date.now() },
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
