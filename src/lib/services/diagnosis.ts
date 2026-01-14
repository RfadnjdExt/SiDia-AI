import { diseases } from '$lib/data/diseases';
import type { Disease, DiagnosisResult } from '$lib/types';

/**
 * Finds the first disease that matches all symptoms exactly (Original Logic style).
 */
export function diagnoseStrict(symptoms: string[]): Disease | null {
    if (symptoms.length === 0) return null;
    return diseases.find(d =>
        d.allSymptoms.length > 0 &&
        d.allSymptoms.every((s: string) => symptoms.includes(s))
    ) || null;
}

/**
 * Analyzes symptoms to find potential diseases with match percentages.
 * Useful for "fancy" UI to show probability or suggestions.
 */
export function analyzeSymptoms(symptoms: string[]): DiagnosisResult[] {
    if (symptoms.length === 0) return [];

    const results: DiagnosisResult[] = diseases.map(disease => {
        const matches = disease.allSymptoms.filter((s: string) => symptoms.includes(s));
        return {
            disease,
            matchCount: matches.length,
            totalSymptoms: disease.allSymptoms.length
        };
    });

    // Filter out 0 matches and sort by match percentage (descending)
    return results
        .filter(r => r.matchCount > 0)
        .sort((a, b) => {
            const scoreA = a.matchCount / a.totalSymptoms;
            const scoreB = b.matchCount / b.totalSymptoms;
            return scoreB - scoreA;
        });
}
