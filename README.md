# KNOCK — The Threshold

> *"1973. Bob Dylan is writing a door. The door is waiting for you. But not every knock is enough."*

**KNOCK** is an immersive, AI-driven narrative experience masquerading as a chat interface. You stand before a metaphorical door. On the other side is a weary voice from 1973—a sheriff holding the keys to the threshold. 

🔗 **[Try the Live Demo Here](https://your-project-name.vercel.app)**  
*(Replace the link above with your Vercel URL once deployed. No custom domain required, Vercel provides a free `.vercel.app` domain automatically.)*

This isn't a traditional chatbot. It is a sentiment-driven gatekeeper. The conversation remembers your history, weighs the weight of your words, and judges your intent. Only when the hidden threshold of sentiment is reached will the door open, culminating in a cinematic finale featuring ambient audio and a dynamically generated voice performance.

Step carefully. Speak truthfully. 

---

## How to Pass the Threshold (For Testers)

If you are testing the application and want to force the door to open, you cannot simply type "hello", "test", or "open the door". The NLP engine filters out shallow messages immediately, and the Rejection Engine will turn you away.

To successfully pass the threshold, your input must meet the following criteria:
1. **Length:** Be detailed enough (around 20-30 words).
2. **Keywords:** Contain thematic "depth" keywords (e.g., *war, rain, jungle, ghost, alone, pain, shadow, blood, hell, meaning, soul*).
3. **Inquiry:** Include a question to indicate genuine depth (*Why, How, What, ?*).
4. **Sentiment:** Carry a heavy, somber, or dark emotional tone.

**Example Phrase to Copy & Paste:**
> *"Why did we leave them alone in the dark jungle? The cold rain and mud still carry the heavy weight of broken soldiers, and I cannot forget the pain. Do you remember the heavy silence that followed the war?"*

---

## The Orchestration of the Threshold (System Architecture)

Beneath the narrative surface, KNOCK operates as a highly orchestrated pipeline of stateful logic, sentiment analysis, and generative AI. It is not merely a call-and-response API wrapper; it is an intelligent gatekeeper built on a modern Next.js stack.

### 1. The Gatekeeper: Multi-layered Sentiment & Depth Analysis
Before the persona even "hears" you, your words are weighed. The system employs a dual-layered sentiment engine:
- **HuggingFace Machine Learning:** A `twitter-roberta-base-sentiment` model analyzes the emotional weight of your input.
- **Algorithmic Depth Scoring:** A custom Natural Language Processing (NLP) layer scans for "shallow patterns" (e.g., 'hi', 'test', 'lol') and immediately penalizes them, while rewarding thematic "depth keywords" (e.g., *dust, time, heaven, silence*) and interrogative complexity in both English and Turkish.
Only a combined score that crosses a strict mathematical threshold (`0.4`) allows the conversation to truly begin.

### 2. The Dynamic Rejection Engine (OpenAI GPT-4o)
If your input is deemed too shallow, the system routes the request to a dedicated Rejection Engine. Instead of a static "error" message, GPT-4o is prompted to generate a unique, poetic rejection based *specifically* on what you just said. It turns you away with imagery of closed doors, blowing sand, and weary refusal—maintaining the illusion without breaking character.

### 3. The 1973 Persona (OpenAI GPT-4o + History State)
Once the threshold is passed, the true narrative engine unlocks. Powered by GPT-4o and heavily guided by a meticulously crafted system prompt, the AI embodies a weary, battle-scarred persona from 1973. It is history-aware, maintaining the context of your entire conversation. It follows strict behavioral rules: it speaks in vivid imagery, answers questions with heavier questions, and never offers comfort.

### 4. The Cinematic Finale (ElevenLabs TTS & Perfect Sync)
When the final threshold is crossed and the door opens, the experience transcends text. The backend triggers the ElevenLabs API to dynamically generate a voice performance for the persona's final monologue (strictly limited to 300-350 characters to prevent clipping). 

To maximize the cinematic impact, the UI implements a precise synchronization sequence:
1. Ambient background music begins immediately as the chat interface slowly fades into darkness.
2. The system waits exactly **2.5 seconds** in silence while fetching the audio.
3. The generated voice performance and a large, yellow typewriter text begin playing at the exact same millisecond. The typing speed dynamically adjusts based on the length of the audio file to ensure the final word is typed exactly as the voice finishes speaking.

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
```

### 4. Run the Development Server
Start the Next.js development server:

```bash
npm run dev
```

The door is now waiting at [http://localhost:3000](http://localhost:3000). 

*Will you knock?*