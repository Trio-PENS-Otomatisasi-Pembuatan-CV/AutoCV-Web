import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { orchestratorAuth } from "./OrchestratorAuthClient";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { normalizeDraftPayload } from "@/application/dto/DraftPayloadDTO";
import { genMockResume } from "./MockUiPathGateway";
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
              let outArgs: any = {};
              if (typeof orchJob.OutputArguments === "string" && orchJob.OutputArguments.trim().length > 0) {
                try {
                  outArgs = JSON.parse(orchJob.OutputArguments);
                } catch (e) {
                  console.warn("[LiveUiPathGateway] Could not parse OutputArguments JSON:", e);
                }
              } else if (typeof orchJob.OutputArguments === "object" && orchJob.OutputArguments !== null) {
                outArgs = orchJob.OutputArguments;
              }

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
                let rawDraft: any = null;
                const rawPayload = outArgs.out_DraftResumePayload;

                if (typeof rawPayload === "string" && rawPayload.trim().length > 0) {
                  try {
                    rawDraft = JSON.parse(rawPayload);
                  } catch (parseErr) {
                    console.warn("[LiveUiPathGateway] Could not parse out_DraftResumePayload as JSON:", parseErr);
                  }
                } else if (typeof rawPayload === "object" && rawPayload !== null) {
                  rawDraft = rawPayload;
                }

                // If robot returned an empty or invalid payload, safely fallback to existing webhook data or sample generator
                const draftToUse =
                  rawDraft ||
                  job.draftData ||
                  (job.request ? genMockResume(job.request) : normalizeDraftPayload({}));

                const normalized = normalizeDraftPayload(draftToUse);
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
      const buffer = Buffer.from(pdfBase64, "base64");
      return new Blob([buffer], { type: "application/pdf" });
    }

    if (job.downloadUrl && /^https?:\/\//i.test(job.downloadUrl)) {
      const res = await fetch(job.downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${job.downloadUrl}`);
      }
      return res.blob();
    }

    if (job.draftData) {
      const { generateAtsPdf } = await import("@/infrastructure/pdf/PdfGeneratorService");
      const buffer = await generateAtsPdf(job.draftData);
      updateJob(jobId, { pdfBase64: buffer.toString("base64") });
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        }
      });
      return new Response(readable, {
        headers: { "Content-Type": "application/pdf" },
      }) as any;
    }

    throw new Error("PDF not ready or not found");
  }
}
