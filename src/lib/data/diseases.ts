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
    },
    {
        name: "Sindrom Wibu Akut",
        description: "Gangguan psikologis yang ditandai dengan obsesi berlebih pada karakter 2D dan penolakan realita 3D.",
        allSymptoms: ["Suka Anime", "Marathon Nonton", "Waifu 2D", "Jarang Mandi", "Halu"],
        advice: "Sentuh rumput (touch grass) segera dan kurangi asupan anime."
    }
];

export const allSymptoms = Array.from(new Set(diseases.flatMap(d => d.allSymptoms))).sort();

// Group symptoms for Body Map
export const symptomCategories: Record<string, string[]> = {
    head: ["sakit kepala", "pusing", "pilek", "hilang penciuman", "Suka Anime", "Waifu 2D", "Halu"],
    torso: ["batuk", "sesak nafas", "nyeri dada"],
    digestive: ["mual", "sakit perut", "diare"],
    general: ["demam", "demam tinggi", "lemas", "nyeri sendi", "bintik merah", "Marathon Nonton", "Jarang Mandi"]
};
