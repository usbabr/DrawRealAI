import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ResultScreen from '../screens/ResultScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import CreditsScreen from '../screens/CreditsScreen';
import GalleryDetailScreen from '../screens/GalleryDetailScreen';
import { useAppTheme } from '../context/ThemeContext';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Upload: undefined;
    Loading: { originalUri: string; style: string; hint?: string };
    Result: { originalUri: string; generatedUri: string; style: string };
    Credits: undefined;
    GalleryDetail: { record: any };
};

export type TabParamList = {
    Home: undefined;
    Create: undefined;
    Gallery: undefined;
    Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

import { MaterialIcons } from '@expo/vector-icons';

const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
    Home: { active: 'home', inactive: 'home' },
    Create: { active: 'auto-fix-high', inactive: 'auto-fix-high' }, // fallback if magic_button isn't in MaterialIcons
    Gallery: { active: 'grid-view', inactive: 'grid-view' },
    Profile: { active: 'person', inactive: 'person' },
};

function MainTabs() {
    const { colors } = useAppTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarIcon: ({ focused }) => {
                    const icons = TAB_ICONS[route.name];
                    const iconName = focused ? icons.active : icons.inactive;

                    return (
                        <View style={tabStyles.iconBase}>
                            <MaterialIcons
                                name={iconName}
                                size={28}
                                color={focused ? colors.primary : colors.textMuted}
                            />
                        </View>
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontFamily: theme.fonts.bold,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: Platform.OS === 'ios' ? 0 : 8,
                },
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    minHeight: Platform.OS === 'ios' ? 88 : 70,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarItemStyle: {},
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Create" component={UploadScreen} />
            <Tab.Screen name="Gallery" component={GalleryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main' | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('drawreal_guest').then((val) => {
            setInitialRoute(val ? 'Main' : 'Auth');
        });
    }, []);

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="Upload" component={UploadScreen} />
                <Stack.Screen name="Loading" component={LoadingScreen} options={{ gestureEnabled: false }} />
                <Stack.Screen name="Result" component={ResultScreen} />
                <Stack.Screen name="Credits" component={CreditsScreen} />
                <Stack.Screen name="GalleryDetail" component={GalleryDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const tabStyles = StyleSheet.create({
    iconBase: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 32,
    },
});
