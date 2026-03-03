import React, { useCallback, useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import { ThemeProvider } from './context/ThemeContext';
import { getPurchasesModule } from './lib/purchases';

const Purchases = getPurchasesModule();

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => { });
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Fallback: if fonts don't load within 3s, render anyway
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 3000);

    // Initialize RevenueCat
    if (Purchases) {
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: 'sk_cwUMrJAtpAPWRmcPnnHycjreuQDkN' });
      } else if (Platform.OS === 'android') {
        // Android SDK config would go here if needed.
      }
    }

    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded || fontError || fontTimeout;

  const onLayoutRootView = useCallback(async () => {
    if (ready && Platform.OS !== 'web') {
      await SplashScreen.hideAsync().catch(() => { });
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={{ flex: 1, height: '100%' }} onLayout={onLayoutRootView}>
          <Navigation />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
