import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Car,
  Footprints,
  ChefHat,
  Zap,
  Copy,
  Check,
  Download,
  Lightbulb,
  FileText,
  Compass,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { VoiceNote, ResurfacingResult, UserSubscription } from '../types/note';
import { resurfaceNotesForContext } from '../services/geminiService';

interface WorkingOnPanelProps {
  notes: VoiceNote[];
  subscription: UserSubscription;
  onOpenUpgrade: () => void;
  onSelectNote: (note: VoiceNote) => void;
}

export const WorkingOnPanel: React.FC<WorkingOnPanelProps> = ({
  notes,
  subscription,
  onOpenUpgrade,
  onSelectNote,
}) => {
  const [activeContext, setActiveContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResurfacingResult | null>(null);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested starter contexts that map beautifully to the realistic voice notes
  const presetQueries = [
    {
      title: 'Monetization Strategy',
      text: 'Drafting pricing tiers and freemium feature gates for a productivity software launch',
    },
    {
      title: 'Dinner Party Planning',
      text: 'Planning a weekend dinner menu for friends with dairy and gluten restrictions',
    },
    {
      title: 'User Onboarding UX',
      text: 'Revamping mobile first-time user experience to eliminate blank-slate churn',
    },
    {
      title: 'Second Brain Essay',
      text: 'Writing a think-piece on why voice memos become idea graveyards and how active retrieval fixes it',
    },
  ];

  const isFreePlan = subscription.plan === 'free';
  const hasExceededResurfacingLimit =
    isFreePlan && subscription.monthlyResurfacingUsed >= subscription.monthlyResurfacingLimit;

  const handleResurface = async (contextToUse?: string) => {
    const query = (contextToUse || activeContext).trim();
    if (!query) return;

    if (hasExceededResurfacingLimit) {
      onOpenUpgrade();
      return;
    }

    setIsLoading(true);
    setError(null);
    if (contextToUse) {
      setActiveContext(contextToUse);
    }

    try {
      const data = await resurfaceNotesForContext(query, notes);
      setResult(data);
      // increment counter in local state
      subscription.monthlyResurfacingUsed += 1;
    } catch (err: any) {
      console.error('Resurfacing error:', err);
      setError(err?.message || 'Failed to resurface thoughts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBrief = () => {
    if (!result?.synthesizedBrief) return;
    navigator.clipboard.writeText(result.synthesizedBrief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!result?.synthesizedBrief) return;
    const blob = new Blob([result.synthesizedBrief], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-brief-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getContextIcon = (cat: string) => {
    switch (cat) {
      case 'Driving':
        return <Car className="w-3.5 h-3.5 text-blue-400" />;
      case 'Walking':
        return <Footprints className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Cooking':
        return <ChefHat className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              The Retrieval Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
              Active Context Resurfacing
            </h2>
          </div>
        </div>

        {/* Plan & Usage indicator */}
        <div className="flex items-center gap-2">
          {isFreePlan ? (
            <div className="flex items-center gap-2 text-xs bg-stone-950 px-3 py-1.5 rounded-full border border-stone-800">
              <span className="text-stone-400">
                Resurfacing runs:{' '}
                <strong className="text-stone-200">
                  {subscription.monthlyResurfacingUsed} / {subscription.monthlyResurfacingLimit}
                </strong>
              </span>
              <button
                onClick={onOpenUpgrade}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pro Unlimited Retrieval
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-stone-400 max-w-2xl mb-6">
        Don’t let your voice memos die in a list. Tell Synapse what you’re currently drafting,
        deciding, or building. Our semantic brain links back to your spontaneous car rides, walks,
        and kitchen epiphanies—and synthesizes them into an actionable brief.
      </p>

      {/* Input Box */}
      <div className="relative mb-4">
        <textarea
          value={activeContext}
          onChange={(e) => setActiveContext(e.target.value)}
          placeholder="e.g., 'Writing our Q3 pricing proposal and deciding what features belong in the free tier vs paid...'"
          rows={3}
          className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/70 rounded-2xl p-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-all resize-none shadow-inner"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-stone-500">
            {notes.length} voice notes in library ready to cross-reference
          </span>

          <button
            type="button"
            onClick={() => handleResurface()}
            disabled={isLoading || !activeContext.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isLoading || !activeContext.trim()
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Scanning Voice Memory...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Resurface Relevant Thoughts</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
          <Compass className="w-3 h-3 text-stone-400" />
          Try instant scenario:
        </span>
        {presetQueries.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleResurface(preset.text)}
            className="text-xs px-3 py-1.5 rounded-full bg-stone-800/60 hover:bg-stone-800 hover:text-amber-300 text-stone-300 border border-stone-700/60 transition-colors flex items-center gap-1.5"
          >
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col items-center justify-center gap-3 animate-in fade-in">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
              <Brain className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-stone-200">
            Scanning across driving, walking & cooking memos...
          </p>
          <p className="text-xs text-stone-500 max-w-md text-center">
            Gemini is identifying conceptual connections, calculating relevance scores, and synthesizing an action brief.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 mb-6">
          {error}
        </div>
      )}

      {/* Resurfaced Results View */}
      {result && !isLoading && (
        <div className="space-y-6 pt-4 border-t border-stone-800/80 animate-in fade-in duration-300">
          {/* Top Banner Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Resurfacing Results
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {result.matches.length} matching voice memo{result.matches.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear results
            </button>
          </div>

          {/* 1. SYNTHESIZED EXECUTIVE BRIEF */}
          {result.synthesizedBrief && (
            <div className="bg-stone-950 rounded-2xl border border-amber-500/30 p-6 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                    Synthesized Working Brief
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBrief}
                    className="px-2.5 py-1 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedBrief ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>Copy Brief</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                    title="Download as Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rendered Brief Content */}
              <div className="text-xs sm:text-sm text-stone-300 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {result.synthesizedBrief}
              </div>
            </div>
          )}

          {/* 2. CROSS-DOMAIN EPIPHANY (if detected) */}
          {result.crossDomainEpiphany && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3 text-xs">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block mb-0.5 font-semibold">
                  Cross-Domain Epiphany
                </strong>
                <p className="text-amber-300/80 leading-relaxed">
                  {result.crossDomainEpiphany}
                </p>
              </div>
            </div>
          )}

          {/* 3. INDIVIDUAL RESURFACED NOTES LIST */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Directly Relevant Spontaneous Notes
            </h4>

            {result.matches.map((match) => {
              const originalNote = notes.find((n) => n.id === match.noteId);
              if (!originalNote) return null;

              return (
                <div
                  key={match.noteId}
                  className="bg-stone-950/70 border border-stone-800/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all space-y-3 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-stone-900 border border-stone-800">
                        {getContextIcon(originalNote.contextCategory)}
                      </span>
                      <span className="text-xs font-semibold text-stone-300">
                        {originalNote.contextCategory} • {new Date(originalNote.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {match.relevanceScore}% Match
                      </span>
                      <button
                        onClick={() => onSelectNote(originalNote)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-2"
                      >
                        Open Memo →
                      </button>
                    </div>
                  </div>

                  <h5 className="text-base font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                    {originalNote.title}
                  </h5>

                  {/* Why it resurfaced rationale */}
                  <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                    <span className="text-stone-400 font-medium">Why it resurfaced: </span>
                    {match.whyResurfaced}
                  </div>

                  {/* Spark Quote */}
                  {match.keySparkQuote && (
                    <blockquote className="border-l-2 border-amber-400/80 pl-3 italic text-xs text-amber-200/90">
                      "{match.keySparkQuote}"
                    </blockquote>
                  )}

                  {/* Suggested Action */}
                  {match.suggestedAction && (
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                      <strong className="text-stone-300">Action:</strong>
                      <span>{match.suggestedAction}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
