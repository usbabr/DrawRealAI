import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme } from '../constants/theme';

export const lightColors = { ...baseTheme.colors };

export const darkColors = {
    ...baseTheme.colors,
    background: '#111827',
    white: '#111827', // Used as base surface in some places
    cardBg: '#1F2937',
    fieldGray: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#374151',
    shadow: 'rgba(0,0,0,0.3)',
};

type ThemeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    colors: typeof lightColors;
};

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    toggleDarkMode: () => { },
    colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('drawreal_theme').then((t) => {
            if (t === 'dark') setIsDarkMode(true);
            setIsLoaded(true);
        });
    }, []);

    const toggleDarkMode = async () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        await AsyncStorage.setItem('drawreal_theme', nextMode ? 'dark' : 'light');
    };

    if (!isLoaded) return null; // Prevent flicker during load

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleDarkMode,
            colors: isDarkMode ? darkColors : lightColors
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
