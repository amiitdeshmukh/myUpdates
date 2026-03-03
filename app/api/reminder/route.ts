import { NextRequest, NextResponse } from "next/server";

import { buildDigest } from "@/lib/digest";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const header = req.headers.get("x-cron-secret");
  const auth = req.headers.get("authorization");
  return header === cronSecret || auth === `Bearer ${cronSecret}`;
}

async function handleSend(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const digest = await buildDigest();
    await sendReminderEmail(digest);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send reminder" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSend(req);
}

export async function POST(req: NextRequest) {
  return handleSend(req);
}
