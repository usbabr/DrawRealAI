export const theme = {
  colors: {
    primary: '#4ADE80',
    primaryLight: 'rgba(74, 222, 128, 0.15)',
    primaryBorder: 'rgba(74, 222, 128, 0.3)',
    purple: '#A78BFA',
    purpleLight: 'rgba(167, 139, 250, 0.15)',
    background: '#F6F8F7',
    white: '#FFFFFF',
    cardBg: '#FFFFFF',
    fieldGray: '#F3F4F6',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    shadow: 'rgba(0,0,0,0.06)',
  },
  fonts: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    // System fallbacks (used in StyleSheet as fontFamily arrays aren't supported in RN,
    // but these names are resolved by expo-font loader)
  },
  radius: {
    sm: 16,
    md: 20,
    lg: 24, // 24px everywhere
    xl: 28,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

