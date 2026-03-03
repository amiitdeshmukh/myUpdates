import { generateJson } from "@/lib/llm";
import type { LearningPlan, UpdateItem } from "@/lib/types";

const defaultLearningPlan: LearningPlan = {
  topics: [
    "LLM agents and tool-calling design",
    "RAG evaluation and retrieval quality",
    "Production AI observability and guardrails"
  ],
  tasks: [
    "Build one small agent that calls 2 tools and writes a trace log of every step.",
    "Create a mini RAG benchmark with 20 QA pairs and measure answer grounding quality.",
    "Add latency, token, and failure-rate dashboards to one existing service."
  ],
  questions: [
    "What failure modes appear when an agent can call tools recursively, and how do you cap risk?",
    "How do you evaluate a RAG pipeline beyond exact-match accuracy?",
    "What are the tradeoffs between prompt caching, fine-tuning, and retrieval for domain adaptation?",
    "How would you design fallback behavior when an LLM endpoint degrades?",
    "Which metrics best indicate that an AI feature is helping users in production?"
  ]
};

function listUpdateHeadlines(updates: UpdateItem[]): string {
  return updates.map((u) => `- ${u.title} (${u.source})`).join("\n");
}

export async function buildLearningPlan(updates: UpdateItem[]): Promise<LearningPlan> {
  const profile =
    process.env.DEV_PROFILE ||
    "Software developer who wants to stay current with AI and modern engineering.";

  const prompt = `
You are creating a practical daily learning plan for a working software developer.
Developer profile: ${profile}
Recent important updates:
${listUpdateHeadlines(updates)}

Return strict JSON with keys:
- topics: string[] (exactly 3)
- tasks: string[] (exactly 3, action-oriented and doable in 30-90 minutes each)
- questions: string[] (exactly 5, interview/practical style)
`;

  const parsed = await generateJson<LearningPlan>(prompt);
  if (!parsed) return defaultLearningPlan;
  if (!Array.isArray(parsed.topics) || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.questions)) {
    return defaultLearningPlan;
  }
  if (parsed.topics.length < 3 || parsed.tasks.length < 3 || parsed.questions.length < 5) {
    return defaultLearningPlan;
  }
  return {
    topics: parsed.topics.slice(0, 3),
    tasks: parsed.tasks.slice(0, 3),
    questions: parsed.questions.slice(0, 5)
  };
}
