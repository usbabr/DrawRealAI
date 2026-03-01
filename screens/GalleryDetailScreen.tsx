import React from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    SafeAreaView, StatusBar, ScrollView, Dimensions, Share, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function GalleryDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { record } = route.params;
    const { colors, isDarkMode } = useAppTheme();
    const s = React.useMemo(() => getStyles(colors), [colors]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this amazing drawing brought to life with DrawReal AI!`,
                url: record.generatedUri
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow photo access to save images.');
                return;
            }

            // Since uri could be remote, we need to download it first
            // @ts-ignore
            const fileUri = `${FileSystem.documentDirectory}drawreal_save_${Date.now()}.png`;
            // @ts-ignore
            const downloadRes = await FileSystem.downloadAsync(record.generatedUri, fileUri);

            await MediaLibrary.createAssetAsync(downloadRes.uri);
            Alert.alert('Success', 'Image saved to your gallery!');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not save the image.');
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={colors.textPrimary} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Creation Profile</Text>
                <View style={s.headerRight}>
                    <TouchableOpacity onPress={handleShare} style={s.iconBtn}>
                        <MaterialIcons name="share" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDownload} style={s.iconBtn}>
                        <MaterialIcons name="file-download" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: record.generatedUri }} style={s.mainImage} resizeMode="cover" />

                <View style={s.infoBlock}>
                    <View style={s.metaRow}>
                        <View style={s.badge}>
                            <Text style={s.badgeText}>{record.style}</Text>
                        </View>
                        <Text style={s.dateTxt}>
                            {new Date(record.timestamp || Date.now()).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </View>

                    {record.hint && (
                        <View style={s.hintBox}>
                            <MaterialIcons name="format-quote" size={20} color={colors.primary} style={{ marginTop: -2 }} />
                            <Text style={s.hintText}>{record.hint}</Text>
                        </View>
                    )}

                    <Text style={s.sectionTitle}>Original Drawing</Text>
                    <Image source={{ uri: record.originalUri }} style={s.originalThumb} resizeMode="contain" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.textPrimary },
    headerRight: { flexDirection: 'row', gap: 6 },
    iconBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flex: 1 },
    mainImage: {
        width: width,
        height: width, // 1:1 aspect ratio
    },
    infoBlock: { padding: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    badge: {
        backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    },
    badgeText: { fontFamily: theme.fonts.bold, fontSize: 13, color: '#fff', textTransform: 'capitalize' },
    dateTxt: { fontFamily: theme.fonts.medium, fontSize: 13, color: colors.textMuted },
    hintBox: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: colors.fieldGray, padding: 16, borderRadius: 12,
        marginBottom: 24, gap: 10,
    },
    hintText: { fontFamily: theme.fonts.medium, fontSize: 15, color: colors.textPrimary, flex: 1, fontStyle: 'italic' },
    sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 16, color: colors.textPrimary, marginBottom: 12 },
    originalThumb: {
        width: '100%', height: 200, borderRadius: 12,
        backgroundColor: colors.fieldGray,
        borderWidth: 1, borderColor: colors.border,
    }
});
