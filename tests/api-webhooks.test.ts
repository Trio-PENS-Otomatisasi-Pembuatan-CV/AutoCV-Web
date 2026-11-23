import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { spawn } from "child_process";

let serverProcess: ReturnType<typeof spawn> | null = null;
const PORT = 3063;
const BASE_URL = `http://localhost:${PORT}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeAll(async () => {
  serverProcess = spawn("bun", ["run", "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT), NEXT_PUBLIC_UIPATH_MODE: "mock" },
    stdio: "pipe",
  });

  let ready = false;
  for (let i = 0; i < 50; i++) {
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

    await sleep(500);

    const progressRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FETCHING_GITHUB", progress: 45 }),
    });
    expect(progressRes.status).toBe(200);

    const statusRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`);
    const statusData = await statusRes.json();
    expect(statusData.status).toBe("FETCHING_GITHUB");
    expect(statusData.progressPercent).toBe(45);

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

    await sleep(200);

    const polledAfterDraft = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();
    expect(polledAfterDraft.status).toBe("AWAITING_CURATION");
    expect(polledAfterDraft.draftData.profile.fullName).toBe("Budi Santoso");
    expect(polledAfterDraft.draftData.experiences[0].role).toBe("Backend Engineer");
    expect(polledAfterDraft.draftData.projects[0].repoUrl).toBe(
      "https://github.com/test/payment-gateway"
    );

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

    await sleep(500);

    const approveRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curatedData: polledAfterDraft.draftData }),
    });
    expect(approveRes.status).toBe(200);

    const fakePdf = Buffer.from("%PDF-1.4 mock pdf content").toString("base64");
    const completeRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfBase64: fakePdf,
      }),
    });
    expect(completeRes.status).toBe(200);

    const finalStatus = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();

    expect(finalStatus.status).toBe("COMPLETED");
    expect(finalStatus.emailSent).toBe(true);
    expect(finalStatus.emailSentAt).toBeDefined();

    const downloadRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/download`);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers.get("content-type")).toContain("application/pdf");
    const downloadedText = await downloadRes.text();
    expect(downloadedText).toContain("%PDF-1.4 mock pdf content");
  });

  it("error webhook marks job as FAILED", async () => {
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

    const errorRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorMessage: "LinkedIn scraping timed out",
        errorStage: "SCRAPING_LINKEDIN",
      }),
    });
    expect(errorRes.status).toBe(200);

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

    await sleep(500);

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

    await sleep(500);

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

  it("/complete ignores robot's emailSent claim", async () => {
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/ignore-emailclaim",
        githubUrl: "https://github.com/ignoreclaim",
        recipientEmail: "ignore@test.com",
      }),
    });
    const { jobId } = await submitRes.json();

    await sleep(300);

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "AI_SYNTHESIZING", progress: 85 }),
    });

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftData: {
          personal_info: {
            full_name: "Ignore Test",
            headline: "Developer",
            email: "ignore@test.com",
            summary: "Test user",
          },
          work_experience: [],
          repositories: [],
          skills: [{ category: "Languages", items: ["Go"] }],
        },
      }),
    });

    await sleep(200);

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curatedData: {
          profile: { fullName: "Ignore Test", headline: "Developer", email: "ignore@test.com", summary: "Test user" },
          experiences: [],
          projects: [],
          skills: [{ category: "Languages", items: ["Go"] }],
        },
      }),
    });

    await sleep(300);

    const fakePdf = Buffer.from("%PDF-1.4 mock pdf content").toString("base64");
    const completeRes = await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfBase64: fakePdf,
        emailSent: false,
      }),
    });
    expect(completeRes.status).toBe(200);

    await sleep(200);

    const finalStatus = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();

    expect(finalStatus.status).toBe("COMPLETED");
    expect(finalStatus.emailSent).toBe(true);
  });

  it("auto-send on completion (simulation mode)", async () => {
    const submitRes = await fetch(`${BASE_URL}/api/cv/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/sim-test",
        githubUrl: "https://github.com/simtest",
        recipientEmail: "sim@test.com",
      }),
    });
    const { jobId } = await submitRes.json();

    await sleep(300);

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "AI_SYNTHESIZING", progress: 85 }),
    });

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draftData: {
          personal_info: {
            full_name: "Sim Test",
            headline: "QA Engineer",
            email: "sim@test.com",
            summary: "Simulation test user",
          },
          work_experience: [],
          repositories: [],
          skills: [{ category: "Languages", items: ["JavaScript"] }],
        },
      }),
    });

    await sleep(200);

    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curatedData: {
          profile: { fullName: "Sim Test", headline: "QA Engineer", email: "sim@test.com", summary: "Simulation test user" },
          experiences: [],
          projects: [],
          skills: [{ category: "Languages", items: ["JavaScript"] }],
        },
      }),
    });

    await sleep(300);

    const fakePdf = Buffer.from("%PDF-1.4 simulation test").toString("base64");
    await fetch(`${BASE_URL}/api/cv/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64: fakePdf }),
    });

    const finalStatus = await (
      await fetch(`${BASE_URL}/api/cv/jobs/${jobId}`)
    ).json();

    expect(finalStatus.status).toBe("COMPLETED");
    expect(finalStatus.emailSent).toBe(true);
    expect(finalStatus.emailSentAt).toBeDefined();
  });

  it("send-email responds 404 for unknown job", async () => {
    const res = await fetch(`${BASE_URL}/api/cv/jobs/nonexistent-job-id-123/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });
});