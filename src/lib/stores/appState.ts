import { writable } from 'svelte/store';
import type { DiagnosisResult } from '$lib/types';

export const selectedHistoryItem = writable<DiagnosisResult | null>(null);
export const searchQuery = writable<string>('');
