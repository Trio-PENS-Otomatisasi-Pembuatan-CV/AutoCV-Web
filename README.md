# AutoCV — Intelligent Career Dossier & ATS Resume Builder

> Membangun CV ATS-friendly dari profil LinkedIn dan proyek GitHub, disintesis dengan AI,
> dikurasi manusia, lalu diekspor menjadi PDF/DOCX dan dikirim via email.
>
> **#HumanInTheLead** · Automation Hackathon 2026 (Indosat Ooredoo Hutchison × UiPath × ONE Indonesia)

AutoCV menggabungkan **portal web Next.js** dengan **robot RPA UiPath** sebagai komponen utama. Robot mengekstrak data LinkedIn/GitHub, AI merumuskan pencapaian dengan pola STAR, dan pengguna tetap memegang kendali penuh lewat dashboard kurasi sebelum dokumen final dicetak.

```text
Form Web  →  Robot Job 1 (scrape LinkedIn + GitHub)  →  AI Synthesis
           →  Dashboard Kurasi (manusia menyunting & menyetujui)
           →  Robot Job 2 (render DOCX/PDF + kirim email)  →  Selesai
```

---

## 📌 Latar Belakang & Masalah

Pembuatan CV secara manual menimbulkan beban berbagai masalah:

| Masalah | Dampak |
|---------|--------|
| CV tidak kompatibel ATS | Dihancurkan oleh parser pelamar |
| Format dua kolom | Parsing horizontal gagal |
| Bullet points pasif | Tidak menonjolkan aksi nyata |
| Proses berulang | Waktu & tenaga terbuang |

AutoCV mengatasi masalah ini dengan:

1. **Ekstraksi otomatis** data LinkedIn & GitHub oleh robot UiPath
2. **Sintesis AI** menggunakan format STAR untuk narasi pencapaian
3. **Kurasi manusia** di Dashboard untuk kontrol penuh
4. **Penyusunan dokumen** oleh robot dengan template khusus ATS

> **Catatan:** Web hanyalah antarmuka pengguna. Semua proses otomasi utama berjalan di robot UiPath.

---

## 👥 Human Touchpoint: Titik Kontrol Manusia

Setiap kandidat memiliki titik kontrol yang dapat dikelola:

- **Curation Studio**: Pilih proyek yang relevan, edit bullet points secara manual
- **Persetujuan Akhir**: Setujui hasil kurasi sebelum PDF dicetak
- **Preview Live**: Lihat hasil akhir sebelum pengiriman

Titik ini menegaskan filosofi **#HumanInTheLead** — otomasi menghilangkan kejenuhan, bukan menggantikan kreativitas manusia.

---

## 🤖 Dampak RPA & UiPath Orchestrator

| Metrik | Hasil |
|--------|-------|
| Waktuproses | ~15 detik (scrape) → ~30 detik (AI synthesis) |
| Jumlah langkah | 5 langkah manual ↓ 2 langkah otomatis |
| Komponen utama | UiPath Robot + Orchestrator Cloud |

Robot berperan sebagai komponen inti siklus:

- **Job 1**: Scrape profil LinkedIn & repositori GitHub, kirim hasil ke AI
- **AI Synthesis**: Merumuskan profil karier dengan pola STAR
- **Job 2**: Render dokumen DOCX → PDF, kirim email otomatis

Lihat dokumentasi di [docs/robot-workflow.md](./docs/robot-workflow.md) untuk detail modul robot.

---

## 🚀 Cara Menjalankan

### Mode Mock (Development)

```powershell
cd AutoCV-Web
cp .env.example .env.local
bun install
bun dev
# buka http://localhost:3000
```

Mode mock mensimulasikan seluruh siklus job (scrape → synthesis → kurasi → PDF) tanpa Orchestrator.

### Mode Live (Production)

1. Isi `.env.local`:
   ```env
   NEXT_PUBLIC_UIPATH_MODE=live
   UIPATH_ORCHESTRATOR_URL=https://cloud.uipath.com/<org>/<tenant>/orchestrator_
   UIPATH_CLIENT_ID=<your-client-id>
   UIPATH_CLIENT_SECRET=<your-client-secret>
   UIPATH_FOLDER_ID=<folder-id>
   UIPATH_PROCESS_KEY_JOB1=<process-key-job1>
   UIPATH_PROCESS_KEY_JOB2=<process-key-job2>
   BACKEND_WEBHOOK_BASE_URL=https://<ngrok>.ngrok-free.app
   ```

2. Jalankan `ngrok http 3000` untuk expose webhook

3. Buka browser, isi form, lalu submit

### Robot UiPath

Buka `AutoCV-Robot` di UiPath Studio dan jalankan `Main.xaml` dengan argumen yang sesuai. Lihat [README Robot](../AutoCV-Robot/README.md) untuk detail.

---

## 📁 Struktur Folder

```text
AutoCV-Web/
├── README.md              # Panduan ini
├── docs/                  # Dokumentasi teknis (folder ini)
│   ├── robot-workflow.md  # Spesifikasi modul robot UiPath
│   ├── ats-scoring.md     # Rubrik perhitungan ATS Score
│   └── screenshots/       # Gambar demo dashboard
├── src/
│   ├── app/               # App Router & REST API
│   ├── core/              # Entity, interface, utils (ATS scoring, dll)
│   ├── infrastructure/    # Gateway, email, PDF, storage
│   └── presentation/      # Komponen UI & hooks
└── .env.example
```

---

## 🔗 Tautan Penting

| Repo | Deskripsi |
|------|-----------|
| [AutoCV-Web](./README.md) | Portal Next.js & REST API — README utama ini |
| [AutoCV-Robot](../AutoCV-Robot) | Robot UiPath (Job 1: scrape, Job 2: generate) |
| [docs/robot-workflow.md](./docs/robot-workflow.md) | Spesifikasi modul robot UiPath (7 modul + Main.xaml) |
| [docs/ats-scoring.md](./docs/ats-scoring.md) | Rubrik perhitungan ATS Score 100 poin |

## 🔐 Keamanan & Rahasia

- Semua API key, password, dan kredensial disimpan di file `.env` lokal (`.gitignore`)
- Untuk produksi, gunakan **UiPath Orchestrator Assets** dengan tipe Credential
- Data uji menggunakan data dummy (karena Community Edition)
- Tidak ada data sensitif yang ditulis ke log robot

---

## 📊 Hasil Uji & Metrik

Berdasarkan hasil demo orchestrator (3/3 job Successful):

- **ATS Score**: 95/100 (Tier A Ready)
- **Durasi Job 1**: 12-15 detik
- **Durasi Job 2**: 8-12 detik

---

## 📸 Screenshot

![Dashboard Kurasi](./docs/screenshots/curation-dashboard.png)
![Delivery View - Metrik ATS](./docs/screenshots/delivery-view.png)

---

## 👥 Tim

- **Farid Al Hasan** — Lead Developer (UiPath + Web)
- **Stefany** — Frontend Engineer
- **Tim** — Automation Hackathon 2026 (#HumanInTheLead)

---

## 📄 License

MIT — Automation Hackathon 2026 (#HumanInTheLead)