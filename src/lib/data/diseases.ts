import type { Disease } from '$lib/types';

export const diseases: Disease[] = [
    {
        name: "Flu",
        description: "Infeksi virus yang menyerang sistem pernapasan (hidung, tenggorokan, dan paru-paru).",
        allSymptoms: ["demam", "batuk", "pilek", "sakit kepala", "lemas"],
        advice: "Istirahat cukup dan minum vitamin C"
    },
    {
        name: "Tipes",
        description: "Penyakit akut yang disebabkan oleh bakteri Salmonella typhi.",
        allSymptoms: ["demam tinggi", "mual", "lemas", "sakit perut", "diare"],
        advice: "Makan makanan lunak dan hindari makanan pedas"
    },
    {
        name: "Covid-19",
        description: "Penyakit menular yang disebabkan oleh virus SARS-CoV-2.",
        allSymptoms: ["demam", "batuk", "sesak nafas", "hilang penciuman", "lemas"],
        advice: "Isolasi mandiri dan hubungi layanan kesehatan"
    },
    {
        name: "Demam Berdarah",
        description: "Penyakit virus yang dibawa oleh nyamuk, terjadi di daerah tropis dan subtropis.",
        allSymptoms: ["demam tinggi", "bintik merah", "nyeri sendi", "mual", "sakit kepala"],
        advice: "Banyak minum air putih dan periksa trombosit"
    }
];

export const allSymptoms = Array.from(new Set(diseases.flatMap(d => d.allSymptoms))).sort();
