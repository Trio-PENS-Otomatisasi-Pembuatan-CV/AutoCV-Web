import { z } from "zod";
import {
  EMAIL_PATTERN,
  LINKEDIN_URL_PATTERN,
  GITHUB_URL_PATTERN,
} from "@/core/constants/validationPatterns";

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
  language: z.enum(["en", "id"]).optional(),
});

export type GenerateCVRequestDTO = z.infer<typeof GenerateCVRequestSchema>;
