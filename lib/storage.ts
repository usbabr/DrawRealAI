import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'drawreal_generations';
const CREDITS_KEY = 'drawreal_credits';

export interface GenerationRecord {
    id: string;
    originalUri: string;
    generatedUri: string;
    style: string;
    hint?: string;
    timestamp: number;
}

export async function saveGeneration(record: Omit<GenerationRecord, 'id' | 'timestamp'>) {
    try {
        const existing = await loadGenerations();
        const newRecord: GenerationRecord = {
            ...record,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };
        const updated = [newRecord, ...existing].slice(0, 50); // keep last 50
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newRecord;
    } catch (e) {
        console.warn('[storage] save failed:', e);
    }
}

export async function loadGenerations(): Promise<GenerationRecord[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function clearGenerations() {
    await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getCredits(): Promise<number> {
    try {
        const raw = await AsyncStorage.getItem(CREDITS_KEY);
        if (raw === null) {
            // Give 3 free credits initially
            await AsyncStorage.setItem(CREDITS_KEY, '3');
            return 3;
        }
        return parseInt(raw, 10);
    } catch {
        return 3;
    }
}

export async function useCredit(): Promise<boolean> {
    try {
        let current = await getCredits();
        if (current > 0) {
            current -= 1;
            await AsyncStorage.setItem(CREDITS_KEY, current.toString());
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
