import OpenAI from "openai";

// Lazy singleton — build zamanında env yoksa hata vermesin
let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _client;
}
