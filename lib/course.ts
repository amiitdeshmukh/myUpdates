export type PhaseQuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type CoursePhase = {
  id: number;
  title: string;
  duration: string;
  whyItMatters: string;
  outcomes: string[];
  tasks: string[];
  prompts: string[];
  quiz: PhaseQuizQuestion[];
};


export const PASS_SCORE = 11;

function codingQuestionsForPhase(phaseTitle: string): PhaseQuizQuestion[] {
  return [
    {
      question: `You are implementing "${phaseTitle}". What is the best first coding step?`,
      options: [
        "Write a minimal reproducible script and verify one happy-path output",
        "Start with UI animation",
        "Skip logging until production",
        "Add concurrency before correctness"
      ],
      answerIndex: 0,
      explanation: "Start small and verify correctness before scaling complexity."
    },
    {
      question: "For reliable LLM integrations, which pattern is most useful in code?",
      options: ["No exception handling", "Retry + timeout + typed error handling", "Global mutable state", "Hard-coded magic strings"],
      answerIndex: 1,
      explanation: "Robust wrappers prevent transient failures from breaking workflows."
    },
    {
      question: "When parsing model JSON output, what should your code do first?",
      options: ["Directly cast without checks", "Validate against schema and fallback on failure", "Ignore parse errors", "Use eval()"],
      answerIndex: 1,
      explanation: "Schema validation protects downstream logic from malformed outputs."
    },
    {
      question: "Which data structure is best for deduplicating retrieved document IDs quickly?",
      options: ["Array scan each time", "Set/HashSet", "Linked list", "Queue"],
      answerIndex: 1,
      explanation: "Hash-based sets provide fast membership checks."
    },
    {
      question: "In Python, how do you best organize provider integrations?",
      options: [
        "One giant function with if-else chains",
        "Interface/abstract base + provider-specific adapters",
        "Duplicate logic in every endpoint",
        "Only environment variables without wrappers"
      ],
      answerIndex: 1,
      explanation: "Adapter-style design keeps integrations testable and extensible."
    },
    {
      question: "Which test type gives quickest confidence for LLM pipeline logic?",
      options: [
        "Only end-to-end tests with live APIs",
        "Unit tests with mocked provider responses + small integration tests",
        "No tests, manual checks only",
        "UI snapshot tests only"
      ],
      answerIndex: 1,
      explanation: "Mocked unit tests are fast; targeted integration tests catch wiring issues."
    },
    {
      question: "Best way to compare vector similarity in code for retrieval?",
      options: ["String equality", "Cosine similarity or dot-product on normalized vectors", "HTTP status code", "Sorting by document length"],
      answerIndex: 1,
      explanation: "Vector distance/similarity metrics are core for embedding retrieval."
    },
    {
      question: "When should you add caching to LLM calls?",
      options: [
        "Before measuring anything",
        "After identifying repeated prompts/queries and measuring hit-rate impact",
        "Never",
        "Only for frontend routes"
      ],
      answerIndex: 1,
      explanation: "Caching should be evidence-driven to avoid unnecessary complexity."
    },
    {
      question: "What is the safest way to store API keys in apps?",
      options: ["Hard-code in source", "Use environment variables/secret manager", "Commit .env to git", "Send keys to client UI"],
      answerIndex: 1,
      explanation: "Secrets belong in secure runtime configuration, not source control."
    },
    {
      question: "For performance debugging, which log set is most useful?",
      options: [
        "Only final answer text",
        "Request id, model, tokens in/out, latency, error class",
        "Browser user agent only",
        "Random debug strings"
      ],
      answerIndex: 1,
      explanation: "Structured telemetry helps identify latency, quality, and reliability bottlenecks."
    }
  ];
}

const BASE_PHASES: CoursePhase[] = [
  {
    id: 1,
    title: "Foundations: AI, ML, DL, Transformers, Tokens, Embeddings",
    duration: "Week 1",
    whyItMatters:
      "You already know Python/C#/Java and basic DSA, so this phase gives the core mental model needed before touching LLM frameworks.",
    outcomes: [
      "Explain AI vs ML vs Deep Learning in practical terms.",
      "Explain transformer attention at a conceptual level.",
      "Understand tokenization and why context window matters.",
      "Understand embeddings and cosine similarity for retrieval."
    ],
    tasks: [
      "Write one note: 'How an LLM answers a question' in 12-15 bullet points.",
      "Build a tiny Python script that tokenizes text with any tokenizer library and prints token counts.",
      "Create a toy embedding demo that compares 10 sentences by cosine similarity."
    ],
    prompts: [
      "Teach me AI, ML, and Deep Learning from scratch for a software engineer who knows Python/C#/Java. Use analogies, then technical definitions, then 10 interview questions with answers.",
      "Explain transformers and attention step by step without skipping math intuition. Then give me a simple pseudo-code forward pass.",
      "Teach me tokenization deeply: BPE/WordPiece basics, why token count drives cost and latency, and how prompt length affects quality.",
      "Give me a practical tutorial on embeddings + cosine similarity and a minimal Python implementation."
    ],
    quiz: [
      {
        question: "What is the main purpose of embeddings in LLM applications?",
        options: [
          "To compress model weights during training",
          "To convert text into vectors for semantic comparison/retrieval",
          "To replace tokenization entirely",
          "To encrypt prompts sent to APIs"
        ],
        answerIndex: 1,
        explanation: "Embeddings map text to vectors so semantic similarity can be computed."
      },
      {
        question: "Why does context window size matter?",
        options: [
          "It controls GPU fan speed",
          "It determines how many characters can be rendered in UI",
          "It limits how much tokenized input the model can consider",
          "It only affects training, never inference"
        ],
        answerIndex: 2,
        explanation: "The model can only attend to tokens inside its context window."
      },
      {
        question: "Attention in transformers primarily helps with:",
        options: [
          "Selecting relevant relationships between tokens",
          "Replacing gradient descent",
          "Compressing datasets into zip files",
          "Improving SMTP delivery"
        ],
        answerIndex: 0,
        explanation: "Attention computes token-to-token relevance for contextual representation."
      },
      {
        question: "Which statement is true about tokens?",
        options: [
          "1 token is always 1 word",
          "Token count strongly affects inference cost and latency",
          "Tokens are only used in embeddings, not prompts",
          "Programming languages do not affect token usage"
        ],
        answerIndex: 1,
        explanation: "Billing and latency are typically tied to input/output token counts."
      },
      {
        question: "Cosine similarity is used to:",
        options: [
          "Measure angular similarity between vectors",
          "Compute exact keyword overlap only",
          "Train language models from scratch",
          "Replace reranking in all RAG pipelines"
        ],
        answerIndex: 0,
        explanation: "Cosine similarity compares vector direction, useful for semantic matching."
      }
    ]
  },
  {
    id: 2,
    title: "LLM API Engineering Basics",
    duration: "Week 2",
    whyItMatters:
      "This phase turns theory into code: robust API calls, structured outputs, retries, logging, and cost awareness.",
    outcomes: [
      "Build reliable API wrappers with timeout/retry/backoff.",
      "Use system/user prompts cleanly.",
      "Capture latency and token usage metrics.",
      "Handle malformed JSON and fallback paths."
    ],
    tasks: [
      "Create a provider-agnostic client (Gemini/OpenAI style) with retries and error classes.",
      "Implement strict JSON-output parsing with schema validation.",
      "Log model, latency, tokens, and failures to a CSV file."
    ],
    prompts: [
      "Teach me how to design a production-grade LLM API client in Python with retries, exponential backoff, timeout, and typed errors.",
      "Show me how to enforce JSON outputs from LLMs and validate them with a schema. Include fallback when JSON is invalid.",
      "Create a checklist for LLM API reliability, observability, and cost tracking for a backend engineer."
    ],
    quiz: [
      {
        question: "Why use exponential backoff when calling LLM APIs?",
        options: [
          "To increase token generation speed",
          "To handle transient failures/rate limits safely",
          "To improve embedding quality",
          "To avoid using API keys"
        ],
        answerIndex: 1,
        explanation: "Backoff reduces pressure during transient errors and rate-limit events."
      },
      {
        question: "Best way to protect downstream logic from malformed model output?",
        options: [
          "Assume output always valid",
          "Use schema validation and fallback response path",
          "Increase temperature to 1.0",
          "Disable retries"
        ],
        answerIndex: 1,
        explanation: "Schema validation catches contract breaks before business logic runs."
      },
      {
        question: "Which metric is most useful for cost control?",
        options: ["Token usage per request", "CPU temperature", "HTTP header count", "Disk seek latency"],
        answerIndex: 0,
        explanation: "Token usage maps directly to spend for most LLM APIs."
      },
      {
        question: "What should a system prompt mainly do?",
        options: [
          "Define durable behavior constraints and role",
          "Store API keys",
          "Replace schema validation",
          "Increase context window"
        ],
        answerIndex: 0,
        explanation: "System prompt sets global behavior boundaries and policy."
      },
      {
        question: "A robust LLM call path should include:",
        options: [
          "Single attempt only",
          "Retry, timeout, and explicit failure handling",
          "No logging",
          "Hard-coded random model selection"
        ],
        answerIndex: 1,
        explanation: "Resilience requires retry, timeout, and deterministic error handling."
      }
    ]
  },
  {
    id: 3,
    title: "Prompt Engineering and Evaluation",
    duration: "Week 3",
    whyItMatters: "You need repeatable quality, not ad-hoc prompting.",
    outcomes: [
      "Use templates for summarization, classification, extraction, and reasoning.",
      "Design eval datasets and score outputs.",
      "Measure hallucination and format compliance."
    ],
    tasks: [
      "Create 30 prompt-test cases for one feature.",
      "Build a simple evaluator that scores correctness and JSON validity.",
      "Run A/B comparison of two prompt templates."
    ],
    prompts: [
      "Teach me prompt engineering as an engineering discipline, not tips and tricks. Include templates and anti-patterns.",
      "Help me design an evaluation set for an LLM feature with at least 30 test cases and scoring rubrics.",
      "Show me how to detect hallucinations in non-RAG and RAG outputs."
    ],
    quiz: [
      {
        question: "What is a strong sign your prompt is production-ready?",
        options: [
          "Works once on one example",
          "Performs consistently across a fixed eval set",
          "Uses the largest model only",
          "Has long instructions"
        ],
        answerIndex: 1,
        explanation: "Consistency on representative eval cases is what matters."
      },
      {
        question: "Why run A/B prompt tests?",
        options: [
          "To compare quality/latency/cost tradeoffs objectively",
          "To increase randomness",
          "To avoid datasets",
          "To remove retries"
        ],
        answerIndex: 0,
        explanation: "A/B testing quantifies improvements and regressions."
      },
      {
        question: "Good eval sets should be:",
        options: ["Tiny and vague", "Static and never updated", "Representative of real user queries", "Only easy questions"],
        answerIndex: 2,
        explanation: "They should mirror real usage and failure modes."
      },
      {
        question: "Format compliance means:",
        options: [
          "Answer sounds smart",
          "Output matches required schema/structure",
          "Prompt has many tokens",
          "Model never refuses"
        ],
        answerIndex: 1,
        explanation: "Compliance checks contract validity for downstream systems."
      },
      {
        question: "Hallucination risk is reduced by:",
        options: ["No evaluation", "Grounded context and explicit uncertainty handling", "Higher temperature only", "Bigger JSON"],
        answerIndex: 1,
        explanation: "Grounding and uncertainty rules reduce unsupported claims."
      }
    ]
  },
  {
    id: 4,
    title: "RAG Core Pipeline",
    duration: "Week 4",
    whyItMatters: "RAG is the most common enterprise LLM pattern.",
    outcomes: [
      "Build ingest -> chunk -> embed -> index -> retrieve -> generate pipeline.",
      "Add source citations in answers.",
      "Evaluate retrieval quality."
    ],
    tasks: [
      "Index at least 50 internal docs.",
      "Implement top-k retrieval and citation formatting.",
      "Measure Recall@k on a small labeled query set."
    ],
    prompts: [
      "Teach me RAG from zero as a backend engineer. Cover architecture, chunking, embedding, vector DB, retrieval, and answer generation.",
      "Give me a full Python mini-project plan for RAG with milestones, file structure, and tests.",
      "Explain how to evaluate retrieval quality (Recall@k, MRR, nDCG) with simple examples."
    ],
    quiz: [
      {
        question: "In RAG, the retriever does what?",
        options: [
          "Generates final answer directly",
          "Finds relevant context chunks/documents",
          "Trains the base model",
          "Encrypts vector DB"
        ],
        answerIndex: 1,
        explanation: "Retriever selects relevant evidence, generator synthesizes response."
      },
      {
        question: "Why include citations in RAG output?",
        options: ["For UI decoration", "For traceability and trust", "To reduce token count only", "To avoid chunking"],
        answerIndex: 1,
        explanation: "Citations let users verify claim-to-source mapping."
      },
      {
        question: "Chunk size affects:",
        options: ["Only CSS layout", "Retrieval precision/recall balance", "SMTP auth", "Language runtime speed only"],
        answerIndex: 1,
        explanation: "Chunk strategy heavily influences retrieval effectiveness."
      },
      {
        question: "Which is retrieval quality metric?",
        options: ["Recall@k", "Frames per second", "Heap fragmentation", "GC pause time"],
        answerIndex: 0,
        explanation: "Recall@k measures whether relevant docs appear in top-k results."
      },
      {
        question: "RAG mainly helps with:",
        options: ["Hardware acceleration", "Grounding answers in external/private knowledge", "Replacing APIs", "Database migrations"],
        answerIndex: 1,
        explanation: "RAG injects retrieval context at inference time."
      }
    ]
  },
  {
    id: 5,
    title: "Advanced RAG Optimization",
    duration: "Week 5",
    whyItMatters: "Baseline RAG often fails; this phase improves relevance and robustness.",
    outcomes: [
      "Use hybrid retrieval (dense + keyword).",
      "Add reranking and query rewriting.",
      "Improve chunking heuristics."
    ],
    tasks: [
      "Benchmark dense vs hybrid vs reranked retrieval.",
      "Implement query expansion/rewriting.",
      "Publish a before/after quality report."
    ],
    prompts: [
      "Teach me advanced RAG techniques: hybrid search, reranking, parent-child chunking, and query rewriting with implementation guidance.",
      "Give me an experiment plan to improve a weak RAG system and measure gains rigorously.",
      "Explain common RAG failure modes and mitigation patterns."
    ],
    quiz: [
      {
        question: "Hybrid retrieval combines:",
        options: ["Dense vectors and keyword/BM25 retrieval", "Only two LLMs", "SQL and NoSQL writes", "Client and server caches"],
        answerIndex: 0,
        explanation: "Hybrid search captures both lexical and semantic matches."
      },
      {
        question: "Reranking is useful because it:",
        options: [
          "Sorts retrieved candidates with finer relevance modeling",
          "Rewrites prompts automatically",
          "Reduces API auth errors",
          "Eliminates need for chunking"
        ],
        answerIndex: 0,
        explanation: "Rerankers improve final top results quality."
      },
      {
        question: "Query rewriting can help when:",
        options: [
          "User query is vague or underspecified",
          "SMTP server is down",
          "Tokenizer fails to load",
          "GPU memory is high"
        ],
        answerIndex: 0,
        explanation: "Rewriting clarifies intent for better retrieval."
      },
      {
        question: "A good RAG optimization process should:",
        options: ["Rely on intuition only", "Use controlled experiments with metrics", "Avoid baselines", "Skip error analysis"],
        answerIndex: 1,
        explanation: "Metrics-driven iteration is required for reliable gains."
      },
      {
        question: "Parent-child chunking aims to:",
        options: [
          "Balance local relevance with broader document context",
          "Increase SMTP throughput",
          "Remove embeddings entirely",
          "Force longer prompts always"
        ],
        answerIndex: 0,
        explanation: "It retrieves precise spans while preserving larger context."
      }
    ]
  },
  {
    id: 6,
    title: "Agents, Tool Calling, and Orchestration",
    duration: "Week 6",
    whyItMatters: "Real systems need tools, state, and controlled autonomy.",
    outcomes: [
      "Implement tool calling with schema contracts.",
      "Design bounded multi-step agent loops.",
      "Log reasoning traces safely."
    ],
    tasks: [
      "Build an agent using search + calculator + DB lookup tools.",
      "Set max step count and tool allow-list.",
      "Create failure fallbacks for tool errors/timeouts."
    ],
    prompts: [
      "Teach me agentic LLM architecture from scratch for backend developers. Include planning, execution loop, tool schemas, and stop conditions.",
      "Show me how to prevent runaway tool-calling with strict limits and guardrails.",
      "Give me a reference implementation plan for a 3-tool agent with observability."
    ],
    quiz: [
      {
        question: "Best control to prevent runaway agent loops?",
        options: ["More verbose prompts", "Step limit and termination criteria", "Larger context window", "Disable logs"],
        answerIndex: 1,
        explanation: "Bounded loops and stop rules cap risk and cost."
      },
      {
        question: "Tool schema validation is important because:",
        options: [
          "It ensures safe/expected tool inputs and outputs",
          "It improves internet speed",
          "It replaces authentication",
          "It removes need for monitoring"
        ],
        answerIndex: 0,
        explanation: "Schemas enforce contracts and reduce runtime surprises."
      },
      {
        question: "Agent observability should include:",
        options: ["Only final answer", "Per-step tool calls, latency, and errors", "CSS classes", "SMTP retries only"],
        answerIndex: 1,
        explanation: "Step-level traces are essential for debugging and evaluation."
      },
      {
        question: "Tool allow-list helps with:",
        options: ["Security and behavior control", "Longer responses", "Embedding compression", "Prompt decoration"],
        answerIndex: 0,
        explanation: "Restricting tool access reduces misuse and unexpected actions."
      },
      {
        question: "Fallback behavior is required when:",
        options: ["Everything always succeeds", "Tools/LLM fail or timeout", "CPU usage is low", "UI is hidden"],
        answerIndex: 1,
        explanation: "Reliable systems degrade gracefully under failure."
      }
    ]
  },
  {
    id: 7,
    title: "Production, Safety, and Cost Engineering",
    duration: "Week 7",
    whyItMatters: "Shipping AI features safely at scale is mostly engineering discipline.",
    outcomes: [
      "Define safety checks and policy boundaries.",
      "Track SLOs, costs, and failure rates.",
      "Implement fallback model or non-LLM fallback."
    ],
    tasks: [
      "Add dashboards: latency p95, token cost, success rate, fallback rate.",
      "Implement content safety and prompt injection checks.",
      "Document incident response for LLM degradation."
    ],
    prompts: [
      "Teach me how to productionize LLM features with SLOs, monitoring, fallback, and on-call readiness.",
      "Give me a practical prompt-injection defense plan for RAG and tool-calling systems.",
      "Show me cost optimization techniques without sacrificing too much quality."
    ],
    quiz: [
      {
        question: "Which metric is critical for user experience?",
        options: ["p95 latency", "Disk sector size", "GPU fan RPM", "CSS animation count"],
        answerIndex: 0,
        explanation: "Latency heavily impacts perceived responsiveness."
      },
      {
        question: "Prompt injection defense is important in RAG because:",
        options: [
          "Retrieved content may contain malicious instructions",
          "Embeddings are always unsafe",
          "It removes need for schema validation",
          "It only affects frontend code"
        ],
        answerIndex: 0,
        explanation: "External content can attempt to override system intent."
      },
      {
        question: "Fallback strategy provides:",
        options: [
          "Guaranteed perfect quality",
          "Resilience when primary path degrades",
          "No need for alerts",
          "Lower security requirements"
        ],
        answerIndex: 1,
        explanation: "Fallbacks keep service usable during partial outages."
      },
      {
        question: "Cost-aware design includes:",
        options: [
          "Ignoring token usage",
          "Measuring cost per successful task",
          "Always using largest model",
          "Disabling retries"
        ],
        answerIndex: 1,
        explanation: "Cost should be tied to delivered value/outcome."
      },
      {
        question: "Safety policy should be:",
        options: [
          "Implicit and undocumented",
          "Explicit, testable, and enforced in code",
          "Model-dependent only",
          "Optional in production"
        ],
        answerIndex: 1,
        explanation: "Policies need deterministic enforcement paths."
      }
    ]
  },
  {
    id: 8,
    title: "Portfolio, Interview Prep, and Career Positioning",
    duration: "Week 8",
    whyItMatters: "You need demonstrable proof of skill for growth and job resilience.",
    outcomes: [
      "Build two portfolio-grade AI projects.",
      "Write architecture docs and tradeoff decisions.",
      "Prepare interview stories and system design walkthroughs."
    ],
    tasks: [
      "Publish one RAG app and one agent app on GitHub.",
      "Create one architecture decision record (ADR) per project.",
      "Practice 20 interview questions and record concise answers."
    ],
    prompts: [
      "Act as an AI interview coach. Ask me senior-level LLM/RAG system design questions and critique my answers ruthlessly.",
      "Help me turn my LLM projects into portfolio case studies with architecture diagrams, metrics, and tradeoffs.",
      "Generate a 2-week interview prep plan for AI engineer roles given my background in Python/C#/Java."
    ],
    quiz: [
      {
        question: "A strong AI portfolio project should include:",
        options: [
          "Only UI screenshots",
          "Architecture, metrics, tradeoffs, and repo",
          "No documentation",
          "No evaluation results"
        ],
        answerIndex: 1,
        explanation: "Employers evaluate engineering depth and decision quality."
      },
      {
        question: "Interview storytelling is strongest when you:",
        options: [
          "Avoid failures",
          "Explain context, constraints, choices, and measurable outcomes",
          "Only discuss tools used",
          "Focus on buzzwords"
        ],
        answerIndex: 1,
        explanation: "Structured stories show judgment and impact."
      },
      {
        question: "For job resilience, best strategy is:",
        options: ["Passive learning only", "Build and ship visible projects with evidence", "Memorize theory only", "Avoid open-source"],
        answerIndex: 1,
        explanation: "Proof of execution matters most."
      },
      {
        question: "A useful architecture doc should contain:",
        options: ["Only API keys", "Problem statement, design, tradeoffs, risks, metrics", "Marketing copy", "Random screenshots"],
        answerIndex: 1,
        explanation: "Decision rationale is core to engineering communication."
      },
      {
        question: "Final phase success means:",
        options: [
          "You read many blogs",
          "You can design, build, evaluate, and explain LLM/RAG systems end-to-end",
          "You know one framework command",
          "You rely fully on AI tools"
        ],
        answerIndex: 1,
        explanation: "End-to-end capability is the objective."
      }
    ]
  }
];

export const COURSE_PHASES: CoursePhase[] = BASE_PHASES.map((phase) => {
  const coding = codingQuestionsForPhase(phase.title);
  return {
    ...phase,
    quiz: [...phase.quiz, ...coding].slice(0, 15)
  };
});
