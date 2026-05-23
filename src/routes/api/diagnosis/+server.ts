import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ─── Startup Check ────────────────────────────────────────────────────────────
if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 10;
const WINDOW_MS      = 60 * 1000;

function isRateLimited(ip: string): boolean {
    const now   = Date.now();
    const entry = rateLimitStore.get(ip);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        rateLimitStore.set(ip, { count: 1, windowStart: now });
        return false;
    }
    if (entry.count >= RATE_LIMIT_MAX) return true;
    entry.count++;
    return false;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
        if (now - entry.windowStart > WINDOW_MS) rateLimitStore.delete(ip);
    }
}, 5 * 60 * 1000);

// ─── Input Validation ─────────────────────────────────────────────────────────
const MAX_SYMPTOMS          = 20;
const MAX_SYMPTOM_LENGTH    = 100;
const ALLOWED_SYMPTOM_REGEX = /^[\p{L}\p{N}\s\-,.]+$/u;

interface ValidationError { error: string; }

function validateSymptoms(symptoms: unknown): ValidationError | null {
    if (!symptoms || !Array.isArray(symptoms))
        return { error: 'Format gejala tidak valid. Harus berupa array.' };
    if (symptoms.length === 0)
        return { error: 'Minimal satu gejala harus dipilih.' };
    if (symptoms.length > MAX_SYMPTOMS)
        return { error: `Terlalu banyak gejala. Maksimal ${MAX_SYMPTOMS} gejala.` };
    for (const s of symptoms) {
        if (typeof s !== 'string')
            return { error: 'Setiap gejala harus berupa teks.' };
        const trimmed = s.trim();
        if (trimmed.length === 0)
            return { error: 'Gejala tidak boleh berupa teks kosong.' };
        if (trimmed.length > MAX_SYMPTOM_LENGTH)
            return { error: `Gejala terlalu panjang. Maksimal ${MAX_SYMPTOM_LENGTH} karakter.` };
        if (!ALLOWED_SYMPTOM_REGEX.test(trimmed))
            return { error: `Gejala mengandung karakter tidak valid: "${trimmed}"` };
    }
    return null;
}

// ─── Gemini Call ──────────────────────────────────────────────────────────────
async function getDiagnosis(symptoms: string[]): Promise<string> {
    const model             = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const sanitizedSymptoms = symptoms.map((s) => s.trim()).join(', ');

    const prompt = `
        Act as a medical diagnosis assistant. The user is experiencing these symptoms: ${sanitizedSymptoms}.
        Analyze these symptoms and provide the most likely diseases, sorted by probability (highest first).
        IMPORTANT: Provide the response STRICTLY in INDONESIAN language.
        For each disease, provide:
        1. Name of the disease
        2. Description (2-3 sentences).
        3. All Symptoms: at least 5-7 typical symptoms.
        4. Matched Symptoms: symptoms from the user's input that match.
        5. Medical advice.
        Return ONLY valid JSON, no markdown:
        [{"disease":{"name":"...","description":"...","allSymptoms":["..."],"matchedSymptoms":["..."],"advice":"..."},"matchCount":0,"totalSymptoms":0}]
        Limit to top 3 possibilities.
    `;

    const result   = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// ─── Request Handler ──────────────────────────────────────────────────────────
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    if (isRateLimited(getClientAddress())) {
        return json(
            { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Request body tidak valid.' }, { status: 400 });
    }

    const { symptoms } = body as { symptoms?: unknown };
    const validationError = validateSymptoms(symptoms);
    if (validationError) return json(validationError, { status: 400 });

    try {
        const text      = await getDiagnosis(symptoms as string[]);
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return json(JSON.parse(cleanText));
    } catch (error) {
        console.error('[diagnosis] AI error:', error);
        return json({ error: 'Gagal memproses diagnosis. Silakan coba lagi.' }, { status: 500 });
    }
};