import OpenAI from "openai";

let _client: OpenAI | null = null;
let _model: string = "gpt-4o";

export function getAIConfig(): { client: OpenAI; model: string } {
  if (!_client) {
    if (process.env.OPENAI_API_KEY) {
      _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      _model = "gpt-4o";
    } else if (process.env.GEMINI_API_KEY) {
      _client = new OpenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      });
      _model = "gemini-1.5-pro";
    } else {
      throw new Error("No API Key provided. Please set OPENAI_API_KEY or GEMINI_API_KEY in your environment.");
    }
  }
  return { client: _client, model: _model };
}
