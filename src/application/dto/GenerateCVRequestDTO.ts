import { z } from "zod";

export enum JobStatus {
  PENDING = "PENDING",
  SCRAPING = "SCRAPING",
  CURATING = "CURATING",
  APPROVED = "APPROVED",
  COMPLETED = "COMPLETED",
}

const LINKEDIN_URL_PATTERN =
  /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/;
const GITHUB_URL_PATTERN =
  /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9._-]+)?\/?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GenerateCVRequestSchema = z.object({
  linkedInUrl: z
    .string()
    .regex(LINKEDIN_URL_PATTERN, "Invalid LinkedIn profile URL"),
  githubUrl: z.string().regex(GITHUB_URL_PATTERN, "Invalid GitHub URL"),
  email: z.string().regex(EMAIL_PATTERN, "Invalid email address"),
});

export type GenerateCVRequestDTO = z.infer<typeof GenerateCVRequestSchema>;
