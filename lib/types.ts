export type UpdateItem = {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  shortSummary: string;
  score: number;
};

export type LearningPlan = {
  topics: string[];
  tasks: string[];
  questions: string[];
};

export type WorkflowStep = {
  phase: string;
  goal: string;
  deliverable: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type DigestPayload = {
  generatedAt: string;
  topUpdates: UpdateItem[];
  learning: LearningPlan;
  workflow: WorkflowStep[];
  quiz: QuizQuestion[];
};
