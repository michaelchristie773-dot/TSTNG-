import React from 'react';

interface FilterState {
  gender: string;
  age: string;
  accent: string;
  emotionSupport: boolean;
}

interface VoiceGalleryControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  availableAccents: string[];
  currentTheme?: 'dark' | 'dim' | 'light';
}

const VoiceGalleryControls: React.FC<VoiceGalleryControlsProps> = ({ 
  filters, onFilterChange, sort, onSortChange, availableAccents, currentTheme = 'dark' 
}) => {
  const isLight = currentTheme === 'light';
  
  const selectClass = `text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl outline-none transition-all ${
    isLight 
    ? 'bg-white border border-slate-200 text-slate-600 focus:border-indigo-500' 
    : 'bg-slate-900 border border-slate-800 text-slate-400 focus:border-indigo-600'
  }`;

  return (
    <div className={`p-4 space-y-4 rounded-3xl border transition-all ${
      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
    }`}>
      <div className="grid grid-cols-2 gap-3">
        <select 
          className={selectClass}
          value={filters.gender}
          onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
        >
          <option value="all">Any Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Neutral">Neutral</option>
        </select>

        <select 
          className={selectClass}
          value={filters.age}
          onChange={(e) => onFilterChange({ ...filters, age: e.target.value })}
        >
          <option value="all">Any Age</option>
          <option value="Young">Young</option>
          <option value="Adult">Adult</option>
          <option value="Elderly">Elderly</option>
        </select>

        <select 
          className={selectClass}
          value={filters.accent}
          onChange={(e) => onFilterChange({ ...filters, accent: e.target.value })}
        >
          <option value="all">Any Accent</option>
          {availableAccents.map(accent => (
            <option key={accent} value={accent}>{accent} English</option>
          ))}
        </select>

        <select 
          className={selectClass}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="highest_rated">Highest Rated</option>
          <option value="most_used">Most Used</option>
        </select>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox"
            checked={filters.emotionSupport}
            onChange={(e) => onFilterChange({ ...filters, emotionSupport: e.target.checked })}
            className="hidden"
          />
          <div className={`w-10 h-5 rounded-full relative transition-all ${filters.emotionSupport ? 'bg-indigo-600' : 'bg-slate-800'}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${filters.emotionSupport ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400">High Expressiveness</span>
        </label>
      </div>
    </div>
  );
};

export default VoiceGalleryControls;