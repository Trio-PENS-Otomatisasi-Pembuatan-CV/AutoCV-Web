import { apiRequest, resolveApiUrl } from "./apiClient";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { JobStatus } from "@/application/dto/GenerateCVRequestDTO";

export interface GenerateCVPayload {
  linkedinUrl: string;
  githubUrl: string;
  targetRole?: string;
  recipientEmail: string;
  language?: "en" | "id";
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progressPercent: number;
  draftData?: ResumePayload;
  downloadUrl?: string;
  errorMessage?: string;
}

export async function submitCVJob(payload: GenerateCVPayload) {
  return apiRequest<{ jobId: string; status: string }>("/cv/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCVJobStatus(jobId: string): Promise<JobStatusResponse> {
  return apiRequest<JobStatusResponse>(`/cv/jobs/${jobId}`, {
    method: "GET",
  });
}

export async function approveCuratedCV(jobId: string, curatedData: unknown) {
  return apiRequest<{ success: boolean; status: string }>(`/cv/jobs/${jobId}/approve`, {
    method: "POST",
    body: JSON.stringify({ curatedData }),
  });
}

export async function downloadCVPdf(jobId: string, filename: string = "ATS_Resume.pdf") {
  if (typeof window === "undefined") throw new Error("downloadCVPdf only works in the browser");
  const downloadApiUrl = resolveApiUrl(`/cv/jobs/${jobId}/download`);
  const response = await fetch(downloadApiUrl);
  if (!response.ok) {
    throw new Error("Failed to download PDF.");
  }
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
