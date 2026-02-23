import { GoogleGenAI, Modality, Type } from "@google/genai";
import { VoiceName, Speaker, DialogueLine, SpeechSettings, Emotion, CloneSample, SystemUpdateResponse } from "../types";



const EMOTION_PROMPTS: Record<Emotion, string> = {
  neutral: "in a natural, balanced tone",
  happy: "with a bright, joyful, and cheerful energy",
  sad: "with a heavy, melancholic, and downcast tone",
  angry: "with a sharp, intense, and aggressive edge",
  fearful: "with a shaky, anxious, and panicked quality",
  surprised: "with a sudden, wide-eyed, and high-pitched energy",
  disgusted: "with a repulsed, condescending, and bitter tone",
  sarcastic: "with a dry, mocking, and cynical inflection",
  whispering: "in a soft, hushed, and secretive whisper",
  shouting: "at a high volume with a forceful, projective energy",
  nostalgic: "in a reflective, warm, and slightly sentimental tone",
  wise: "in a calm, deep, and highly experienced manner",
  fragile: "in a thin, gentle, and vulnerable tone",
  shaky: "with a quivering, unsteady, and old quality",
  friendly: "in a welcoming, approachable, and warm tone",
  authoritative: "with a commanding, steady, and professional power"
};

/**
 * Maps artistic virtual voices to core neural profiles supported by the API.
 * This allows for a wide character variety while maintaining high fidelity.
 */
function mapVirtualVoice(voice: VoiceName | string): { base: string; personality: string } {
  const v = voice as VoiceName;
  switch (v) {
    // Primary Mappings
    case VoiceName.Zephyr: return { base: 'Zephyr', personality: '' };
    case VoiceName.Puck: return { base: 'Puck', personality: '' };
    case VoiceName.Charon: return { base: 'Charon', personality: '' };
    case VoiceName.Kore: return { base: 'Kore', personality: '' };
    case VoiceName.Fenrir: return { base: 'Fenrir', personality: '' };
    
    // Virtual Character shaping
    case VoiceName.Lyra: return { base: 'Zephyr', personality: ' ethereal and soft atmospheric qualities' };
    case VoiceName.Orion: return { base: 'Kore', personality: ' cinematic power and deep resonance' };
    case VoiceName.Cassiopeia: return { base: 'Zephyr', personality: ' regal, commanding and Shakespearean weight' };
    case VoiceName.Perseus: return { base: 'Charon', personality: ' brave energy and energetic heroic pace' };
    case VoiceName.Andromeda: return { base: 'Zephyr', personality: ' dreamy, smooth meditation-like cadence' };
    case VoiceName.Cepheus: return { base: 'Fenrir', personality: ' ancient wisdom and a slightly raspy historical tone' };
    case VoiceName.Aquila: return { base: 'Puck', personality: ' sharp precision and quick tech-inspired delivery' };
    case VoiceName.Cygnus: return { base: 'Charon', personality: ' graceful, friendly Australian charm' };
    case VoiceName.Delphinus: return { base: 'Puck', personality: ' cheerful, bubbly gaming-style energy' };
    case VoiceName.Hydra: return { base: 'Charon', personality: ' dark, shadowy whispering textures' };
    case VoiceName.Rigel: return { base: 'Fenrir', personality: ' precise, articulate Indian English accent' };
    case VoiceName.Antares: return { base: 'Zephyr', personality: ' strong, lyrical Scottish accent' };
    case VoiceName.Sirius: return { base: 'Charon', personality: ' charming, warm Irish brogue' };
    case VoiceName.Vega: return { base: 'Zephyr', personality: ' vibrant, clear South African accent' };
    case VoiceName.Altair: return { base: 'Kore', personality: ' polite, steady Canadian accent' };
    case VoiceName.Canopus: return { base: 'Zephyr', personality: ' warm, hospitable Southern US drawl' };
    
    // Generic fallbacks
    default: return { base: 'Zephyr', personality: '' };
  }
}

function formatSettingsInstruction(settings: SpeechSettings, voiceName?: VoiceName | string, overrideEmotion?: Emotion): string {
  const { personality } = mapVirtualVoice(voiceName || '');
  const rateDesc = settings.rate === 1 ? "normal speed" : `${settings.rate}x speed`;
  const emotionDesc = EMOTION_PROMPTS[overrideEmotion || settings.emotion];
  const accentDesc = settings.accentStrength > 0.5 ? "with a strong regional accent" : "with a natural, subtle accent";
  const volumeDesc = settings.volume > 1.2 ? "loudly" : (settings.volume < 0.8 ? "softly" : "at normal volume");
  
  return `Speak ${emotionDesc}${personality} ${volumeDesc} at a ${rateDesc} with a ${settings.pitch} pitch and ${accentDesc}. `;
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the environment.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function getPhoneticBreakdown(text: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Convert the following text into a high-fidelity phonetic breakdown using the International Phonetic Alphabet (IPA). Stress syllables clearly. Text: "${text}"`,
  });
  return response.text || "";
}

export async function summarizeScript(text: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a concise, high-impact summary of the following text suitable for a voice-over script. Retain the core emotion and key information. Text: "${text}"`,
  });
  return response.text || "Summary unavailable.";
}

export async function processIntelligencePrompt(
  instruction: string, 
  currentText: string,
  currentMode: string
): Promise<SystemUpdateResponse> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `You are the Neural Orchestrator for Vocalize Studio. Based on the User's instruction, reconfigure the entire studio state.
    
    User Instruction: "${instruction}"
    Current Studio Context: Mode: ${currentMode}, Text: "${currentText}"
    
    Rules:
    1. If the user wants a dialogue, set mode to 'multi' and provide 'dialogue' and 'speakers'.
    2. Available voices: ${Object.values(VoiceName).join(', ')}.
    3. Emotions: happy, sad, angry, wise, shouting, whispering, etc.
    4. Limit speakers to 10 for management, but optimize for 2 primary neural profiles.
    
    Output JSON format:
    {
      "mode": "single" | "multi",
      "singleText": "string (if single mode)",
      "dialogue": [{"speakerId": "1", "text": "...", "emotionOverride": "..."}],
      "speakers": [{"id": "1", "name": "...", "voice": "...", "settings": {"rate": 1, "pitch": "normal", "emotion": "neutral", "volume": 1, "accentStrength": 0.2}}],
      "settings": {"rate": 1, "pitch": "normal", "emotion": "neutral"},
      "explanation": "brief description of what you changed"
    }`,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse orchestrator response.");
  }
}

export async function analyzeVoiceSample(samples: CloneSample[]): Promise<{ profile: string; confidence: number }> {
  if (samples.length === 0) throw new Error("No voice samples provided");

  const ai = getAI();
  const parts = samples.map(s => ({
    inlineData: { data: s.data, mimeType: s.mimeType }
  }));

  parts.push({
    text: `Analyze these voice samples meticulously. Synthesize an averaged voice fingerprint. Return JSON with 'profile' (string) and 'confidence' (number 0-100).`
  } as any);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { responseMimeType: "application/json" }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return { profile: data.profile || "Standard voice", confidence: data.confidence || 85 };
  } catch {
    return { profile: "Standard voice", confidence: 70 };
  }
}

export async function generateClonedSpeech(
  text: string,
  voiceProfile: string,
  settings: SpeechSettings
): Promise<string> {
  const ai = getAI();
  const instruction = formatSettingsInstruction(settings);
  const prompt = `[VOICE_CLONE_INSTRUCTION: ${voiceProfile}] ${instruction} Text: ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!data) {
    throw new Error("The neural engine returned an empty audio stream. Please try a different prompt or voice.");
  }
  return data;
}

export async function generateSingleSpeakerSpeech(
  text: string, 
  voice: VoiceName,
  settings: SpeechSettings
): Promise<string> {
  const ai = getAI();
  const { base } = mapVirtualVoice(voice);
  const instruction = formatSettingsInstruction(settings, voice);
  const prompt = `${instruction}Text: ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: base },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!data) {
    throw new Error("Synthesis failed: No audio data received from the model.");
  }
  return data;
}

export async function generateMultiSpeakerSpeech(
  speakers: Speaker[],
  lines: DialogueLine[]
): Promise<string> {
  const ai = getAI();
  
  // The API currently supports exactly 2 speakers for multi-speaker TTS.
  // We map all dialogue lines to the first two speakers defined in the studio.
  const activeSpeakers = speakers.slice(0, 2);
  if (activeSpeakers.length < 2) {
    throw new Error("Multi-speaker synthesis requires at least 2 speakers to be defined.");
  }

  const promptBody = lines
    .map(line => {
      let speaker = speakers.find(s => s.id === line.speakerId);
      // Fallback to one of the two active speakers if the line's speaker is not in the top 2
      if (!activeSpeakers.find(s => s.id === line.speakerId)) {
        speaker = activeSpeakers[0];
      }
      const instruction = speaker ? formatSettingsInstruction(speaker.settings, speaker.voice, line.emotionOverride) : "";
      return `${speaker?.name || 'Speaker'}: [INSTRUCTION: ${instruction}] ${line.text}`;
    })
    .join('\n');

  const fullPrompt = `TTS the following conversation between ${activeSpeakers[0].name} and ${activeSpeakers[1].name}:\n\n${promptBody}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: activeSpeakers[0].name,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: mapVirtualVoice(activeSpeakers[0].voice).base } }
            },
            {
              speaker: activeSpeakers[1].name,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: mapVirtualVoice(activeSpeakers[1].voice).base } }
            }
          ],
        }
      }
    }
  });

  const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!data) {
    throw new Error("Multi-speaker synthesis failed: No audio data received.");
  }
  return data;
}
