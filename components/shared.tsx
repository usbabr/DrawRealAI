import React, { useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, SafeAreaView, StatusBar, Dimensions,
    PanResponder, Animated, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList>;

// === Before/After Slider Component ===
function BeforeAfterSlider({ beforeUri, afterUri, height = 320 }: {
    beforeUri: string; afterUri: string; height?: number;
}) {
    const sliderX = useRef(new Animated.Value(width * 0.5)).current;
    const sliderPos = useRef(width * 0.5);

    const pan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, { moveX }) => {
                const clamped = Math.max(24, Math.min(width - 24, moveX));
                sliderPos.current = clamped;
                sliderX.setValue(clamped);
            },
        })
    ).current;

    return (
        <View style={[bStyles.container, { height }]}>
            {/* After (full width, underneath) */}
            <Image source={{ uri: afterUri }} style={bStyles.fullImg} resizeMode="cover" />

            {/* Before (clipped to slider position) */}
            <Animated.View style={[bStyles.clipView, { width: sliderX }]}>
                <Image source={{ uri: beforeUri }} style={[bStyles.fullImg, { width }]} resizeMode="cover" />
            </Animated.View>

            {/* Labels */}
            <View style={[bStyles.label, { left: 12 }]}>
                <Text style={bStyles.labelText}>BEFORE</Text>
            </View>
            <View style={[bStyles.label, { right: 12, backgroundColor: theme.colors.primary }]}>
                <Text style={[bStyles.labelText, { color: '#fff' }]}>AFTER</Text>
            </View>

            {/* Drag handle */}
            <Animated.View style={[bStyles.line, { left: sliderX }]} {...pan.panHandlers}>
                <View style={bStyles.handle}>
                    <Text style={{ fontSize: 14, color: theme.colors.textPrimary }}>⇔</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const bStyles = StyleSheet.create({
    container: { width: '100%', borderRadius: theme.radius.xl, overflow: 'hidden', position: 'relative' },
    fullImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
    clipView: { position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden' },
    label: {
        position: 'absolute', top: 12,
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
    },
    labelText: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#fff', letterSpacing: 1 },
    line: {
        position: 'absolute', top: 0, bottom: 0, width: 3,
        backgroundColor: '#fff', marginLeft: -1.5,
        alignItems: 'center', justifyContent: 'center',
    },
    handle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
        shadowRadius: 4, elevation: 4,
        borderWidth: 2, borderColor: theme.colors.primary,
    },
});

// Export for reuse
export { BeforeAfterSlider };

// Style config
export const STYLES: Array<{
    key: string; label: string; emoji: string; desc: string;
}> = [
        { key: 'realistic', label: 'Realistic', emoji: '📷', desc: 'True-to-life photo' },
        { key: 'storybook', label: 'Storybook', emoji: '📚', desc: 'Pixar/Disney magic' },
        { key: 'anime', label: 'Anime', emoji: '⛩️', desc: 'Studio Ghibli vibes' },
        { key: 'watercolor', label: 'Watercolor', emoji: '🎨', desc: 'Soft painterly art' },
        { key: 'comic', label: 'Comic', emoji: '💥', desc: 'Bold comic style' },
        { key: 'oil', label: 'Oil Paint', emoji: '🖼️', desc: 'Classic oil painting' },
    ];
