import { generateJson } from "@/lib/llm";
import type { UpdateItem } from "@/lib/types";

export async function improveSummaries(updates: UpdateItem[]): Promise<UpdateItem[]> {
  if (updates.length === 0) return updates;

  const prompt = `
Rewrite each item into a concise, high-signal summary for a busy developer.
Return strict JSON array with objects: { "title": string, "summary": string }.
Max 30 words per summary.

Items:
${updates.map((u, i) => `${i + 1}. ${u.title} | ${u.shortSummary}`).join("\n")}
`;

  const parsed = await generateJson<Array<{ title: string; summary: string }>>(prompt);
  if (!parsed || !Array.isArray(parsed)) return updates;

  const byTitle = new Map(
    parsed
      .filter((p) => p && typeof p.title === "string" && typeof p.summary === "string")
      .map((p) => [p.title.toLowerCase().trim(), p.summary])
  );

  return updates.map((u) => ({
    ...u,
    shortSummary: byTitle.get(u.title.toLowerCase().trim()) ?? u.shortSummary
  }));
}
