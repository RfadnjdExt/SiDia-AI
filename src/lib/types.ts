export interface Disease {
    name: string;
    symptoms: string[];
    advice: string;
}

export interface DiagnosisResult {
    disease: Disease | null;
    matchCount: number;
    totalSymptoms: number;
}
