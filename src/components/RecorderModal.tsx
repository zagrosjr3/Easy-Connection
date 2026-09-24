import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  Upload,
  Car,
  Footprints,
  ChefHat,
  Zap,
  Sparkles,
  AlertCircle,
  X,
  FileAudio,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { ContextCategory, VoiceNote, UserSubscription } from '../types/note';
import { transcribeAudioBlob, processTranscriptMetadata } from '../services/geminiService';

interface RecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: (note: VoiceNote) => void;
  subscription: UserSubscription;
  onOpenUpgrade: () => void;
}

export const RecorderModal: React.FC<RecorderModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
  subscription,
  onOpenUpgrade,
}) => {
  const [selectedContext, setSelectedContext] = useState<ContextCategory>('Driving');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Processing status
  const [processingStep, setProcessingStep] = useState<
    'idle' | 'transcribing' | 'indexing' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInputFallback, setTextInputFallback] = useState('');
  const [showTextFallback, setShowTextFallback] = useState(false);

  // Audio level visualizer state
  const [micVolume, setMicVolume] = useState<number[]>(new Array(16).fill(15));

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<any>(null);

  // Quota calculation
  const isFreePlan = subscription.plan === 'free';
  const hasReachedLimit = isFreePlan && subscription.monthlyNotesUsed >= subscription.monthlyNotesLimit;

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  if (!isOpen) return null;

  const startLiveVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        // sample 16 points
        const bars: number[] = [];
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * 2] || 0;
          bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setMicVolume(bars);
        animationFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch (e) {
      console.warn('Audio visualizer not supported', e);
    }
  };

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (hasReachedLimit) {
      onOpenUpgrade();
      return;
    }

    setErrorMessage(null);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
    setElapsedSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      startLiveVisualizer(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(fullBlob);
        setAudioUrl(URL.createObjectURL(fullBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // collect chunk every 250ms
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMessage(
        'Could not access microphone. Please ensure microphone permissions are granted, or type your thoughts below.'
      );
      setShowTextFallback(true);
    }
  };

  const pauseResumeRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasReachedLimit) {
      onOpenUpgrade();
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setElapsedSeconds(Math.round(file.size / 16000)); // rough estimate
    }
  };

  const processAndSaveNote = async () => {
    if (!audioBlob && !textInputFallback.trim()) {
      setErrorMessage('Please record audio or provide text before processing.');
      return;
    }

    setProcessingStep('transcribing');
    setErrorMessage(null);

    try {
      let transcriptText = textInputFallback.trim();

      // Step 1: Transcribe if audio blob exists
      if (audioBlob) {
        setProcessingStep('transcribing');
        const mime = audioBlob.type || 'audio/webm';
        transcriptText = await transcribeAudioBlob(audioBlob, mime);
      }

      if (!transcriptText) {
        throw new Error('No speech detected in audio. Please speak clearly or write notes.');
      }

      // Step 2: Extract structured cognitive metadata with Gemini 3.8 Flash
      setProcessingStep('indexing');
      const metadata = await processTranscriptMetadata(transcriptText, selectedContext);

      // Construct final note
      const newNote: VoiceNote = {
        id: `note-${Date.now()}`,
        title: metadata.title || 'Untitled Voice Note',
        summary: metadata.summary || 'Summary pending processing',
        transcript: transcriptText,
        keyInsights: metadata.keyInsights || [],
        actionItems: metadata.actionItems || [],
        tags: metadata.tags || [`#${selectedContext.toLowerCase()}`],
        contextCategory: selectedContext,
        entities: metadata.entities || [],
        emotionalTone: metadata.emotionalTone || 'Spontaneous & Unfiltered',
        sparkSnippet: metadata.sparkSnippet || transcriptText.slice(0, 120),
        createdAt: new Date().toISOString(),
        durationSeconds: Math.max(1, elapsedSeconds),
        audioUrl: audioUrl || undefined,
        waveformPeaks: micVolume.concat(micVolume).slice(0, 40),
      };

      setProcessingStep('success');
      setTimeout(() => {
        onNoteCreated(newNote);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Note creation error:', err);
      setErrorMessage(err?.message || 'Processing failed. Please check connection and try again.');
      setProcessingStep('error');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const contextOptions: { label: ContextCategory; icon: any; hint: string }[] = [
    { label: 'Driving', icon: Car, hint: 'Big buttons, hands-free' },
    { label: 'Walking', icon: Footprints, hint: 'Fast pacing thoughts' },
    { label: 'Cooking', icon: ChefHat, hint: 'Wet hands & food ideas' },
    { label: 'Quick Thought', icon: Zap, hint: 'Fleeting brain sparks' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-semibold text-stone-100">Capture Voice Memo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Banner */}
        {isFreePlan && (
          <div className="px-6 py-2.5 bg-stone-950/60 border-b border-stone-800/60 flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Free Monthly Limit:{' '}
              <strong className="text-stone-200">
                {subscription.monthlyNotesUsed} / {subscription.monthlyNotesLimit} notes
              </strong>
            </span>
            {hasReachedLimit ? (
              <button
                onClick={onOpenUpgrade}
                className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                Limit reached • Upgrade to Pro →
              </button>
            ) : (
              <span className="text-stone-500">Reset on 1st of month</span>
            )}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5 block">
              Where are you right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {contextOptions.map(({ label, icon: Icon, hint }) => {
                const isSelected = selectedContext === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedContext(label)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-bold">{label}</span>
                    <span className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Recording Area */}
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-stone-950/60 rounded-2xl border border-stone-800/70 relative overflow-hidden">
            {/* Ambient context badge */}
            <div className="absolute top-3 left-4 text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-500/70" />
              <span>{selectedContext} Mode Active</span>
            </div>

            {/* Timer */}
            <div className="mt-4 text-4xl sm:text-5xl font-mono font-bold tracking-tight text-stone-100">
              {formatTimer(elapsedSeconds)}
            </div>

            {/* Live Audio Visualizer Bars */}
            <div className="flex items-center gap-1.5 h-14 my-4 px-2 w-full max-w-xs justify-center">
              {micVolume.map((vol, i) => (
                <div
                  key={i}
                  style={{
                    height: isRecording && !isPaused ? `${vol}%` : '8%',
                  }}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isRecording
                      ? isPaused
                        ? 'bg-stone-600'
                        : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'bg-stone-700/50'
                  }`}
                />
              ))}
            </div>

            {/* Record / Pause / Stop Controls */}
            {!isRecording && !audioBlob && (
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={hasReachedLimit}
                  className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-transform active:scale-95 ${
                    hasReachedLimit
                      ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-400 text-white shadow-xl shadow-red-500/25'
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping group-hover:block hidden" />
                  <Mic className="w-8 h-8 relative z-10" />
                </button>
                <p className="text-xs text-stone-400">
                  {hasReachedLimit ? 'Monthly note limit reached on Free plan' : 'Tap to start speaking (hands-free)'}
                </p>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={pauseResumeRecording}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
                  title="Finish recording"
                >
                  <Square className="w-6 h-6 fill-current" />
                </button>
              </div>
            )}

            {/* If audio has been captured and ready for processing */}
            {!isRecording && audioBlob && (
              <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Audio captured ({formatTimer(elapsedSeconds)})</span>
                </div>
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full mt-2 h-9 rounded-lg" />
                )}
                <div className="flex gap-2 mt-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setElapsedSeconds(0);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/80 rounded-xl"
                  >
                    Record Again
                  </button>
                  <button
                    type="button"
                    onClick={processAndSaveNote}
                    disabled={processingStep !== 'idle'}
                    className="flex-1 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Process with Gemini
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Steps Status */}
          {processingStep !== 'idle' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
              <div className="flex-1 text-xs">
                {processingStep === 'transcribing' && (
                  <p className="font-semibold text-amber-200">
                    Transcribing audio verbatim with <code className="text-amber-300">gemini-3.5-transcribe</code>...
                  </p>
                )}
                {processingStep === 'indexing' && (
                  <p className="font-semibold text-amber-200">
                    Synthesizing title, action items, tags & insights with Gemini 3.8 Flash...
                  </p>
                )}
                {processingStep === 'success' && (
                  <p className="font-semibold text-emerald-300">
                    Memory indexed! Adding to your Second Brain...
                  </p>
                )}
                {processingStep === 'error' && (
                  <p className="font-semibold text-red-300">
                    {errorMessage || 'Failed to process voice note.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fallback / Upload alternative options */}
          <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
            <label className="flex items-center gap-1.5 hover:text-stone-200 cursor-pointer">
              <Upload className="w-4 h-4 text-stone-400" />
              <span>Upload audio file (.mp3, .wav, .webm)</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isRecording}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowTextFallback(!showTextFallback)}
              className="text-stone-400 hover:text-amber-400 transition-colors"
            >
              {showTextFallback ? 'Hide text fallback' : 'Type raw memo'}
            </button>
          </div>

          {/* Text input fallback */}
          {showTextFallback && (
            <div className="space-y-2 animate-in fade-in">
              <textarea
                value={textInputFallback}
                onChange={(e) => setTextInputFallback(e.target.value)}
                placeholder="Can't speak right now? Type your stream-of-consciousness thoughts here..."
                rows={3}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60 resize-none"
              />
              {textInputFallback.trim() && !audioBlob && (
                <button
                  type="button"
                  onClick={processAndSaveNote}
                  disabled={processingStep !== 'idle'}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Index Text into Second Brain
                </button>
              )}
            </div>
          )}

          {errorMessage && processingStep !== 'indexing' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
