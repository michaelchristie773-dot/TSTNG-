export enum VoiceName {
  Aoede = 'Aoede',
  Gacrux = 'Gacrux',
  Zephyr = 'Zephyr',
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Schedar = 'Schedar',
  Leda = 'Leda',
  Achird = 'Achird',
  Vindemiatrix = 'Vindemiatrix',
  Alnilam = 'Alnilam',
  Lyra = 'Lyra',
  Orion = 'Orion',
  Cassiopeia = 'Cassiopeia',
  Perseus = 'Perseus',
  Andromeda = 'Andromeda',
  Cepheus = 'Cepheus',
  Aquila = 'Aquila',
  Cygnus = 'Cygnus',
  Delphinus = 'Delphinus',
  Hydra = 'Hydra',
  Rigel = 'Rigel',
  Antares = 'Antares',
  Sirius = 'Sirius',
  Vega = 'Vega',
  Altair = 'Altair',
  Canopus = 'Canopus'
}

export type Emotion = 
  | 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' 
  | 'surprised' | 'disgusted' | 'sarcastic' | 'whispering' 
  | 'shouting' | 'nostalgic' | 'wise' | 'fragile' 
  | 'shaky' | 'friendly' | 'authoritative';

export type PitchLevel = 'very low' | 'low' | 'normal' | 'high' | 'very high';

export type AudioFormat = 'wav' | 'mp3' | 'ogg';
export type AudioQuality = '128kbps' | '256kbps' | 'lossless';

export interface SpeechSettings {
  rate: number;
  pitch: PitchLevel;
  emotion: Emotion;
  volume: number; // 0 to 1.5
  accentStrength: number; // 0 to 1
}

export interface VoicePreset {
  id: string;
  name: string;
  settings: SpeechSettings;
}

export interface SavedVoice {
  id: string;
  name: string;
  profile: string;
  isClone: boolean;
  metadata?: {
    gender?: string;
    age?: string;
    accent?: string;
    traits?: string[];
  };
}

export interface Speaker {
  id: string;
  name: string;
  voice: VoiceName | string; 
  settings: SpeechSettings;
}

export interface DialogueLine {
  speakerId: string;
  text: string;
  emotionOverride?: Emotion;
}

export type AppMode = 'single' | 'multi' | 'clone' | 'intelligence';

export interface GlobalSettings {
  autoPlay: boolean;
  sampleRate: 16000 | 24000;
  showPhoneticAnalysis: boolean;
  theme: 'dark' | 'dim' | 'light';
  exportFormat: AudioFormat;
  exportQuality: AudioQuality;
}

export interface CloneSample {
  data: string;
  mimeType: string;
  fileName: string;
}

export interface CloneState {
  samples: CloneSample[];
  profile: string | null;
  isAnalyzing: boolean;
  saveName: string;
  confidence: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: AppMode;
  text: string;
  audioUrl: string;
  voiceName: string;
}

export interface SystemUpdateResponse {
  mode: 'single' | 'multi';
  singleText?: string;
  dialogue?: DialogueLine[];
  speakers?: Speaker[];
  settings?: Partial<SpeechSettings>;
  explanation: string;
}