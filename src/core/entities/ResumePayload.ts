// AutoCV Canonical ResumePayload model
type ProfileInfo = {
  fullName: string;
  headline?: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  bulletPoints: string[];
  isSelected?: boolean;
}

export interface TechnicalProject {
  id: string;
  name: string;
  repoUrl: string;
  stars?: number;
  language?: string;
  techStack?: string[];
  starSummary: string;
  isSelected: boolean;
}

export interface EducationRecord {
  institution: string;
  degree: string;
  graduationYear?: string;
  gpa?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export type ResumeLanguage = "en" | "id";

export interface ResumePayload {
  profile: ProfileInfo;
  experiences: WorkExperience[];
  projects: TechnicalProject[];
  skills: SkillCategory[];
  education?: EducationRecord[];
  language?: ResumeLanguage;
}
