
import React, { useState } from 'react';
import { VoiceName } from '../types';

interface VoiceCardProps {
  name: string;
  voiceId: VoiceName | string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string, name: string) => void;
  isPreviewing?: boolean;
  description: string;
  tags: string[];
  isClone?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  // Widened gender and age types to string to accommodate various neural profile source formats
  metadata?: {
    gender?: string;
    age?: string;
    accent?: string;
    traits?: string[];
  };
  currentTheme?: 'dark' | 'dim' | 'light';
  rating?: number;
  onRate?: (id: string, rating: number) => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ 
  name, voiceId, isSelected, onSelect, onPreview, isPreviewing, 
  description, tags, isClone, isFavorite, onToggleFavorite, onDelete, metadata, currentTheme = 'dark',
  rating = 0, onRate
}) => {
  const isLight = currentTheme === 'light';
  const isDark = currentTheme === 'dark';
  const accentColor = isClone ? 'cyan' : 'indigo';
  const [hoverRating, setHoverRating] = useState(0);
  
  const borderClass = isSelected 
    ? (accentColor === 'indigo' ? 'border-indigo-500/50 ring-4 ring-indigo-500/10' : 'border-cyan-500/50 ring-4 ring-cyan-500/10')
    : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/5 hover:border-white/20');

  const bgClass = isSelected 
    ? (accentColor === 'indigo' ? 'bg-indigo-600/10' : 'bg-cyan-600/10')
    : (isLight ? 'bg-white shadow-sm' : (isDark ? 'bg-zinc-950/60' : 'bg-slate-900/40'));

  const avatarBg = isSelected 
    ? (accentColor === 'indigo' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]')
    : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400');

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(voiceId as string, name);
  };

  const handleRatingClick = (e: React.MouseEvent, r: number) => {
    e.stopPropagation();
    if (onRate) onRate(voiceId as string, r);
  };

  return (
    <div 
      onClick={() => onSelect(voiceId as string)}
      className={`relative p-6 rounded-[32px] border transition-all duration-300 cursor-pointer group active:scale-[0.98] ${borderClass} ${bgClass}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${avatarBg} ${isSelected ? 'text-white' : ''}`}>
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-extrabold uppercase tracking-tight text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{name}</h3>
            {isClone && (
              <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Clone</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{metadata?.accent || 'Global'}</span>
            <div className={`w-1 h-1 rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{metadata?.age || 'Adult'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <p className={`text-[11px] leading-relaxed line-clamp-2 font-medium opacity-70 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {metadata?.traits?.map(t => (
              <span key={t} className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-tighter border transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500' : 'bg-white/5 border-white/10 text-slate-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                {t}
              </span>
            ))}
          </div>

          {/* Rating Display */}
          <div 
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onClick={(e) => handleRatingClick(e, star)}
                className={`transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-amber-400 scale-110'
                    : isLight ? 'text-slate-200' : 'text-slate-700'
                } hover:scale-125`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-2 items-center">
          <button 
            disabled={isPreviewing}
            onClick={handlePreviewClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              isPreviewing 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600' : 'bg-white/5 text-slate-400 hover:bg-indigo-600 hover:text-white')
            }`}
          >
            {isPreviewing ? (
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Preview
              </>
            )}
          </button>
          <div className="flex gap-1.5">
            {tags.slice(0, 1).map(tag => (
              <span key={tag} className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.2em] border ${isLight ? 'border-slate-200 text-slate-300' : 'border-white/5 text-slate-600'}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className={`transition-all duration-500 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
           <svg className={`w-5 h-5 ${accentColor === 'indigo' ? 'text-indigo-500' : 'text-cyan-500'}`} fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
        </div>
      </div>
    </div>
  );
};

export default VoiceCard;
