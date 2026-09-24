import { VoiceNote } from '../types/note';

// Helper to generate pseudo waveform heights
function generateMockPeaks(seed: number, count = 48): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = Math.abs(Math.sin(i * 0.35 + seed) * 70 + Math.cos(i * 0.7 + seed * 2) * 25);
    peaks.push(Math.max(15, Math.min(95, Math.round(val))));
  }
  return peaks;
}

export const INITIAL_VOICE_NOTES: VoiceNote[] = [
  {
    id: 'note-101',
    title: 'Freemium Trap & The Active Resurfacing Gap',
    summary: 'Why traditional voice memo apps become graveyards: users record constantly while driving, but search requires remembering past keywords. The real breakthrough is proactive, context-aware resurfacing.',
    transcript: `Hey, quick thought while driving on the 280. I was thinking about why almost every audio memo app I've used ends up becoming an idea graveyard. You record 50 memos when driving or pacing around, and then you literally never open them again. Why? Because search in existing apps is passive. It requires you to remember the exact phrasing or keywords you mumbled three weeks ago. 
The monetization model should reflect this: basic recording is commoditized, but context-aware cognitive resurfacing is where the 10x value lives. If an app can look at what project you're currently tackling and say "Hey, while driving on Tuesday you had this exact realization about user onboarding friction", people will happily pay $12 a month. We must anchor our pricing around that retrieval intelligence, not raw storage.`,
    keyInsights: [
      'Voice memo apps fail because search is passive and keyword-dependent.',
      'Recording audio on the go is commoditized; semantic resurfacing is the high-value wedge.',
      'Willingness to pay triggers when past spontaneous ideas actively rescue current work.'
    ],
    actionItems: [
      'Prototype a "What are you working on right now?" input widget',
      'Test relevance scoring against 50+ messy transcripts',
      'Design pricing tier showing free limit vs unlimited contextual synthesis'
    ],
    tags: ['#monetization', '#product/strategy', '#saas/pricing', '#voice-ai'],
    contextCategory: 'Driving',
    entities: ['Highway 280', 'Freemium model', 'Semantic search', 'User onboarding'],
    emotionalTone: 'Energized & Strategic',
    sparkSnippet: 'Voice apps fail because search is passive. The real 10x value is proactive cognitive resurfacing when you are actually working.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    durationSeconds: 142,
    starred: true,
    waveformPeaks: generateMockPeaks(1),
  },
  {
    id: 'note-102',
    title: 'The 3-Second Friction Rule for On-the-Go Audio',
    summary: 'When someone is walking or carrying groceries, any friction above 3 seconds kills capture intent. The UI must have giant touch targets and one-tap lock.',
    transcript: `Walking the dog down Elm Street. Note to self on mobile UX: whenever you're walking fast or cooking with wet hands, you have about a three-second window before you lose the thread of your thought or give up. If you have to unlock the phone, find the app, wait for a splash screen, and hit a tiny red button, the idea is dead. 
We need dedicated quick-modes. A driving mode with high contrast and giant touch area, and an auto-stop silence detection so you don't record two minutes of road hum after you finish talking.`,
    keyInsights: [
      'Idea decay happens within 3 seconds of friction while in motion.',
      'Context-specific capture modes (Driving, Walking, Cooking) solve wet hands & attention limits.',
      'Auto-stop on silence prevents bloated empty audio files.'
    ],
    actionItems: [
      'Implement large high-contrast record button for one-handed operation',
      'Add quick toggle for Driving vs Walking mode'
    ],
    tags: ['#ux/mobile', '#capture-speed', '#audio/design', '#walking'],
    contextCategory: 'Walking',
    entities: ['Elm Street', 'Silence detection', 'Thumb zone UX', 'AirPods mic'],
    emotionalTone: 'Observational & Focused',
    sparkSnippet: 'Whenever you are walking fast or cooking with wet hands, you have about a three-second window before you lose the thread.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    durationSeconds: 88,
    starred: false,
    waveformPeaks: generateMockPeaks(2),
  },
  {
    id: 'note-103',
    title: 'Crispy Scallion Chili Crisp & Gentle Simmer Technique',
    summary: 'Kitchen experiment notes on scallion oil and crispy shallots: low heat prevents burning bitterness, and finishing with toasted sesame oil preserves aromatics.',
    transcript: `Cooking dinner right now, hands are full of garlic. Just figured out why my scallion oil kept turning bitter in previous batches. You cannot rush the shallots. You have to slice them paper-thin with a mandoline, drop them in cold neutral avocado oil, and bring it up slowly over medium-low heat. Once they turn golden blonde, pull them off the heat immediately because residual heat will carry them to dark crisp brown. 
Finish with star anise and pour over crushed Sichuan pepper and toasted sesame oil. This applies to so many craft things: the secret is patience during the temperature climb.`,
    keyInsights: [
      'Cold oil start with slow heat ramp prevents burning thin shallots.',
      'Pull shallots when golden blonde; residual thermal mass finishes the browning.',
      'Analogy to craft: rush the beginning and you burn the delicate aromatics.'
    ],
    actionItems: [
      'Document final ratio: 4 shallots to 1 cup avocado oil, 2 star anise pods',
      'Test Sichuan chili flake temperature threshold'
    ],
    tags: ['#cooking/technique', '#recipes', '#culinary', '#craft'],
    contextCategory: 'Cooking',
    entities: ['Scallion oil', 'Avocado oil', 'Shallots', 'Sichuan pepper', 'Star anise'],
    emotionalTone: 'Relaxed & Sensory',
    sparkSnippet: 'Pull them off immediately when golden blonde because residual heat will carry them to dark crisp brown.',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    durationSeconds: 115,
    starred: true,
    waveformPeaks: generateMockPeaks(3),
  },
  {
    id: 'note-104',
    title: 'Customer Onboarding: Simulated Sandbox vs Empty Canvas',
    summary: 'New users churn when faced with a blank state in note apps. Pre-populating a realistic simulated second brain instantly demonstrates the "aha" moment.',
    transcript: `Walking back from the coffee shop. I was thinking about customer retention and our free trial conversion. In productivity tools, empty state anxiety is the number one reason people drop off after signing up. If you give a user a blank notebook, they stare at it and leave. 
Instead, we should onboard them with a pre-populated "sample memory" showing notes from driving, walking, and cooking. That way, their very first search or "Working on..." query immediately triggers a multi-note synthesis brief. They see the magic before they even record their first memo.`,
    keyInsights: [
      'Empty state anxiety is the single biggest drop-off point in note and second-brain apps.',
      'Pre-populated realistic sandbox allows users to experience deep retrieval on minute one.',
      'Instant gratification converts free tier users into paying subscribers.'
    ],
    actionItems: [
      'Design default sample data with cross-domain variety',
      'Include a sample query button like "Show me what I thought about pricing"'
    ],
    tags: ['#growth/onboarding', '#conversion', '#retention', '#product/ux'],
    contextCategory: 'Walking',
    entities: ['Empty state anxiety', 'Customer retention', 'Sample memory sandbox'],
    emotionalTone: 'Analytical & Decisive',
    sparkSnippet: 'If you give a user a blank notebook, they stare at it and leave. Show them the retrieval magic on minute one.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    durationSeconds: 104,
    starred: false,
    waveformPeaks: generateMockPeaks(4),
  },
  {
    id: 'note-105',
    title: 'Mental Model: Scratchpad vs Cognitive Sparring Partner',
    summary: 'A scratchpad merely records what you said; a second brain synthesizes disparate notes into fresh perspectives you forgot you had.',
    transcript: `Late drive home on the freeway. Differentiating our product positioning. An audio recorder is a filing cabinet or scratchpad: you throw thoughts in, and it files them away by date. A genuine second brain must act like an intellectual sparring partner. 
When you sit down to write a strategy doc or code a feature, it should say: "You touched on this three weeks ago when walking by the lake, and you had a related thought while cooking breakfast. Here is how your thinking evolved." That is the transformation from passive storage to active cognition.`,
    keyInsights: [
      'Filing cabinets store; sparring partners challenge and synthesize.',
      'Evolution of thought over time is the highest-order intelligence for a second brain.',
      'Users do not want more notes; they want clarity and recall on their best ideas.'
    ],
    actionItems: [
      'Highlight evolution of thought in the synthesized brief generator',
      'Create timeline view showing when related concepts resurfaced'
    ],
    tags: ['#mental-models', '#product/positioning', '#second-brain', '#ai-agents'],
    contextCategory: 'Driving',
    entities: ['Second Brain philosophy', 'Cognitive sparring partner', 'Freeway thoughts'],
    emotionalTone: 'Philosophical & Inspired',
    sparkSnippet: 'A scratchpad merely stores what you said; a genuine second brain acts like an intellectual sparring partner.',
    createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(), // 19 days ago
    durationSeconds: 156,
    starred: true,
    waveformPeaks: generateMockPeaks(5),
  },
  {
    id: 'note-106',
    title: 'Weekend Hosting Dinner Menu & Dietary Hacks',
    summary: 'Planning for next weekend: friends have dairy and gluten sensitivities. Idea for crispy polenta cakes, rich braised short rib or portobello mushroom glaze, and scallion chili oil.',
    transcript: `Prepping lunch in the kitchen. Reminder about next Saturday dinner hosting: Alex is gluten-free and Maya can't do dairy. Instead of trying to make fake dairy pasta, build around naturally gluten-free and dairy-free comfort foods. 
Crispy pan-fried polenta squares with garlic rosemary oil, topped with slow-braised beef short ribs or balsamic glazed portobellos for vegetarians. We can drizzle the homemade scallion chili oil on top for an unexpected punch. Check with Maya if corn is okay.`,
    keyInsights: [
      'Do not substitute fake ingredients; build dishes around naturally allergen-free comfort foods.',
      'Crispy polenta cakes provide rich texture without gluten or dairy.',
      'The scallion chili oil bridges Italian rosemary and umami glaze beautifully.'
    ],
    actionItems: [
      'Confirm corn tolerance with Maya',
      'Buy polenta tubes or coarse yellow cornmeal and fresh rosemary on Thursday'
    ],
    tags: ['#hosting', '#cooking/recipes', '#dinner-party', '#life/errands'],
    contextCategory: 'Cooking',
    entities: ['Polenta cakes', 'Short ribs', 'Portobello mushrooms', 'Alex & Maya', 'Scallion chili oil'],
    emotionalTone: 'Warm & Hospitable',
    sparkSnippet: 'Instead of trying to make fake dairy pasta, build around naturally gluten-free and dairy-free comfort foods.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    durationSeconds: 98,
    starred: false,
    waveformPeaks: generateMockPeaks(6),
  },
];
