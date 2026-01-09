import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded for testing script only (user's key)
const API_KEY = "AIzaSyAJ0CTGGS3Ah0X6gjFBdDD8moGE-6riwAI";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
    try {
        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
