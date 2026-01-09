import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { symptoms } = await request.json();

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return json({ error: 'Symptoms are required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
        Act as a medical diagnosis assistant. The user is experiencing these symptoms: ${symptoms.join(', ')}.
        
        Analyze these symptoms and provide the most likely diseases, sorted by probability.
        IMPORTANT: Provide the response STRICTLY in INDONESIAN language.
        
        For each disease, provide:
        1. Name of the disease (in Indonesian if applicable, or common medical term)
        2. A list of matching symptoms from the input (in Indonesian)
        3. Simple medical advice (in Indonesian)
        
        Return the response strictly in this JSON format (no markdown code blocks):
        [
            {
                "disease": {
                    "name": "Nama Penyakit",
                    "symptoms": ["gejala1", "gejala2"],
                    "advice": "Saran medis di sini"
                },
                "matchCount": number of matching symptoms,
                "totalSymptoms": number of typical symptoms for this disease
            }
        ]
        
        Limit to top 3 possibilities.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const diagnosis = JSON.parse(cleanText);

        return json(diagnosis);
    } catch (error) {
        console.error('Gemini API Error:', error);
        return json({ error: 'Failed to process diagnosis' }, { status: 500 });
    }
};
