# ATS Scoring & Delivery Metrics — AutoCV

Spesifikasi teknis perhitungan skor ATS dan metrik delivery untuk dokumen yang dihasilkan.

---

## 🎯 Latar Belakang

ATS (Applicant Tracking System) menggunakan *Resume Parsing Engine* untuk membaca teks, mengekstrak entitas, dan mencocokkan kata kunci. CV tradisional sering gagal karena:

- Kontak tidak lengkap
- Pengalaman kerja tidak struktural
- Bullet points pasif
- Format dua kolom

AutoCV menghitung skor ATS dengan **heuristic scoring engine** untuk mengevaluasi kesiapan dokumen.

---

## 📊 Rubrik Skor 100 Poin

| No | Dimensi | Kriteria | Poin |
|----|---------|----------|------|
| 1 | Kelengkapan Profil | Nama, email, summary, location | 20 |
| 2 | Tautan Verifikasi | LinkedIn URL, GitHub URL | 10 |
| 3 | Kualitas Pengalaman | ≥1 pengalaman, bullet points ≥2 | 25 |
| 4 | Proyek Pilihan | ≥1 proyek terpilih, narasi STAR | 15 |
| 5 | Skills | ≥2 kategori, ≥3 item tiap kategori | 15 |
| 6 | Education | ≥1 data institusi, gelar/jurusan | 10 |
| 7 | Action Verbs | Bullet points diawali dengan verba kuat | 5 |
| **TOTAL** | | | **100** |

---

## 🧮 Threshold Kategori

| Skor | Tier | Status |
|------|------|--------|
| ≥ 90 | Tier A Ready | Sangat siap untuk Fortune 500 |
| 70-89 | Tier B | Cukup kompetitif, perlu optimasi |
| < 70 | Tier C | Perlu kurasi tambahan |

---

## 💻 Implementasi

Fungsi di `src/core/utils/atsScoreCalculator.ts`:

```typescript
export function calculateAtsScore(resume: ResumePayload): AtsScoreResult {
  // Evaluasi 7 dimensi
  // Return: { score, tier, label }
}
```

Hitung real-time di `DeliveryView.tsx` dengan `useMemo`.

---

## 📐 Format Dokumen

### Single Column (Standard ATS)

- Alur linear: Header → Summary → Projects → Experience → Skills → Education
- Margin 0.5-0.75 inci (Letter/A4)
- Tag heading semantik H1, H2

### Mengapa Tidak Dua Kolom?

Parser ATS lama membaca horizontal, menyebabkan *gibberish* pada layout dua kolom.

---

## 🎯 Methodology: STAR Format

**STAR** = Situation, Task, Action, Result

Contoh bullet point:

```
Led development of event-driven inventory service (Situation)
Reduced checkout latency by 35% via Go & RabbitMQ (Task + Action + Result)
```

---

## 📦 Delivery: UiPath RPA

Robot UiPath bertanggung jawab atas:

| Komponen | Implementasi |
|----------|-------------|
| Ekspor DOCX | Inject data ke template `ATS_Resume_Template.docx` |
| Konversi PDF | Microsoft Word engine (presisi tipografi) |
| Email | SMTP integration, otomatis ke `in_RecipientEmail` |

---

## 📈 Hasil Demo

```
ATS Score: 95/100 (Tier A Ready)
Job 1 Duration: 12-15 detik
Job 2 Duration: 8-12 detik
Orchestrator Status: 3/3 jobs Successful
```