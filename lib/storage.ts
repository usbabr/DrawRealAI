import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'drawreal_generations';

export interface GenerationRecord {
    id: string;
    originalUri: string;
    generatedUri: string;
    style: string;
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
