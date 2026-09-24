import React from 'react';
import {
  Car,
  Footprints,
  ChefHat,
  Zap,
  Star,
  Clock,
  Sparkles,
  Tag,
} from 'lucide-react';
import { VoiceNote, ContextCategory } from '../types/note';
import { AudioWaveform } from './AudioWaveform';

interface NoteCardProps {
  note: VoiceNote;
  onSelect: (note: VoiceNote) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onSelect,
  onToggleStar,
}) => {
  const getContextMeta = (cat: ContextCategory) => {
    switch (cat) {
      case 'Driving':
        return {
          icon: Car,
          label: 'Driving',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      case 'Walking':
        return {
          icon: Footprints,
          label: 'Walking',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'Cooking':
        return {
          icon: ChefHat,
          label: 'Cooking',
          badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        };
      default:
        return {
          icon: Zap,
          label: 'Quick Thought',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
    }
  };

  const meta = getContextMeta(note.contextCategory);
  const Icon = meta.icon;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={() => onSelect(note)}
      className="group relative bg-stone-900/70 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-black/40"
    >
      <div>
        {/* Top bar: Category + Date + Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{meta.label}</span>
            </span>

            <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {formatDate(note.createdAt)}
            </span>
          </div>

          <button
            onClick={(e) => onToggleStar(note.id, e)}
            className="p-1 rounded-full text-stone-500 hover:text-amber-400 transition-colors"
            title={note.starred ? 'Starred' : 'Star memo'}
          >
            <Star
              className={`w-4 h-4 ${
                note.starred ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-200 transition-colors mb-2 line-clamp-2">
          {note.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-stone-400 leading-relaxed line-clamp-3 mb-4">
          {note.summary}
        </p>

        {/* Spark Snippet Callout */}
        {note.sparkSnippet && (
          <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/70 mb-4 text-[11px] text-amber-300/80 italic line-clamp-2">
            "{note.sparkSnippet}"
          </div>
        )}
      </div>

      <div>
        {/* Waveform Scrubber */}
        <div className="pt-2 border-t border-stone-800/60 mb-3">
          <AudioWaveform
            peaks={note.waveformPeaks}
            durationSeconds={note.durationSeconds}
            audioUrl={note.audioUrl}
            compact={true}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 border border-stone-700/40 font-mono"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 text-stone-500">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
