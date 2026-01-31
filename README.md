# SiDia-AI (Sistem Diagnosis AI)

> **"Asisten kesehatan AI & dokumentasi yang ramah."**

SiDia-AI adalah platform diagnosis medis futuristik dengan antarmuka **"Noir Medical Dossier"**. Aplikasi ini tidak hanya sekadar chatbot, melainkan sistem analisis gejala yang mensimulasikan pemindaian saraf jaringan dalam (Neural Network Scan) untuk memberikan hasil diagnosis yang presisi, estetis, dan mendalam.

![SiDia Banner](static/banner.png)

## Fitur Utama

- **Neural Cluster Analysis**: Diagnosis penyakit berdasarkan pola gejala menggunakan **Google Gemini API**.
- **Noir / Sci-Fi UI**: Antarmuka gelap, glassmorphism, dan animasi "heartbeat" futuristik.
- **Riwayat Pasien (Patient History)**: Penyimpanan lokal untuk melihat kembali log diagnosis sebelumnya.
- **Neural Interrogation**: Sistem cerdas yang menanyakan "gejala lanjutan" untuk memperkuat akurasi diagnosis.

## Teknologi

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) + [TailwindCSS v4](https://tailwindcss.com/)
- **Engine**: Google Gemini API
- **Runtime Dev**: [Bun](https://bun.sh/)

## Cara Instalasi & Menjalankan (Local)

Pastikan Anda sudah memiliki **API Key** dari [Google AI Studio](https://aistudio.google.com/).

```bash
# Clone Repository
git clone https://github.com/RfadnjdExt/SiDia-AI.git
cd SiDia-AI

# Install dependensi (Wajib Bun)
bun install

# Setup Environment
cp .env.example .env
# Edit file .env dan masukkan GEMINI_API_KEY Anda

# Jalankan Dev Server
bun dev --host
```

Buka browser di `http://localhost:5173`.

## Deployment

Aplikasi ini dapat dideploy dengan mudah ke Vercel:

1.  Deploy repositori ini ke **Vercel**.
2.  Set Environment Variable:
    *   `GEMINI_API_KEY`: API Key Anda.

---
*Dibuat dengan dedikasi untuk Tugas Akhir / Proyek Pribadi.*
