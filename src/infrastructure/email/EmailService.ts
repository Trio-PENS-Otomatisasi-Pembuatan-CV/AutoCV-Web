import nodemailer from "nodemailer";

export interface SendCVEmailOptions {
  jobId: string;
  recipientEmail: string;
  candidateName: string;
  baseUrl: string;
}

export interface SendCVEmailResult {
  success: boolean;
  mode: "LIVE_SMTP" | "SIMULATION";
  sentTo: string;
}

export async function sendCVEmail(
  opts: SendCVEmailOptions
): Promise<SendCVEmailResult> {
  const { jobId, recipientEmail, candidateName, baseUrl } = opts;

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const isLive = !!smtpHost && !!smtpUser && !!smtpPass;

  const downloadUrl = `${baseUrl}/api/cv/jobs/${jobId}/download`;

  if (!isLive) {
    console.log(
      `[EmailService] SIMULATION — skipping real send to ${recipientEmail}. Link: ${downloadUrl}`
    );
    return { success: true, mode: "SIMULATION", sentTo: recipientEmail };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"AutoCV System" <${smtpUser}>`,
    to: recipientEmail,
    subject: `[AutoCV] Your ATS-Optimized Resume is Ready — ${candidateName}`,
    html: buildEmailHtml({ candidateName, downloadUrl }),
  });

  return { success: true, mode: "LIVE_SMTP", sentTo: recipientEmail };
}

function buildEmailHtml({
  candidateName,
  downloadUrl,
}: {
  candidateName: string;
  downloadUrl: string;
}): string {
  const timestamp = new Date().toUTCString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:Arial,sans-serif;color:#1e293b;background:#f8fafc;margin:0;padding:24px}
    .container{max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
    .header{background:#0f172a;color:#fff;padding:24px;text-align:center}
    .badge{display:inline-block;background:#2563eb;color:#fff;font-size:11px;font-weight:700;
           padding:4px 10px;border-radius:999px;text-transform:uppercase;margin-bottom:8px}
    .content{padding:28px 24px;line-height:1.6}
    .card{background:#f1f5f9;border-left:4px solid #2563eb;padding:14px;margin:18px 0;
          border-radius:0 8px 8px 0;font-size:13px}
    .btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
         font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;margin:18px 0}
    .footer{text-align:center;padding:18px;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">#HumanInTheLead Verified</div>
      <h2 style="margin:0;font-size:20px">AutoCV — Intelligent Resume Builder</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${candidateName}</strong>,</p>
      <p>Your ATS-compliant resume has been successfully generated and curated
         through the <strong>AutoCV Platform</strong>. It is now ready for download.</p>
      <div class="card">
        <strong>Delivery Summary</strong><br/>
        Recipient: ${candidateName}<br/>
        Format: ATS Single-Column — Verified<br/>
        Generated at: ${timestamp}
      </div>
      <p>Click the button below to download your resume PDF:</p>
      <a href="${downloadUrl}" class="btn">⬇&nbsp;Download My Resume</a>
      <p style="font-size:12px;color:#64748b">
        This link is valid while your session is active.
        If it expires, please generate a new resume from the AutoCV platform.
      </p>
      <p>Best regards,<br/><strong>The AutoCV Team</strong></p>
    </div>
    <div class="footer">
      Sent automatically by the AutoCV platform. The robot email step was bypassed.
    </div>
  </div>
</body>
</html>`;
}