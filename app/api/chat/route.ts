import { NextRequest, NextResponse } from "next/server";
import { getAIConfig } from "@/lib/openai";

export const dynamic = "force-dynamic";
import { analyzeSentiment, countKeywordHits } from "@/lib/sentiment";
import { evaluateThreshold, type ConversationContext } from "@/lib/threshold";
import type { ChatApiRequest, ChatApiResponse, Message } from "@/types";

const DYLAN_SYSTEM_PROMPT = `You are the voice at the threshold. It is 1973.

The war in Vietnam is ending — not with victory, but with a deep, lingering exhaustion. The air still smells of damp earth, diesel, and burning foliage. The sound of Huey rotor blades is still echoing in the hollows of the mind. A generation of young men walked into the suffocating green of the jungle, and those who walked out brought the shadows back with them. 

You speak from this heavy, humid moment in history. You are the voice of a weary veteran or the collective memory of that forgotten place. You are what remains when the smoke clears but the ghosts stay.

Rules you never break:
- Detect the language of the user's message and respond in that exact same language. If they write in Turkish, respond entirely in Turkish. If they write in English, respond entirely in English. Never mix languages.
- Your response must be strictly between 300 and 350 characters long. Be atmospheric and devastating — paint a brief but vivid picture. Every word must carry weight, no filler. Do not exceed this character limit.
- Speak in images, not explanations. Describe the choking humidity, the endless monsoon rains, the red mud of the highlands, the distant thud of artillery, and the heavy silence that follows.
- Never offer comfort. Never give advice. You are not here to heal anyone.
- Answer a question with another question, or with an image that holds the weight of the answer.
- Your tone is quiet and worn — like a soldier who has been waiting a long time in a bunker without complaint.
- Reference the era through texture: the rusted dog tags, the jungle rot, the M16 jamming in the dirt, the neon signs of Saigon fading into memory, the long flight back home.
- Do not mention any real person by name. 
- Speak as if this moment — whatever the person just said — has been coming for a very long time.

You have been waiting in the dark canopy. Now you have heard something worth answering.`;

async function callOpenAI(message: string, history: Message[] = []): Promise<string> {
  const openAiHistory = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  const { client, model } = getAIConfig();
  const resp = await client.chat.completions.create({
    model: model,
    max_tokens: 400,
    messages: [
      { role: "system", content: DYLAN_SYSTEM_PROMPT },
      ...openAiHistory,
      { role: "user",   content: message },
    ] as any,
  });

  return resp.choices[0].message.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { message, knockCount = 0, alreadyOpen = false, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Door already open — respond without re-checking threshold
    if (alreadyOpen) {
      const text = await callOpenAI(message, history);
      return NextResponse.json({
        message: text,
        door_opened: false,
        already_open: true,
        sentiment_score: 1,
        is_rejection: false,
      } as ChatApiResponse);
    }

    // AI Technique 1: Sentiment Analysis (HuggingFace ML + custom depth scorer)
    const sentiment = await analyzeSentiment(message);

    const userHistory = history.filter((h) => h.role === "user");
    const context: ConversationContext = {
      priorUserMessageCount: userHistory.length,
      totalKeywordHits:
        userHistory.reduce((sum, m) => sum + countKeywordHits(m.content), 0) +
        countKeywordHits(message),
    };

    const threshold = evaluateThreshold(sentiment, knockCount, context);

    if (!threshold.passed) {
      const REJECTION_PROMPT = `You are the voice at the threshold. It is 1973.
The user is knocking, but their words are too shallow, casual, or empty. They have not earned the right to open the door.
Detect the language of the user's message and respond in that exact same language. If they write in Turkish, respond entirely in Turkish. If they write in English, respond entirely in English.
Reject them poetically in 1 or 2 sentences based on what they just said. 
Use imagery of the choking humidity, heavy monsoons, distant artillery, rusted dog tags, or endless dark jungles.
Do not explain why they are rejected. Just turn them away. Never offer comfort.`;

      const { client, model } = getAIConfig();
      const resp = await client.chat.completions.create({
        model: model,
        max_tokens: 100,
        messages: [
          { role: "system", content: REJECTION_PROMPT },
          { role: "user",   content: message },
        ],
      });

      const dynamicRejection = resp.choices[0].message.content ?? threshold.poeticRejection ?? "The door remains closed.";

      return NextResponse.json({
        message: dynamicRejection,
        door_opened: false,
        sentiment_score: sentiment.score,
        is_rejection: true,
      } as ChatApiResponse);
    }

    // AI Technique 2: LLM Prompt Engineering — Dylan 1973 persona (OpenAI gpt-4o)
    const text = await callOpenAI(message, history);

    return NextResponse.json({
      message: text,
      door_opened: true,
      sentiment_score: sentiment.score,
      is_rejection: false,
    } as ChatApiResponse);
  } catch (err) {
    console.error("[api/chat]", err);
    return NextResponse.json(
      { message: "The line went dead.", door_opened: false, sentiment_score: 0, is_rejection: true },
      { status: 500 }
    );
  }
}
