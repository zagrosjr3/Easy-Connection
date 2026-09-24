import { VoiceNote, ResurfacingResult, AskBrainResult } from '../types/note';

/**
 * Transcribe recorded audio blob via server
 */
export async function transcribeAudioBlob(audioBlob: Blob, mimeType: string = 'audio/webm'): Promise<string> {
  const reader = new FileReader();
  
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const audioBase64 = await base64Promise;

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Transcription failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.transcript;
}

/**
 * Extract structured metadata (title, summary, tags, action items, entities) from transcript
 */
export async function processTranscriptMetadata(
  transcript: string,
  detectedContext?: string
): Promise<{
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
  contextCategory: any;
  entities: string[];
  emotionalTone: string;
  sparkSnippet?: string;
}> {
  const response = await fetch('/api/process-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      detectedContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Processing failed with HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Deep contextual resurfacing: evaluate library against user's active context
 */
export async function resurfaceNotesForContext(
  activeContext: string,
  notes: VoiceNote[]
): Promise<ResurfacingResult> {
  const response = await fetch('/api/resurface', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activeContext,
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Resurfacing failed with HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Natural language Q&A across the second brain archive
 */
export async function askSecondBrain(
  question: string,
  notes: VoiceNote[]
): Promise<AskBrainResult> {
  const response = await fetch('/api/ask-brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Brain query failed with HTTP ${response.status}`);
  }

  return response.json();
}
