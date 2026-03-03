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

  const topics = digest.learning.topics.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const tasks = digest.learning.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const questions = digest.learning.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const workflow = digest.workflow
    .map((w, i) => `${i + 1}. ${w.phase}\nGoal: ${w.goal}\nDeliverable: ${w.deliverable}`)
    .join("\n\n");
  const quiz = digest.quiz
    .map(
      (q, i) =>
        `${i + 1}. ${q.question}\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\nAnswer: ${String.fromCharCode(
          65 + q.answerIndex
        )}\nWhy: ${q.explanation}`
    )
    .join("\n\n");

  return `
Daily Dev Edge Report
Generated: ${digest.generatedAt}

1) Important Updates (Top ${digest.topUpdates.length})
${top}

2) What To Learn Next
Topics:
${topics}

Today's Tasks:
${tasks}

Practice Questions:
${questions}

3) LLM/RAG From-Scratch Workflow
${workflow}

4) Quiz
${quiz}

Reminder:
Did you complete today's tasks? Reply to this email with: YES or NO.
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
    subject: "Daily Dev Edge: Updates, Learning, and Check-in",
    text: buildEmailBody(digest)
  });
}
