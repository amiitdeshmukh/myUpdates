import type { WorkflowStep } from "@/lib/types";

const defaultWorkflow: WorkflowStep[] = [
  {
    phase: "Phase 1: Foundations (Week 1)",
    goal: "Understand AI, ML, deep learning, transformers, tokens, and embeddings.",
    deliverable: "Write a one-page note explaining tokenization, attention, and embeddings in your own words."
  },
  {
    phase: "Phase 2: LLM API Basics (Week 2)",
    goal: "Call a hosted LLM API, structure prompts, and handle retries/errors.",
    deliverable: "Build a CLI tool that summarizes text and logs prompt, response time, and token usage."
  },
  {
    phase: "Phase 3: Prompting + Evaluation (Week 3)",
    goal: "Learn prompting patterns and basic offline eval.",
    deliverable: "Create 25 test prompts and score outputs for correctness, format, and hallucination risk."
  },
  {
    phase: "Phase 4: RAG Fundamentals (Week 4)",
    goal: "Index docs, chunk text, embed, retrieve top-k context, and answer grounded queries.",
    deliverable: "Ship a mini RAG chatbot on one private knowledge base with citation links."
  },
  {
    phase: "Phase 5: Advanced RAG (Week 5)",
    goal: "Improve retrieval with better chunking, hybrid search, reranking, and query rewriting.",
    deliverable: "Benchmark 3 retrieval strategies and publish a comparison table."
  },
  {
    phase: "Phase 6: Agents + Tools (Week 6)",
    goal: "Build tool-calling agents with clear limits and fail-safe behavior.",
    deliverable: "Create an agent that uses search + calculator + db lookup with a step trace."
  },
  {
    phase: "Phase 7: Production Readiness (Week 7)",
    goal: "Add guardrails, monitoring, latency budgets, and cost controls.",
    deliverable: "Add dashboards for latency, token spend, success rate, and fallback rate."
  },
  {
    phase: "Phase 8: Portfolio + Interview Prep (Week 8)",
    goal: "Package your learnings into demonstrable projects and interview stories.",
    deliverable: "Publish 2 AI projects and a concise architecture write-up for each."
  }
];

export function buildWorkflowFromScratch(): WorkflowStep[] {
  return defaultWorkflow;
}
