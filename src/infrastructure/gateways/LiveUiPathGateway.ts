import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { orchestratorAuth } from "./OrchestratorAuthClient";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";
import { normalizeDraftPayload } from "@/application/dto/DraftPayloadDTO";
import fs from "fs";

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
      in_WebhookBaseUrl: webhookBaseUrl,
      webhookBaseUrl,
      in_UseMockFallback: true,
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

              // Job 1 finished: Draft payload ready for curation
              if (outArgs.out_DraftResumePayload) {
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
              } else if (outArgs.out_OutputPdfPath) {
                // Job 2 finished: PDF generated
                const pdfPath = outArgs.out_OutputPdfPath;
                let pdfBase64: string | undefined;
                if (typeof pdfPath === "string" && fs.existsSync(pdfPath)) {
                  try {
                    pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
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
    const curatedJson =
      typeof curatedPayload === "string" ? curatedPayload : JSON.stringify(curatedPayload);

    const inputArgs = JSON.stringify({
      in_JobId: jobId,
      jobId,
      in_ApprovedResumePayload: curatedJson,
      curatedData: curatedJson,
      in_RecipientEmail: job.request?.recipientEmail || job.request?.email || "",
      recipientEmail: job.request?.recipientEmail || job.request?.email || "",
      in_WebhookBaseUrl: webhookBaseUrl,
      webhookBaseUrl,
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

    if (job.pdfBase64) {
      const binary = atob(job.pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: "application/pdf" });
    }

    if (job.downloadUrl) {
      const res = await fetch(job.downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${job.downloadUrl}`);
      }
      return res.blob();
    }

    throw new Error("PDF not ready or not found");
  }
}
