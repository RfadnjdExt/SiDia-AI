# SiDia-AI (Sistem Diagnosis AI)

> **"Asisten kesehatan AI & dokumentasi yang ramah."**

SiDia-AI adalah platform diagnosis medis futuristik dengan antarmuka **"Noir Medical Dossier"**. Aplikasi ini tidak hanya sekadar chatbot, melainkan sistem analisis gejala yang mensimulasikan pemindaian saraf jaringan dalam (Neural Network Scan) untuk memberikan hasil diagnosis yang presisi, estetis, dan mendalam.

![SiDia Banner](static/banner.png)

## 🚀 Fitur Utama

- **🧠 Neural Cluster Analysis**: Diagnosis penyakit berdasarkan pola gejala menggunakan **ChatGPT Backend** (Python).
- **🕵️‍♂️ Noir / Sci-Fi UI**: Antarmuka gelap, glassmorphism, dan animasi "heartbeat" futuristik.
- **📜 Riwayat Pasien (Patient History)**: Penyimpanan lokal untuk melihat kembali log diagnosis sebelumnya.
- **🔍 Neural Interrogation**: Sistem cerdas yang menanyakan "gejala lanjutan" untuk memperkuat akurasi diagnosis.
- **⚡ Hybrid Architecture**:
  - **Frontend**: SvelteKit (Tersedia di Vercel).
  - **Backend**: Python FastAPI + `curl_cffi` (Tersedia di Railway) untuk bypass proteksi bot.

## 🛠️ Teknologi

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) + [TailwindCSS v4](https://tailwindcss.com/)
- **Backend**: Python 3.9 + FastAPI
- **Engine**: ChatGPT (Reverse Engineered via `curl_cffi`)
- **Runtime Dev**: [Bun](https://bun.sh/) (Frontend) & Python (Backend)

## 📦 Cara Instalasi & Menjalankan (Local)

Karena aplikasi ini menggunakan arsitektur Hybrid, Anda perlu menjalankan **dua server**:

### 1. Persiapan Backend (Python)
Server ini bertugas menangani komunikasi dengan ChatGPT agar tidak terdeteksi sebagai bot.

```bash
# Masuk ke folder backend
cd src/lib/submodules/chatgpt

# Install dependensi
pip install -r requirements.txt

# Jalankan Server (Port 6969)
python api_server.py
```
_Biarkan terminal ini terbuka._

### 2. Persiapan Frontend (SvelteKit)
Buka terminal baru untuk menjalankan antarmuka pengguna.

```bash
# Kembali ke root project
cd ../../../..

# Install dependensi JS
bun install

# Buat file .env dari contoh (jika perlu, meski config utama ada di src/lib/config.ts)
# Jalankan Dev Server
bun dev
```

Buka browser di `http://localhost:5173`. Pastikan backend Python sudah jalan di port `6969`.

## ☁️ Deployment (Architecture Split)

Untuk stabilitas maksimal (menghindari IP Ban dari ChatGPT), kami menggunakan **Split Deployment**:

1.  **Backend (Python) -> Railway** 🚂
    *   Deploy repositori ini ke Railway.
    *   Railway otomatis mendeteksi `Dockerfile` dan menjalankan server Python.
    *   **Hasil**: Dapat URL API (contoh: `https://sidia-backend.up.railway.app`).

2.  **Frontend (SvelteKit) -> Vercel** ▲
    *   Deploy repositori ini ke Vercel.
    *   Set Environment Variable di Vercel:
        *   `GPT_SERVER_URL`: `https://sidia-backend.up.railway.app/conversation`
        *   `AI_PROVIDER`: `gpt`

## 📝 Catatan Penting
- **IP Flagging**: Jika backend Python terkena "IP Flagged" atau "403 Forbidden", restart server Python (Backend) untuk mendapatkan sesi/token baru. Logika `auto-refresh` token sudah tertanam di `api_server.py`.

---
*Dibuat dengan ❤️ dan ☕ untuk Tugas Akhir / Proyek Pribadi.*
