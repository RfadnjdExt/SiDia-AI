export interface Disease {
    name: string;
    description: string;
    allSymptoms: string[]; // List of all typical symptoms for this disease
    matchedSymptoms?: string[]; // List of symptoms that matched the user's input
    advice: string;
}

export interface DiagnosisResult {
    disease: Disease | null;
    matchCount: number;
    totalSymptoms: number;
}
