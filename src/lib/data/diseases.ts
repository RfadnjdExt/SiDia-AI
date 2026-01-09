import type { Disease } from '$lib/types';

export const diseases: Disease[] = [
    {
        name: "Flu",
        symptoms: ["demam", "batuk", "pilek"],
        advice: "Istirahat cukup dan minum vitamin C"
    },
    {
        name: "Tipes",
        symptoms: ["demam tinggi", "mual", "lemas"],
        advice: "Makan makanan lunak dan hindari makanan pedas"
    },
    {
        name: "Covid-19",
        symptoms: ["demam", "batuk", "sesak nafas"],
        advice: "Isolasi mandiri dan hubungi layanan kesehatan"
    },
    {
        name: "Demam Berdarah",
        symptoms: ["demam tinggi", "bintik merah", "nyeri sendi"],
        advice: "Banyak minum air putih dan periksa trombosit"
    }
];

export const allSymptoms = Array.from(new Set(diseases.flatMap(d => d.symptoms))).sort();
