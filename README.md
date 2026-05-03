# KNOCK — The Threshold

> *"1973. Bob Dylan is writing a door. The door is waiting for you. But not every knock is enough."*

**KNOCK** is an immersive, AI-driven narrative experience masquerading as a chat interface. You stand before a metaphorical door. On the other side is a weary voice from 1973—a sheriff holding the keys to the threshold. 

🔗 **[Try the Live Demo Here](http://main-ruddy-five.vercel.app/)**

This isn't a traditional chatbot. It is a sentiment-driven gatekeeper. The conversation remembers your history, weighs the weight of your words, and judges your intent. Only when the hidden threshold of sentiment is reached will the door open, culminating in a cinematic finale featuring ambient audio and a dynamically generated voice performance.

Step carefully. Speak truthfully. 

---

## How to Pass the Threshold (For Testers)

If you are testing the application and want to force the door to open, you cannot simply type "hello", "test", or "open the door". The NLP engine filters out shallow messages immediately, and the Rejection Engine will turn you away.

To successfully pass the threshold, your conversation must meet **all** of the following criteria:
1. **Persistence:** Send at least **3 messages** — the door will not open on a single attempt.
2. **Length:** Each message should be detailed enough (around 30+ words).
3. **Keywords:** Accumulate at least **6 thematic keyword hits** across the conversation (e.g., *war, rain, jungle, ghost, alone, pain, shadow, blood, hell, meaning, soul*).
4. **Inquiry:** Include a question to indicate genuine depth (*Why, How, What, ?*).
5. **Sentiment:** Carry a heavy, somber, or dark emotional tone that scores above the threshold.

**Example Phrase to Copy & Paste:**
> *"Why did we leave them alone in the dark jungle? The cold rain and mud still carry the heavy weight of broken soldiers, and I cannot forget the pain. Do you remember the heavy silence that followed the war?"*

---

## The Orchestration of the Threshold (System Architecture)

Beneath the narrative surface, KNOCK operates as a highly orchestrated pipeline of stateful logic, sentiment analysis, and generative AI. It is not merely a call-and-response API wrapper; it is an intelligent gatekeeper built on a modern Next.js stack.

### 1. The Gatekeeper: Multi-layered Sentiment & Depth Analysis
Before the persona even "hears" you, your words are weighed. The system employs a dual-layered sentiment engine:
- **HuggingFace Machine Learning:** A `twitter-roberta-base-sentiment` model analyzes the emotional weight of your input.
- **Algorithmic Depth Scoring:** A custom Natural Language Processing (NLP) layer scans for "shallow patterns" (e.g., 'hi', 'test', 'lol') and immediately penalizes them, while rewarding thematic "depth keywords" (e.g., *dust, time, heaven, silence*) and interrogative complexity in both English and Turkish.
Only a combined score that crosses a strict mathematical threshold (`0.55`) — along with a minimum of 3 prior messages and 6 accumulated depth-keyword hits — allows the door to open.

### 2. The Dynamic Rejection Engine (OpenAI GPT-4o)
If your input is deemed too shallow, the system routes the request to a dedicated Rejection Engine. Instead of a static "error" message, GPT-4o is prompted to generate a unique, poetic rejection based *specifically* on what you just said. It turns you away with imagery of closed doors, blowing sand, and weary refusal—maintaining the illusion without breaking character.

### 3. The 1973 Persona (OpenAI GPT-4o + History State)
Once the threshold is passed, the true narrative engine unlocks. Powered by GPT-4o and heavily guided by a meticulously crafted system prompt, the AI embodies a weary, battle-scarred persona from 1973. It is history-aware, maintaining the context of your entire conversation. It follows strict behavioral rules: it speaks in vivid imagery, answers questions with heavier questions, and never offers comfort.

### 4. Voice Performance & Typewriter Sync (ElevenLabs TTS)
Every response in the conversation — rejection, progress, and finale — is voiced in real time by ElevenLabs using the same Bill persona (a weary 1970s sheriff voice). For each message, the system:
1. Fetches the audio blob from ElevenLabs in the background while the UI waits.
2. Reads the exact audio duration from the loaded metadata.
3. Calculates the typewriter character speed as `(duration_ms − 300ms) / character_count`, then starts the voice and the typewriter at the **exact same millisecond** — so the last character lands just as the voice goes silent.

If the primary ElevenLabs API key hits its quota or returns an error, the system automatically retries with a secondary fallback key (`ELEVENLABS_API_KEY_2`) without any interruption to the experience. If both keys fail, the typewriter falls back to a default speed so the narrative never breaks.

**The Cinematic Finale** adds one more layer on top of this: when the door finally opens, ambient background music begins as the chat fades to black, a **2.5-second silence** builds tension, and then the final monologue voice and typewriter begin together — the typing speed again locked to the audio duration for a frame-perfect ending.

---

## Opening the Door (Installation & Setup)

To run this experience locally, you need to provide your own API keys for the services mentioned above.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- API Keys for OpenAI, ElevenLabs, and HuggingFace.

### 2. Installation
Navigate into the project directory and install the necessary dependencies:

```bash
npm install
```

### 3. Environment Variables
Create a file named `.env.local` in the root directory of the project. Add your API keys to match the following structure:

```env
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_TOKEN=your_huggingface_api_token_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_API_KEY_2=your_second_elevenlabs_key_here   # optional — used as automatic fallback if the primary key fails or hits quota
```

### 4. Run the Development Server
Start the Next.js development server:

```bash
npm run dev
```

The door is now waiting at [http://localhost:3000](http://localhost:3000). 

*Will you knock?*