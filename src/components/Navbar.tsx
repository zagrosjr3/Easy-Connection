import React from 'react';
import {
  Mic,
  Brain,
  MessageSquare,
  Sparkles,
  Zap,
  Search,
  Compass,
} from 'lucide-react';
import { UserSubscription } from '../types/note';

interface NavbarProps {
  subscription: UserSubscription;
  onOpenRecorder: () => void;
  onOpenAskBrain: () => void;
  onOpenUpgrade: () => void;
  onScrollToWorkingOn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subscription,
  onOpenRecorder,
  onOpenAskBrain,
  onOpenUpgrade,
  onScrollToWorkingOn,
}) => {
  const isPro = subscription.plan === 'pro';

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Brain className="w-5 h-5" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-stone-100">
                Synapse<span className="text-amber-400">Voice</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-400 border border-stone-700/50">
                AI Second Brain
              </span>
            </div>
            <span className="text-[10px] text-stone-500 hidden sm:block">
              Driving • Walking • Cooking • Spontaneous Retrieval
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Working On shortcut button */}
          <button
            onClick={onScrollToWorkingOn}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-amber-300 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Working On...</span>
          </button>

          {/* Ask Brain Button */}
          <button
            onClick={onOpenAskBrain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 hover:text-amber-300 transition-colors"
            title="Ask anything across your voice memos"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Ask Brain</span>
          </button>

          {/* Subscription Tier Badge / CTA */}
          <button
            onClick={onOpenUpgrade}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isPro
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            {isPro ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pro Unlimited</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-stone-400">
                  Free: <strong className="text-stone-200">{subscription.monthlyNotesUsed}/{subscription.monthlyNotesLimit}</strong>
                </span>
                <span className="text-amber-400 hidden lg:inline ml-1 font-bold">Upgrade</span>
              </>
            )}
          </button>

          {/* Big Record Memo CTA */}
          <button
            onClick={onOpenRecorder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            <Mic className="w-4 h-4 fill-stone-950" />
            <span>Record Note</span>
          </button>
        </div>
      </div>
    </header>
  );
};
