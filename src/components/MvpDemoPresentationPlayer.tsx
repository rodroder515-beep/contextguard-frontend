import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MVP_DEMO_SCRIPT, TOTAL_DEMO_DURATION, DemoChapter } from '../data/mvpDemoScript';

interface MvpDemoPresentationPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToSection: (sectionId: string) => void;
  onRunDemoEvaluation?: () => void;
}

export const MvpDemoPresentationPlayer: React.FC<MvpDemoPresentationPlayerProps> = ({
  isOpen,
  onClose,
  onJumpToSection,
  onRunDemoEvaluation,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);
  const currentChapter = MVP_DEMO_SCRIPT[activeChapterIndex] || MVP_DEMO_SCRIPT[0];
  const lastSpokenChapterRef = useRef<number | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find chapter by timestamp
  const getChapterForTime = useCallback((time: number): number => {
    const idx = MVP_DEMO_SCRIPT.findIndex(
      (c) => time >= c.startTime && time < c.endTime
    );
    return idx !== -1 ? idx : time >= TOTAL_DEMO_DURATION ? MVP_DEMO_SCRIPT.length - 1 : 0;
  }, []);

  // Speech synthesis for live narration
  const speakChapterTranscript = useCallback((chapter: DemoChapter) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const fullText = chapter.transcript.join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = playbackSpeed * 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  }, [playbackSpeed]);

  // Handle chapter jump
  const jumpToChapter = useCallback((index: number) => {
    const chapter = MVP_DEMO_SCRIPT[index];
    if (!chapter) return;
    setActiveChapterIndex(index);
    setCurrentTime(chapter.startTime);

    if (autoScrollEnabled) {
      onJumpToSection(chapter.sectionId);
    }

    if (isNarrationEnabled && isPlaying) {
      speakChapterTranscript(chapter);
      lastSpokenChapterRef.current = index;
    }
  }, [autoScrollEnabled, onJumpToSection, isNarrationEnabled, isPlaying, speakChapterTranscript]);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const intervalMs = 250;
    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        if (next >= TOTAL_DEMO_DURATION) {
          setIsPlaying(false);
          return TOTAL_DEMO_DURATION;
        }

        const newChapterIdx = getChapterForTime(next);
        if (newChapterIdx !== activeChapterIndex) {
          setActiveChapterIndex(newChapterIdx);
          const ch = MVP_DEMO_SCRIPT[newChapterIdx];
          if (autoScrollEnabled && ch) {
            onJumpToSection(ch.sectionId);
          }
          if (isNarrationEnabled && lastSpokenChapterRef.current !== newChapterIdx) {
            speakChapterTranscript(ch);
            lastSpokenChapterRef.current = newChapterIdx;
          }
        }

        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isPlaying,
    playbackSpeed,
    activeChapterIndex,
    autoScrollEnabled,
    getChapterForTime,
    isNarrationEnabled,
    onJumpToSection,
    speakChapterTranscript,
  ]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!isPlaying) {
      if (currentTime >= TOTAL_DEMO_DURATION) {
        setCurrentTime(0);
        setActiveChapterIndex(0);
        jumpToChapter(0);
      } else {
        if (isNarrationEnabled) {
          speakChapterTranscript(currentChapter);
          lastSpokenChapterRef.current = activeChapterIndex;
        }
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveChapterIndex(0);
    jumpToChapter(0);
    if (isPlaying && isNarrationEnabled) {
      speakChapterTranscript(MVP_DEMO_SCRIPT[0]);
    }
  };

  const handleTimelineScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const newIdx = getChapterForTime(newTime);
    setActiveChapterIndex(newIdx);
    const ch = MVP_DEMO_SCRIPT[newIdx];
    if (autoScrollEnabled && ch) {
      onJumpToSection(ch.sectionId);
    }
    if (isPlaying && isNarrationEnabled) {
      speakChapterTranscript(ch);
      lastSpokenChapterRef.current = newIdx;
    }
  };

  const fullScriptText = MVP_DEMO_SCRIPT.map(
    (c) => `${c.timeLabel} | ${c.title}\n\n${c.transcript.join('\n\n')}\n`
  ).join('\n---\n\n');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([fullScriptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ContextGuard_MVP_Demonstration_Script.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Floating Presentation Dock (fixed bottom) */}
      <div
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[820px] transition-all duration-300"
        role="region"
        aria-label="ContextGuard MVP Demonstration Controller"
      >
        <div className="bg-[#141413] text-[#f4f3ef] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 bg-white/5 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#d94e34] animate-pulse" />
              <span className="font-mono-tech tracking-wider uppercase text-[10px] sm:text-[11px] text-[#f4f3ef] font-semibold truncate">
                MVP DEMO WALKTHROUGH
              </span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="font-mono-tech text-[10px] text-[#d99b16] hidden sm:inline">
                {currentChapter.timeLabel} · {currentChapter.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Teleprompter / Full Script Button */}
              <button
                type="button"
                onClick={() => setIsScriptModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-mono-tech text-[#eae8e2] transition-colors cursor-pointer"
                title="View Full Script & Presenter Notes"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Script Notes</span>
              </button>

              {/* TTS Voice Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isNarrationEnabled;
                  setIsNarrationEnabled(nextState);
                  if (nextState && isPlaying) {
                    speakChapterTranscript(currentChapter);
                  } else if (!nextState && typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono-tech transition-colors cursor-pointer ${
                  isNarrationEnabled
                    ? 'bg-[#d94e34] text-white font-medium'
                    : 'bg-white/10 hover:bg-white/20 text-[#eae8e2]'
                }`}
                title={isNarrationEnabled ? 'Voice Narration On' : 'Voice Narration Off'}
              >
                {isNarrationEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-white/60" />
                )}
                <span className="hidden sm:inline">Voice</span>
              </button>

              {/* Expand / Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Minimize Player' : 'Expand Player'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Exit Presentation */}
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  onClose();
                }}
                className="p-1 rounded-md bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                aria-label="Close MVP Demo Walkthrough"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Player Body */}
          {isExpanded && (
            <div className="p-3.5 sm:p-5 space-y-3.5">
              {/* Timeline Progress Bar + Chapter Markers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono-tech text-white/70">
                  <span className="text-[#f4f3ef] font-semibold">{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">{currentChapter.title}</span>
                    <span className="text-white/30">/</span>
                    <span>{formatTime(TOTAL_DEMO_DURATION)}</span>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={TOTAL_DEMO_DURATION}
                    step={0.5}
                    value={currentTime}
                    onChange={handleTimelineScrub}
                    className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#d94e34] focus:outline-none"
                    aria-label="Demo scrubber"
                  />
                </div>

                {/* Chapter Pills Carousel / Grid */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
                  {MVP_DEMO_SCRIPT.map((ch, idx) => {
                    const isActive = idx === activeChapterIndex;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => jumpToChapter(idx)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono-tech whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#eae8e2] text-[#141413] font-bold shadow-xs'
                            : 'bg-white/5 hover:bg-white/15 text-white/70'
                        }`}
                      >
                        <span className="opacity-60 mr-1.5">{ch.timeLabel.split('–')[0]}</span>
                        <span>{ch.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Subtitle / Teleprompter Display */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 min-h-[72px] flex flex-col justify-center">
                <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[#d99b16] mb-1 flex items-center justify-between">
                  <span>TRANSCRIPT · {currentChapter.timeLabel}</span>
                  {currentChapter.id === 'live-demo' && onRunDemoEvaluation && (
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToSection('interactive-demo');
                        onRunDemoEvaluation();
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Trigger Evaluation
                    </button>
                  )}
                </div>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#f4f3ef] font-serif-editorial">
                  {currentChapter.transcript.join(' ')}
                </p>
              </div>

              {/* Bottom Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  {/* Play / Pause Primary Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#f4f3ef] hover:bg-white text-[#141413] font-semibold text-xs tracking-tight transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>{currentTime >= TOTAL_DEMO_DURATION ? 'Replay Demo' : 'Play Walkthrough'}</span>
                      </>
                    )}
                  </button>

                  {/* Restart */}
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                    title="Restart from beginning"
                    aria-label="Restart"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Speed Controls */}
                  <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px] font-mono-tech">
                    {[1, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-[#d94e34] text-white font-semibold'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono-tech">
                  {/* Auto-scroll toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={autoScrollEnabled}
                      onChange={(e) => setAutoScrollEnabled(e.target.checked)}
                      className="rounded accent-[#d94e34] cursor-pointer"
                    />
                    <span>Auto-scroll</span>
                  </label>

                  {/* Section Jump Button */}
                  <button
                    type="button"
                    onClick={() => onJumpToSection(currentChapter.sectionId)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#d99b16] hover:underline cursor-pointer"
                  >
                    <span>View Section</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Script Notes & Teleprompter Modal */}
      {isScriptModalOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ContextGuard MVP Demonstration Full Script"
        >
          <div className="bg-[#141413] text-[#f4f3ef] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
              <div>
                <h3 className="font-serif-editorial text-lg font-semibold text-[#f4f3ef]">
                  ContextGuard — MVP Demonstration Script
                </h3>
                <p className="font-mono-tech text-xs text-white/60">
                  Exact 2:50 presentation transcript & chapter cue sheet
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono-tech transition-colors cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono-tech transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScriptModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {MVP_DEMO_SCRIPT.map((ch, idx) => (
                <div
                  key={ch.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    idx === activeChapterIndex
                      ? 'bg-white/10 border-[#d94e34]/60'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-tech text-xs font-bold text-[#d99b16]">
                      {ch.timeLabel} | {ch.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        jumpToChapter(idx);
                        setIsScriptModalOpen(false);
                      }}
                      className="text-xs font-mono-tech text-white/70 hover:text-white underline cursor-pointer"
                    >
                      Jump to chapter →
                    </button>
                  </div>

                  <div className="space-y-2 text-[#eae8e2] font-serif-editorial text-[15px] leading-relaxed">
                    {ch.transcript.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {ch.keyPoints.map((pt, kIdx) => (
                      <span
                        key={kIdx}
                        className="px-2 py-0.5 rounded-sm bg-black/40 text-white/70 font-mono-tech text-[10px]"
                      >
                        • {pt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>Total Duration: 2 minutes 50 seconds</span>
              <button
                type="button"
                onClick={() => setIsScriptModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#eae8e2] text-[#141413] font-semibold text-xs cursor-pointer hover:bg-white"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
