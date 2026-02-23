
// Vocalize AI Studio - Neural Synthesis Interface
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Header from './components/Header';
import VoiceCard from './components/VoiceCard';
import Toast from './components/Toast';
import Waveform from './components/Waveform';
import TuningControls from './components/TuningControls';
import VUMeter from './components/VUMeter';
import SignupPage from './components/SignupPage';
import VoiceGalleryControls from './components/VoiceGalleryControls';
import { VoiceName, AppMode, Speaker, DialogueLine, SpeechSettings, CloneState, Emotion, GlobalSettings, SavedVoice, VoicePreset, HistoryItem, AudioFormat, AudioQuality, CloneSample, SystemUpdateResponse } from './types';
import { generateSingleSpeakerSpeech, generateMultiSpeakerSpeech, analyzeVoiceSample, generateClonedSpeech, getPhoneticBreakdown, summarizeScript, processIntelligencePrompt } from './services/gemini';
import { decodeBase64, decodeRawPcm, audioBufferToWavBlob } from './utils/audio';

const WORD_LIMIT = 2000;
const MAX_SPEAKERS = 10;

const VOICE_METADATA: Record<string, any> = {
  [VoiceName.Aoede]: { gender: 'Female', age: 'Elderly', accent: 'US', traits: ['Empathetic', 'Wise'], tags: ['Warm', 'Narrative'], supportsEmotions: true },
  [VoiceName.Gacrux]: { gender: 'Female', age: 'Elderly', accent: 'US', traits: ['Gentle', 'Kind'], tags: ['Soft', 'Reflective'], supportsEmotions: true },
  [VoiceName.Zephyr]: { gender: 'Female', age: 'Adult', accent: 'US', traits: ['Professional', 'Polished'], tags: ['Commercial', 'Pro'], supportsEmotions: true },
  [VoiceName.Kore]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Commanding', 'Direct'], tags: ['Authoritative', 'Deep'], supportsEmotions: true },
  [VoiceName.Puck]: { gender: 'Neutral', age: 'Young', accent: 'US', traits: ['Energetic', 'Playful'], tags: ['Lively', 'Upbeat'], supportsEmotions: true },
  [VoiceName.Charon]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Mysterious', 'Rough'], tags: ['Gravelly', 'Dramatic'], supportsEmotions: true },
  [VoiceName.Fenrir]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Reliable', 'Calm'], tags: ['Steady', 'Instructional'], supportsEmotions: true },
  [VoiceName.Schedar]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Heroic', 'Loud'], tags: ['Trailer', 'Power'], supportsEmotions: true },
  [VoiceName.Leda]: { gender: 'Female', age: 'Adult', accent: 'UK', traits: ['Quick-witted', 'Posh'], tags: ['Fast', 'Modern'], supportsEmotions: true },
  [VoiceName.Achird]: { gender: 'Male', age: 'Adult', accent: 'AU', traits: ['Aussie', 'Friendly'], tags: ['Expressive', 'Narrative'], supportsEmotions: true },
  [VoiceName.Vindemiatrix]: { gender: 'Female', age: 'Adult', accent: 'US', traits: ['Helpful', 'Concise'], tags: ['Clear', 'Professional'], supportsEmotions: true },
  [VoiceName.Alnilam]: { gender: 'Male', age: 'Adult', accent: 'UK', traits: ['Sophisticated', 'Artistic'], tags: ['Rhythmic', 'Poetic'], supportsEmotions: true },
  [VoiceName.Lyra]: { gender: 'Female', age: 'Adult', accent: 'UK', traits: ['Ethereal', 'Soft'], tags: ['Atmospheric', 'Poetic'], supportsEmotions: true },
  [VoiceName.Orion]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Powerful', 'Deep'], tags: ['Cinematic', 'Narrative'], supportsEmotions: true },
  [VoiceName.Cassiopeia]: { gender: 'Female', age: 'Elderly', accent: 'UK', traits: ['Regal', 'Commanding'], tags: ['Shakespearean', 'Bold'], supportsEmotions: true },
  [VoiceName.Perseus]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Brave', 'Energetic'], tags: ['Action', 'Bouncy'], supportsEmotions: true },
  [VoiceName.Andromeda]: { gender: 'Female', age: 'Adult', accent: 'US', traits: ['Dreamy', 'Smooth'], tags: ['Meditation', 'Cloudy'], supportsEmotions: true },
  [VoiceName.Cepheus]: { gender: 'Male', age: 'Elderly', accent: 'UK', traits: ['Ancient', 'Raspy'], tags: ['Historical', 'Gravel'], supportsEmotions: true },
  [VoiceName.Aquila]: { gender: 'Female', age: 'Young', accent: 'US', traits: ['Sharp', 'Quick'], tags: ['Tech', 'Fast'], supportsEmotions: true },
  [VoiceName.Cygnus]: { gender: 'Male', age: 'Adult', accent: 'AU', traits: ['Graceful', 'Friendly'], tags: ['Casual', 'Modern'], supportsEmotions: true },
  [VoiceName.Delphinus]: { gender: 'Neutral', age: 'Young', accent: 'US', traits: ['Cheerful', 'Bubbly'], tags: ['Gaming', 'Upbeat'], supportsEmotions: true },
  [VoiceName.Hydra]: { gender: 'Male', age: 'Adult', accent: 'US', traits: ['Dark', 'Whispery'], tags: ['Horror', 'Shadow'], supportsEmotions: true },
  [VoiceName.Rigel]: { gender: 'Male', age: 'Adult', accent: 'IN', traits: ['Precise', 'Articulate'], tags: ['Tech', 'Global'], supportsEmotions: true },
  [VoiceName.Antares]: { gender: 'Female', age: 'Adult', accent: 'SC', traits: ['Strong', 'Lyrical'], tags: ['Narrative', 'Rugged'], supportsEmotions: true },
  [VoiceName.Sirius]: { gender: 'Male', age: 'Adult', accent: 'IE', traits: ['Charming', 'Warm'], tags: ['Storytelling', 'Friendly'], supportsEmotions: true },
  [VoiceName.Vega]: { gender: 'Female', age: 'Adult', accent: 'ZA', traits: ['Vibrant', 'Clear'], tags: ['Professional', 'Bright'], supportsEmotions: true },
  [VoiceName.Altair]: { gender: 'Male', age: 'Adult', accent: 'CA', traits: ['Polite', 'Steady'], tags: ['News', 'Trustworthy'], supportsEmotions: true },
  [VoiceName.Canopus]: { gender: 'Female', age: 'Adult', accent: 'SUS', traits: ['Southern', 'Hospitable'], tags: ['Warm', 'Country'], supportsEmotions: true },
};

const DEFAULT_SETTINGS: SpeechSettings = { rate: 1.0, pitch: 'normal', emotion: 'neutral', volume: 1.0, accentStrength: 0.2 };

const VoxyCharacter: React.FC<{ isGenerating: boolean, isSelected: boolean }> = ({ isGenerating, isSelected }) => {
  return (
    <div className={`relative w-20 h-20 flex items-center justify-center transition-all duration-700 ${isSelected ? 'scale-125 rotate-6' : 'scale-100 hover:scale-110 cursor-pointer'}`}>
      <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${isGenerating ? 'bg-indigo-500/60 animate-pulse scale-150' : (isSelected ? 'bg-indigo-500/20' : 'bg-transparent')}`} />
      <div className={`absolute inset-0 rounded-[24px] border border-white/10 transition-all duration-1000 ${isGenerating ? 'animate-[spin_4s_linear_infinite] opacity-100' : 'opacity-0 scale-75'}`} />
      <div className={`relative w-14 h-14 rounded-[20px] flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${isGenerating ? 'animate-bounce bg-white text-indigo-600' : (isSelected ? 'bg-indigo-600 text-white scale-110' : 'bg-white/5 text-slate-500 hover:text-slate-300')}`}>
        <div className="flex gap-1.5 mb-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-indigo-600 animate-ping' : 'bg-current'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-indigo-600 animate-ping' : 'bg-current'}`} />
        </div>
        <div className={`w-5 h-0.5 rounded-full ${isGenerating ? 'bg-indigo-600 h-1' : 'bg-current'}`} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('vocalize_auth') === 'true');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Initializing state for dialogue script imports and UI visibility
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [mode, setMode] = useState<AppMode>(() => (sessionStorage.getItem('vocalize_mode') as AppMode) || 'single');
  const [singleText, setSingleText] = useState(() => sessionStorage.getItem('vocalize_single_text') || "The horizon of speech has shifted. We no longer speak into machines; we orchestrate intelligence, crafting cadence from the void of digital noise.");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => sessionStorage.getItem('vocalize_voice_id') || VoiceName.Zephyr);
  const [singleSettings, setSingleSettings] = useState<SpeechSettings>(() => {
    const saved = sessionStorage.getItem('vocalize_settings');
    return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS, emotion: 'wise' };
  });

  const [clone, setClone] = useState<CloneState>({
    samples: [], profile: null, isAnalyzing: false, saveName: '', confidence: 0
  });

  const [presets, setPresets] = useState<VoicePreset[]>(() => {
    const saved = localStorage.getItem('vocalize_presets');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [phoneticText, setPhoneticText] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [wordTimings, setWordTimings] = useState<{start: number, end: number}[]>([]);

  // Gallery Filters & Sorting
  const [galleryFilters, setGalleryFilters] = useState({
    gender: 'all',
    age: 'all',
    accent: 'all',
    emotionSupport: false
  });
  const [gallerySort, setGallerySort] = useState('name_asc');

  const availableAccents = useMemo(() => {
    const accents = new Set<string>();
    Object.values(VOICE_METADATA).forEach(meta => {
      if (meta.accent) accents.add(meta.accent);
    });
    return Array.from(accents).sort();
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('vocalize_ratings');
    return saved ? JSON.parse(saved) : {};
  });

  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('vocalize_usage');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('vocalize_ratings', JSON.stringify(ratings));
    localStorage.setItem('vocalize_usage', JSON.stringify(usageCounts));
    localStorage.setItem('vocalize_presets', JSON.stringify(presets));
  }, [ratings, usageCounts, presets]);

  useEffect(() => {
    sessionStorage.setItem('vocalize_mode', mode);
    sessionStorage.setItem('vocalize_single_text', singleText);
    sessionStorage.setItem('vocalize_voice_id', selectedVoiceId);
    sessionStorage.setItem('vocalize_settings', JSON.stringify(singleSettings));
  }, [mode, singleText, selectedVoiceId, singleSettings]);

  useEffect(() => {
    setIsDirty(true);
    setAudioUrl(null);
    setPhoneticText(null);
  }, [singleText, selectedVoiceId, singleSettings, mode]);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('vocalize_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('vocalize_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedClones, setSavedClones] = useState<SavedVoice[]>(() => {
    const saved = localStorage.getItem('vocalize_saved_clones');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('vocalize_global_settings');
    return saved ? JSON.parse(saved) : { 
      autoPlay: true, 
      sampleRate: 24000, 
      showPhoneticAnalysis: true, 
      theme: 'dark',
      exportFormat: 'wav',
      exportQuality: 'lossless'
    };
  });
  
  const [speakers, setSpeakers] = useState<Speaker[]>(() => {
    const saved = sessionStorage.getItem('vocalize_speakers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Narrator', voice: VoiceName.Kore, settings: { ...DEFAULT_SETTINGS } },
      { id: '2', name: 'Guide', voice: VoiceName.Zephyr, settings: { ...DEFAULT_SETTINGS, emotion: 'friendly' } },
    ];
  });

  const [dialogue, setDialogue] = useState<DialogueLine[]>(() => {
    const saved = sessionStorage.getItem('vocalize_dialogue');
    return saved ? JSON.parse(saved) : [
      { speakerId: '1', text: "Welcome to the Obsidian Interface." },
      { speakerId: '2', text: "Ready for vector-based synthesis.", emotionOverride: 'friendly' }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('vocalize_speakers', JSON.stringify(speakers));
    sessionStorage.setItem('vocalize_dialogue', JSON.stringify(dialogue));
  }, [speakers, dialogue]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => setToast({ message, type });

  const scriptStats = useMemo(() => {
    const text = mode === 'multi' ? dialogue.map(d => d.text).join(' ') : singleText;
    const wordCount = text.trim().split(/\s+/).filter(x => x).length;
    const duration = Math.round((wordCount / 140) * (1 / (singleSettings.rate || 1)) * 60);
    return { wordCount, duration, isOverLimit: wordCount > WORD_LIMIT };
  }, [singleText, dialogue, mode, singleSettings.rate]);

  const filteredAndSortedVoices = useMemo(() => {
    const prebuilt = Object.values(VoiceName).map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      isClone: false,
      isFavorite: favorites.includes(id),
      metadata: VOICE_METADATA[id] || { gender: 'Neutral', age: 'Adult', accent: 'US' },
      description: VOICE_METADATA[id]?.traits?.join(', ') || "A high-fidelity AI voice.",
      tags: VOICE_METADATA[id]?.tags || ['Studio']
    }));

    const clones = savedClones.map(c => ({
      id: c.id,
      name: c.name,
      isClone: true,
      isFavorite: favorites.includes(c.id),
      metadata: c.metadata || { gender: 'Neutral', age: 'Adult', accent: 'Custom' },
      description: "Cloned neural print.",
      tags: ['Cloned']
    }));

    let voices = [...clones, ...prebuilt];

    voices = voices.filter(v => {
      const { gender, age, accent, emotionSupport } = galleryFilters;
      if (gender !== 'all' && v.metadata?.gender !== gender) return false;
      if (age !== 'all' && v.metadata?.age !== age) return false;
      if (accent !== 'all' && v.metadata?.accent !== accent) return false;
      if (emotionSupport && !v.metadata?.supportsEmotions) return false;
      return true;
    });

    voices.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      switch (gallerySort) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'highest_rated': return (ratings[b.id] || 0) - (ratings[a.id] || 0);
        case 'most_used': return (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0);
        default: return 0;
      }
    });

    return voices;
  }, [savedClones, favorites, galleryFilters, gallerySort, ratings, usageCounts]);

  const handleModeChange = (newMode: AppMode) => {
    if (!isAuthenticated && (newMode === 'multi' || newMode === 'clone' || newMode === 'intelligence')) {
      showToast("Sync your Neural Profile to unlock Studio orchestration", "info");
      setIsAuthModalOpen(true);
      return;
    }
    setMode(newMode);
  };

  const incrementUsage = (voiceId: string) => {
    setUsageCounts(prev => ({ ...prev, [voiceId]: (prev[voiceId] || 0) + 1 }));
  };

  const handlePreviewVoice = async (voiceId: string, name: string) => {
    if (previewVoiceId) return;
    setPreviewVoiceId(voiceId);
    try {
      const previewText = `Initializing ${name} vector profile. Studio synthesis active.`;
      const isCloneVoice = savedClones.find(c => c.id === voiceId);
      let base64 = "";
      if (isCloneVoice) {
        base64 = await generateClonedSpeech(previewText, isCloneVoice.profile, DEFAULT_SETTINGS);
      } else {
        base64 = await generateSingleSpeakerSpeech(previewText, voiceId as VoiceName, DEFAULT_SETTINGS);
      }
      const audioCtx = new AudioContext({ sampleRate: globalSettings.sampleRate });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const rawData = decodeBase64(base64);
      const buffer = await decodeRawPcm(rawData, audioCtx, globalSettings.sampleRate);
      const url = URL.createObjectURL(audioBufferToWavBlob(buffer));
      
      // Revoke old URL if it exists to prevent memory leaks
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      
      setAudioUrl(url);
      if (globalSettings.autoPlay && audioRef.current) {
        setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
      }
      showToast(`Profiling ${name}...`, "info");
      incrementUsage(voiceId);
      await audioCtx.close();
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.warn('Preview aborted');
      } else {
        showToast(err.message || "Preview failed");
      }
    } finally {
      setPreviewVoiceId(null);
    }
  };

  const handleRateVoice = (voiceId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [voiceId]: rating }));
    showToast(`Vector rated: ${rating} stars`, "success");
  };

  const handleUpdateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setSpeakers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveSpeaker = (id: string) => {
    if (speakers.length <= 1) return;
    setSpeakers(prev => prev.filter(s => s.id !== id));
    setDialogue(prev => prev.filter(d => d.speakerId !== id));
  };

  const handleAddSpeaker = () => {
    if (speakers.length >= MAX_SPEAKERS) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setSpeakers(prev => [...prev, { id: newId, name: `Voice ${prev.length + 1}`, voice: VoiceName.Zephyr, settings: { ...DEFAULT_SETTINGS } }]);
  };

  const calculateTimings = useCallback(() => {
    if (!audioRef.current || !audioRef.current.duration) return;
    
    const text = mode === 'single' ? singleText : dialogue.map(d => d.text).join(' ');
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return;

    const duration = audioRef.current.duration;
    const totalChars = words.join('').length;
    const timePerChar = duration / totalChars;

    let currentTime = 0;
    const timings = words.map(word => {
      const start = currentTime;
      const end = currentTime + (word.length * timePerChar);
      currentTime = end;
      return { start, end };
    });
    setWordTimings(timings);
  }, [singleText, dialogue, mode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      const index = wordTimings.findIndex(t => time >= t.start && time <= t.end);
      if (index !== currentWordIndex) {
        setCurrentWordIndex(index);
      }
    };

    const handleEnded = () => {
      setCurrentWordIndex(-1);
    };

    const handlePlay = () => {
      calculateTimings();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('loadedmetadata', calculateTimings);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('loadedmetadata', calculateTimings);
    };
  }, [wordTimings, currentWordIndex, calculateTimings]);

  const handleSavePreset = (name: string, settings: SpeechSettings) => {
    const newPreset = { id: Date.now().toString(), name, settings };
    setPresets(prev => [...prev, newPreset]);
    showToast(`Preset "${name}" mapped`, 'success');
  };

  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    showToast('Preset purged', 'info');
  };

  const handleGenerate = async () => {
    if (!isAuthenticated && scriptStats.wordCount > 100) {
      showToast("Guest limit reached. Sign up for full Neural Access.", "info");
      setIsAuthModalOpen(true);
      return;
    }
    if (scriptStats.isOverLimit) return showToast("Script exceeds Studio buffer.");
    setIsGenerating(true);
    try {
      let base64 = "";
      const isCloneVoice = savedClones.find(c => c.id === selectedVoiceId);
      if (mode === 'single') {
        base64 = isCloneVoice 
          ? await generateClonedSpeech(singleText, isCloneVoice.profile, singleSettings)
          : await generateSingleSpeakerSpeech(singleText, selectedVoiceId as VoiceName, singleSettings);
        incrementUsage(selectedVoiceId);
      } else if (mode === 'multi') {
        base64 = await generateMultiSpeakerSpeech(speakers, dialogue);
        speakers.forEach(s => incrementUsage(s.voice));
      }
      const audioCtx = new AudioContext({ sampleRate: globalSettings.sampleRate });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const rawData = decodeBase64(base64);
      const buffer = await decodeRawPcm(rawData, audioCtx, globalSettings.sampleRate);
      const url = URL.createObjectURL(audioBufferToWavBlob(buffer));
      
      // Revoke old URL if it exists
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      
      setAudioUrl(url);
      setIsDirty(false);
      setHistory(prev => [{
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode,
        text: mode === 'single' ? singleText : dialogue[0].text.slice(0, 30) + "...",
        audioUrl: url,
        voiceName: filteredAndSortedVoices.find(v => v.id === selectedVoiceId)?.name || 'Studio'
      }, ...prev].slice(0, 20));
      if (globalSettings.autoPlay && audioRef.current) {
        setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
      }
      showToast("Synthesis complete", "success");
      await audioCtx.close();
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        showToast("Synthesis interrupted", "info");
      } else {
        showToast(err.message || "Synthesis failed");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const studioBg = 'bg-[#020617]';

  return (
    <div className={`min-h-screen ${studioBg} text-slate-100 pb-24 flex flex-col transition-all duration-700 selection:bg-indigo-500/30 overflow-x-hidden relative`}>
      {/* Background Mesh Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full"></div>
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsAuthModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#020617] rounded-[48px] border border-white/5 shadow-[0_0_100px_rgba(99,102,241,0.15)] overflow-hidden">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-8 right-8 z-[110] text-slate-500 hover:text-white transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <SignupPage onComplete={() => {
              localStorage.setItem('vocalize_auth', 'true');
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);
              showToast("Identity Synchronized", "success");
            }} />
          </div>
        </div>
      )}

      {/* Script Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsImportModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/5 rounded-[40px] shadow-3xl overflow-hidden backdrop-blur-3xl p-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Script Importer</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-80 bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-sm text-indigo-300 outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="PROTAGONIST: Line text...&#10;SUPPORT: Response..."
              />
              <button 
                onClick={() => {
                  const lines = importText.split('\n').filter(l => l.includes(':'));
                  const parsed = lines.map(l => {
                    const [name, text] = l.split(':');
                    let speaker = speakers.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
                    if (!speaker) {
                       speaker = speakers[0];
                    }
                    return { speakerId: speaker.id, text: text.trim() };
                  });
                  setDialogue(parsed);
                  setIsImportModalOpen(false);
                  setImportText("");
                  showToast("Buffer Synced", "success");
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Sync with Architect
              </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[40px] shadow-3xl p-10 space-y-8 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Studio Preferences</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white transition-all">✕</button>
              </div>
              <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Engine Quality</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setGlobalSettings({...globalSettings, sampleRate: 24000})} className={`py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${globalSettings.sampleRate === 24000 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>24kHz High-Fi</button>
                      <button onClick={() => setGlobalSettings({...globalSettings, sampleRate: 16000})} className={`py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${globalSettings.sampleRate === 16000 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>16kHz Efficient</button>
                    </div>
                  </div>
              </div>
              {isAuthenticated && (
                <button onClick={() => { localStorage.removeItem('vocalize_auth'); setIsAuthenticated(false); setIsSettingsOpen(false); }} className="w-full py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                  Terminate Session
                </button>
              )}
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        <Header 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onToggleTheme={() => {}}
          currentTheme="dark"
          isAuthenticated={isAuthenticated}
          onSignUp={() => setIsAuthModalOpen(true)}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex bg-black/40 p-2 rounded-[28px] border border-white/5 backdrop-blur-3xl shadow-2xl">
                {(['single', 'multi', 'clone'] as const).map(m => (
                  <button key={m} onClick={() => handleModeChange(m)} className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                    {m} MODE
                  </button>
                ))}
              </div>
              <VoxyCharacter isGenerating={isGenerating} isSelected={justSelected} />
            </div>

            <div className="bg-black/40 border border-white/5 rounded-[48px] p-10 shadow-3xl transition-all relative overflow-hidden">
              {mode === 'clone' ? (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Neural Voice Cloning</h2>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{clone.samples.length} / 3 SAMPLES</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="relative group">
                        <input 
                          type="file" 
                          accept="audio/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async (re) => {
                              const base64 = (re.target?.result as string).split(',')[1];
                              const newSamples = [...clone.samples];
                              newSamples[i] = { data: base64, mimeType: file.type, fileName: file.name };
                              setClone({ ...clone, samples: newSamples.filter(Boolean) });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className={`h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${clone.samples[i] ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`}>
                          {clone.samples[i] ? (
                            <>
                              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span className="text-[9px] font-black uppercase text-indigo-400">Sample Loaded</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[9px] font-black uppercase text-slate-500">Upload Sample {i + 1}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex gap-4">
                      <input 
                        value={clone.saveName}
                        onChange={e => setClone({...clone, saveName: e.target.value})}
                        placeholder="Voice Profile Name (e.g. My Voice)"
                        className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 h-14 text-sm outline-none focus:border-indigo-500/50"
                      />
                      <button 
                        disabled={clone.samples.length < 1 || clone.isAnalyzing || !clone.saveName}
                        onClick={async () => {
                          setClone({ ...clone, isAnalyzing: true });
                          try {
                            const result = await analyzeVoiceSample(clone.samples);
                            const newClone: SavedVoice = {
                              id: `clone-${Date.now()}`,
                              name: clone.saveName,
                              profile: result.profile,
                              isClone: true,
                              metadata: { gender: 'Custom', age: 'Adult', accent: 'Cloned' }
                            };
                            setSavedClones([...savedClones, newClone]);
                            localStorage.setItem('vocalize_saved_clones', JSON.stringify([...savedClones, newClone]));
                            showToast(`Neural Profile "${clone.saveName}" Synchronized`, "success");
                            setClone({ samples: [], profile: null, isAnalyzing: false, saveName: '', confidence: result.confidence });
                            setMode('single');
                            setSelectedVoiceId(newClone.id);
                          } catch (err: any) {
                            showToast(err.message || "Cloning failed");
                          } finally {
                            setClone(prev => ({ ...prev, isAnalyzing: false }));
                          }
                        }}
                        className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all"
                      >
                        {clone.isAnalyzing ? 'Analyzing...' : 'Clone Voice'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Upload at least one clear voice sample (3-10 seconds) for optimal neural mapping.</p>
                  </div>
                </div>
              ) : mode === 'multi' ? (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Dialogue Architect</h2>
                    <div className="flex gap-4">
                      <button onClick={() => setIsImportModalOpen(true)} className="px-5 py-2 bg-white/5 border border-white/5 text-slate-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Import</button>
                      <button onClick={() => setDialogue([...dialogue, { speakerId: speakers[0].id, text: "" }])} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg">Add Line</button>
                    </div>
                  </div>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                     {dialogue.map((line, i) => {
                       let wordCounter = 0;
                       // Calculate offset for multi-speaker word highlighting
                       const previousLinesText = dialogue.slice(0, i).map(d => d.text).join(' ');
                       const offset = previousLinesText.split(/\s+/).filter(w => w.length > 0).length;

                       return (
                        <div key={i} className="flex gap-4 group">
                            <select value={line.speakerId} onChange={e => { const d = [...dialogue]; d[i].speakerId = e.target.value; setDialogue(d); }} className="bg-slate-900 border border-white/5 rounded-2xl px-4 text-[10px] font-black uppercase text-slate-400 outline-none h-12 min-w-[120px]">
                              {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="flex-1 relative">
                              <input 
                                value={line.text} 
                                onChange={e => { const d = [...dialogue]; d[i].text = e.target.value; setDialogue(d); }} 
                                className={`w-full bg-black/40 border border-white/5 rounded-2xl px-6 h-12 text-sm outline-none focus:border-indigo-500/50 transition-opacity ${currentWordIndex !== -1 ? 'opacity-20' : 'opacity-100'}`} 
                                placeholder="Input dialogue..." 
                              />
                              {currentWordIndex !== -1 && (
                                <div className="absolute inset-0 px-6 flex items-center text-sm pointer-events-none overflow-hidden whitespace-nowrap">
                                  {line.text.split(/(\s+)/).map((part, pi) => {
                                    const isWord = /\S/.test(part);
                                    const wordIdx = isWord ? offset + wordCounter++ : -1;
                                    return (
                                      <span key={pi} className={`transition-all duration-200 ${wordIdx === currentWordIndex ? 'text-indigo-400 font-bold scale-110' : 'text-slate-500'}`}>
                                        {part}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <button onClick={() => setDialogue(dialogue.filter((_, idx) => idx !== i))} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                        </div>
                       );
                     })}
                   </div>
                   <div className="pt-8 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <button disabled={isGenerating} onClick={handleGenerate} className="w-full sm:w-auto px-12 py-5 rounded-3xl font-black text-white uppercase tracking-widest shadow-3xl bg-indigo-600 hover:scale-105 active:scale-95 transition-all">Render Script</button>
                      {audioUrl && (
                        <div className="flex-1 w-full space-y-2">
                          <audio ref={audioRef} src={audioUrl} controls className="w-full h-12 opacity-80" />
                          <Waveform url={audioUrl} audioRef={audioRef} color="indigo" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Script Interface</h2>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${scriptStats.isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>{scriptStats.wordCount} / {WORD_LIMIT} WORDS</span>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={singleText} 
                      onChange={e => setSingleText(e.target.value)} 
                      className={`w-full h-80 bg-black/40 border border-white/5 rounded-[40px] p-10 text-xl leading-relaxed focus:border-indigo-500/30 outline-none transition-all resize-none font-medium custom-scrollbar ${currentWordIndex !== -1 ? 'opacity-10' : 'opacity-100'}`} 
                      placeholder="Initialize vocal script..." 
                    />
                    {currentWordIndex !== -1 && (
                      <div className="absolute inset-0 p-10 text-xl leading-relaxed font-medium overflow-y-auto custom-scrollbar pointer-events-none">
                        {(() => {
                          let wordCounter = 0;
                          return singleText.split(/(\s+)/).map((part, i) => {
                            const isWord = /\S/.test(part);
                            const index = isWord ? wordCounter++ : -1;
                            return (
                              <span key={i} className={`transition-all duration-200 ${index === currentWordIndex ? 'text-indigo-400 font-bold scale-110' : 'text-slate-500'}`}>
                                {part}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="pt-8 border-t border-white/5 space-y-8">
                    {/* Corrrected: Wrapping setSingleSettings to handle Partial updates by merging with existing state */}
                    <TuningControls settings={singleSettings} onUpdate={(updates) => setSingleSettings(prev => ({ ...prev, ...updates }))} color="indigo" currentTheme="dark" presets={presets} onSavePreset={handleSavePreset} onDeletePreset={handleDeletePreset} />
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <button disabled={isGenerating || !singleText.trim()} onClick={handleGenerate} className="w-full sm:w-auto px-12 py-5 rounded-3xl font-black text-white uppercase tracking-widest shadow-3xl bg-indigo-600 hover:scale-105 active:scale-95 transition-all">Render Script</button>
                      {audioUrl && (
                        <div className="flex-1 w-full space-y-2">
                          <audio ref={audioRef} src={audioUrl} controls className="w-full h-12 opacity-80" />
                          <Waveform url={audioUrl} audioRef={audioRef} color="indigo" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center justify-between border-b border-white/5 pb-6">
              Character Lab
              <span className="text-[10px] font-mono opacity-40 uppercase">{filteredAndSortedVoices.length} Vector Profiles</span>
            </h2>
            <VoiceGalleryControls 
              filters={galleryFilters} 
              onFilterChange={setGalleryFilters} 
              sort={gallerySort} 
              onSortChange={setGallerySort} 
              availableAccents={availableAccents}
              currentTheme="dark" 
            />
            <div className="space-y-4 h-[700px] overflow-y-auto pr-2 custom-scrollbar pb-20">
              {filteredAndSortedVoices.map(v => (
                <VoiceCard key={v.id} {...v} voiceId={v.id} isSelected={selectedVoiceId === v.id} isPreviewing={previewVoiceId === v.id} rating={ratings[v.id] || 0} onRate={handleRateVoice} onSelect={setSelectedVoiceId} onPreview={handlePreviewVoice} currentTheme="dark" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
