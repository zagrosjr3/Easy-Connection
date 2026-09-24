import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Infinity,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { UserSubscription } from '../types/note';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (newSub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [justUpgraded, setJustUpgraded] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeToPro = () => {
    onUpdateSubscription({
      plan: 'pro',
      billingCycle,
      monthlyNotesUsed: subscription.monthlyNotesUsed,
      monthlyNotesLimit: 9999,
      monthlyResurfacingUsed: subscription.monthlyResurfacingUsed,
      monthlyResurfacingLimit: 9999,
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setJustUpgraded(true);
    setTimeout(() => {
      setJustUpgraded(false);
      onClose();
    }, 1200);
  };

  const handleSwitchToFree = () => {
    onUpdateSubscription({
      plan: 'free',
      billingCycle: 'monthly',
      monthlyNotesUsed: 4, // set near limit for realistic testing
      monthlyNotesLimit: 5,
      monthlyResurfacingUsed: 2,
      monthlyResurfacingLimit: 3,
      renewsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    });
    onClose();
  };

  const isPro = subscription.plan === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ✦
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">Synapse Membership</h2>
              <p className="text-[11px] text-stone-400">
                Straightforward pricing: Free tier with a monthly limit, Pro for unlimited intelligence.
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

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Plan Testing Switcher for Agent / User */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">Simulator:</span>
              <span className="font-bold text-amber-300">
                Currently in {isPro ? 'Pro Unlimited' : 'Free Tier (Limit Demo)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwitchToFree}
                className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                  !isPro
                    ? 'bg-stone-800 text-stone-200 border-stone-700'
                    : 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300'
                }`}
              >
                Test Free Limit (4/5 Used)
              </button>
              <button
                type="button"
                onClick={handleUpgradeToPro}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
                  isPro
                    ? 'bg-amber-500 text-stone-950 border-amber-500'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-amber-300'
                }`}
              >
                Test Pro (Unlimited)
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-xs font-semibold ${
                billingCycle === 'monthly' ? 'text-stone-100' : 'text-stone-500'
              }`}
            >
              Monthly billing
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')
              }
              className="relative w-12 h-6 bg-stone-800 rounded-full p-0.5 transition-colors border border-stone-700"
            >
              <div
                className={`w-5 h-5 rounded-full bg-amber-400 transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold ${
                  billingCycle === 'yearly' ? 'text-stone-100' : 'text-stone-500'
                }`}
              >
                Annual billing
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Save 31%
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier Card */}
            <div
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                !isPro
                  ? 'bg-stone-950/80 border-stone-700 shadow-md'
                  : 'bg-stone-950/40 border-stone-800/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-stone-200">Free Tier</h3>
                  {!isPro && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-medium">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="text-3xl font-extrabold text-stone-100 mb-1">$0</div>
                <p className="text-xs text-stone-500 mb-4">
                  For occasional on-the-go idea capture.
                </p>

                <ul className="space-y-2.5 text-xs text-stone-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong className="text-stone-200">5 voice memos</strong> per month
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verbatim Gemini audio transcription</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Driving, Walking & Cooking capture modes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong className="text-stone-200">3 AI Resurfacing runs</strong> per month
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800/80">
                <button
                  onClick={handleSwitchToFree}
                  disabled={!isPro}
                  className="w-full py-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold text-stone-300 transition-colors"
                >
                  {!isPro ? 'Your Active Plan' : 'Downgrade to Free'}
                </button>
              </div>
            </div>

            {/* Pro Tier Card */}
            <div
              className={`p-5 rounded-3xl border relative flex flex-col justify-between transition-all ${
                isPro
                  ? 'bg-amber-950/20 border-amber-500 shadow-xl shadow-amber-500/10'
                  : 'bg-stone-950 border-amber-500/50 shadow-lg'
              }`}
            >
              <div className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-amber-300">Second Brain Pro</h3>
                  {isPro && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-stone-100">
                    {billingCycle === 'yearly' ? '$8.25' : '$12'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">/ month</span>
                </div>
                <p className="text-xs text-stone-400 mb-4">
                  {billingCycle === 'yearly' ? 'Billed annually at $99/year' : 'Billed monthly'}
                </p>

                <ul className="space-y-2.5 text-xs text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-200">Unlimited</strong> voice memo recordings
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-200">Unlimited</strong> "Working On..."
                      resurfacing
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Synthesized executive briefs & Markdown export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>"Ask Your Brain" natural language chat & citations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cross-domain epiphany & serendipity detection</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800/80">
                <button
                  onClick={handleUpgradeToPro}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isPro ? 'Manage Pro Subscription' : 'Unlock Pro Unlimited'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Testimonial / Why this pricing works */}
          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 text-xs text-stone-400 space-y-1">
            <strong className="text-stone-300 block font-semibold">
              Why our retrieval engine is worth 10x traditional audio storage:
            </strong>
            <p>
              "Raw voice recordings are useless when forgotten. Synapse actively surfaces the 30-second
              thought you had on Highway 280 three weeks ago, right as you're writing your pitch deck."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
