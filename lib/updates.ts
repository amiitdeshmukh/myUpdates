import Parser from "rss-parser";

import type { UpdateItem } from "@/lib/types";

const parser = new Parser();

const SOURCES = [
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml" },
  { name: "Anthropic News", url: "https://www.anthropic.com/news/rss.xml" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml" },
  { name: "arXiv cs.AI", url: "https://export.arxiv.org/rss/cs.AI" }
];

const IMPORTANT_KEYWORDS: Record<string, number> = {
  release: 4,
  model: 4,
  gpt: 4,
  claude: 4,
  gemini: 4,
  benchmark: 3,
  security: 3,
  vulnerability: 3,
  reasoning: 3,
  agent: 2,
  inference: 2,
  eval: 2,
  api: 2
};

function scoreImportance(title: string, summary: string, published?: string): number {
  const text = `${title} ${summary}`.toLowerCase();
  let score = 0;

  Object.entries(IMPORTANT_KEYWORDS).forEach(([keyword, weight]) => {
    if (text.includes(keyword)) score += weight;
  });

  if (published) {
    const dt = new Date(published);
    if (!Number.isNaN(dt.getTime())) {
      const hoursOld = (Date.now() - dt.getTime()) / 3_600_000;
      if (hoursOld <= 24) score += 4;
      else if (hoursOld <= 72) score += 2;
      else if (hoursOld <= 7 * 24) score += 1;
    }
  }

  return score;
}

function shortText(text: string, maxLen = 220): string {
  const cleaned = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 3)}...`;
}

export async function fetchTopUpdates(topN: number): Promise<UpdateItem[]> {
  const all: UpdateItem[] = [];

  await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        feed.items.slice(0, 10).forEach((item) => {
          const title = (item.title ?? "").trim();
          const link = (item.link ?? "").trim();
          if (!title || !link) return;
          const rawSummary = (item.contentSnippet || item.content || "").trim();
          const shortSummary = shortText(rawSummary || title);
          const publishedAt = item.isoDate || item.pubDate;
          all.push({
            title,
            link,
            source: source.name,
            publishedAt,
            shortSummary,
            score: scoreImportance(title, rawSummary, publishedAt)
          });
        });
      } catch {
        // Ignore single-source failures so the app remains resilient.
      }
    })
  );

  const dedup = new Map<string, UpdateItem>();
  all.forEach((item) => {
    const key = item.title.toLowerCase().trim();
    const current = dedup.get(key);
    if (!current || current.score < item.score) dedup.set(key, item);
  });

  return Array.from(dedup.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(topN, 1));
}
