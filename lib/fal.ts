import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type DrawingStyle = 'realistic' | 'storybook' | 'anime' | 'watercolor';

const FAL_KEY = process.env.EXPO_PUBLIC_FAL_KEY ?? '';
const MODEL = 'fal-ai/flux/dev/image-to-image';

const BASE_PROMPTS: Record<DrawingStyle, string> = {
    realistic: `photorealistic, highly detailed, 8K resolution, cinematic photography,
    natural lighting, professional photo, sharp focus, hyperrealistic textures`,
    storybook: `children's storybook illustration, Pixar animation style,
    soft warm colors, magical atmosphere, wholesome, Disney inspired, gentle and whimsical`,
    anime: `high quality anime art, Studio Ghibli style, vibrant colors,
    clean line art, soft shading, professional anime illustration, expressive`,
    watercolor: `beautiful watercolor painting, soft color washes, loose brushstrokes,
    warm palette, professional watercolor art, impressionistic`,
};

function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
}

// Submit job to Fal queue
async function submitJob(imageDataUrl: string, prompt: string): Promise<string> {
    const url = `https://queue.fal.run/${MODEL}`;
    console.log('[Fal] Submitting to', url);
    console.log('[Fal] Key present:', !!FAL_KEY, 'length:', FAL_KEY.length);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Key ${FAL_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image_url: imageDataUrl,
            prompt,
            strength: 0.80,
            num_inference_steps: 28,
            num_images: 1,
        }),
    });

    const text = await res.text();
    console.log('[Fal] Submit response:', res.status, text.slice(0, 200));

    if (!res.ok) throw new Error(`Fal submit failed ${res.status}: ${text}`);

    const data = JSON.parse(text);
    const requestId: string = data?.request_id ?? data?.requestId;
    if (!requestId) throw new Error('No request_id from Fal: ' + text);

    return requestId;
}

// Poll for result
async function pollResult(requestId: string, maxAttempts = 40): Promise<string> {
    const statusUrl = `https://queue.fal.run/${MODEL}/requests/${requestId}/status`;
    const resultUrl = `https://queue.fal.run/${MODEL}/requests/${requestId}`;
    const headers = { Authorization: `Key ${FAL_KEY}` };

    for (let i = 0; i < maxAttempts; i++) {
        await delay(3000);
        console.log(`[Fal] Polling attempt ${i + 1}...`);

        const res = await fetch(statusUrl, { headers });
        const text = await res.text();
        console.log('[Fal] Status:', res.status, text.slice(0, 150));

        if (!res.ok) continue;

        const data = JSON.parse(text);
        const status: string = data?.status ?? '';

        if (status === 'COMPLETED') {
            const resultRes = await fetch(resultUrl, { headers });
            const resultText = await resultRes.text();
            console.log('[Fal] Result:', resultText.slice(0, 200));
            const result = JSON.parse(resultText);
            const imageUrl: string =
                result?.images?.[0]?.url ??
                result?.data?.images?.[0]?.url ??
                result?.image?.url;
            if (!imageUrl) throw new Error('No image URL in result: ' + resultText);
            return imageUrl;
        }

        if (status === 'FAILED') {
            throw new Error('Fal job failed: ' + text);
        }
    }

    throw new Error('Fal timed out after 2 minutes');
}

// Convert image URI to base64 data URL (platform-aware)
export async function uriToDataUrl(uri: string): Promise<string> {
    console.log('[uriToDataUrl] Platform:', Platform.OS, 'uri:', uri.slice(0, 40));

    if (uri.startsWith('data:')) return uri;

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } else {
        // Native: expo-file-system/legacy
        const path = uri.startsWith('file://') ? uri : `file://${uri}`;
        const base64 = await FileSystem.readAsStringAsync(path, { encoding: 'base64' as any });
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${base64}`;
    }
}

// Main export
export async function generateFromDrawing(
    imageDataUrl: string,
    style: DrawingStyle,
    hint?: string
): Promise<string> {
    const subject = hint?.trim() || "a subject from a child's drawing";
    const prompt = `${subject}, ${BASE_PROMPTS[style]}`;

    console.log('[Fal] generateFromDrawing called, style:', style);
    const requestId = await submitJob(imageDataUrl, prompt);
    console.log('[Fal] Got requestId:', requestId);
    return pollResult(requestId);
}
