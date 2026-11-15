import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { spawn } from "child_process";

let serverProcess: ReturnType<typeof spawn> | null = null;
const PORT = 3055;
const BASE_URL = `http://localhost:${PORT}`;

beforeAll(async () => {
  serverProcess = spawn("bun", ["run", "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: "pipe",
  });

  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE_URL}/login`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  if (!ready) throw new Error("Next.js test server failed to start");
}, 30000);

afterAll(() => {
  if (serverProcess) serverProcess.kill();
});

describe("Backend Webhooks & Lifecycle API", () => {
  it("full lifecycle: submit → progress → draft (snake_case) → curate → approve → complete → download", async () => {
    // 1. Submit job
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/test-candidate",
        githubUrl: "https://github.com/testcandidate",
        recipientEmail: "test@candidate.com",
      }),
    });
    expect(submitRes.status).toBe(202);
    const submitData = await submitRes.json();
    expect(submitData.jobId).toBeDefined();
    const jobId = submitData.jobId;

    // 2. Post progress update (simulating robot stage change)
    const progressRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FETCHING_GITHUB", progress: 45 }),
    });
    expect(progressRes.status).toBe(200);

    // 3. Verify progress reflected
    const statusRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`);
    const statusData = await statusRes.json();
    expect(statusData.status).toBe("FETCHING_GITHUB");
    expect(statusData.progressPercent).toBe(45);

    // 4. Post draft with snake_case schema (robot v2.0)
    const draftRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftData: {
          personal_info: {
            full_name: "Budi Santoso",
            headline: "Software Engineer",
            email: "test@candidate.com",
            summary: "Experienced Go developer",
          },
          work_experience: [
            {
              id: "exp-1",
              company: "PT Digital Nusantara",
              position: "Backend Engineer",
              bullet_points: ["Built microservices in Go", "Reduced latency by 40%"],
            },
          ],
          repositories: [
            {
              id: "proj-1",
              name: "payment-gateway",
              repo_url: "https://github.com/test/payment-gateway",
              stars: 48,
              language: "Go",
              star_summary: "Event-driven payment processing",
              is_selected: true,
            },
          ],
          skills: [
            { category: "Languages", items: ["Go", "TypeScript"] },
          ],
        },
      }),
    });
    expect(draftRes.status).toBe(200);

    // 5. Verify draft normalized to camelCase ResumePayload
    const polledAfterDraft = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();
    expect(polledAfterDraft.status).toBe("AWAITING_CURATION");
    expect(polledAfterDraft.draftData.profile.fullName).toBe("Budi Santoso");
    expect(polledAfterDraft.draftData.experiences[0].role).toBe("Backend Engineer");
    expect(polledAfterDraft.draftData.projects[0].repoUrl).toBe(
      "https://github.com/test/payment-gateway"
    );

    // 6. Curate (autosave partial edits)
    const curateRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/curate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftData: {
          profile: {
            fullName: "Budi Santoso",
            headline: "Senior Software Engineer",
            email: "test@candidate.com",
            summary: "Updated summary by user",
          },
          experiences: [],
          projects: [],
          skills: [],
        },
      }),
    });
    expect(curateRes.status).toBe(200);

    // 7. Approve
    const approveRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curatedData: polledAfterDraft.draftData }),
    });
    expect(approveRes.status).toBe(200);

    // 8. Post completion with base64 PDF
    const fakePdf = Buffer.from("%PDF-1.4 mock pdf content").toString("base64");
    const completeRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfBase64: fakePdf,
        emailSent: true,
      }),
    });
    expect(completeRes.status).toBe(200);

    // 9. Download PDF
    const downloadRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/download`);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers.get("content-type")).toContain("application/pdf");
    const downloadedText = await downloadRes.text();
    expect(downloadedText).toContain("%PDF-1.4 mock pdf content");
  });

  it("error webhook marks job as FAILED", async () => {
    // Submit fresh job
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/failed-case",
        githubUrl: "https://github.com/failedcase",
        recipientEmail: "failed@case.com",
      }),
    });
    const { jobId } = await submitRes.json();

    // Post error
    const errorRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorMessage: "LinkedIn scraping timed out",
        errorStage: "SCRAPING_LINKEDIN",
      }),
    });
    expect(errorRes.status).toBe(200);

    // Verify FAILED status
    const polled = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();
    expect(polled.status).toBe("FAILED");
    expect(polled.errorMessage).toBe("LinkedIn scraping timed out");
  });

  it("progress webhook rejects invalid status", async () => {
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/test-progress",
        githubUrl: "https://github.com/testprogress",
        recipientEmail: "tp@test.com",
      }),
    });
    const { jobId } = await submitRes.json();

    const badProgressRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", progress: 100 }),
    });
    expect(badProgressRes.status).toBe(400);
  });

  it("curate rejects non-AWAITING_CURATION jobs", async () => {
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/test-cur",
        githubUrl: "https://github.com/testcur",
        recipientEmail: "tc@test.com",
      }),
    });
    const { jobId } = await submitRes.json();

    // Job is in PENDING/SCRAPING state, not AWAITING_CURATION
    const curateRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/curate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftData: {
          profile: { fullName: "Test", email: "tc@test.com", summary: "x" },
          experiences: [],
          projects: [],
          skills: [],
        },
      }),
    });
    expect(curateRes.status).toBe(409);
  });
});
