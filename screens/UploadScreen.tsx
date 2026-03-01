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

const { width } = Dimensions.get('window');

const STYLES = [
    { key: 'storybook', label: 'storybook', emoji: '📚', desc: 'Disney/Pixar magic', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Zqe_8XMcKvZX8hkH_XX1ldx-By4-gbozmlMYsjZBs8baJEMZgd7-aklwU_hW6tcAAE3cOLOftxkC3sl_evT_HeSYC1jS_Q2l4P0dynX9sSRRraYRFsiStfdyzv1-rTr9o3eCQ6eiCu-U6J8Uo5SMf8kXQqAhHTcahaNry_rsjZUjUqNVRHYVV_2PAiPAb0mxoAQtxB5TjdFlk_esO2cy5F1hrctYJpUfxOGwokKTCGtJCitc0IUrjuw8FspIMTVudBzMU8t-bjLS' },
    { key: 'anime', label: 'anime', emoji: '⛩️', desc: 'Studio Ghibli vibes', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtFvzwukVmw2loauRD-OFnbh8L4Td4wFQ622ngoqcrT9PoIVJQdJpRlhaS5V0ncysymTtACq-DHFZ956Y87Z1A1S3LWOdt3k5cKaRQtbKeEadeD6nDvhbonJmlAwjQwk21259urL5lYuXKxijoIJe-lSxuB3bUysMMkBTR7WiXeEN8CJI-yIiVYJUTB4xztADvsyq9m64ZJBdivzQAeE8NUTEIzx0Znmpn5-0j9by9awzLSck12OFZiM-DH3-qlAG1NvJHOFRNqfTb' },
    { key: 'realistic', label: 'realistic', emoji: '📷', desc: 'True-to-life photo', uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbWnMXDo-qan6bp6dC2VonvN-_4SJsXvKFh-GU6KO9aez7GFjhpKkqEQDkPapQ5Ng7qCqClhBvR76OHTWYRaeQOPJsATCUmCjs9I4tRLrxnAMPawzzcPAekA-9vbwNHvPj0VqEa-lpawdocxdfqvWKeZEfo-kHr7PF96Bx2cK3v6urTV-C3bsTbHaBqvidldJ14n3tj0M3Jc4DOmPWjfFt-qoQ6eYGzVvPAoUbI_Zy2C9xJMnIFQLN7Z0PTqHaxIg806gMSZtguvFC' },
    { key: 'watercolor', label: 'watercolor', emoji: '🎨', desc: 'Soft painterly art', uri: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=500&q=80' },
    { key: 'comic', label: 'comic', emoji: '💥', desc: 'Bold comic style', uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&q=80' },
    { key: 'oilpaint', label: 'oilpaint', emoji: '🖼️', desc: 'Classic fine art', uri: 'https://images.unsplash.com/photo-1578301978693-85fa9c03fa75?w=500&q=80' },
];

export default function UploadScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hint, setHint] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('realistic');

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
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnWrapper}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Drawing</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Upload Buttons */}
                    <View style={styles.uploadRow}>
                        <TouchableOpacity style={[styles.uploadBtn, styles.cameraBtn]} onPress={pickFromCamera} activeOpacity={0.85}>
                            <MaterialIcons name="photo-camera" size={36} color="#fff" />
                            <Text style={styles.uploadLabel}>Scan Drawing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.uploadBtn, styles.galleryBtn]} onPress={pickFromGallery} activeOpacity={0.85}>
                            <MaterialIcons name="image" size={36} color="#fff" />
                            <Text style={styles.uploadLabel}>Upload Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.preview} resizeMode="cover" />
                    ) : (
                        <View style={styles.previewEmpty}>
                            <MaterialIcons name="add-photo-alternate" size={48} color={theme.colors.border} />
                            <Text style={styles.previewEmptyText}>Your drawing will appear here</Text>
                        </View>
                    )}

                    {/* Hint Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>What did they draw?</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., A happy little elephant"
                            placeholderTextColor={theme.colors.textMuted}
                            value={hint}
                            onChangeText={setHint}
                        />
                    </View>

                    {/* Style Selector */}
                    <View style={styles.styleSection}>
                        <Text style={styles.inputLabel}>Choose a Style</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleRow}>
                            {STYLES.map((s) => (
                                <TouchableOpacity
                                    key={s.key}
                                    style={[styles.styleCard, selectedStyle === s.key && styles.styleCardActive]}
                                    onPress={() => setSelectedStyle(s.key)}
                                    activeOpacity={0.8}
                                >
                                    <Image source={{ uri: s.uri }} style={styles.styleCardImage} resizeMode="cover" />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.styleCardGradient}
                                    />
                                    <Text style={[styles.styleCardLabel, selectedStyle === s.key && styles.styleCardLabelActive]}>
                                        {s.label}
                                    </Text>
                                    {selectedStyle === s.key && (
                                        <View style={styles.styleCardCheck}>
                                            <MaterialIcons name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                </ScrollView>

                {/* Bottom CTA */}
                <View style={styles.bottomArea}>
                    <TouchableOpacity onPress={handleGenerate} activeOpacity={0.88} style={styles.generateWrapper}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.purple]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.generateBtn}
                        >
                            <Text style={styles.generateText}>Bring to Life ✨</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.white },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtnWrapper: {
        width: 40, height: 40,
        borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: -8,
    },
    headerTitle: {
        fontFamily: theme.fonts.bold,
        fontSize: 19,
        color: theme.colors.textPrimary,
    },
    scroll: { flex: 1 },
    scrollContent: { padding: theme.spacing.lg },

    // Upload buttons
    uploadRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
    uploadBtn: {
        flex: 1, height: 150,
        borderRadius: theme.radius.lg,
        alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    cameraBtn: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    galleryBtn: {
        backgroundColor: theme.colors.purple,
        shadowColor: theme.colors.purple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    uploadIcon: { fontSize: 34 },
    uploadLabel: {
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        color: theme.colors.white,
    },

    // Preview
    preview: {
        width: '100%', height: 200,
        borderRadius: theme.radius.lg,
        marginBottom: 20,
    },
    previewEmpty: {
        width: '100%', height: 180,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        backgroundColor: theme.colors.fieldGray,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, gap: 8,
    },
    previewIcon: { fontSize: 40, opacity: 0.3 },
    previewEmptyText: {
        fontFamily: theme.fonts.medium,
        fontSize: 13,
        color: theme.colors.textMuted,
    },

    // Input
    inputSection: { marginBottom: 22 },
    inputLabel: {
        fontFamily: theme.fonts.bold,
        fontSize: 15,
        color: theme.colors.textPrimary,
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: theme.colors.fieldGray,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontFamily: theme.fonts.regular,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },

    styleSection: { marginBottom: 12 },
    styleRow: { paddingHorizontal: 20, gap: 12 },
    styleCard: {
        width: 140,
        height: 140,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: theme.colors.cardBg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    styleCardActive: {
        borderColor: theme.colors.primary,
    },
    styleCardImage: {
        width: '100%',
        height: '100%',
    },
    styleCardGradient: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '50%',
    },
    styleCardLabel: {
        position: 'absolute',
        bottom: 12, left: 12,
        fontFamily: theme.fonts.bold,
        fontSize: 15,
        color: '#fff',
    },
    styleCardLabelActive: {
        color: theme.colors.primary,
    },
    styleCardCheck: {
        position: 'absolute',
        top: 8, right: 8,
        width: 24, height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },

    // Bottom
    bottomArea: {
        padding: 20,
        paddingBottom: 28,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    generateWrapper: { borderRadius: theme.radius.lg, overflow: 'hidden' },
    generateBtn: {
        paddingVertical: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    generateText: {
        fontFamily: theme.fonts.bold,
        fontSize: 18,
        color: theme.colors.white,
    },
});
