import type { ResumePayload } from "@/core/entities/ResumePayload";

export interface AtsScoreResult {
  score: number; // 0–100
  tier: string; // "Tier A Ready" | "Tier B" | "Tier C"
  label: string; // e.g. "98/100"
}

const ACTION_VERBS =
  /^(led|built|designed|delivered|reduced|increased|engineered|developed|managed|created|automated|optimized|implemented|architected|mentored|launched|streamlined)/i;

export function calculateAtsScore(resume: ResumePayload): AtsScoreResult {
  let score = 0;

  // 1. Profile completeness (20 pts)
  const p = resume.profile;
  if (p?.fullName?.trim()) score += 5;
  if (p?.email?.trim()) score += 5;
  if (p?.summary?.trim()) score += 5;
  if (p?.location?.trim()) score += 5;

  // 2. Social URLs (10 pts)
  if (p?.linkedinUrl?.trim()) score += 5;
  if (p?.githubUrl?.trim()) score += 5;

  // 3. Work experience quality (25 pts)
  const exps = resume.experiences ?? [];
  if (exps.length >= 1) score += 10;
  if (exps.length >= 2) score += 5;
  const wellBulleted = exps.filter((e) => (e.bulletPoints?.length ?? 0) >= 2).length;
  if (wellBulleted >= 1) score += 5;
  if (wellBulleted >= 2) score += 5;

  // 4. Projects (15 pts)
  const selProjs = (resume.projects ?? []).filter((pr) => pr.isSelected !== false);
  if (selProjs.length >= 1) score += 5;
  if (selProjs.length >= 2) score += 5;
  const withSummary = selProjs.filter((pr) => pr.starSummary?.trim()).length;
  if (withSummary >= 2) score += 5;

  // 5. Skills (15 pts)
  const skills = resume.skills ?? [];
  if (skills.length >= 1) score += 5;
  const richSkill = skills.filter((s) => (s.items?.length ?? 0) >= 3).length;
  if (richSkill >= 1) score += 5;
  if (richSkill >= 2) score += 5;

  // 6. Education (10 pts)
  const edu = resume.education ?? [];
  if (edu.length >= 1) score += 5;
  if (edu[0]?.degree?.trim()) score += 5;

  // 7. Action verb check (5 pts)
  const allBullets = exps.flatMap((e) => e.bulletPoints ?? []);
  const actionCount = allBullets.filter((b) => ACTION_VERBS.test(b.trim())).length;
  if (actionCount >= 2) score += 5;

  score = Math.min(100, score);

  const tier =
    score >= 90 ? "Tier A Ready" : score >= 70 ? "Tier B" : "Tier C";

  return { score, tier, label: `${score}/100` };
}
