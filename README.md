# AutoCV — Intelligent Career Dossier & ATS Resume Builder

> Membangun CV ATS-friendly dari profil LinkedIn dan proyek GitHub, disintesis dengan AI,
> dikurasi manusia, lalu diekspor menjadi PDF/DOCX dan dikirim via email.
>
> **#HumanInTheLead** · Automation Hackathon 2026 (Indosat Ooredoo Hutchison × UiPath × ONE Indonesia)

AutoCV menggabungkan **portal web Next.js** dengan **robot RPA UiPath**. Robot mengekstrak data
LinkedIn/GitHub, AI merumuskan pencapaian dengan pola STAR, dan pengguna tetap memegang kendali
penuh lewat dashboard kurasi sebelum dokumen final dicetak.

```text
Form Web  →  Robot Job 1 (scrape LinkedIn + GitHub)  →  AI Synthesis
          →  Dashboard Kurasi (manusia menyunting & menyetujui)
          →  Robot Job 2 (render DOCX/PDF + kirim email)  →  Selesai
```

---

## 1. Tools / Teknologi yang Dipakai

| Layer | Teknologi |
|---|---|
| **Web / Frontend** | Next.js 16.4.5 (App Router), React 19.3, TypeScript 5, Tailwind CSS v4, Lucide React |
| **Validasi & DTO** | Zod 4 (clean architecture: `core` → `application` → `infrastructure` → `presentation`) |
| **Email (web)** | Nodemailer |
| **Package manager** | Bun 1.2.18 (atau npm) |
| **Robot / RPA** | UiPath Studio 26.10, Windows framework, .NET 10, ekspresi Visual Basic |
| **Robot activities** | UiPath.System / Mail / Excel / Testing / UIAutomation / WebAPI Activities |
| **Script helper robot** | Node.js (`LinkedInDomExtractor.js`, `FetchGitHubRepos.js`, `GenerateResumeDocument.js`) + PowerShell runners |
| **AI / LLM** | Gemini `gemini-3.5-flash-lite` (primary) → OpenRouter `openai/gpt-4o-mini` (fallback otomatis) |
| **Dokumen** | Template `ATS_Resume_Template.docx` → generator DOCX/PDF |
| **Orkestrasi** | UiPath Orchestrator Cloud + REST webhook |

---

## 2. Kebutuhan Aplikasi / Koneksi

### 2.1 Prasyarat

| Kebutuhan | Wajib | Keterangan |
|---|---|---|
| Windows 10/11 64-bit | Ya | Diperlukan UiPath Studio + otomasi browser |
| Node.js ≥ 20 & Bun ≥ 1.2 (atau npm) | Ya (web) | Menjalankan portal Next.js |
| UiPath Studio 26.10 + `uip` CLI | Live mode | `uip` butuh hak admin saat instalasi |
| Ekstensi UiPath Web Automation | Live mode | Chrome atau Edge |
| Sesi LinkedIn yang sudah login | Live mode | Robot memakai sesi browser yang ada |
| Akun UiPath Orchestrator + External App | Live mode | Scope `OR.Execution`, `OR.Jobs`, `OR.Monitoring` |
| ngrok / host publik | Live mode lokal | Agar robot bisa memanggil webhook ke web |
| SMTP host & kredensial | Live mode (email) | Bisa diganti mode simulasi |
| Gemini API key + OpenRouter API key | Ya (AI) | Hanya di file lokal, **jangan di-commit** |

### 2.2 Environment Variables

Salin `.env.example` → `.env.local` (web) dan `.env` (robot), lalu isi nilainya.
Contoh di bawah hanya **placeholder**, bukan nilai asli.

| Variabel | Contoh (dummy) | Dipakai oleh |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Web |
| `NEXT_PUBLIC_UIPATH_MODE` | `mock` atau `live` | Web |
| `UIPATH_ORCHESTRATOR_URL` | `https://cloud.uipath.com/<org>/<tenant>/orchestrator_` | Web (live) |
| `UIPATH_CLIENT_ID` | `<your-client-id>` | Web (live) |
| `UIPATH_CLIENT_SECRET` | `<your-client-secret>` | Web (live) |
| `UIPATH_TENANT_NAME` | `<tenant-name>` | Web (live) |
| `UIPATH_FOLDER_ID` | `<folder-id>` | Web (live) |
| `UIPATH_PROCESS_KEY_JOB1` | `<process-key-job1>` | Web (live) |
| `UIPATH_PROCESS_KEY_JOB2` | `<process-key-job2>` | Web (live) |
| `BACKEND_WEBHOOK_BASE_URL` | `https://<ngrok-subdomain>.ngrok-free.app` | Web + Robot |
| `AI_PROVIDER` | `Gemini` | Robot |
| `AI_FALLBACK_PROVIDER` | `OpenAI` | Robot |
| `GEMINI_API_KEY` | `<gemini-api-key>` | Robot |
| `GEMINI_CHAT_MODEL` | `gemini-3.5-flash-lite` | Robot |
| `OPENAI_API_KEY` | `<openrouter-api-key>` | Robot (fallback) |
| `OPENAI_BASE_URL` | `https://openrouter.ai/api/v1` | Robot (fallback) |
| `OPENAI_CHAT_MODEL` | `openai/gpt-4o-mini` | Robot (fallback) |

> Konfigurasi AI robot juga dibaca dari `AutoCV-Robot/Data/Config/ai_settings.json`.
> Gunakan `ai_settings.example.json` sebagai template.

### 2.3 Endpoint Web ↔ Robot

| Method | Endpoint | Pemanggil | Fungsi |
|---|---|---|---|
| `POST` | `/api/cv/generate` | Frontend | Mulai Job 1, mengembalikan `{ jobId }` |
| `GET` | `/api/cv/jobs/{jobId}` | Frontend (poll) | Status job + data draf |
| `POST` | `/api/cv/jobs/{jobId}/draft` | Robot (Job 1) | Kirim draf hasil AI |
| `POST` | `/api/cv/jobs/{jobId}/progress` | Robot (Job 1) | Update tahap/progress |
| `POST` | `/api/cv/jobs/{jobId}/curate` | Frontend | Autosave hasil kurasi |
| `POST` | `/api/cv/jobs/{jobId}/approve` | Frontend | Memicu Job 2 |
| `POST` | `/api/cv/jobs/{jobId}/complete` | Robot (Job 2) | Kirim PDF base64 + status email |
| `POST` | `/api/cv/jobs/{jobId}/error` | Robot | Notifikasi kegagalan |
| `GET` | `/api/cv/jobs/{jobId}/download` | Frontend | Unduh PDF |
| `POST` | `/api/cv/jobs/{jobId}/send-email` | Frontend | Kirim ulang PDF ke email kandidat |

---

## 3. Cara Menjalankan

### 3.1 Web — Mode Mock (tanpa robot, paling cepat)

```powershell
cd AutoCV-Web
Copy-Item .env.example .env.local
# pastikan NEXT_PUBLIC_UIPATH_MODE=mock
bun install
bun dev
# buka http://localhost:3000
```

Mode mock mensimulasikan seluruh siklus job (scrape → synthesis → kurasi → PDF) tanpa
Orchestrator, sehingga cocok untuk pengembangan frontend.

### 3.2 Web — Mode Live (robot sungguhan)

1. Isi `.env.local`:
   ```env
   NEXT_PUBLIC_UIPATH_MODE=live
   UIPATH_ORCHESTRATOR_URL=https://cloud.uipath.com/<org>/<tenant>/orchestrator_
   UIPATH_CLIENT_ID=<your-client-id>
   UIPATH_CLIENT_SECRET=<your-client-secret>
   UIPATH_FOLDER_ID=<folder-id>
   UIPATH_PROCESS_KEY_JOB1=<process-key-job1>
   UIPATH_PROCESS_KEY_JOB2=<process-key-job2>
   BACKEND_WEBHOOK_BASE_URL=https://<ngrok-subdomain>.ngrok-free.app
   ```
2. Ekspos localhost agar robot bisa memanggil webhook:
   ```powershell
   ngrok http 3000
   ```
3. Jalankan `bun dev`, buka form, lalu submit.

### 3.3 Robot — UiPath Studio

1. Buka folder `AutoCV-Robot` di UiPath Studio.
2. Isi `Data/Config/ai_settings.json` (dari `ai_settings.example.json`) atau `.env`.
3. Jalankan `Main.xaml` dengan argumen input (lihat §4).

### 3.4 Robot — `uip` CLI

```powershell
# dari folder AutoCV-Robot
uip login                                  # sekali saja, membuka browser
uip rpa validate --file-path "Main.xaml" --project-dir "."
uip rpa build "."
uip rpa pack "." "../_AutoCV-Pack-Out" --package-version 1.0.0
uip rpa publish "../_AutoCV-Pack-Out/AutoCV.Deployment.1.0.0.nupkg"
```

### 3.5 Simulasi penuh (tanpa kredensial eksternal)

Set `NEXT_PUBLIC_UIPATH_MODE=mock` di web dan jalankan robot dengan
`in_UseMockFallback=True`. Robot akan memakai fixture di `Data/Mocks/`.

---

## 4. Contoh Input & Output

### 4.1 Input form web

| Field | Contoh |
|---|---|
| LinkedIn Profile URL | `https://www.linkedin.com/in/jane-doe` |
| GitHub Profile URL | `https://github.com/janedoe` |
| Target Job Role (opsional) | `Fullstack Software Engineer` |
| Recipient Email | `jane.doe@example.com` |

Padanan argumen robot (`Main.xaml`):

```json
{
  "in_JobId": "job-123",
  "in_LinkedInUrl": "https://www.linkedin.com/in/jane-doe",
  "in_GitHubUrl": "https://github.com/janedoe",
  "in_TargetJobRole": "Fullstack Software Engineer",
  "in_RecipientEmail": "jane.doe@example.com",
  "in_UseMockFallback": false,
  "in_RequireManualApproval": true,
  "in_WebhookBaseUrl": "http://localhost:3000"
}
```

### 4.2 Output antara — `out_DraftResumePayload` (dipotong, data fiktif)

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
  "experiences": [],
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
  "skills": [],
  "education": []
}
```

### 4.3 Output akhir

| Output | Lokasi / Nilai |
|---|---|
| PDF ATS | `AutoCV-Robot/Data/Outputs/CV_<Nama>_<timestamp>.pdf` |
| DOCX | `AutoCV-Robot/Data/Outputs/CV_<Nama>_<timestamp>.docx` |
| Email | Terkirim ke `in_RecipientEmail`, atau log `Mode: SIMULATION` |
| Status job | `PENDING → SCRAPING → SYNTHESIZING → CURATING → COMPLETED` |

---

## 5. Struktur Project

```text
Automation-CV/
├── README.md                  # Panduan singkat ini
├── AutoCV-Web/                # Portal Next.js (frontend + API routes)
│   ├── src/
│   │   ├── app/               # App Router + REST API
│   │   ├── application/       # DTO & use-case
│   │   ├── core/              # entity, interface, config
│   │   ├── infrastructure/    # gateway, email, pdf, storage
│   │   └── presentation/      # komponen UI & hooks
│   └── .env.example
├── AutoCV-Robot/              # Proyek robot UiPath
│   ├── Main.xaml              # Entry point
│   ├── Modules/               # 00–06 workflow
│   ├── Data/
│   │   ├── Config/            # ai_settings.json (lokal, tidak di-commit)
│   │   ├── Mocks/             # fixture fallback
│   │   ├── Outputs/           # hasil PDF/DOCX
│   │   ├── Scripts/           # helper JS/PowerShell
│   │   └── Templates/         # template DOCX
│   ├── .env.example
│   └── Data/Config/ai_settings.example.json
└── Docs/                       # Dokumentasi teknis lengkap
```

Folder `_AutoCV-Pack-Out/`, `AutoCV-Robot-Packages/`, `node_modules/`, `.next/`, dan `.local/`
adalah artefak build — tidak perlu di-commit.

---

## 6. Security & Secrets

Repository ini **tidak menyimpan** password atau API key.

- File `.env`, `.env.local`, `Data/Config/.env`, `Data/Config/ai_settings.json`, dan
  `Data/Config/gemini_api_key.txt` sudah masuk `.gitignore`.
- Gunakan hanya file `.example` sebagai template, lalu isi nilai asli secara lokal.
- Untuk produksi, simpan kredensial di **UiPath Orchestrator Assets** (Credential) atau
  environment variables platform hosting.
- Jika sebuah key pernah tidak sengaja ter-commit, **rotasi key** tersebut.

---

## 7. Dokumentasi Lengkap

| Topik | Lokasi |
|---|---|
| Indeks dokumentasi | `Docs/README.md` |
| Setup pengembangan | `Docs/Getting-Started/Development-Setup.md` |
| Arsitektur sistem | `Docs/System-Design/System-Architecture.md` |
| Referensi API | `Docs/Backend-API/API-Reference.md` |
| Panduan robot | `Docs/AutoCV-Robot/Workflow-Guide.md` |
| Konfigurasi lingkungan | `Docs/Deployment/Environment-Configuration.md` |
| Deployment | `Docs/Deployment/Deployment-Guide.md` |

---

## 8. License

MIT — Automation Hackathon 2026 (#HumanInTheLead).
