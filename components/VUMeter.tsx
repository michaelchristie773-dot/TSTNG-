
import React, { useEffect, useRef, useState } from 'react';

interface VUMeterProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  color?: string;
  onAnalyzerCreate?: (analyser: AnalyserNode) => void;
}

const VUMeter: React.FC<VUMeterProps> = ({ audioRef, color = '#6366f1', onAnalyzerCreate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let source: MediaElementAudioSourceNode;
    let analyzer: AnalyserNode;
    let animationId: number;

    const initAnalyzer = () => {
      if (audioContextRef.current) return; // Prevent double init
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      source = audioContextRef.current.createMediaElementSource(audio);
      analyzer = audioContextRef.current.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzer.connect(audioContextRef.current.destination);
      
      if (onAnalyzerCreate) {
        onAnalyzerCreate(analyzer);
      }
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyzer.getByteFrequencyData(dataArray);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    };

    const handlePlay = () => {
      if (!audioContextRef.current) initAnalyzer();
      else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsActive(true);
    };

    const handlePause = () => setIsActive(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      cancelAnimationFrame(animationId);
    };
  }, [audioRef, color, onAnalyzerCreate]);

  return (
    <div className={`h-8 w-full bg-slate-950/40 rounded-lg overflow-hidden border border-slate-800 transition-opacity ${isActive ? 'opacity-100' : 'opacity-20'}`}>
      <canvas ref={canvasRef} width={400} height={32} className="w-full h-full" />
    </div>
  );
};

export default VUMeter;
