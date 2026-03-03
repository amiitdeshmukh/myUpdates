import OpenAI from "openai";

type Provider = "openai" | "gemini";

const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase() as Provider;
const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const openaiClient =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  const startCandidates = [firstBrace, firstBracket].filter((x) => x >= 0);
  if (startCandidates.length === 0) return trimmed;
  const start = Math.min(...startCandidates);
  return trimmed.slice(start).trim();
}

async function generateWithOpenAI(prompt: string): Promise<string | null> {
  if (!openaiClient) return null;
  const response = await openaiClient.responses.create({
    model: openaiModel,
    input: `${prompt}\n\nOutput must be strict JSON only. No markdown or extra text.`
  });
  return response.output_text ?? null;
}

async function generateWithGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length === 0) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(
    key
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${prompt}\n\nOutput must be strict JSON only. No markdown or extra text.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? null;
}

export async function generateJson<T>(prompt: string): Promise<T | null> {
  try {
    const raw =
      provider === "openai" ? await generateWithOpenAI(prompt) : await generateWithGemini(prompt);
    if (!raw) return null;
    const json = extractJson(raw);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
