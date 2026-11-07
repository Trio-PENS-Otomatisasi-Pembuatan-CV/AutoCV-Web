import { z } from "zod";

export enum JobStatus {
  PENDING = "PENDING",
  SCRAPING_LINKEDIN = "SCRAPING_LINKEDIN",
  FETCHING_GITHUB = "FETCHING_GITHUB",
  AI_SYNTHESIZING = "AI_SYNTHESIZING",
  AWAITING_CURATION = "AWAITING_CURATION",
  GENERATING_PDF = "GENERATING_PDF",
  DELIVERING_EMAIL = "DELIVERING_EMAIL",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

const LINKEDIN_URL_PATTERN =
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/;
const GITHUB_URL_PATTERN =
  /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9._-]+)?\/?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GenerateCVRequestSchema = z.object({
  linkedinUrl: z
    .string()
    .regex(LINKEDIN_URL_PATTERN, "Invalid LinkedIn profile URL")
    .optional(),
  linkedInUrl: z
    .string()
    .regex(LINKEDIN_URL_PATTERN, "Invalid LinkedIn profile URL")
    .optional(),
  githubUrl: z.string().regex(GITHUB_URL_PATTERN, "Invalid GitHub URL"),
  recipientEmail: z
    .string()
    .regex(EMAIL_PATTERN, "Invalid email address")
    .optional(),
  email: z.string().regex(EMAIL_PATTERN, "Invalid email address").optional(),
  targetRole: z.string().max(100).optional(),
});

export type GenerateCVRequestDTO = z.infer<typeof GenerateCVRequestSchema>;
