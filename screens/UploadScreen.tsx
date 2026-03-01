import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const STYLES = [
    { key: 'storybook', label: 'storybook', emoji: '📚', desc: 'Disney/Pixar magic', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Zqe_8XMcKvZX8hkH_XX1ldx-By4-gbozmlMYsjZBs8baJEMZgd7-aklwU_hW6tcAAE3cOLOftxkC3sl_evT_HeSYC1jS_Q2l4P0dynX9sSRRraYRFsiStfdyzv1-rTr9o3eCQ6eiCu-U6J8Uo5SMf8kXQqAhHTcahaNry_rsjZUjUqNVRHYVV_2PAiPAb0mxoAQtxB5TjdFlk_esO2cy5F1hrctYJpUfxOGwokKTCGtJCitc0IUrjuw8FspIMTVudBzMU8t-bjLS' },
    { key: 'anime', label: 'anime', emoji: '⛩️', desc: 'Studio Ghibli vibes', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFvzwukVmw2loauRD-OFnbh8L4Td4wFQ622ngoqcrT9PoIVJQdJpRlhaS5V0ncysymTtACq-DHFZ956Y87Z1A1S3LWOdt3k5cKaRQtbKeEadeD6nDvhbonJmlAwjQwk21259urL5lYuXKxijoIJe-lSxuB3bUysMMkBTR7WiXeEN8CJI-yIiVYJUTB4xztADvsyq9m64ZJBdivzQAeE8NUTEIzx0Znmpn5-0j9by9awzLSck12OFZiM-DH3-qlAG1NvJHOFRNqfTb' },
    { key: 'realistic', label: 'realistic', emoji: '📷', desc: 'True-to-life photo', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbWnMXDo-qan6bp6dC2VonvN-_4SJsXvKFh-GU6KO9aez7GFjhpKkqEQDkPapQ5Ng7qCqClhBvR76OHTWYRaeQOPJsATCUmCjs9I4tRLrxnAMPawzzcPAekA-9vbwNHvPj0VqEa-lpawdocxdfqvWKeZEfo-kHr7PF96Bx2cK3v6urTV-C3bsTbHaBqvidldJ14n3tj0M3Jc4DOmPWjfFt-qoQ6eYGzVvPAoUbI_Zy2C9xJMnIFQLN7Z0PTqHaxIg806gMSZtguvFC' },
    { key: 'watercolor', label: 'watercolor', emoji: '🎨', desc: 'Soft painterly art', uri: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=500&q=80' },
    { key: 'comic', label: 'comic', emoji: '💥', desc: 'Bold comic style', uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&q=80' },
    { key: 'oilpaint', label: 'oilpaint', emoji: '🖼️', desc: 'Classic fine art', uri: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?q=80&w=500' },
];

export default function UploadScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hint, setHint] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('realistic');
    const { colors } = useAppTheme();
    const s = React.useMemo(() => getStyles(colors), [colors]);

    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera access is required to scan drawings.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });
        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });
        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    const handleGenerate = () => {
        if (!selectedImage) {
            Alert.alert('No drawing selected', 'Please scan or upload a drawing first.');
            return;
        }
        navigation.navigate('Loading', {
            originalUri: selectedImage,
            style: selectedStyle,
            hint: hint.trim() || undefined,
        });
    };


    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >

                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <MaterialIcons name="arrow-back-ios" size={20} color={colors.textPrimary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>New Drawing</Text>
                    <View style={s.headerRight} />
                </View>

                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

                    {/* Upload Buttons */}
                    <View style={s.uploadRow}>
                        <TouchableOpacity style={[s.uploadBtn, s.cameraBtn]} onPress={pickFromCamera} activeOpacity={0.85}>
                            <MaterialIcons name="photo-camera" size={36} color="#fff" />
                            <Text style={s.uploadLabel}>Scan Drawing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[s.uploadBtn, s.galleryBtn]} onPress={pickFromGallery} activeOpacity={0.85}>
                            <MaterialIcons name="image" size={36} color="#fff" />
                            <Text style={s.uploadLabel}>Upload Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={s.preview} resizeMode="cover" />
                    ) : (
                        <View style={s.previewEmpty}>
                            <MaterialIcons name="add-photo-alternate" size={48} color={colors.border} />
                            <Text style={s.previewEmptyText}>Your drawing will appear here</Text>
                        </View>
                    )}

                    {/* Hint Input */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>What did they draw?</Text>
                        <View style={s.inputWrapper}>
                            <MaterialIcons name="lightbulb-outline" size={24} color={colors.textMuted} />
                            <TextInput
                                style={s.input}
                                placeholder="e.g., A happy little elephant"
                                placeholderTextColor={colors.textMuted}
                                value={hint}
                                onChangeText={setHint}
                            />
                        </View>
                    </View>

                    {/* Style Selection */}
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Choose a Style</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stylesRow}>
                            {STYLES.map((st) => (
                                <TouchableOpacity
                                    key={st.key}
                                    style={[
                                        s.styleCard,
                                        selectedStyle === st.key && s.styleCardActive
                                    ]}
                                    onPress={() => setSelectedStyle(st.key)}
                                    activeOpacity={0.8}
                                >
                                    <Image source={{ uri: st.uri }} style={s.styleCardImage} />
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.styleCardOverlay} />
                                    {selectedStyle === st.key && (
                                        <View style={[s.checkBadge, { backgroundColor: colors.primary }]}>
                                            <MaterialIcons name="check" size={14} color={colors.background} />
                                        </View>
                                    )}
                                    <View style={s.styleCardContent}>
                                        <Text style={s.styleCardName}>{st.label}</Text>
                                        <Text style={s.styleCardEmoji}>{st.emoji}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={s.footer}>
                    <TouchableOpacity
                        onPress={handleGenerate}
                        activeOpacity={0.88}
                        style={[s.generateWrapper, !selectedImage && s.generateDisabled]}
                        disabled={!selectedImage}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.purple]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.generateBtn}
                        >
                            <Text style={s.generateText}>Bring to Life ✨</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    safe: {
        flex: 1, backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: colors.background,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.textPrimary },
    headerRight: { width: 40 },
    scroll: { flex: 1 },
    // Upload buttons
    uploadRow: { flexDirection: 'row', gap: 14, marginBottom: 20, paddingHorizontal: 20, marginTop: 20 },
    uploadBtn: {
        flex: 1, height: 130,
        borderRadius: theme.radius.lg,
        alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    cameraBtn: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
    },
    galleryBtn: {
        backgroundColor: colors.purple,
        shadowColor: colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
    },
    uploadLabel: { fontFamily: theme.fonts.bold, fontSize: 13, color: '#fff' },

    // Preview
    preview: {
        width: '100%', height: 200,
        borderRadius: theme.radius.lg,
        marginBottom: 20,
    },
    previewEmpty: {
        width: 'auto', height: 180, marginHorizontal: 20,
        borderRadius: theme.radius.lg, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
        backgroundColor: colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, gap: 8,
    },
    previewEmptyText: { fontFamily: theme.fonts.medium, fontSize: 13, color: colors.textMuted },

    section: { marginTop: 32, paddingHorizontal: 20 },
    sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.textPrimary, marginBottom: 16 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.fieldGray,
        borderRadius: theme.radius.lg, paddingHorizontal: 16, paddingVertical: 14,
    },
    input: {
        flex: 1, marginLeft: 12,
        fontFamily: theme.fonts.regular, fontSize: 15, color: colors.textPrimary,
    },

    stylesRow: {
        flexDirection: 'row', gap: 12, paddingBottom: 4,
    },
    styleCard: {
        width: 130, height: 160, borderRadius: theme.radius.lg,
        overflow: 'hidden', borderWidth: 2, borderColor: 'transparent',
    },
    styleCardActive: { borderColor: colors.primary },
    styleCardImage: { width: '100%', height: '100%', position: 'absolute' },
    styleCardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
    styleCardContent: { flex: 1, padding: 12, justifyContent: 'flex-end' },
    styleCardName: { fontFamily: theme.fonts.bold, fontSize: 14, color: '#fff', textTransform: 'capitalize' },
    styleCardEmoji: { fontSize: 20, marginTop: 2 },
    checkBadge: {
        position: 'absolute', top: 8, right: 8,
        width: 24, height: 24, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
    },

    footer: {
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
        backgroundColor: colors.cardBg,
        borderTopWidth: 1, borderColor: colors.border,
    },
    generateWrapper: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    generateDisabled: {
        opacity: 0.5,
        shadowOpacity: 0, elevation: 0,
    },
    generateBtn: {
        paddingVertical: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    generateText: {
        fontFamily: theme.fonts.bold,
        fontSize: 18,
        color: '#fff',
    },
});
