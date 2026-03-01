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

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;
type Nav = StackNavigationProp<RootStackParamList>;

export default function GalleryScreen() {
    const navigation = useNavigation<Nav>();
    const [records, setRecords] = useState<GenerationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGenerations().then((data) => {
            setRecords(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={s.safe}>
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (records.length === 0) {
        return (
            <SafeAreaView style={s.safe}>
                <StatusBar barStyle="dark-content" />
                <View style={s.header}><Text style={s.headerTitle}>My Creations</Text></View>
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
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" />
            <View style={s.header}>
                <Text style={s.headerTitle}>My Creations</Text>
                <Text style={s.count}>{records.length} total</Text>
            </View>
            <FlatList
                data={records}
                numColumns={2}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.grid}
                columnWrapperStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={s.card}
                        activeOpacity={0.85}
                        onPress={() =>
                            navigation.navigate('Result', {
                                originalUri: item.originalUri,
                                generatedUri: item.generatedUri,
                                style: item.style,
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

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.textPrimary },
    count: { fontFamily: theme.fonts.medium, fontSize: 13, color: theme.colors.textMuted },
    grid: { padding: 18, gap: 12 },
    card: {
        width: ITEM_SIZE, borderRadius: theme.radius.lg, overflow: 'hidden',
        backgroundColor: theme.colors.cardBg,
        shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 2,
    },
    thumb: { width: ITEM_SIZE, height: ITEM_SIZE },
    cardMeta: {
        paddingHorizontal: 10, paddingVertical: 8,
        flexDirection: 'row', justifyContent: 'space-between',
    },
    cardStyle: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.textPrimary, textTransform: 'capitalize' },
    cardDate: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.textMuted },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
    emptyIcon: { fontSize: 64 },
    emptyTitle: { fontFamily: theme.fonts.bold, fontSize: 22, color: theme.colors.textPrimary },
    emptySub: { fontFamily: theme.fonts.regular, fontSize: 15, color: theme.colors.textMuted, textAlign: 'center' },
    ctaBtn: {
        backgroundColor: theme.colors.primary, borderRadius: theme.radius.lg,
        paddingHorizontal: 28, paddingVertical: 16, marginTop: 8,
    },
    ctaText: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#fff' },
});
