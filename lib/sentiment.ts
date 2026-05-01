import type { SentimentResult } from "@/types";

const THRESHOLD_MIN = 0.4;

const DEPTH_KEYWORDS = [
  // English
  "why", "meaning", "death", "dying", "live", "life", "soul", "lost",
  "fear", "gone", "leave", "farewell", "end", "begin", "door", "heaven",
  "forgive", "remember", "forget", "pain", "love", "alone", "time",
  "war", "peace", "dust", "shadow", "light", "dark", "silence",
  "cry", "hurt", "hope", "dream", "broken", "carry", "weight", "empty", "miss",
  "badge", "gun", "road", "river", "sunset", "desert", "cold", "wound",
  // Turkish
  "neden", "anlam", "ölüm", "yaşam", "ruh", "kayıp", "korku", "elveda",
  "son", "başlangıç", "kapı", "cennet", "affet", "hatırla", "unut",
  "acı", "aşk", "yalnız", "zaman", "savaş", "barış", "toz", "gölge",
  "ışık", "karanlık", "sessizlik", "ağla", "kır", "taşı", "ağırlık",
  "boş", "özle", "bırak", "geride", "geç", "köprü", "yol",
];

const SHALLOW_PATTERNS = [
  /^(hi|hello|hey|merhaba|selam|test|deneme|ok|okay|yes|no|evet|hayır)[\s!?.]*$/i,
  /^\d+$/,
  /^[!?.,\s]+$/,
  /^(lol|haha|hmm|umm|uh|hm|ah)[\s!?.]*$/i,
];

async function fetchHuggingFaceSentiment(text: string): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ inputs: text }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

    const results = data[0] as { label: string; score: number }[];
    const positive = results.find((r) => r.label.toLowerCase() === "positive")?.score ?? 0;
    const neutral  = results.find((r) => r.label.toLowerCase() === "neutral")?.score ?? 0;
    // Positive + neutral indicate non-trivial emotional engagement
    return positive * 0.5 + neutral * 0.5;
  } catch {
    return null;
  }
}

function scoreDepth(message: string): number {
  const trimmed = message.trim();

  for (const p of SHALLOW_PATTERNS) {
    if (p.test(trimmed)) return 0;
  }

  const words = trimmed.toLowerCase().split(/\s+/);
  let score = 0;

  // Length factor: reaches max at 20 words (0.3)
  score += Math.min(words.length / 20, 1) * 0.3;

  // Depth keyword matches: reaches max at 3 hits (0.4)
  const hits = words.filter((w) =>
    DEPTH_KEYWORDS.some((k) => w.includes(k))
  ).length;
  score += Math.min(hits / 3, 1) * 0.4;

  // Contains a genuine question (0.2)
  if (
    /[?]/.test(trimmed) ||
    /\b(why|what|how|who|neden|nasıl|kim|ne zaman)\b/i.test(trimmed)
  ) {
    score += 0.2;
  }

  // Lowercase sincerity signal: not shouting (0.1)
  if (trimmed === trimmed.toLowerCase()) score += 0.1;

  return Math.min(score, 1);
}

export async function analyzeSentiment(message: string): Promise<SentimentResult> {
  const [depthScore, hfScore] = await Promise.all([
    Promise.resolve(scoreDepth(message)),
    fetchHuggingFaceSentiment(message),
  ]);

  const score =
    hfScore !== null
      ? depthScore * 0.5 + hfScore * 0.5
      : depthScore;

  const label: SentimentResult["label"] =
    score < 0.2 ? "shallow" : score < THRESHOLD_MIN ? "seeking" : "sincere";

  return { score, label, passed: score >= THRESHOLD_MIN };
}
