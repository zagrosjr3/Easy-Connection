import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Search,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { VoiceNote, AskBrainResult } from '../types/note';
import { askSecondBrain } from '../services/geminiService';

interface AskBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: VoiceNote[];
  onSelectNote: (note: VoiceNote) => void;
}

export const AskBrainModal: React.FC<AskBrainModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AskBrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleQuestions = [
    'What ideas did I have about mobile audio friction while walking?',
    'What did I decide about cooking shallots and scallion oil?',
    'Summarize all my complaints about traditional note apps.',
    'Did I mention any dietary restrictions for the dinner party?',
  ];

  const handleAsk = async (questionToAsk?: string) => {
    const q = (questionToAsk || query).trim();
    if (!q) return;

    if (questionToAsk) setQuery(questionToAsk);
    setIsLoading(true);
    setError(null);

    try {
      const data = await askSecondBrain(q, notes);
      setResult(data);
    } catch (err: any) {
      console.error('Ask brain error:', err);
      setError(err?.message || 'Failed to query memory archive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100">Ask Your Second Brain</h2>
              <p className="text-[11px] text-stone-400">
                Natural language query across all your spontaneous voice memos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Query input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-500 absolute left-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk();
              }}
              placeholder="e.g. 'What did I say about shallot oil while cooking?'"
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-2xl pl-11 pr-24 py-3.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
            />
            <button
              onClick={() => handleAsk()}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ask</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          {!result && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Suggested Questions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(sq)}
                    className="p-3 text-left rounded-xl bg-stone-950/70 border border-stone-800/80 hover:border-amber-500/40 text-xs text-stone-300 hover:text-amber-200 transition-colors"
                  >
                    "{sq}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Answer Card */}
          {result && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-stone-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesized Answer</span>
                </div>

                <div className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {result.answer}
                </div>
              </div>

              {/* Cited Notes */}
              {result.citedNoteIds && result.citedNoteIds.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                    Source Voice Memos Cited ({result.citedNoteIds.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.citedNoteIds.map((id) => {
                      const note = notes.find((n) => n.id === id);
                      if (!note) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            onClose();
                            onSelectNote(note);
                          }}
                          className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 text-left transition-all group flex items-center justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-medium text-amber-400 block mb-0.5">
                              {note.contextCategory} • {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-bold text-stone-200 group-hover:text-amber-200 line-clamp-1">
                              {note.title}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related follow-up questions */}
              {result.relatedFollowUps && result.relatedFollowUps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <span className="text-xs text-stone-500">Related follow-up questions:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.relatedFollowUps.map((rf, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAsk(rf)}
                        className="text-xs px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700/60 transition-colors"
                      >
                        {rf}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
