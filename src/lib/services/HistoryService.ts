import type { DiagnosisResult } from '$lib/types';

export interface HistoryLog {
    id: string;
    timestamp: number;
    patientName: string;
    result: DiagnosisResult;
}

export class HistoryService {
    private static readonly STORAGE_KEY = 'sidia_diagnosis_history';

    static save(result: DiagnosisResult, patientName: string): void {
        const history = this.getAll();
        const newLog: HistoryLog = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            patientName,
            result
        };
        history.unshift(newLog); // Add to top
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Limit to 50
    }

    static getAll(): HistoryLog[] {
        if (typeof localStorage === 'undefined') return [];
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static search(query: string): HistoryLog[] {
        const history = this.getAll();
        const lowerQuery = query.toLowerCase();
        return history.filter(log =>
            log.patientName.toLowerCase().includes(lowerQuery) ||
            log.result.disease?.name.toLowerCase().includes(lowerQuery) ||
            new Date(log.timestamp).toLocaleDateString().includes(lowerQuery)
        );
    }

    static clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
