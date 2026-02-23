import React, { useState } from 'react';
import ArchitectModal from './ArchitectModal';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  currentTheme: 'dark' | 'dim' | 'light';
  isAuthenticated: boolean;
  onSignUp: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, isAuthenticated, onSignUp }) => {
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);

  return (
    <header className="relative py-8 text-center border-b border-white/5 bg-black/20 backdrop-blur-md">
      <ArchitectModal isOpen={isArchitectOpen} onClose={() => setIsArchitectOpen(false)} />
      
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Neural Pulse Active</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center space-x-3 group cursor-pointer" onClick={() => setIsArchitectOpen(true)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 uppercase tracking-tighter">
              Vocalize Studio
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button 
              onClick={onSignUp}
              className="px-6 py-2.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all"
            >
              Sync Profile
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pro Session</span>
            </div>
          )}
          <button 
            onClick={onOpenSettings}
            className="p-2.5 border border-white/10 rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;