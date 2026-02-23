
import React, { useState, useEffect } from 'react';

interface ArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchitectModal: React.FC<ArchitectModalProps> = ({ isOpen, onClose }) => {
  const [displayText, setDisplayText] = useState('');
  const metadata = [
    "API Status: Optimizing [Gemini 2.5 Pro]...",
    "Studio Version: 2.5.0-Stable",
    "Encryption: AES-256 Multi-layer Active",
    "Location: Neural Edge Server #09",
    "Owner: Michael Christie",
    "System: Vocalize Studio v2.5",
  ];

  useEffect(() => {
    if (!isOpen) {
      setDisplayText('');
      return;
    }

    let currentLine = 0;
    let currentChar = 0;
    // Fix: Using any for the timeout to avoid NodeJS namespace issues in browser environment
    let timeout: any;

    const type = () => {
      if (currentLine < metadata.length) {
        if (currentChar < metadata[currentLine].length) {
          setDisplayText(prev => prev + metadata[currentLine][currentChar]);
          currentChar++;
          timeout = setTimeout(type, 30);
        } else {
          setDisplayText(prev => prev + '\n');
          currentLine++;
          currentChar = 0;
          timeout = setTimeout(type, 150);
        }
      }
    };

    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-[#020617] border border-indigo-500/30 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden animate-in zoom-in-95">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Michael Christie</h2>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lead Architect & Senior Engineer</p>
            </div>
          </div>

          <div className="p-4 bg-black/50 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-indigo-300/80 min-h-[160px] whitespace-pre-wrap">
            {displayText}
            <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1" />
          </div>

          <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
            <p>
              Vocalize AI Studio is a culmination of high-end frontend architecture and next-generation neural synthesis. 
              Designed for creators who demand studio-grade fidelity and intuitive control.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Close Access
          </button>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default ArchitectModal;
