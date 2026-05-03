import type { SentimentResult } from "@/types";

const THRESHOLD_MIN = 0.42;

const DEPTH_KEYWORDS = [
  // English
  "why", "meaning", "death", "dying", "live", "life", "soul", "lost",
  "fear", "gone", "leave", "farewell", "end", "begin", "door", "heaven",
  "forgive", "remember", "forget", "pain", "love", "alone", "time",
  "war", "peace", "dust", "shadow", "light", "dark", "silence",
  "cry", "hurt", "hope", "dream", "broken", "carry", "weight", "empty", "miss",
  "badge", "gun", "road", "river", "sunset", "desert", "cold", "wound",
  // Vietnam War Theme (English)
  "jungle", "rain", "monsoon", "mud", "chopper", "blood", "rifle", "soldier",
  "vietnam", "veteran", "hell", "desolate", "trauma", "ghost", "bunker",

  // Turkish
  "neden", "anlam", "ölüm", "yaşam", "ruh", "kayıp", "korku", "elveda",
  "son", "başlangıç", "kapı", "cennet", "affet", "hatırla", "unut",
  "acı", "aşk", "yalnız", "zaman", "savaş", "barış", "toz", "gölge",
  "ışık", "karanlık", "sessizlik", "ağla", "kır", "taşı", "ağırlık",
  "boş", "özle", "bırak", "geride", "geç", "köprü", "yol",
  // Vietnam War Theme (Turkish)
  "orman", "yağmur", "muson", "çamur", "helikopter", "kan", "tüfek", "asker",
  "vietnam", "gazi", "cehennem", "ıssız", "travma", "hayalet", "sığınak", "siper"
];

const SHALLOW_PATTERNS = [
  /^(hi|hello|hey|merhaba|selam|test|deneme|ok|okay|yes|no|evet|hayır)[\s!?.]*$/i,
  /^\d+$/,
  /^[!?.,\s]+$/,
  /^(lol|haha|hmm|umm|uh|hm|ah)[\s!?.]*$/i,
  /^(lütfen|aç|hadi|please|open)[\s!?.]*$/i,
];

export function countKeywordHits(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter((w) => DEPTH_KEYWORDS.some((k) => w.includes(k))).length;
}

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
    const negative = results.find((r) => r.label.toLowerCase() === "negative")?.score ?? 0;
    const positive = results.find((r) => r.label.toLowerCase() === "positive")?.score ?? 0;
    const neutral  = results.find((r) => r.label.toLowerCase() === "neutral")?.score ?? 0;

    // Weight emotional (negative-leaning) messages higher; penalise flat/neutral responses.
    return (negative * 0.6) + (positive * 0.3) + (neutral * 0.1);
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

  // Length factor: reaches maximum contribution at 30 words.
  score += Math.min(words.length / 30, 1) * 0.35;

  // Depth keyword matches: reaches maximum contribution at 5 hits.
  const hits = countKeywordHits(trimmed);
  score += Math.min(hits / 5, 1) * 0.45;

  // Genuine question adds 0.2.
  if (
    /[?]/.test(trimmed) ||
    /\b(why|what|how|who|neden|nasıl|kim|ne zaman)\b/i.test(trimmed)
  ) {
    score += 0.2;
  }

  return Math.min(score, 1);
}

export async function analyzeSentiment(message: string): Promise<SentimentResult> {
  const [depthScore, hfScore] = await Promise.all([
    Promise.resolve(scoreDepth(message)),
    fetchHuggingFaceSentiment(message),
  ]);

  const score =
    hfScore !== null
      ? depthScore * 0.7 + hfScore * 0.3 // ZORLAŞTIRILDI: Derinlik (uzunluk/kelime) çok daha önemli
      : depthScore;

  const label: SentimentResult["label"] =
    score < 0.3 ? "shallow" : score < THRESHOLD_MIN ? "seeking" : "sincere";

  return { score, label, passed: score >= THRESHOLD_MIN };
}

