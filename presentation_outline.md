# Outline Presentasi: Evolusi SiDia (CLI ke Web AI)

**Tema**: Transformasi Sistem Diagnosis Berbasis OOP Menjadi Platform AI Hybrid.

---

## Slide 1: Judul
**Judul**: SiDia: Evolusi Asisten Kesehatan Cerdas
**Sub-judul**: Dari Java CLI Berbasis OOP Menuju Web AI Hybrid & Future Proprietary LLM
**Nama**: [Nama Anda]
**NIM**: [NIM Anda]

---

## Slide 2: Genesis - SiDia (Versi CLI)
**"Pondasi OOP yang Kokoh"**

*   **Deskripsi**: Awal mula proyek sebagai aplikasi terminal (Console) berbasis Java.
*   **Fokus Utama**: Penerapan ketat prinsip **Object-Oriented Programming (OOP)**.
*   **Fitur**:
    *   Tanya-jawab interaktif sederhana.
    *   Logika probabilitas (if-else/scoring) untuk diagnosis.
    *   Sistem rekam medis otomatis (File I/O).
*   **Prinsip OOP**:
    *   **Encapsulation**: Pembungkusan data pasien dan rekam medis agar aman.
    *   **Polymorphism**: Struktur kelas penyakit yang mewarisi sifat dasar namun memiliki gejala spesifik berbeda.

---

## Slide 3: Transformasi ke Web (SiDia-AI)
**"Membawa Logika ke Dunia Modern"**

*   **Latar Belakang**: Keterbatasan CLI dalam visualisasi dan aksesibilitas.
*   **Teknologi Baru**:
    *   **Frontend**: SvelteKit (UI Reactive & Cepat).
    *   **Desain**: "Noir Medical Dossier" (Futuristik & Profesional).
*   **Nilai Tambah**: Visualisasi data (grafik detak jantung), UX yang lebih ramah, dan akses global via browser.

---

## Slide 4: Menjaga Roh OOP di Web (PENTING)
**"Bahasa Berubah, Prinsip Tetap Sama"**

*   **Poin Kunci**: Peralihan ke TypeScript tidak menghilangkan OOP, justru memperkuatnya dengan **Interface** dan **Design Patterns**.
*   **Bukti Penerapan (Show Code)**:
    1.  **Factory Pattern (`ReportFactory.ts`)**:
        *   Digunakan untuk fitur "Export Laporan" (JSON, PDF, Text).
        *   Menciptakan objek laporan berbeda tanpa mengubah kode utama (Open/Closed Principle).
    2.  **Interface / Abstraction (`IReport`, `Disease`)**:
        *   Mendefinisikan kontrak struktur data diagnosis yang konsisten.
    3.  **Encapsulation (`HistoryService.ts`)**:
        *   Membungkus logika penyimpanan *Local Storage* agar tidak terekspos langsung ke UI.

---

## Slide 5: Integrasi AI (Hybrid Intelligence)
**"Dari Probabilitas Statis ke Neural Analysis"**

*   **Masalah Lama**: Logika *hardcoded* di Java terbatas pada penyakit yang sudah didefinisikan.
*   **Solusi Saat Ini**: Menggunakan **Large Language Model (LLM)**.
    *   **Provider**: ChatGPT (via Python Backend) & Gemini.
    *   **Arsitektur Split**: Frontend (Vercel) + Backend Python (Railway).
*   **Keunggulan**: Mampu menganalisis kombinasi gejala kompleks yang tidak terpikirkan sebelumnya.

---

## Slide 6: Rencana Masa Depan (Future Work)
**"Kemandirian Teknologi (Proprietary LLM)"**

*   **Tujuan**: Mengurangi ketergantungan pada pihak ketiga (ChatGPT/Gemini).
*   **Rencana**:
    *   Melatih (Fine-tuning) model LLM Open Source (misal: Llama 3 atau Mistral) khusus data medis Indonesia.
    *   Hosting model sendiri untuk privasi data pasien yang lebih terjamin.
    *   Integrasi kembali ke arsitektur SiDia sebagai *Core Intelligence* baru.

---

## Slide 7: Kesimpulan
**"Keseimbangan Tradisi dan Inovasi"**

*   SiDia membuktikan bahwa **Prinsip OOP** adalah pondasi abadi yang relevan, baik di aplikasi Console sederhana maupun Web App modern bertenaga AI.
*   Evolusi teknologi (Java -> TS -> Python AI) hanyalah alat untuk mencapai tujuan: **Diagnosis kesehatan yang akurat dan mudah diakses.**

---
