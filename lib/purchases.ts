import Purchases from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export const getPurchasesModule = () => {
    if (Platform.OS === 'web') return null;

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (isExpoGo) return null;

    return Purchases;
};
