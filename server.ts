import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing large audio JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize JSON response from Gemini
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * 1. Transcribe Audio Endpoint
 * Accepts base64 encoded audio and mimeType
 */
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    // Using gemini-3.5-transcribe for audio transcription
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this voice recording completely, verbatim, and accurately. Include natural punctuation, sentence breaks, and preserve the speaker\'s original tone and terminology.',
          },
        ],
      },
    });

    const transcript = response.text || '';
    return res.json({ transcript: transcript.trim() });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio. Please try again.',
    });
  }
});

/**
 * 2. Process & Structure Note Endpoint
 * Takes raw transcript or text and generates title, summary, action items, tags, entities, and context category.
 */
app.post('/api/process-note', async (req, res) => {
  try {
    const { transcript, detectedContext } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Valid transcript string is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `You are the indexing intelligence of Synapse Voice, an executive second-brain for voice notes.
Analyze this voice memo transcript and extract structured cognitive metadata.
Detected recording environment hint (if any): "${detectedContext || 'unknown'}".

Transcript:
"${transcript}"

Extract:
1. "title": A crisp, high-signal title (4-8 words) capturing the core idea.
2. "summary": A punchy 1-2 sentence executive summary of what was thought or decided.
3. "keyInsights": Array of 2 to 4 bullet points highlighting novel observations, hypotheses, or realizations.
4. "actionItems": Array of concrete next steps or tasks mentioned (if any, otherwise empty array).
5. "tags": Array of 3 to 6 hierarchical or topical hashtags (e.g. "#product/pricing", "#engineering", "#recipe", "#life/errands", "#strategy").
6. "contextCategory": Best fit single category from: "Driving", "Walking", "Cooking", "Workout", "Quick Thought", "Meeting", "Other".
7. "entities": Array of key concepts, companies, tools, frameworks, ingredients, or people mentioned.
8. "emotionalTone": One or two words describing energy/tone (e.g. "Energized & Strategic", "Reflective & Observational", "Frustrated with friction", "Calm & Exploratory").
9. "sparkSnippet": The single most impactful or memorable sentence/quote from the transcript.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            contextCategory: { type: Type.STRING },
            entities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emotionalTone: { type: Type.STRING },
            sparkSnippet: { type: Type.STRING },
          },
          required: ['title', 'summary', 'keyInsights', 'tags', 'contextCategory'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Process note error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process note metadata.',
    });
  }
});

/**
 * 3. Smart Contextual Resurfacing Engine ("Working on...")
 * This is the critical value-prop: user provides their current task/context,
 * and AI evaluates all historical voice notes to resurface the relevant gems,
 * explaining why they matter and synthesizing them into an actionable brief.
 */
app.post('/api/resurface', async (req, res) => {
  try {
    const { activeContext, notes } = req.body;

    if (!activeContext || typeof activeContext !== 'string') {
      return res.status(400).json({ error: 'activeContext is required' });
    }

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.json({
        resurfacedNotes: [],
        synthesizedBrief: 'No voice notes found in your library yet. Record a few voice notes to begin resurfacing!',
        crossDomainEpiphany: null,
      });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    // Prepare note summaries for prompt
    const notesPayload = notes.map((n: any, index: number) => ({
      index,
      id: n.id,
      title: n.title,
      date: n.createdAt,
      context: n.contextCategory,
      tags: n.tags,
      summary: n.summary,
      keyInsights: n.keyInsights,
      actionItems: n.actionItems,
      entities: n.entities,
      transcriptSample: n.transcript.slice(0, 450),
    }));

    const prompt = `You are the deep memory retrieval engine for Synapse Voice Second Brain.
The user is currently working on:
"""
${activeContext}
"""

Below is the user's archive of voice memos recorded in various everyday contexts (driving, walking, cooking, etc.):
${JSON.stringify(notesPayload, null, 2)}

Your job is to solve the classic voice memo problem: ideas were recorded and forgotten, and now the user needs them.
Evaluate each note's genuine semantic and conceptual relevance to what the user is working on right now.
Do NOT just do superficial keyword matching. Look for underlying principles, analogies, past decisions, uncompleted thoughts, and warnings.

Return a JSON object with:
1. "matches": Array of the top relevant notes (up to 5 most relevant notes, relevanceScore >= 45).
   Each match must include:
   - "noteId": the string ID of the note
   - "relevanceScore": integer from 0 to 100 (where 100 is directly applicable)
   - "whyResurfaced": A direct, 1-2 sentence explanation of why this specific past thought helps with their current task. Mention where/when they thought of it (e.g. "While driving last week, you realized...")
   - "keySparkQuote": An exact or near-exact high-impact quote/snippet from that note's transcript or insights that sparks clarity.
   - "suggestedAction": A concrete suggestion on how to apply this past thought to the current task.

2. "synthesizedBrief": A high-value, cohesive executive brief (2-4 concise paragraphs with markdown headers and bullet points) that synthesizes the insights across all matched voice notes into an actionable starting document or checklist for the current task.

3. "crossDomainEpiphany": Optional serendipitous connection (or null if none). An unexpected insight from an unrelated context (e.g., an idea had while cooking that unexpectedly applies to software or strategy).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  noteId: { type: Type.STRING },
                  relevanceScore: { type: Type.INTEGER },
                  whyResurfaced: { type: Type.STRING },
                  keySparkQuote: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ['noteId', 'relevanceScore', 'whyResurfaced', 'keySparkQuote', 'suggestedAction'],
              },
            },
            synthesizedBrief: { type: Type.STRING },
            crossDomainEpiphany: { type: Type.STRING },
          },
          required: ['matches', 'synthesizedBrief'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Resurfacing error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to compute contextual resurfacing.',
    });
  }
});

/**
 * 4. "Ask Your Second Brain" Q&A
 * Natural language questioning across the user's voice memo archive
 */
app.post('/api/ask-brain', async (req, res) => {
  try {
    const { question, notes } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'question is required' });
    }

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.json({
        answer: 'You do not have any voice notes recorded yet. Record or import some notes first!',
        citedNotes: [],
      });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const archiveContext = notes.map((n: any) => `
[Note ID: ${n.id} | Title: "${n.title}" | Date: ${n.createdAt} | Context: ${n.contextCategory} | Tags: ${n.tags?.join(', ')}]
Summary: ${n.summary}
Key Insights: ${n.keyInsights?.join('; ')}
Transcript: ${n.transcript}
`).join('\n---\n');

    const prompt = `You are Synapse Voice, the personal AI second brain.
The user is asking a question about their past thoughts, voice notes, and decisions.

Archive of user's voice notes:
${archiveContext}

User Question:
"${question}"

Answer the question directly, speaking in a collaborative second-person tone ("You mentioned...", "When you were cooking on...").
Synthesize across multiple memos if relevant.
Point out any contradictions or evolution of thoughts over time if present.

Return a JSON with:
1. "answer": Comprehensive Markdown answer with quotes and dates.
2. "citedNoteIds": Array of string Note IDs that provided the evidence for this answer.
3. "relatedFollowUps": 2-3 natural follow-up questions the user might ask next.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            citedNoteIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            relatedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'citedNoteIds'],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Ask brain error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to query second brain archive.',
    });
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Synapse Voice] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
