# AutoCV-Web

Next.js 16 frontend for **AutoCV** — Intelligent Career Dossier & ATS Resume Builder.

## Quick Start

```bash
bun install
bun dev          # http://localhost:3000 (mock mode)
```

## Modes

| Mode | `NEXT_PUBLIC_UIPATH_MODE` | Description |
|------|---------------------------|-------------|
| **Mock** (default) | `mock` | In-memory `MockUiPathGateway` simulates the full robot lifecycle with realistic delays and sample resume data. No UiPath Orchestrator needed. |
| **Live** | `live` | Real `LiveUiPathGateway` calls UiPath Orchestrator Cloud to start robot jobs, polls progress, and receives webhook callbacks. |

## Environment Variables

Create `.env.local` from `.env.example`:

```env
# API base (used by browser client)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Switch: mock | live
NEXT_PUBLIC_UIPATH_MODE=mock

# Required when NEXT_PUBLIC_UIPATH_MODE=live
UIPATH_ORCHESTRATOR_URL=https://cloud.uipath.com/{orgName}/{tenantName}/orchestrator_
UIPATH_CLIENT_ID=your-client-id
UIPATH_CLIENT_SECRET=your-client-secret
UIPATH_TENANT_NAME=DefaultTenant
UIPATH_FOLDER_ID=12345
UIPATH_PROCESS_KEY_JOB1=AutoCV_Job1_ScrapeAndSynthesize
UIPATH_PROCESS_KEY_JOB2=AutoCV_Job2_RenderPDF

# Robot callbacks must reach this URL (ngrok for local dev)
BACKEND_WEBHOOK_BASE_URL=http://localhost:3000
```

## Live Mode Setup (Robot Integration)

### 1. Publish Robot to Orchestrator
- Open `AutoCV-Robot` in UiPath Studio → **Publish** → Orchestrator Tenant Feed.
- Note the **Process Key / Release Key** for both processes:
  - **Job 1** (scrape & synthesize): `AutoCV_Job1_ScrapeAndSynthesize`
  - **Job 2** (render PDF + email): `AutoCV_Job2_RenderPDF`
- Copy keys to `UIPATH_PROCESS_KEY_JOB1` / `UIPATH_PROCESS_KEY_JOB2`.

### 2. Configure Orchestrator Assets
In Orchestrator → **Assets**, create:

| Asset Name | Type | Value |
|------------|------|-------|
| `Backend_Webhook_Base_URL` | Text | Public URL of this web app (e.g. `https://your-app.vercel.app` or ngrok) |
| `Gemini_API_Key` | Credential | Google AI Studio API key |
| `SMTP_Host` / `SMTP_Port` / `SMTP_Credential` | Text / Integer / Credential | Mail server for PDF delivery |
| `Word_Template_Path` | Text | `Data\Templates\ATS_Resume_Template.docx` |

### 3. External Application (Web → Orchestrator auth)
Automation Cloud → **Admin** → **External Applications** → **Add**:
- **Type:** Confidential
- **Scopes:** `OR.Execution`, `OR.Jobs`, `OR.Monitoring`
- Copy **Client ID** / **Client Secret** → `UIPATH_CLIENT_ID` / `UIPATH_CLIENT_SECRET`.

### 4. Expose Localhost for Robot Callbacks (Dev)
Robot must POST webhooks to your machine:
```bash
ngrok http 3000
```
Copy the HTTPS URL → `BACKEND_WEBHOOK_BASE_URL` (Orchestrator Asset) and `.env.local`.

### 5. Run in Live Mode
```bash
cp .env.example .env.local
# Edit .env.local with live credentials + ngrok URL
NEXT_PUBLIC_UIPATH_MODE=live
bun dev
```

## API Endpoints (Robot ↔ Backend)

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

## Job Lifecycle

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

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo → **Add Project** → Root Directory: `AutoCV-Web`
2. Build: `bun run build` (auto-detected)
3. Add **Environment Variables** from `.env.local` in Vercel dashboard.
4. Deploy.

> **Note:** The backend uses an in-memory `JobStore`. On serverless platforms (Vercel), job state is ephemeral per invocation. For live mode, deploy to a persistent Node.js host (VPS, Railway, Render, Fly.io) or add Redis/Upstash as `JobStore` backend.

## Testing Locally

```bash
bun dev                    # mock mode
# Submit form → watch mock robot progress → curate → download mock PDF
```

## License

MIT — Automation Hackathon 2026 (#HumanInTheLead)