import { generateJson } from "@/lib/llm";
import type { QuizQuestion, UpdateItem } from "@/lib/types";

const fallbackQuiz: QuizQuestion[] = [
  {
    question: "In a RAG system, what does the retriever primarily do?",
    options: [
      "Find relevant chunks/documents for the user query",
      "Generate final text directly without context",
      "Train the embedding model from scratch",
      "Encrypt all user prompts before inference"
    ],
    answerIndex: 0,
    explanation: "Retriever selects relevant context; generator uses it to answer."
  },
  {
    question: "Which metric best detects hallucinations in grounded QA?",
    options: ["GPU utilization", "Citation faithfulness/grounding score", "Tokens per second", "API retries"],
    answerIndex: 1,
    explanation: "Grounding or faithfulness checks if claims are supported by retrieved evidence."
  },
  {
    question: "Why is chunk size important in RAG?",
    options: [
      "It controls CSS rendering of the frontend",
      "It affects retrieval relevance and context coverage",
      "It only matters for model fine-tuning",
      "It changes SMTP email deliverability"
    ],
    answerIndex: 1,
    explanation: "Bad chunking can either lose context or include too much noise."
  },
  {
    question: "What is the safest first step when building an AI feature for production?",
    options: [
      "Deploy directly with no logging",
      "Use largest model always",
      "Define eval set + guardrails + fallback behavior",
      "Skip human review entirely"
    ],
    answerIndex: 2,
    explanation: "Start with measurable quality, protection, and fallback before scaling traffic."
  },
  {
    question: "In LLM tool-calling, what reduces runaway behavior?",
    options: ["Unlimited recursive calls", "Strict step limits and tool allow-list", "Longer system prompts only", "Disabling retries"],
    answerIndex: 1,
    explanation: "Bounded steps and explicit tool constraints reduce failure and cost risks."
  }
];

function updatesToText(updates: UpdateItem[]): string {
  return updates.map((u) => `- ${u.title} (${u.source})`).join("\n");
}

export async function buildQuiz(updates: UpdateItem[]): Promise<QuizQuestion[]> {
  const prompt = `
Create a beginner-friendly but practical quiz for learning AI, LLMs, and RAG from scratch.
Recent update context:
${updatesToText(updates)}

Return strict JSON array of exactly 5 objects:
{
  "question": string,
  "options": string[] (exactly 4),
  "answerIndex": number (0 to 3),
  "explanation": string
}
`;

  const parsed = await generateJson<QuizQuestion[]>(prompt);
  if (!parsed || !Array.isArray(parsed) || parsed.length < 5) return fallbackQuiz;

  const valid = parsed.filter(
    (q) =>
      q &&
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.answerIndex === "number" &&
      q.answerIndex >= 0 &&
      q.answerIndex <= 3 &&
      typeof q.explanation === "string"
  );

  if (valid.length < 5) return fallbackQuiz;
  return valid.slice(0, 5);
}
