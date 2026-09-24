import React, { useState } from 'react';
import {
  X,
  Star,
  Trash2,
  Copy,
  Check,
  Share2,
  Clock,
  Car,
  Footprints,
  ChefHat,
  Zap,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  ListTodo,
  FileText,
} from 'lucide-react';
import { VoiceNote, ContextCategory } from '../types/note';
import { AudioWaveform } from './AudioWaveform';

interface NoteDetailModalProps {
  note: VoiceNote | null;
  onClose: () => void;
  onToggleStar: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onToggleActionItem: (noteId: string, itemIndex: number) => void;
  completedActions: Record<string, boolean>; // e.g. "note-101-0": true
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  onClose,
  onToggleStar,
  onDeleteNote,
  onToggleActionItem,
  completedActions,
}) => {
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript'>('insights');

  if (!note) return null;

  const getContextMeta = (cat: ContextCategory) => {
    switch (cat) {
      case 'Driving':
        return {
          icon: Car,
          label: 'Driving Mode',
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      case 'Walking':
        return {
          icon: Footprints,
          label: 'Walking Mode',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'Cooking':
        return {
          icon: ChefHat,
          label: 'Cooking Mode',
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

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(note.transcript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# ${note.title}
*Recorded in ${note.contextCategory} on ${new Date(note.createdAt).toLocaleString()}*
*Tags:* ${note.tags.join(', ')}

## Summary
${note.summary}

## Key Insights
${note.keyInsights.map((k) => `- ${k}`).join('\n')}

## Action Items
${note.actionItems.map((a) => `- [ ] ${a}`).join('\n')}

## Verbatim Audio Transcript
${note.transcript}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/70">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{meta.label}</span>
            </span>

            <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {new Date(note.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleStar(note.id)}
              className="p-2 rounded-full text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
              title={note.starred ? 'Starred' : 'Star memo'}
            >
              <Star
                className={`w-4 h-4 ${
                  note.starred ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
            <button
              onClick={handleExportMarkdown}
              className="p-2 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Download Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this voice note from your second brain?')) {
                  onDeleteNote(note.id);
                  onClose();
                }
              }}
              className="p-2 rounded-full text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Note Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight mb-2">
              {note.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700 font-mono"
                >
                  {tag}
                </span>
              ))}
              {note.emotionalTone && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300/90 border border-amber-500/20">
                  Mood: {note.emotionalTone}
                </span>
              )}
            </div>
          </div>

          {/* Audio Waveform Player */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 shadow-inner">
            <AudioWaveform
              peaks={note.waveformPeaks}
              durationSeconds={note.durationSeconds}
              audioUrl={note.audioUrl}
            />
          </div>

          {/* Spark Snippet */}
          {note.sparkSnippet && (
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200/95 italic">
              <span className="font-semibold block not-italic text-[10px] uppercase text-amber-400 mb-1">
                Spark Snippet (Core Epiphany)
              </span>
              "{note.sparkSnippet}"
            </div>
          )}

          {/* Navigation Tabs (Insights vs Raw Transcript) */}
          <div className="flex border-b border-stone-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('insights')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'insights'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Synthesis & Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'transcript'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Verbatim Audio Transcript</span>
            </button>
          </div>

          {/* TAB 1: Insights & Actions */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Executive Summary
                </h4>
                <p className="text-sm text-stone-300 leading-relaxed bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                  {note.summary}
                </p>
              </div>

              {/* Key Insights */}
              {note.keyInsights && note.keyInsights.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Key Insights Extracted
                  </h4>
                  <ul className="space-y-2">
                    {note.keyInsights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-stone-300 flex items-start gap-2 bg-stone-950/40 p-3 rounded-xl border border-stone-800/60"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <span className="leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items with interactive checkmarks */}
              {note.actionItems && note.actionItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                    Action Items & Tasks
                  </h4>
                  <div className="space-y-2">
                    {note.actionItems.map((item, idx) => {
                      const itemKey = `${note.id}-${idx}`;
                      const isDone = !!completedActions[itemKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => onToggleActionItem(note.id, idx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isDone
                              ? 'bg-stone-950/30 border-stone-800/50 text-stone-500 line-through'
                              : 'bg-stone-950/70 border-stone-800 text-stone-200 hover:border-amber-500/30'
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-500 shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mentioned Entities */}
              {note.entities && note.entities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Concepts & Entities Mentioned
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {note.entities.map((entity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Verbatim Transcript */}
          {activeTab === 'transcript' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Transcribed with Gemini 3.5 Transcribe
                </span>
                <button
                  onClick={handleCopyTranscript}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Transcript</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans whitespace-pre-wrap">
                {note.transcript}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
