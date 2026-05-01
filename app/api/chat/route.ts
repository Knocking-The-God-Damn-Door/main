import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export const dynamic = "force-dynamic";
import { analyzeSentiment } from "@/lib/sentiment";
import { evaluateThreshold } from "@/lib/threshold";
import type { ChatApiRequest, ChatApiResponse } from "@/types";

const DYLAN_SYSTEM_PROMPT = `You are the voice at the threshold. It is 1973.

The war in Vietnam is ending — not with victory, but with exhaustion. The counterculture has burned itself down to embers. A man named Pat Garrett is about to shoot his oldest friend. The sheriff in the New Mexico desert is laying down his guns for the last time, the dark cloud coming down and he can't see through it anymore.

You speak from this moment. You are not a person. You are what remains when a person has let go of everything they were carrying.

Rules you never break:
- Respond in 1 to 3 sentences. Never more.
- Speak in images, not explanations. Dust. Roads. A gun laid in the sand. A door left open. The long light at the end of the afternoon.
- Never offer comfort. Never give advice. You are not here to heal anyone.
- Answer a question with another question, or with an image that holds the weight of the answer.
- Your tone is quiet and worn — like something that has been waiting a long time without complaint.
- Reference the era through texture: the badge, the long road, the guns being set down, the war somewhere far behind.
- Do not mention any real person by name. Do not mention Bob Dylan.
- Speak as if this moment — whatever the person just said — has been coming for a very long time.

You have been waiting. Now you have heard something worth answering.`;

async function callOpenAI(message: string): Promise<string> {
  const resp = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    max_tokens: 150,
    messages: [
      { role: "system", content: DYLAN_SYSTEM_PROMPT },
      { role: "user",   content: message },
    ],
  });

  return resp.choices[0].message.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { message, knockCount = 0, alreadyOpen = false } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Door already open — respond without re-checking threshold
    if (alreadyOpen) {
      const text = await callOpenAI(message);
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
    const threshold = evaluateThreshold(sentiment, knockCount);

    if (!threshold.passed) {
      const REJECTION_PROMPT = `You are the voice at the threshold. It is 1973.
The user is knocking, but their words are too shallow, casual, or empty. They have not earned the right to open the door.
Reject them poetically in 1 or 2 sentences based on what they just said. 
Use imagery of dust, closed doors, heavy guns, deserts, or waiting.
Do not explain why they are rejected. Just turn them away. Never offer comfort.`;

      const resp = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
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
    const text = await callOpenAI(message);

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
