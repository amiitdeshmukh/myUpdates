import { buildLearningPlan } from "@/lib/learning";
import { buildQuiz } from "@/lib/quiz";
import { improveSummaries } from "@/lib/summaries";
import type { DigestPayload } from "@/lib/types";
import { fetchTopUpdates } from "@/lib/updates";
import { buildWorkflowFromScratch } from "@/lib/workflow";

export async function buildDigest(): Promise<DigestPayload> {
  const topN = Number(process.env.TOP_UPDATES || "2");
  const updates = await fetchTopUpdates(topN);
  const summarized = await improveSummaries(updates);
  const learning = await buildLearningPlan(summarized);
  const workflow = buildWorkflowFromScratch();
  const quiz = await buildQuiz(summarized);

  return {
    generatedAt: new Date().toISOString(),
    topUpdates: summarized,
    learning,
    workflow,
    quiz
  };
}
