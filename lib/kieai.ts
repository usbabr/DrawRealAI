import { DrawingStyle } from './fal';

const API_KEY = process.env.EXPO_PUBLIC_KIEAI_KEY!;
const GENERATE_URL = 'https://api.kie.ai/api/v1/flux/kontext/generate';
const TASK_URL = 'https://api.kie.ai/api/v1/flux/kontext/record/info/';

const STYLE_PROMPTS: Record<DrawingStyle, string> = {
    realistic: `Transform this children's drawing into a photorealistic image. Professional photography, natural lighting, 8K resolution, sharp focus, hyperrealistic. Keep the original subject.`,
    storybook: `Transform this children's drawing into a Pixar/Disney storybook illustration. Soft warm colors, magical, wholesome. Keep the original subject.`,
    anime: `Transform this children's drawing into a Studio Ghibli anime illustration. Vibrant colors, clean line art, soft shading, expressive. Keep the original subject.`,
    watercolor: `Transform this children's drawing into a beautiful watercolor painting. Soft color washes, loose brushstrokes, warm palette, artistic. Keep the original subject.`,
};

function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
}

// Poll task until complete
async function pollTask(taskId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        await delay(3000);

        const res = await fetch(`${TASK_URL}${taskId}`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.log(`Poll attempt ${i + 1}: HTTP ${res.status}`);
            continue;
        }

        const data = await res.json();
        console.log('Poll response:', JSON.stringify(data));

        const status: string =
            data?.data?.status ?? data?.status ?? data?.data?.taskStatus ?? '';
        const imageUrl: string =
            data?.data?.imageUrl ??
            data?.data?.outputImage ??
            data?.data?.output ??
            data?.imageUrl ??
            data?.url ?? '';

        const s = status.toLowerCase();
        if ((s === 'success' || s === 'completed' || s === 'finished' || s === 'done') && imageUrl) {
            return imageUrl;
        }
        if (s === 'failed' || s === 'error') {
            throw new Error('Kie.ai generation failed: ' + JSON.stringify(data?.data));
        }
        console.log(`Still processing (attempt ${i + 1}), status: ${status}`);
    }
    throw new Error('Kie.ai timed out after 90 seconds');
}

// Main: send base64 image directly in generate body
export async function generateFromDrawingKieai(
    dataUrl: string,
    style: DrawingStyle,
    hint?: string
): Promise<string> {
    const prompt = hint?.trim()
        ? `${hint.trim()}. ${STYLE_PROMPTS[style]}`
        : STYLE_PROMPTS[style];

    // Extract raw base64 string (without the data:image/...;base64, prefix)
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

    const body = {
        prompt,
        inputImage: base64,        // try raw base64
        width: 1024,
        height: 1024,
        outputFormat: 'webp',
    };

    console.log('Kie.ai generate request to:', GENERATE_URL);
    console.log('Prompt:', prompt.slice(0, 80));

    const res = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const rawText = await res.text();
    console.log('Kie.ai generate response:', res.status, rawText.slice(0, 300));

    if (!res.ok) {
        throw new Error(`Kie.ai generate failed (${res.status}): ${rawText}`);
    }

    const data = JSON.parse(rawText);

    // Immediate image URL?
    const directUrl: string =
        data?.data?.imageUrl ??
        data?.data?.outputImage ??
        data?.imageUrl ?? '';
    if (directUrl) return directUrl;

    // Async task?
    const taskId: string =
        data?.data?.taskId ??
        data?.data?.id ??
        data?.taskId ??
        data?.id ?? '';
    if (taskId) {
        console.log('Got taskId:', taskId, '— polling...');
        return pollTask(taskId);
    }

    throw new Error('Kie.ai: unexpected response — ' + rawText.slice(0, 200));
}
