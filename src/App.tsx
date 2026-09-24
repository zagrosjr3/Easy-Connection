import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Footprints,
  ChefHat,
  Star,
  Search,
  Plus,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookMarked,
  ArrowUpRight,
} from 'lucide-react';
import { VoiceNote, ContextCategory, UserSubscription } from './types/note';
import { INITIAL_VOICE_NOTES } from './data/mockNotes';
import { Navbar } from './components/Navbar';
import { NoteCard } from './components/NoteCard';
import { WorkingOnPanel } from './components/WorkingOnPanel';
import { RecorderModal } from './components/RecorderModal';
import { AskBrainModal } from './components/AskBrainModal';
import { NoteDetailModal } from './components/NoteDetailModal';
import { SubscriptionModal } from './components/SubscriptionModal';

export default function App() {
  // 1. Voice Notes State with LocalStorage Persistence
  const [notes, setNotes] = useState<VoiceNote[]>(() => {
    try {
      const saved = localStorage.getItem('synapse_voice_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading localStorage', e);
    }
    return INITIAL_VOICE_NOTES;
  });

  // 2. Subscription State (Free vs Pro)
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('synapse_subscription');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading subscription', e);
    }
    return {
      plan: 'free',
      billingCycle: 'yearly',
      monthlyNotesUsed: 4, // 4 out of 5 used so user can immediately test limit
      monthlyNotesLimit: 5,
      monthlyResurfacingUsed: 1,
      monthlyResurfacingLimit: 3,
      renewsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  // Action items completion state
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('synapse_completed_actions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // UI Modals State
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isAskBrainOpen, setIsAskBrainOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<'All' | ContextCategory | 'Starred'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Ref to scroll to WorkingOnPanel
  const workingOnRef = useRef<HTMLDivElement | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('synapse_voice_notes', JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('synapse_subscription', JSON.stringify(subscription));
    } catch (e) {}
  }, [subscription]);

  useEffect(() => {
    try {
      localStorage.setItem('synapse_completed_actions', JSON.stringify(completedActions));
    } catch (e) {}
  }, [completedActions]);

  // Handlers
  const handleNoteCreated = (newNote: VoiceNote) => {
    setNotes((prev) => [newNote, ...prev]);
    // increment used notes counter
    setSubscription((prev) => ({
      ...prev,
      monthlyNotesUsed: prev.monthlyNotesUsed + 1,
    }));
    setSelectedNote(newNote);
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleActionItem = (noteId: string, itemIdx: number) => {
    const key = `${noteId}-${itemIdx}`;
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetSampleNotes = () => {
    if (confirm('Restore pre-loaded sample voice memos?')) {
      setNotes(INITIAL_VOICE_NOTES);
      setCompletedActions({});
    }
  };

  const scrollToWorkingOn = () => {
    workingOnRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    // 1. Context / Starred Filter
    if (activeFilter === 'Starred' && !note.starred) return false;
    if (activeFilter !== 'All' && activeFilter !== 'Starred' && note.contextCategory !== activeFilter) {
      return false;
    }

    // 2. Search Query filter (matches title, transcript, tags, entities, summary)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchTranscript = note.transcript.toLowerCase().includes(q);
      const matchSummary = note.summary.toLowerCase().includes(q);
      const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
      const matchEntities = note.entities?.some((e) => e.toLowerCase().includes(q));
      if (!matchTitle && !matchTranscript && !matchSummary && !matchTags && !matchEntities) {
        return false;
      }
    }

    return true;
  });

  const filterTabs: { id: 'All' | ContextCategory | 'Starred'; label: string; icon?: any }[] = [
    { id: 'All', label: 'All Memos' },
    { id: 'Driving', label: 'Driving', icon: Car },
    { id: 'Walking', label: 'Walking', icon: Footprints },
    { id: 'Cooking', label: 'Cooking', icon: ChefHat },
    { id: 'Starred', label: 'Starred', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        subscription={subscription}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenAskBrain={() => setIsAskBrainOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onScrollToWorkingOn={scrollToWorkingOn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900/60 to-stone-950 border border-stone-800/80 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-10 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice Memos That Don't Die In a List</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-100 leading-tight">
              A second brain that remembers what you thought on the road.
            </h1>

            <p className="text-sm sm:text-base text-stone-400 leading-relaxed max-w-2xl">
              You record ideas while driving, walking, or cooking. Synapse transcribes verbatim,
              extracts key insights, and <strong className="text-stone-200">intelligently resurfaces relevant thoughts</strong> the
              moment you're working on something related.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsRecorderOpen(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>Record New Voice Memo</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToWorkingOn}
                className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <span>Try Contextual Retrieval</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800/80">
            <div>
              <div className="text-xs font-medium text-stone-500">Memos in Brain</div>
              <div className="text-xl sm:text-2xl font-bold text-stone-200 mt-0.5">
                {notes.length} notes
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500">Spontaneous Contexts</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                Car • Walk • Kitchen
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500">Retrieval Accuracy</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
                Semantic AI
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500">Active Membership</div>
              <div className="text-xl sm:text-2xl font-bold text-stone-200 mt-0.5 flex items-center gap-1.5">
                <span>{subscription.plan === 'pro' ? 'Pro Unlimited' : 'Free Tier'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE WORKING ON... CONTEXTUAL RESURFACING ENGINE */}
        <section ref={workingOnRef}>
          <WorkingOnPanel
            notes={notes}
            subscription={subscription}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onSelectNote={(note) => setSelectedNote(note)}
          />
        </section>

        {/* SECTION 3: THE MEMORY ARCHIVE & EXPLORER */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
                Your Voice Archive
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                Transcribed verbatim with Gemini 3.5 Transcribe, indexed with key insights & action items.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, shallots, pricing..."
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Context Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {filterTabs.map(({ id, label, icon: Icon }) => {
                const isSelected = activeFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800/70'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetSampleNotes}
              className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1 font-medium transition-colors"
              title="Reset sample memos"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Samples</span>
            </button>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 px-4 bg-stone-900/40 rounded-3xl border border-stone-800/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-stone-300">No matching voice memos found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try changing your search terms or filter, or record a new voice memo right now.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
                className="text-xs text-amber-400 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onSelect={(n) => setSelectedNote(n)}
                  onToggleStar={handleToggleStar}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-800/80 bg-stone-950 py-8 px-4 text-center text-xs text-stone-500 space-y-2">
        <p>
          Synapse Voice • Intelligent Second Brain for Hands-Free Capture & Contextual Resurfacing
        </p>
        <p className="text-[11px] text-stone-600">
          Powered by Gemini 3.5 Transcribe & Gemini 3.8 Flash • Audio & Transcripts are private
        </p>
      </footer>

      {/* MODALS */}
      <RecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onNoteCreated={handleNoteCreated}
        subscription={subscription}
        onOpenUpgrade={() => {
          setIsRecorderOpen(false);
          setIsUpgradeOpen(true);
        }}
      />

      <AskBrainModal
        isOpen={isAskBrainOpen}
        onClose={() => setIsAskBrainOpen(false)}
        notes={notes}
        onSelectNote={(note) => {
          setIsAskBrainOpen(false);
          setSelectedNote(note);
        }}
      />

      <NoteDetailModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onToggleStar={(id) => handleToggleStar(id)}
        onDeleteNote={handleDeleteNote}
        onToggleActionItem={handleToggleActionItem}
        completedActions={completedActions}
      />

      <SubscriptionModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => setSubscription(newSub)}
      />
    </div>
  );
}
