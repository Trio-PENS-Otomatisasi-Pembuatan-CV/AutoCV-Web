# AutoCV-Web

Next.js 16 portal untuk **AutoCV — Intelligent Career Dossier & ATS Resume Builder**.
Form input → robot UiPath → dashboard kurasi → PDF/DOCX + email.

> **Project context:** AutoCV terdiri dari dua repo — portal web ini dan robot UiPath
> (`AutoCV-Robot`). Panduan singkat yang mencakup keduanya ada pada bundel submission:
> `Automation-CV/README.md`. Dokumentasi teknis lengkap ada di `Automation-CV/Docs/`.

---

## 1. Tools / Teknologi yang Dipakai

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.4.5 (App Router, Turbopack) |
| UI | React 19.3, TypeScript 5, Tailwind CSS v4, Lucide React |
| Validasi | Zod 4 (`src/application/dto/*`) |
| Email | Nodemailer |
| Package manager | Bun 1.2.18 (`package.json → packageManager`), alternatif npm |
| Runtime | Node.js ≥ 20 (dev & production) |
| Arsitektur | Clean architecture: `core` → `application` → `infrastructure` → `presentation` |
| Integrasi | UiPath Orchestrator Cloud REST (OAuth External App) + webhook masuk |

Struktur layer:

```text
src/
├── app/               # App Router + REST API routes
├── application/       # DTO (Zod) + use-case
├── core/              # entity, interface, config, util
├── infrastructure/    # gateway (mock/live), email, pdf, storage
└── presentation/      # komponen UI + hooks
```

---

## 2. Kebutuhan Aplikasi / Koneksi

| Kebutuhan | Mode Mock | Mode Live |
|---|---|---|
| Node.js ≥ 20 + Bun ≥ 1.2 (atau npm) | Wajib | Wajib |
| Browser modern | Wajib | Wajib |
| UiPath Orchestrator Cloud + External App (Client ID/Secret) | — | Wajib |
| Dua process/release robot sudah di-publish | — | Wajib |
| ngrok / host publik agar robot bisa callback ke web | — | Wajib (dev lokal) |
| SMTP host & kredensial (dikirim robot) | — | Opsional (mode simulasi tersedia) |

Mode dipilih lewat `NEXT_PUBLIC_UIPATH_MODE`:

| Mode | Nilai | Perilaku |
|---|---|---|
| **Mock** (default) | `mock` | `MockUiPathGateway` mensimulasikan seluruh siklus job dengan data contoh. Tanpa Orchestrator. |
| **Live** | `live` | `LiveUiPathGateway` memanggil Orchestrator, polling status, menerima webhook dari robot. |

### 2.1 Environment Variables

Salin `.env.example` → `.env.local`, lalu isi nilainya. Semua nilai sensitif hanya
placeholder — **jangan commit nilai asli**.

```env
# API base (dipakai browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# mock | live
NEXT_PUBLIC_UIPATH_MODE=mock

# Wajib saat NEXT_PUBLIC_UIPATH_MODE=live
UIPATH_ORCHESTRATOR_URL=https://cloud.uipath.com/<org>/<tenant>/orchestrator_
UIPATH_CLIENT_ID=<your-client-id>
UIPATH_CLIENT_SECRET=<your-client-secret>
UIPATH_TENANT_NAME=<tenant-name>
UIPATH_FOLDER_ID=<folder-id>
UIPATH_PROCESS_KEY_JOB1=<process-key-job1>
UIPATH_PROCESS_KEY_JOB2=<process-key-job2>

# URL publik web ini, dipakai robot untuk callback
BACKEND_WEBHOOK_BASE_URL=http://localhost:3000
```

---

## 3. Cara Menjalankan

### 3.1 Mode Mock (paling cepat, tanpa robot)

```bash
cd AutoCV-Web
cp .env.example .env.local        # Windows: Copy-Item .env.example .env.local
bun install
bun dev                           # http://localhost:3000
```

Pastikan `NEXT_PUBLIC_UIPATH_MODE=mock`. Seluruh alur (submit → progress → kurasi →
download PDF) berjalan tanpa Orchestrator.

### 3.2 Mode Live (robot sungguhan)

1. **Publish robot** — buka `AutoCV-Robot` di UiPath Studio → **Publish** ke Orchestrator.
   Catat Process/Release Key Job 1 dan Job 2 → `UIPATH_PROCESS_KEY_JOB1/JOB2`.
2. **Orchestrator Assets** (folder tempat robot berjalan):

   | Asset | Tipe | Keterangan |
   |---|---|---|
   | `Backend_Webhook_Base_URL` | Text | URL publik web ini |
   | `Gemini_API_Key` | Credential | API key Google AI Studio |
   | `SMTP_Host` / `SMTP_Port` / `SMTP_Credential` | Text / Integer / Credential | Server email pengiriman PDF |
   | `Word_Template_Path` | Text | `Data\Templates\ATS_Resume_Template.docx` |

3. **External Application** (Automation Cloud → Admin → External Applications → Add):
   Type **Confidential**, scope `OR.Execution`, `OR.Jobs`, `OR.Monitoring`.
   Salin Client ID/Secret ke `.env.local`.
4. **Expose localhost** agar robot bisa callback:
   ```bash
   ngrok http 3000
   ```
   Salin URL HTTPS ke `BACKEND_WEBHOOK_BASE_URL` (di `.env.local` **dan** Orchestrator Asset).
5. **Jalankan web:**
   ```bash
   NEXT_PUBLIC_UIPATH_MODE=live bun dev
   ```

### 3.3 Build production

```bash
bun run build
bun start
```

Deploy ke Vercel: hubungkan repo → **Root Directory** = `AutoCV-Web` → tambahkan environment
variables → deploy.

> **Catatan:** `JobStore` masih in-memory. Di platform serverless (Vercel) state job bersifat
> sementara; untuk mode live gunakan host Node.js persisten (VPS/Railway/Render/Fly.io) atau
> tambahkan Redis/Upstash sebagai backend `JobStore`.

---

## 4. Contoh Input & Output

### 4.1 Input (form web)

| Field | Wajib | Contoh |
|---|---|---|
| LinkedIn Profile URL | Tidak (punya default) | `https://www.linkedin.com/in/jane-doe` |
| GitHub Profile URL | Ya | `https://github.com/janedoe` |
| Target Job Role | Tidak | `Fullstack Software Engineer` |
| Recipient Email | Tidak | `jane.doe@example.com` |

Padanan request API (`POST /api/cv/generate`):

```json
{
  "linkedinUrl": "https://www.linkedin.com/in/jane-doe",
  "githubUrl": "https://github.com/janedoe",
  "targetRole": "Fullstack Software Engineer",
  "recipientEmail": "jane.doe@example.com",
  "language": "en"
}
```

### 4.2 Response

```json
{ "jobId": "9f6c1f0e-0000-4a00-8000-000000000000" }
```

Lalu `GET /api/cv/jobs/{jobId}` untuk polling:

```json
{
  "jobId": "9f6c1f0e-0000-4a00-8000-000000000000",
  "status": "AWAITING_CURATION",
  "progress": 60
}
```

Status yang mungkin: `PENDING → SCRAPING_LINKEDIN → FETCHING_GITHUB → AI_SYNTHESIZING →
AWAITING_CURATION → GENERATING_PDF → DELIVERING_EMAIL → COMPLETED` (atau `FAILED`).

### 4.3 Output draf dari robot (dipotong, data fiktif)

```json
{
  "profile": {
    "fullName": "Jane Doe",
    "headline": "Fullstack Software Engineer",
    "email": "jane.doe@example.com",
    "summary": "Software engineer focused on scalable web applications...",
    "linkedinUrl": "https://www.linkedin.com/in/jane-doe",
    "githubUrl": "https://github.com/janedoe"
  },
  "projects": [
    {
      "id": 1,
      "name": "inventory-service",
      "repoUrl": "https://github.com/janedoe/inventory-service",
      "techStack": ["TypeScript", "Node.js", "PostgreSQL"],
      "starSummary": "Reduced checkout latency by 35%...",
      "isSelected": true
    }
  ],
  "experiences": [],
  "skills": [],
  "education": []
}
```

### 4.4 Output akhir

| Output | Nilai / Lokasi |
|---|---|
| PDF ATS | Diunduh via `GET /api/cv/jobs/{jobId}/download` |
| DOCX + PDF di robot | `AutoCV-Robot/Data/Outputs/CV_<Nama>_<timestamp>.pdf` / `.docx` |
| Email | Terkirim ke `recipientEmail`; bisa dikirim ulang via `POST /api/cv/jobs/{jobId}/send-email` |
| Status | `COMPLETED` → tombol download muncul di UI |

---

## 5. API Endpoints (Robot ↔ Backend)

| Method | Endpoint | Called By | Purpose |
|--------|----------|-----------|---------|
| `POST` | `/api/cv/generate` | Frontend | Start Job 1, returns `{jobId}` |
| `GET` | `/api/cv/jobs/{jobId}` | Frontend (poll) | Job status + draft data |
| `POST` | `/api/cv/jobs/{jobId}/draft` | **Robot (Job 1)** | Push AI-synthesized draft (snake_case or camelCase accepted) |
| `POST` | `/api/cv/jobs/{jobId}/progress` | **Robot (Job 1)** | Optional stage updates: `{status, progress}` |
| `POST` | `/api/cv/jobs/{jobId}/curate` | Frontend | Autosave curation edits (partial) |
| `POST` | `/api/cv/jobs/{jobId}/approve` | Frontend | Trigger Job 2 with curated data |
| `POST` | `/api/cv/jobs/{jobId}/complete` | **Robot (Job 2)** | Push base64 ATS PDF + emailSent flag |
| `POST` | `/api/cv/jobs/{jobId}/error` | **Robot** | Failure notification |
| `GET` | `/api/cv/jobs/{jobId}/download` | Frontend | Download base64 PDF served by backend |
| `POST` | `/api/cv/jobs/{jobId}/send-email` | Frontend | Re-send the generated PDF to the recipient email |

## 6. Job Lifecycle

```
Frontend: POST /generate → 202 {jobId}
  → Orchestrator starts Job 1 (scrape LinkedIn → GitHub → AI synthesis)
Robot Job 1: POST /draft {draftData} → backend stores draft, status=AWAITING_CURATION
Frontend: polls GET /jobs/{jobId} → shows curation dashboard
User: curates → POST /approve {curatedData}
  → Orchestrator starts Job 2 (Word template → PDF → email)
Robot Job 2: POST /complete {pdfBase64, emailSent:true}
Frontend: polls → COMPLETED → download PDF
```

## 7. Testing Locally

```bash
bun dev                    # mock mode
# Submit form → watch mock robot progress → curate → download mock PDF
```

## 8. License

MIT — Automation Hackathon 2026 (#HumanInTheLead)
