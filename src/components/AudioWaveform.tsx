import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioWaveformProps {
  peaks?: number[];
  durationSeconds: number;
  audioUrl?: string;
  className?: string;
  compact?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  peaks = [],
  durationSeconds,
  audioUrl,
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // If peaks not provided, generate pleasing visual bars
  const barCount = compact ? 28 : 44;
  const bars = peaks.length >= barCount
    ? peaks.slice(0, barCount)
    : Array.from({ length: barCount }, (_, i) => {
        const val = Math.abs(Math.sin(i * 0.4) * 60 + Math.cos(i * 0.8) * 30);
        return Math.max(20, Math.min(95, Math.round(val)));
      });

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
      setAudioElement(audio);
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl]);

  // Synthetic playback simulation if no real audioUrl is attached (e.g. for mock notes)
  useEffect(() => {
    let interval: any;
    if (isPlaying && !audioUrl) {
      const totalMs = Math.max(5, durationSeconds) * 1000;
      const stepMs = 100;
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + stepMs / totalMs;
          if (next >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioUrl, durationSeconds]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleBarClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newProgress = index / barCount;
    setProgress(newProgress);
    if (audioElement && audioElement.duration) {
      audioElement.currentTime = newProgress * audioElement.duration;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSeconds = Math.round(progress * durationSeconds);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Play / Pause button */}
      <button
        onClick={togglePlay}
        className={`shrink-0 flex items-center justify-center rounded-full transition-all duration-200 ${
          compact
            ? 'w-7 h-7 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-stone-950'
            : 'w-10 h-10 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 active:scale-95'
        }`}
        title={isPlaying ? 'Pause' : 'Play audio memo'}
      >
        {isPlaying ? (
          <Pause className={compact ? 'w-3.5 h-3.5 fill-current' : 'w-4 h-4 fill-current'} />
        ) : (
          <Play className={compact ? 'w-3.5 h-3.5 fill-current translate-x-0.5' : 'w-4 h-4 fill-current translate-x-0.5'} />
        )}
      </button>

      {/* Waveform bars */}
      <div className="flex-1 flex items-center gap-[2.5px] h-9 cursor-pointer py-1" title="Click to seek">
        {bars.map((heightPercent, idx) => {
          const barProgress = idx / barCount;
          const isPassed = barProgress <= progress;
          return (
            <div
              key={idx}
              onClick={(e) => handleBarClick(idx, e)}
              className="flex-1 flex items-center justify-center h-full group"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-full transition-colors duration-150 ${
                  isPassed
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : 'bg-stone-700/60 group-hover:bg-stone-600'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Time indicator */}
      <div className="shrink-0 text-xs font-mono text-stone-400 min-w-[62px] text-right">
        {isPlaying ? formatTime(currentSeconds) : formatTime(durationSeconds)}
      </div>
    </div>
  );
};
