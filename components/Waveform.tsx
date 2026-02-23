
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  url: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  color?: 'indigo' | 'cyan';
}

const Waveform: React.FC<WaveformProps> = ({ url, audioRef, color = 'indigo' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [zoom, setZoom] = useState(0);

  const primaryColor = color === 'indigo' ? '#6366f1' : '#06b6d4';
  const secondaryColor = '#1e293b'; // slate-800

  useEffect(() => {
    if (!containerRef.current || !audioRef.current) return;

    // Initialize WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: secondaryColor,
      progressColor: primaryColor,
      cursorColor: '#ffffff',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      height: 64,
      media: audioRef.current, // Sync with existing audio element
      normalize: true,
      interact: true,
      hideScrollbar: false,
    });

    wavesurferRef.current = ws;

    // Cleanup on unmount
    return () => {
      ws.destroy();
    };
  }, [color]);

  // Load new URL when it changes
  useEffect(() => {
    if (wavesurferRef.current) {
      if (url) {
        wavesurferRef.current.load(url).catch(err => {
          // Silent catch for "The operation was aborted" errors which are common during rapid changes
          if (err.name !== 'AbortError') {
            console.error('WaveSurfer load error:', err);
          }
        });
      } else {
        // If URL is null, we might want to clear the waveform or just do nothing
        // WaveSurfer v7 doesn't have a simple 'clear' but we can load an empty blob if needed
      }
    }
  }, [url]);

  // Handle zoom changes
  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setZoom(value);
    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(value);
    }
  };

  return (
    <div className="w-full mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Master Waveform Scrub
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950/40 px-3 py-1 rounded-lg border border-slate-800">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Zoom</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={zoom} 
            onChange={handleZoom}
            className={`w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
          />
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full bg-slate-950/40 rounded-xl border border-slate-800 p-2 cursor-pointer transition-colors hover:border-slate-700"
      />
      
      <div className="flex justify-between px-1">
        <span className="text-[9px] font-mono text-slate-600">0:00</span>
        <span className="text-[9px] font-mono text-slate-600">Scrub to navigate script delivery</span>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }
        
        /* Wavesurfer scrollbar styling */
        div[ref] ::-webkit-scrollbar {
          height: 4px;
        }
        div[ref] ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.2);
        }
        div[ref] ::-webkit-scrollbar-thumb {
          background: ${primaryColor}44;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Waveform;
