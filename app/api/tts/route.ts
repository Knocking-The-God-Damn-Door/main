import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // "pqHfZKP75CvOlQylNhV4" is Bill - a strong, narrative old man voice (like a 1970s sheriff)
    const voiceId = "pqHfZKP75CvOlQylNhV4";
    const keys = [
      process.env.ELEVENLABS_API_KEY,
      process.env.ELEVENLABS_API_KEY_2
    ].filter(Boolean) as string[];

    if (keys.length === 0) {
      return NextResponse.json({ error: "No ELEVENLABS_API_KEY set in .env.local" }, { status: 500 });
    }

    let response;
    let lastErrorDetail = "";

    for (const apiKey of keys) {
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            speed: 0.92,
          },
        }),
      });

      if (response.ok) {
        break; // Success, exit the fallback loop
      } else {
        lastErrorDetail = await response.text();
        console.warn(`[api/tts] ElevenLabs key failed. Status: ${response.status}`);
      }
    }

    if (!response || !response.ok) {
      console.error("[api/tts] All ElevenLabs keys failed. Last error:", lastErrorDetail);
      return NextResponse.json({ error: "Failed to generate speech", detail: lastErrorDetail }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
