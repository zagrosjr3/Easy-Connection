export type ContextCategory = 
  | 'Driving'
  | 'Walking'
  | 'Cooking'
  | 'Workout'
  | 'Quick Thought'
  | 'Meeting'
  | 'Other';

export interface VoiceNote {
  id: string;
  title: string;
  summary: string;
  transcript: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
  contextCategory: ContextCategory;
  entities: string[];
  emotionalTone: string;
  sparkSnippet?: string;
  createdAt: string; // ISO string
  durationSeconds: number;
  starred?: boolean;
  archived?: boolean;
  audioUrl?: string; // object URL or data URL
  waveformPeaks?: number[]; // normalized peaks 0-100 for visualizer
}

export interface ResurfacedMatch {
  noteId: string;
  relevanceScore: number; // 0 - 100
  whyResurfaced: string;
  keySparkQuote: string;
  suggestedAction: string;
}

export interface ResurfacingResult {
  matches: ResurfacedMatch[];
  synthesizedBrief: string;
  crossDomainEpiphany?: string | null;
}

export interface AskBrainResult {
  answer: string;
  citedNoteIds: string[];
  relatedFollowUps?: string[];
}

export interface UserSubscription {
  plan: 'free' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  monthlyNotesUsed: number;
  monthlyNotesLimit: number;
  monthlyResurfacingUsed: number;
  monthlyResurfacingLimit: number;
  renewsAt: string;
}
