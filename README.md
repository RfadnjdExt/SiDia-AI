# SiDia-AI

SiDia-AI adalah asisten diagnosis medis cerdas yang ditenagai oleh Google Gemini AI. Aplikasi ini menganalisis gejala yang dilaporkan pengguna untuk mengidentifikasi kemungkinan penyakit, memberikan wawasan mendalam, dan saran medis dalam Bahasa Indonesia.

## Fitur

- **Analisis Gejala**: Masukkan daftar gejala untuk mendapatkan analisis instan.
- **Probabilitas Penyakit**: Mengurutkan potensi penyakit berdasarkan kemungkinannya.
- **Wawasan Mendalam**: Pencocokan gejala yang unik dan saran medis yang disesuaikan untuk setiap potensi diagnosis.
- **Terlokalisasi**: Semua respons dan saran diberikan dalam Bahasa Indonesia.

## Teknologi yang Digunakan

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Model AI**: [Google Gemini](https://ai.google.dev/) (gemini-2.5-flash)
- **Runtime**: [Bun](https://bun.sh/)

## Cara Memulai

### Prasyarat

- [Bun](https://bun.sh/) sudah terinstall
- Kunci API Google Gemini (Gemini API Key)

### Instalasi

1. Salin file proyek ke komputer lokal Anda.

2. Install dependensi:
   ```bash
   bun install
   ```

3. Konfigurasi Variabel Lingkungan:
   Buat file `.env` di direktori root dan tambahkan kunci API Gemini Anda:
   ```env
   GEMINI_API_KEY=kunci_api_anda_disini
   ```

4. Jalankan server pengembangan:
   ```bash
   bun --bun run dev
   ```

## Penggunaan API

### `POST /api/diagnosis`

Menerima payload JSON dengan daftar gejala.

**Request:**
```json
{
  "symptoms": ["demam", "batuk", "pusing"]
}
```

**Response:**
Mengembalikan array JSON berisi potensi penyakit dengan jumlah kecocokan gejala dan saran medis.
