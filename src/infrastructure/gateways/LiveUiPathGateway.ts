import type { IUiPathGateway, JobProgress, JobSubmission } from "@/core/interfaces/IUiPathGateway";
import type { GenerateCVRequestDTO } from "@/application/dto/GenerateCVRequestDTO";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";
import { orchestratorAuth } from "./OrchestratorAuthClient";
import { createJob, getJob, updateJob } from "@/infrastructure/storage/JobStore";

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

    const inputArgs = JSON.stringify({
      in_JobId: jobId,
      in_LinkedInUrl: request.linkedinUrl || request.linkedInUrl || "",
      in_GitHubUrl: request.githubUrl,
      in_RecipientEmail: request.recipientEmail || request.email || "",
      in_TargetJobRole: request.targetRole || "General Tech Professional",
      // Explicit gate: an unset Boolean defaults to False, which auto-approves
      // the draft and generates a PDF before human curation.
      in_RequireManualApproval: true,
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
            Strategy: "Specific",
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

    const data = (await response.json().catch(() => ({}))) as OrchestratorStartJobsResponse;
    const orchJobId = data.value?.[0]?.Key || data.value?.[0]?.Id?.toString();

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

    return {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      draftData: job.draftData,
      downloadUrl: job.downloadUrl,
      errorMessage: job.errorMessage,
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

    const approvedPayload = curatedData || job.draftData || {};

    const inputArgs = JSON.stringify({
      in_JobId: jobId,
      // Existing inputs re-sent because the robot re-runs ingestion before the gate
      in_LinkedInUrl: job.request?.linkedinUrl || job.request?.linkedInUrl || "",
      in_GitHubUrl: job.request?.githubUrl || "",
      in_RecipientEmail: job.request?.recipientEmail || job.request?.email || "",
      in_TargetJobRole: job.request?.targetRole || "General Tech Professional",
      // Non-empty payload opens the approval gate; the robot proceeds to
      // document generation and email delivery.
      in_ApprovedResumePayload:
        typeof approvedPayload === "string" ? approvedPayload : JSON.stringify(approvedPayload),
      in_RequireManualApproval: true,
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
            Strategy: "Specific",
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
