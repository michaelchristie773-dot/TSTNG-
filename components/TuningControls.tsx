import React, { useState, useRef } from 'react';
import { SpeechSettings, Emotion, VoicePreset, PitchLevel } from '../types';

interface TuningControlsProps {
  settings: SpeechSettings;
  onUpdate: (updates: Partial<SpeechSettings>) => void;
  color?: 'indigo' | 'cyan' | 'violet' | string;
  presets?: VoicePreset[];
  onSavePreset?: (name: string, settings: SpeechSettings) => void;
  onDeletePreset?: (id: string) => void;
  currentTheme?: 'dark' | 'dim' | 'light';
}

const EMOTIONS: { id: Emotion; label: string; icon: string }[] = [
  { id: 'neutral', label: 'Neutral', icon: '😐' },
  { id: 'happy', label: 'Happy', icon: '😊' },
  { id: 'friendly', label: 'Friendly', icon: '👋' },
  { id: 'wise', label: 'Wise', icon: '🦉' },
  { id: 'nostalgic', label: 'Nostalgic', icon: '📻' },
  { id: 'authoritative', label: 'Command', icon: '👑' },
  { id: 'shouting', label: 'Excited', icon: '🤩' },
  { id: 'whispering', label: 'Whisper', icon: '🤫' },
  { id: 'fragile', label: 'Fragile', icon: '👵' },
  { id: 'sad', label: 'Somber', icon: '😔' },
  { id: 'angry', label: 'Angry', icon: '😠' },
  { id: 'shaky', label: 'Shaky', icon: '❄️' },
  { id: 'fearful', label: 'Fearful', icon: '😨' },
  { id: 'surprised', label: 'Surprise', icon: '😲' },
  { id: 'disgusted', label: 'Disgust', icon: '🤮' },
  { id: 'sarcastic', label: 'Sarcasm', icon: '😏' },
];

const PITCH_OPTIONS: PitchLevel[] = ['very low', 'low', 'normal', 'high', 'very high'];

const TuningControls: React.FC<TuningControlsProps> = ({ 
  settings, 
  onUpdate, 
  color = "indigo",
  presets = [],
  onSavePreset,
  onDeletePreset,
  currentTheme = 'dark'
}) => {
  const isLight = currentTheme === 'light';
  const isDark = currentTheme === 'dark';
  const accentColor = color === 'cyan' ? 'cyan' : (color === 'violet' ? 'violet' : 'indigo');
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [fineTune, setFineTune] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), settings);
      setIsSaving(false);
      setPresetName('');
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vocalize_preset_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation - check if it looks like SpeechSettings
        if (typeof json.rate === 'number' && json.emotion) {
          onUpdate(json);
        } else {
          alert('Invalid preset file format.');
        }
      } catch (err) {
        alert('Failed to parse preset file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const panelBg = isLight ? 'bg-slate-50 border-slate-200' : (isDark ? 'bg-black border-zinc-900' : 'bg-slate-950/40 border-slate-800/50');

  return (
    <div className={`space-y-6 p-5 ${panelBg} rounded-2xl border backdrop-blur-sm shadow-xl transition-colors`}>
      <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/50'}`}>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Preset Gallery
          </label>
          <div className="flex gap-2 mt-2">
            <select 
              className={`${isLight ? 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500'} border rounded-lg px-3 py-1.5 text-[11px] outline-none transition-all`}
              onChange={(e) => {
                const p = presets.find(p => p.id === e.target.value);
                if (p) onUpdate(p.settings);
              }}
              value=""
            >
              <option value="" disabled>Load Preset...</option>
              {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
              onClick={() => setIsSaving(!isSaving)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${isSaving ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20'}`}
            >
              {isSaving ? 'Cancel' : 'Save New'}
            </button>
            <button 
              onClick={handleExport}
              title="Export current settings to JSON"
              className={`p-1.5 rounded-lg border transition-all hover:scale-110 active:scale-95 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-indigo-600' : 'bg-white/5 border-white/10 text-slate-500 hover:text-indigo-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              title="Import settings from JSON"
              className={`p-1.5 rounded-lg border transition-all hover:scale-110 active:scale-95 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-indigo-600' : 'bg-white/5 border-white/10 text-slate-500 hover:text-indigo-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precision</label>
          <button 
            onClick={() => setFineTune(!fineTune)}
            className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${fineTune ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : (isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800 text-slate-500 border border-slate-700')}`}
          >
            {fineTune ? 'Fine-Tune (0.01)' : 'Standard (0.1)'}
          </button>
        </div>
      </div>

      {isSaving && (
        <div className="flex gap-2 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-top-2">
          <input 
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 transition-all outline-none"
            placeholder="Preset Name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button onClick={handleSave} className="bg-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg hover:bg-indigo-500 active:scale-95 transition-all">Save</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3 group">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-indigo-400">Speaking Rate</label>
              <span className={`text-[10px] font-mono transition-all duration-300 group-hover:scale-110 ${accentColor === 'cyan' ? 'text-cyan-400' : 'text-indigo-400'}`}>{settings.rate.toFixed(fineTune ? 2 : 1)}x</span>
            </div>
            <input 
              type="range" min="0.5" max="2.0" step={fineTune ? 0.01 : 0.1}
              value={settings.rate} onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-all ${isLight ? 'bg-slate-200' : 'bg-slate-800'} ${accentColor === 'cyan' ? 'accent-cyan-500' : 'accent-indigo-500'}`}
            />
          </div>

          <div className="space-y-3 group">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-violet-400">Pitch Shift</label>
              <span className="text-[10px] font-mono text-violet-400 capitalize transition-all duration-300 group-hover:scale-110">{settings.pitch}</span>
            </div>
            <input 
              type="range" min="0" max="4" step="1"
              value={PITCH_OPTIONS.indexOf(settings.pitch)}
              onChange={(e) => onUpdate({ pitch: PITCH_OPTIONS[parseInt(e.target.value)] })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-all ${isLight ? 'bg-slate-200' : 'bg-slate-800'} accent-violet-500`}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 group">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-emerald-400">Output Volume</label>
              <span className="text-[10px] font-mono text-emerald-400 transition-all duration-300 group-hover:scale-110">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1.5" step="0.05"
              value={settings.volume} onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-all ${isLight ? 'bg-slate-200' : 'bg-slate-800'} accent-emerald-500`}
            />
          </div>

          <div className="space-y-3 group">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-orange-400">Accent Strength</label>
              <span className="text-[10px] font-mono text-orange-400 transition-all duration-300 group-hover:scale-110">{Math.round(settings.accentStrength * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={settings.accentStrength} onChange={(e) => onUpdate({ accentStrength: parseFloat(e.target.value) })}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-all ${isLight ? 'bg-slate-200' : 'bg-slate-800'} accent-orange-500`}
            />
          </div>
        </div>
      </div>

      <div className={`space-y-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/50'}`}>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emotional Delivery</label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map(e => {
            const isSelected = settings.emotion === e.id;
            let activeClass = isSelected 
              ? (accentColor === 'cyan' ? 'bg-cyan-600 border-cyan-400 shadow-cyan-600/20 scale-105' : 'bg-indigo-600 border-indigo-400 shadow-indigo-600/20 scale-105')
              : (isLight ? 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700');
            
            return (
              <button
                key={e.id}
                onClick={() => onUpdate({ emotion: e.id })}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all group flex items-center gap-2 border shadow-lg hover:scale-110 active:scale-95 ${activeClass} ${isSelected ? 'text-white' : ''}`}
              >
                <span className="text-sm transition-transform group-hover:scale-125 duration-300">{e.icon}</span>
                {e.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TuningControls;