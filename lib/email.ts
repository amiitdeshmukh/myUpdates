import nodemailer from "nodemailer";

import type { DigestPayload } from "@/lib/types";

function assertEmailEnv() {
  const required = [
    "EMAIL_FROM",
    "EMAIL_TO",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD"
  ] as const;
  const missing = required.filter((k) => !process.env[k] || process.env[k]?.trim().length === 0);
  if (missing.length > 0) {
    throw new Error(`Missing email config: ${missing.join(", ")}`);
  }
}

function buildEmailBody(digest: DigestPayload): string {
  const top = digest.topUpdates
    .map(
      (u, i) =>
        `${i + 1}. ${u.title}\nSummary: ${u.shortSummary}\nSource: ${u.source}\nReference: ${u.link}`
    )
    .join("\n\n");

  return `
Daily Dev Edge Digest
Generated: ${digest.generatedAt}

Important Updates (Top ${digest.topUpdates.length})
${top}
`.trim();
}

export async function sendReminderEmail(digest: DigestPayload): Promise<void> {
  assertEmailEnv();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: "Daily Dev Edge Digest",
    text: buildEmailBody(digest)
  });
}
