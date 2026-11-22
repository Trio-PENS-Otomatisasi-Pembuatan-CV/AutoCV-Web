import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { orchestratorAuth } from "./OrchestratorAuthClient";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { normalizeDraftPayload } from "@/application/dto/DraftPayloadDTO";
import fs from "fs";
import path from "path";

function prepareCompactCuratedPayload(raw: any): string {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  const profile = raw?.profile || raw?.personal_info || {};
  const rawProjects = raw?.projects || raw?.repositories || [];
  const selectedProjects = (Array.isArray(rawProjects) ? rawProjects : [])
    .filter((p: any) => p && p.isSelected !== false)
    .slice(0, 5)
    .map((p: any) => ({
      name: p.name || "",
      techStack: p.techStack || (p.language ? [p.language] : []),
      language: p.language || "",
      repoUrl: p.repoUrl || p.repo_url || p.html_url || "",
      starSummary: p.starSummary || p.star_summary || p.description || "",
      isSelected: true,
    }));

  const experiences = (Array.isArray(raw?.experiences) ? raw.experiences : [])
    .filter((e: any) => e && e.isSelected !== false)
    .map((e: any) => ({
    role: e.role || e.position || "",
    company: e.company || "",
    startDate: e.startDate || e.period || "",
    endDate: e.endDate || "",
    location: e.location || "",
    bulletPoints: Array.isArray(e.bulletPoints) ? e.bulletPoints : (e.description ? [e.description] : []),
    isSelected: true,
  }));

  const education = (Array.isArray(raw?.education) ? raw.education : []).map((edu: any) => ({
    degree: edu.degree || "",
    institution: edu.institution || "",
    graduationYear: edu.graduationYear || edu.year || "",
    gpa: edu.gpa || "",
  }));

  const skills = Array.isArray(raw?.skills) ? raw.skills : [];

  const compact = {
    profile: {
      fullName: profile.fullName || profile.name || "Candidate",
      headline: profile.headline || "",
      email: profile.email || profile.recipient_email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      summary: profile.summary || "",
      linkedinUrl: profile.linkedinUrl || profile.linkedin_url || "",
      githubUrl: profile.githubUrl || profile.github_url || "",
    },
    experiences,
    projects: selectedProjects,
    skills,
    education,
    language: raw?.language || "en",
  };

  return JSON.stringify(compact);
}

function findLocalPdfFile(pdfPath: string): string | null {
  if (!pdfPath) return null;
  if (path.isAbsolute(pdfPath) && fs.existsSync(pdfPath)) {
    return pdfPath;
  }
  const basename = path.basename(pdfPath);
  const userProfile = process.env.USERPROFILE || "";
  const candidates = [
    path.resolve(process.cwd(), "..", "robot", pdfPath),
    path.resolve(process.cwd(), "..", "robot", "Data", "Outputs", basename),
    path.resolve(process.cwd(), pdfPath),
    path.resolve(process.cwd(), "Data", "Outputs", basename),
    path.join(userProfile, ".nuget", "packages", "autocv", "1.0.5", "content", pdfPath),
    path.join(userProfile, ".nuget", "packages", "autocv", "1.0.5", "content", "Data", "Outputs", basename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

interface OrchestratorStartJobsResponse {
  value?: Array<{
    Id: number;
    Key: string;
    State: string;
  }>;
}

export class LiveUiPathGateway implements IUiPathGateway {
  async submitJob(request: GenerateCVRequestDTO): Promise<JobSubmission> {
    const jobId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    // Initialize local JobStore entry
    createJob(jobId, request, JobStatus.PENDING);

    const token = await orchestratorAuth.getAccessToken();
    const orchestratorUrl = process.env.UIPATH_ORCHESTRATOR_URL?.replace(/\/+$/, "");
    const releaseKey = process.env.UIPATH_PROCESS_KEY_JOB1;
    const folderId = process.env.UIPATH_FOLDER_ID;
    const tenantName = process.env.UIPATH_TENANT_NAME;
    const webhookBaseUrl =
      process.env.BACKEND_WEBHOOK_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

    const inputArgs = JSON.stringify({
      in_JobId: jobId,
      jobId,
      in_LinkedInUrl: request.linkedinUrl || request.linkedInUrl || "",
      linkedinUrl: request.linkedinUrl || request.linkedInUrl || "",
      in_GitHubUrl: request.githubUrl,
      githubUrl: request.githubUrl,
      in_RecipientEmail: request.recipientEmail || request.email || "",
      recipientEmail: request.recipientEmail || request.email || "",
      in_TargetJobRole: request.targetRole || "General Tech Professional",
      targetRole: request.targetRole || "General Tech Professional",
      in_Language: request.language || "id",
      language: request.language || "id",
      in_WebhookBaseUrl: webhookBaseUrl,
      webhookBaseUrl,
      in_UseMockFallback: false,
      in_RequireManualApproval: true,
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (tenantName) headers["X-UIPATH-TenantName"] = tenantName;
    if (folderId) headers["X-UIPATH-OrganizationUnitId"] = folderId;

    const response = await fetch(
      `${orchestratorUrl}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          startInfo: {
            ReleaseKey: releaseKey,
            Strategy: "ModernJobsCount",
            JobsCount: 1,
            InputArguments: inputArgs,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      updateJob(jobId, {
        status: JobStatus.FAILED,
        errorMessage: `Failed to trigger Job 1 in Orchestrator: ${err}`,
      });
      throw new Error(`Orchestrator StartJobs (Job 1) failed (HTTP ${response.status}): ${err}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const htmlText = await response.text();
      const err = `Orchestrator returned non-JSON response (Content-Type: ${contentType}). Check UIPATH_ORCHESTRATOR_URL tenant name. Response preview: ${htmlText.slice(0, 200)}`;
      updateJob(jobId, { status: JobStatus.FAILED, errorMessage: err });
      throw new Error(err);
    }

    const data = (await response.json()) as OrchestratorStartJobsResponse;
    const orchJobId = data.value?.[0]?.Id ? String(data.value[0].Id) : data.value?.[0]?.Key;

    if (!orchJobId) {
      const err = `Orchestrator did not return a job ID. Response: ${JSON.stringify(data)}`;
      updateJob(jobId, { status: JobStatus.FAILED, errorMessage: err });
      throw new Error(err);
    }

    updateJob(jobId, {
      status: JobStatus.SCRAPING_LINKEDIN,
      progress: 15,
      orchestratorJobId: orchJobId,
    });

    return { jobId };
  }

  async getJobProgress(jobId: string): Promise<JobProgress> {
    const job = getJob(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found`);
    }

    // If job is already awaiting curation, completed, or failed, return directly
    if (
      job.status === JobStatus.AWAITING_CURATION ||
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.FAILED
    ) {
      return {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        draftData: job.draftData,
        downloadUrl: job.downloadUrl,
        errorMessage: job.errorMessage,
      };
    }

    // Dual-channel resilience: Query Orchestrator OData directly if orchestratorJobId exists
    if (job.orchestratorJobId) {
      try {
        const token = await orchestratorAuth.getAccessToken();
        const orchestratorUrl = process.env.UIPATH_ORCHESTRATOR_URL?.replace(/\/+$/, "");
        const folderId = process.env.UIPATH_FOLDER_ID;
        const tenantName = process.env.UIPATH_TENANT_NAME;

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };
        if (tenantName) headers["X-UIPATH-TenantName"] = tenantName;
        if (folderId) headers["X-UIPATH-OrganizationUnitId"] = folderId;

        const res = await fetch(`${orchestratorUrl}/odata/Jobs(${job.orchestratorJobId})`, {
          headers,
        });

        if (res.ok) {
          const orchJob = await res.json();
          if (orchJob.State === "Running") {
            // Increment progress while robot is active
            if (job.status === JobStatus.SCRAPING_LINKEDIN) {
              updateJob(jobId, { status: JobStatus.FETCHING_GITHUB, progress: 40 });
            } else if (job.status === JobStatus.FETCHING_GITHUB) {
              updateJob(jobId, { status: JobStatus.AI_SYNTHESIZING, progress: 60 });
            }
          } else if (orchJob.State === "Successful") {
            if (orchJob.OutputArguments) {
              const outArgs =
                typeof orchJob.OutputArguments === "string"
                  ? JSON.parse(orchJob.OutputArguments)
                  : orchJob.OutputArguments;

              // Check if Job 2 is complete (out_JobStatus === "COMPLETED" or PDF path present or job in GENERATING_PDF)
              if (
                outArgs.out_JobStatus === "COMPLETED" ||
                Boolean(outArgs.out_OutputPdfPath) ||
                job.status === JobStatus.GENERATING_PDF
              ) {
                const pdfPath = outArgs.out_OutputPdfPath || "";
                let pdfBase64: string | undefined;
                const localPdfFile = findLocalPdfFile(pdfPath);
                if (localPdfFile) {
                  try {
                    pdfBase64 = fs.readFileSync(localPdfFile).toString("base64");
                  } catch (e) {
                    console.warn("[LiveUiPathGateway] Could not read local PDF file:", e);
                  }
                }
                updateJob(jobId, {
                  status: JobStatus.COMPLETED,
                  progress: 100,
                  pdfBase64: pdfBase64 || job.pdfBase64,
                  downloadUrl: `/api/cv/jobs/${jobId}/download`,
                });
              } else if (outArgs.out_JobStatus === "CURATING" || outArgs.out_DraftResumePayload) {
                // Job 1 finished: Draft payload ready for curation
                const rawDraft =
                  typeof outArgs.out_DraftResumePayload === "string"
                    ? JSON.parse(outArgs.out_DraftResumePayload)
                    : outArgs.out_DraftResumePayload;

                const normalized = normalizeDraftPayload(rawDraft);
                updateJob(jobId, {
                  status: JobStatus.AWAITING_CURATION,
                  progress: 75,
                  draftData: normalized,
                });
              }
            } else if (job.status === JobStatus.GENERATING_PDF) {
              updateJob(jobId, {
                status: JobStatus.COMPLETED,
                progress: 100,
                downloadUrl: `/api/cv/jobs/${jobId}/download`,
              });
            }
          } else if (orchJob.State === "Faulted") {
            updateJob(jobId, {
              status: JobStatus.FAILED,
              errorMessage: orchJob.Info || "Orchestrator job faulted during execution",
            });
          }
        }
      } catch (pollErr) {
        console.warn("[LiveUiPathGateway] Orchestrator direct poll error:", pollErr);
      }
    }

    const currentJob = getJob(jobId) || job;
    return {
      jobId: currentJob.jobId,
      status: currentJob.status,
      progress: currentJob.progress,
      draftData: currentJob.draftData,
      downloadUrl: currentJob.downloadUrl,
      errorMessage: currentJob.errorMessage,
    };
  }

  async approveResume(jobId: string, curatedData?: unknown): Promise<void> {
    const job = getJob(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found`);
    }

    // Set optimistic state
    updateJob(jobId, {
      status: JobStatus.GENERATING_PDF,
      progress: 90,
    });

    const token = await orchestratorAuth.getAccessToken();
    const orchestratorUrl = process.env.UIPATH_ORCHESTRATOR_URL?.replace(/\/+$/, "");
    const releaseKey = process.env.UIPATH_PROCESS_KEY_JOB2;
    const folderId = process.env.UIPATH_FOLDER_ID;
    const tenantName = process.env.UIPATH_TENANT_NAME;
    const webhookBaseUrl =
      process.env.BACKEND_WEBHOOK_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

    const curatedPayload = curatedData || job.draftData;
    const compactCuratedJson = prepareCompactCuratedPayload(curatedPayload);

    const inputArgs = JSON.stringify({
      in_JobId: jobId,
      in_ApprovedResumePayload: compactCuratedJson,
      in_RecipientEmail: job.request?.recipientEmail || job.request?.email || "",
      in_WebhookBaseUrl: webhookBaseUrl,
      in_Language: (curatedPayload as any)?.language || "en",
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (tenantName) headers["X-UIPATH-TenantName"] = tenantName;
    if (folderId) headers["X-UIPATH-OrganizationUnitId"] = folderId;

    const response = await fetch(
      `${orchestratorUrl}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          startInfo: {
            ReleaseKey: releaseKey,
            Strategy: "ModernJobsCount",
            JobsCount: 1,
            InputArguments: inputArgs,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      updateJob(jobId, {
        status: JobStatus.FAILED,
        errorMessage: `Failed to trigger Job 2 in Orchestrator: ${err}`,
      });
      throw new Error(`Orchestrator StartJobs (Job 2) failed (HTTP ${response.status}): ${err}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const htmlText = await response.text();
      const err = `Orchestrator returned non-JSON response on Job 2 (Content-Type: ${contentType}). Response preview: ${htmlText.slice(0, 200)}`;
      updateJob(jobId, { status: JobStatus.FAILED, errorMessage: err });
      throw new Error(err);
    }

    const data = (await response.json()) as OrchestratorStartJobsResponse;
    const orchJobId2 = data.value?.[0]?.Id ? String(data.value[0].Id) : data.value?.[0]?.Key;
    if (orchJobId2) {
      updateJob(jobId, {
        orchestratorJobId: orchJobId2,
        status: JobStatus.GENERATING_PDF,
        progress: 85,
      });
    }
  }

  async downloadCv(jobId: string): Promise<Blob> {
    const job = getJob(jobId);
    if (!job) {
      throw new Error(`Job '${jobId}' not found`);
    }

    let pdfBase64 = job.pdfBase64;
    if (!pdfBase64) {
      const name = job.draftData?.profile.fullName?.replace(/\s+/g, "_") || "";
      const userProfile = process.env.USERPROFILE || "";
      const searchDirs = [
        path.resolve(process.cwd(), "..", "AutoCV-Robot", "Data", "Outputs"),
        path.resolve(process.cwd(), "Data", "Outputs"),
        path.resolve(process.cwd(), "..", "robot", "Data", "Outputs"),
        path.join(userProfile, ".nuget", "packages", "autocv", "1.0.5", "content", "Data", "Outputs"),
      ];
      for (const dir of searchDirs) {
        if (fs.existsSync(dir)) {
          const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith(".pdf") && (name ? f.includes(name) : true));
          if (files.length > 0) {
            files.sort(
              (a, b) =>
                fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs
            );
            pdfBase64 = fs.readFileSync(path.join(dir, files[0])).toString("base64");
            updateJob(jobId, { pdfBase64 });
            break;
          }
        }
      }
    }

    if (pdfBase64) {
      const binary = atob(pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: "application/pdf" });
    }

    if (job.downloadUrl && /^https?:\/\//i.test(job.downloadUrl)) {
      const res = await fetch(job.downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${job.downloadUrl}`);
      }
      return res.blob();
    }

    if (job.draftData) {
      const generatedPdfBytes = await generatePdfFromDraft(job.draftData);
      if (generatedPdfBytes) {
        const buffer = Buffer.from(generatedPdfBytes);
        updateJob(jobId, { pdfBase64: buffer.toString("base64") });
        return new Blob([buffer], { type: "application/pdf" });
      }
    }

    throw new Error("PDF not ready or not found");
  }
}

async function generatePdfFromDraft(draftData: any): Promise<Uint8Array | null> {
  const html = buildResumeHtml(draftData);
  try {
    const { execSync } = await import("child_process");
    const chromePath = getChromeExecutable();
    if (chromePath) {
      const args = [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--print-to-pdf",
      ];
      const result = execSync(`${chromePath} ${args.join(" ")} -- ${html}`, {
        encoding: "binary",
        maxBuffer: 100 * 1024 * 1024,
      });
      return new Uint8Array(Buffer.from(result, "binary"));
    }
  } catch (e) {
    console.warn("[generatePdfFromDraft] Chrome headless failed:", e);
  }
  return createSimplePdfFromDraft(draftData);
}

function getChromeExecutable(): string | null {
  const candidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  const fs = require("fs");
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function buildResumeHtml(draftData: any): string {
  const profile = draftData?.profile || {};
  const experiences = draftData?.experiences || [];
  const projects = draftData?.projects || [];
  const skills = draftData?.skills || [];
  const education = draftData?.education || [];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:Calibri,Arial,sans-serif;color:#0F172A;margin:0;padding:24px}
    .resume{background:#fff;padding:24px}
    h1{font-size:24px;font-weight:bold;margin:0 0 4px 0}
    h2{font-size:14px;font-weight:bold;margin:0 0 8px 0;border-bottom:1px solid #0F172A;padding-bottom:4px}
    .section{margin-top:16px}
    .item{margin-bottom:8px;font-size:11px}
    .skills{font-size:11px}
    .skills span{margin-right:8px}
  </style>
</head>
<body>
  <div class="resume">
    <h1>${profile.fullName || "Candidate"}</h1>
    ${profile.headline ? `<p style="font-size:13px;color:#475569;margin:0 0 8px 0">${profile.headline}</p>` : ""}
    ${profile.email || profile.phone ? `<p style="font-size:11px;color:#475569;margin:0 0 8px 0">
      ${profile.email ? profile.email + " | " : ""}${profile.phone || ""} | ${profile.location || ""}
    </p>` : ""}

    ${profile.summary ? `<div class="section"><h2>Professional Summary</h2><p class="item">${profile.summary}</p></div>` : ""}

    ${experiences.length > 0 ? `<div class="section"><h2>Work Experience</h2>${experiences.map((e: any) => `
      <div class="item">
        <strong>${e.role}</strong> — ${e.company}${e.startDate ? " " + e.startDate + (e.endDate ? " - " + e.endDate : " — Present") : ""}
        <ul style="margin:4px 0 0 0;padding-left:20px">
          ${(e.bulletPoints || []).map((b: string) => `<li>${b}</li>`).join("")}
        </ul>
      </div>`).join("")}</div>` : ""}

    ${projects.length > 0 ? `<div class="section"><h2>Projects</h2>${projects.map((p: any) => `
      <div class="item">
        <strong>${p.name}</strong> <span style="font-size:10px;color:#64748B">[${p.techStack?.join(", ") || p.language || ""}]</span>
        <p style="font-size:10px;margin:4px 0 0 0">${p.starSummary || ""}</p>
      </div>`).join("")}</div>` : ""}

    ${skills.length > 0 ? `<div class="section"><h2>Skills</h2><div class="skills">${skills.map((s: any) => s.items.join(", ")).join(" | ")}</div></div>` : ""}

    ${education.length > 0 ? `<div class="section"><h2>Education</h2>${education.map((e: any) => `
      <div class="item"><strong>${e.degree}</strong> — ${e.institution}${e.graduationYear ? " | " + e.graduationYear : ""}</div>`).join("")}</div>` : ""}
  </div>
</body>
</html>`;
}

function createSimplePdfFromDraft(draftData: any): Uint8Array | null {
  try {
    const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 5 0 R >>
stream
BT
/F1 11 tf
72 720 Td
(${escapePdf(draftData?.profile?.fullName || "Candidate")} ) Tj
0 -16 Td
(ATS Resume - AutoCV Generated ) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000428 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
512
%%EOF`;
    return new Uint8Array(Buffer.from(content));
  } catch (e) {
    console.warn("[createSimplePdfFromDraft] Fallback PDF failed:", e);
    return null;
  }
}

function escapePdf(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}
