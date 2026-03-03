import { NextResponse } from "next/server";

import { buildDigest } from "@/lib/digest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const digest = await buildDigest();
    return NextResponse.json(digest);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build digest" },
      { status: 500 }
    );
  }
}
