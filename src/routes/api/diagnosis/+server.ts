import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Force check for API Key
if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function getDiagnosis(prompt: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { symptoms } = await request.json();

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return json({ error: 'Symptoms are required' }, { status: 400 });
        }

        const prompt = `
        Act as a medical diagnosis assistant. The user is experiencing these symptoms: ${symptoms.join(', ')}.
        
        Analyze these symptoms and provide the most likely diseases, sorted by probability (highest first).
        IMPORTANT: Provide the response STRICTLY in INDONESIAN language.
        
        For each disease, provide:
        1. Name of the disease
        2. Description: A clear, concise explanation of what the disease is (2-3 sentences).
        3. All Symptoms: A comprehensive list of typical symptoms for this disease (at least 5-7 symptoms per disease).
        4. Matched Symptoms: The list of symptoms from the user's input that match this disease.
        5. Medical advice.
        
        Return the response strictly in this JSON format (no markdown code blocks):
        [
            {
                "disease": {
                    "name": "Nama Penyakit",
                    "description": "Penjelasan penyakit...",
                    "allSymptoms": ["gejala1", "gejala2", "gejala3", "gejala4", "gejala5"],
                    "matchedSymptoms": ["gejala_dari_input"],
                    "advice": "Saran medis di sini"
                },
                "matchCount": number of matching symptoms,
                "totalSymptoms": number of items in allSymptoms
            }
        ]
        
        Limit to top 3 possibilities. ensure valid JSON.
        `;

        console.log(`Using AI Provider: GEMINI (Direct)`);
        const text = await getDiagnosis(prompt);

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const diagnosis = JSON.parse(cleanText);

        return json(diagnosis);
    } catch (error) {
        console.error('AI API Error:', error);
        return json({ error: 'Failed to process diagnosis' }, { status: 500 });
    }
};
