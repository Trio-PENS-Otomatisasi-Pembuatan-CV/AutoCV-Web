import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export function findChromePath(): string | null {
  const candidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function escapeXml(unsafe: string): string {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildAtsResumeHtml(resume: ResumePayload): string {
  const p = resume.profile;
  const contacts = [p.email, p.phone, p.location, p.linkedinUrl, p.githubUrl]
    .filter(Boolean)
    .join(" • ");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: Letter; margin: 15mm; }
    body { font-family: 'Calibri', 'Arial', sans-serif; color: #0F172A; font-size: 10pt; line-height: 1.35; margin: 0; }
    h1 { font-size: 20pt; text-align: center; margin: 0 0 2px 0; text-transform: uppercase; font-weight: 900; }
    .headline { font-size: 10.5pt; text-align: center; font-weight: 600; color: #1E293B; margin-bottom: 4px; }
    .contact { font-size: 9pt; text-align: center; color: #475569; margin-bottom: 12px; }
    .section-title { font-size: 11pt; font-weight: bold; border-bottom: 1.5px solid #0F172A; padding-bottom: 2px; margin: 10px 0 6px 0; text-transform: uppercase; }
    .entry-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; }
    .entry-date { font-weight: 600; color: #475569; font-size: 9pt; }
    ul { margin: 3px 0 6px 18px; padding: 0; }
    li { margin-bottom: 2px; color: #334155; }
  </style>
</head>
<body>
  <h1>${escapeXml(p.fullName || "Candidate")}</h1>
  ${p.headline ? `<div class="headline">${escapeXml(p.headline)}</div>` : ""}
  <div class="contact">${escapeXml(contacts)}</div>

  ${p.summary ? `<div class="section-title">Professional Summary</div><p style="margin: 4px 0 8px 0; color: #334155;">${escapeXml(p.summary)}</p>` : ""}

  ${resume.experiences?.length ? `
    <div class="section-title">Work Experience</div>
    ${resume.experiences.map((exp) => `
      <div class="entry-header">
        <div><span>${escapeXml(exp.role)}</span> — <span style="font-weight: normal;">${escapeXml(exp.company)}</span></div>
        <div class="entry-date">${escapeXml(exp.startDate || "")} – ${escapeXml(exp.endDate || "Present")}</div>
      </div>
      <ul>${(exp.bulletPoints || []).map((b) => `<li>${escapeXml(b)}</li>`).join("")}</ul>
    `).join("")}
  ` : ""}

  ${resume.projects?.filter((pr) => pr.isSelected !== false).length ? `
    <div class="section-title">Technical Projects</div>
    ${resume.projects.filter((pr) => pr.isSelected !== false).map((pr) => `
      <div class="entry-header">
        <div><span>${escapeXml(pr.name)}</span> ${pr.language ? `<span style="font-weight: normal; font-size: 9pt; color: #64748B;">(${escapeXml(pr.language)})</span>` : ""}</div>
      </div>
      <ul><li>${escapeXml(pr.starSummary || "")}</li></ul>
    `).join("")}
  ` : ""}

  ${resume.skills?.length ? `
    <div class="section-title">Technical Skills</div>
    ${resume.skills.map((s) => `<p style="margin: 2px 0; font-size: 9.5pt;"><strong>${escapeXml(s.category)}:</strong> ${escapeXml((s.items || []).join(", "))}</p>`).join("")}
  ` : ""}

  ${resume.education?.length ? `
    <div class="section-title">Education</div>
    ${resume.education.map((edu) => `
      <div class="entry-header">
        <div><span>${escapeXml(edu.degree)}</span> — <span style="font-weight: normal;">${escapeXml(edu.institution)}</span></div>
        <div class="entry-date">${escapeXml(edu.graduationYear || "")}</div>
      </div>
      ${edu.gpa ? `<div style="font-size: 9pt; color: #64748B;">GPA: ${escapeXml(edu.gpa)}</div>` : ""}
    `).join("")}
  ` : ""}
</body>
</html>`;
}

export async function generateAtsPdf(resume: ResumePayload): Promise<Buffer> {
  const chrome = findChromePath();
  const html = buildAtsResumeHtml(resume);

  if (chrome) {
    const tempDir = os.tmpdir();
    const id = Math.random().toString(36).slice(2);
    const htmlPath = path.join(tempDir, `resume_${id}.html`);
    const pdfPath = path.join(tempDir, `resume_${id}.pdf`);

    try {
      fs.writeFileSync(htmlPath, html, "utf8");
      execSync(`"${chrome}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`, {
        stdio: "ignore",
      });
      if (fs.existsSync(pdfPath)) {
        return fs.readFileSync(pdfPath);
      }
    } finally {
      if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }
  }

  return createValidFallbackPdf(resume);
}

function createValidFallbackPdf(resume: ResumePayload): Buffer {
  const name = resume.profile.fullName || "Candidate";
  const title = resume.profile.headline || "";
  const streamText = `BT /F1 18 Tf 50 750 Td (${name}) Tj ET
BT /F1 11 Tf 50 730 Td (${title}) Tj ET`;
  const streamLen = streamText.length;

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLen} >>
stream
${streamText}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
385
%%EOF`;

  return Buffer.from(pdf);
}