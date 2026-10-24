import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface ProblemSectionProps {
  onOpenMvpDemo?: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onOpenMvpDemo }) => {
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [briefingStep, setBriefingStep] = useState<0 | 1 | 2>(0);
  const [hoveredPoint, setHoveredPoint] = useState<number>(3);

  const curvePoints = [
    { step: 'Step 1: Prompt Init', rawTokens: 18, scopedTokens: 16, note: 'User instruction + local workspace context loaded' },
    { step: 'Step 2: RAG Retrieval', rawTokens: 46, scopedTokens: 22, note: 'Thread logs & .env configs pulled into context window' },
    { step: 'Step 3: LLM Drafting', rawTokens: 78, scopedTokens: 26, note: 'Incidental API keys & SSNs travel with task tokens' },
    { step: 'Step 4: External MCP Call', rawTokens: 115, scopedTokens: 28, note: 'Unscoped agent forwards 4 sensitive spans to 3P plugin' },
  ];

  const activePoint = curvePoints[hoveredPoint] || curvePoints[3];

  return (
    <section
      id="problem"
      aria-label="The Problem of Sensitive Information Leaving AI Workflows"
      className="py-20 md:py-28 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Top Half: Visual Briefing Player + Corner-Ticked Editorial Quote (matching 00:07-00:09) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Interactive Visual Briefing Frame */}
          <div className="lg:col-span-6">
            <div className="relative w-full min-h-[250px] md:min-h-0 md:aspect-[16/10] bg-[#141413] overflow-hidden border border-[#141413]/20 shadow-sm group">
              {/* Architectural Dark Grid Interior Backdrop */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Subtle architectural studio lighting gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0e0e0d] via-[#1c232b]/70 to-[#291e19]/60" />

              {!isPlayingBriefing ? (
                /* Poster State matching 00:08 video player frame */
                <div className="relative z-10 w-full min-h-[250px] md:min-h-0 md:h-full flex flex-col justify-between p-4 sm:p-6">
                  {/* Top telemetry bar inside frame */}
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[#a09f99] font-mono-tech text-[10px] tracking-[0.12em] uppercase">
                    <span>THREAT BRIEFING · OUTBOUND CONTEXT DRIFT</span>
                    <span> BOUNDARY TRACE #01</span>
                  </div>

                  {/* Center Architectural Visual & Play Trigger */}
                  <div className="my-auto py-4 md:py-0 flex flex-col items-center justify-center text-center px-2 sm:px-4">
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 md:gap-3 text-[11px] font-mono-tech text-[#d8d6d0]/80 bg-white/5 border border-white/10 px-3 py-1.5 max-w-full">
                      <span>RAG Context</span>
                      <span className="text-[#D94E34]">→ sk_live_98a7f</span>
                      <span>→ External MCP Tool</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayingBriefing(true);
                        setBriefingStep(0);
                      }}
                      aria-label="Play workflow boundary briefing"
                      className="w-15 h-15 rounded-full bg-[#f4f3ef] text-[#141413] flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Bottom Bar: 02:50 Pill on Left, CG Monogram on Right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xs bg-white/12 backdrop-blur-xs font-mono-tech text-[11px] text-[#f4f3ef]">
                        02:50
                      </span>
                      {onOpenMvpDemo && (
                        <button
                          type="button"
                          onClick={onOpenMvpDemo}
                          className="px-2.5 py-1 rounded-xs bg-[#d94e34]/30 hover:bg-[#d94e34]/60 border border-[#d94e34]/50 font-mono-tech text-[10px] text-[#f4f3ef] transition-colors cursor-pointer"
                        >
                          ▶ Launch MVP Demo Walkthrough
                        </button>
                      )}
                    </div>
                    <span className="font-serif-editorial text-[18px] tracking-tight font-semibold text-[#f4f3ef]">
                      CG
                    </span>
                  </div>
                </div>
              ) : (
                /* Active Interactive Briefing Simulation */
                <div className="relative z-10 w-full min-h-[250px] md:min-h-0 md:h-full flex flex-col justify-between p-4 sm:p-5 md:p-6 bg-[#121211]/95 text-[#f4f3ef]">
                  <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center justify-between md:justify-start gap-2 min-w-0">
                      <span className="font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[#D94E34] whitespace-nowrap">
                        INTERACTIVE TRACE
                      </span>
                      <span className="hidden md:inline text-white/30">·</span>
                      <span className="font-mono-tech text-[10px] text-[#a09f99] whitespace-nowrap">
                        STEP {briefingStep + 1} OF 3
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setBriefingStep(((briefingStep + 1) % 3) as 0 | 1 | 2)}
                        className="px-3 py-1.5 md:px-2.5 md:py-1 bg-white/10 hover:bg-white/20 text-[11px] font-mono-tech rounded-xs cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Next Step →
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPlayingBriefing(false)}
                        aria-label="Pause briefing"
                        className="p-2 md:p-1.5 bg-white/10 hover:bg-white/20 rounded-xs cursor-pointer shrink-0"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-auto py-4 md:py-3 space-y-3">
                    {briefingStep === 0 && (
                      <div className="space-y-2">
                        <div className="flex items-start sm:items-center gap-2 text-[#E5A01D] font-mono-tech text-[11px]">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-snug">1. UNSCOPED CONTEXT INGESTION</span>
                        </div>
                        <p className="text-[13px] text-[#d8d6d0] leading-relaxed break-words">
                          An AI assistant asked to draft a billing reply ingests the entire support thread—including an incidental Stripe secret key (<code className="text-[#D94E34] break-all sm:break-normal">sk_live_98a7f...</code>) and customer SSN (<code className="text-[#D94E34] whitespace-nowrap">419-00-8821</code>).
                        </p>
                      </div>
                    )}
                    {briefingStep === 1 && (
                      <div className="space-y-2">
                        <div className="flex items-start sm:items-center gap-2 text-[#D94E34] font-mono-tech text-[11px]">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-snug">2. RELEVANCE VS. PERMISSION CONFLICT</span>
                        </div>
                        <p className="text-[13px] text-[#d8d6d0] leading-relaxed break-words">
                          Even when an entity like <code className="text-[#E5A01D] break-all sm:break-normal">elena.rostova@acme.io</code> is 86% relevant to the user’s task, an external third-party LLM endpoint lacks authorization to receive raw customer PII.
                        </p>
                      </div>
                    )}
                    {briefingStep === 2 && (
                      <div className="space-y-2">
                        <div className="flex items-start sm:items-center gap-2 text-[#6E9B26] font-mono-tech text-[11px]">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="leading-snug">3. CONTEXTGUARD BOUNDARY DECISION</span>
                        </div>
                        <p className="text-[13px] text-[#d8d6d0] leading-relaxed break-words">
                          ContextGuard blocks the extraneous <code className="text-[#D94E34]">sk_live</code> key, substitutes a symbolic placeholder <code className="text-[#E5A01D] break-all sm:break-normal">&lt;CONTACT_EMAIL_1&gt;</code> for the email, and allows the scoped invoice figure <code className="text-[#6E9B26] whitespace-nowrap">$1,420.00</code>.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 md:pt-2 border-t border-white/10">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBriefingStep(idx as 0 | 1 | 2)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            briefingStep === idx ? 'w-8 bg-[#f4f3ef]' : 'w-3 bg-white/25'
                          }`}
                          aria-label={`Go to briefing step ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingBriefing(false)}
                      className="flex items-center gap-1 font-mono-tech text-[10px] text-[#a09f99] hover:text-white cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3 shrink-0" />
                      Reset Frame
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Editorial Quote with Corner Ticks matching 00:08 */}
          <div className="lg:col-span-6">
            <div className="corner-ticks relative p-6 sm:p-8 lg:p-10">
              <span className="corner-ticks-inner" />
              <blockquote className="font-serif-editorial text-[24px] sm:text-[29px] xl:text-[32px] leading-[1.26] tracking-[-0.015em] text-[#141413]">
                “You may be able to automate workflows rapidly with AI, but if an
                agent cannot distinguish between what is useful for a task and
                what is permitted to leave the boundary, convenience becomes an
                exfiltration vector.”
              </blockquote>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[13px] font-medium text-[#141413]">
                    Foundational Threat Thesis
                  </div>
                  <div className="text-[12px] text-[#686762]">
                    ContextGuard Research · Outbound AI Governance
                  </div>
                </div>

                <div className="font-serif-editorial text-[20px] tracking-[-0.02em] text-[#686762] select-none">
                  Contextual Integrity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hairline Divider between Quote and Drop-Cap Prose (00:08-00:10) */}
        <div className="my-16 md:my-20 border-t border-[#141413]/10" />

        {/* Bottom Half: Left Divergence Chart + Right Coral Drop-Cap Editorial Prose (00:09-00:11) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Minimalist Context Exposure Divergence Graph matching 00:10-00:11 */}
          <div className="lg:col-span-5 pt-4 lg:pt-16">
            <div className="max-w-[380px] mx-auto lg:mx-0">
              <div className="relative h-[220px] border-l border-b border-[#141413]/20 px-4 pt-6 pb-4">
                {/* Interactive Hover Tooltip Box matching 00:11 */}
                <div className="mb-4 inline-block bg-[#eceae4] border border-[#141413]/20 p-2.5 shadow-xs">
                  <div className="font-mono-tech text-[9px] tracking-[0.1em] uppercase bg-[#141413] text-[#f4f3ef] px-1.5 py-0.5 inline-block mb-1">
                    {activePoint.step}
                  </div>
                  <div className="font-mono-tech text-[10px] text-[#141413]">
                    Raw Exposure: <span className="text-[#D94E34] font-medium">{activePoint.rawTokens} spans</span> · Authorized: <span className="text-[#4d7317] font-medium">{activePoint.scopedTokens} spans</span>
                  </div>
                  <div className="text-[11px] text-[#686762] mt-0.5">
                    {activePoint.note}
                  </div>
                </div>

                {/* SVG Diverging Lines matching 00:10-00:11 */}
                <svg
                  viewBox="0 0 300 90"
                  className="w-full h-[86px] overflow-visible"
                  aria-label="Divergence between unscoped context sharing and task-authorized sharing"
                >
                  {/* Unscoped Raw Context Curve (Coral Red, diverging upward) */}
                  <path
                    d="M 10 78 Q 110 70, 200 46 T 285 12"
                    fill="none"
                    stroke="#D94E34"
                    strokeWidth="1.75"
                  />
                  {/* ContextGuard Scoped & Authorized Curve (Ink Charcoal, controlled) */}
                  <path
                    d="M 10 78 Q 110 74, 200 68 T 285 62"
                    fill="none"
                    stroke="#141413"
                    strokeWidth="1.5"
                  />

                  {/* Interactive step markers */}
                  {[10, 100, 195, 285].map((cx, idx) => {
                    const rawY = [78, 66, 45, 12][idx];
                    const scopedY = [78, 73, 68, 62][idx];
                    return (
                      <g
                        key={idx}
                        onClick={() => setHoveredPoint(idx)}
                        onMouseEnter={() => setHoveredPoint(idx)}
                        className="cursor-pointer"
                      >
                        <line
                          x1={cx}
                          y1={0}
                          x2={cx}
                          y2={85}
                          stroke={hoveredPoint === idx ? 'rgba(20,20,19,0.25)' : 'transparent'}
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={cx}
                          cy={rawY}
                          r={hoveredPoint === idx ? 4 : 2.5}
                          fill="#D94E34"
                        />
                        <circle
                          cx={cx}
                          cy={scopedY}
                          r={hoveredPoint === idx ? 4 : 2.5}
                          fill="#141413"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2.5 flex items-center justify-between font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762]">
                <span>WORKFLOW DEPTH (TIME)</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#D94E34]">— UNSCOPED</span>
                  <span className="text-[#141413]">— CONTEXTGUARD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Drop-Cap Narrative matching 00:08-00:10 */}
          <div className="lg:col-span-7">
            <div className="max-w-[540px] space-y-6 font-serif-editorial text-[18px] sm:text-[20px] leading-[1.56] text-[#222220]">
              <p>
                <span className="float-left font-serif-editorial text-[52px] leading-[0.82] pr-3.5 pt-1 text-[#D94E34] select-none">
                  A
                </span>
                I workflow engineering, as practiced today, treats context as an
                all-or-nothing buffer. Autonomous assistants and multi-step tool
                pipelines ingest entire repositories, customer tickets, clinical
                notes, and local environment secrets into a shared context
                window. The result is silent credential drift, over-privileged
                external tool calls, and brittle pattern filters that cannot
                distinguish incidental secrets from task inputs.
              </p>

              <p className="text-[#4a4945]">
                ContextGuard is a proposed security layer for AI workflows: an
                authorization boundary between your internal context and
                external AI models, plugins, and APIs.
              </p>

              <p className="text-[#4a4945]">
                It detects sensitive entities. It analyzes task relevance. It
                enforces destination-specific authorization—ensuring that
                relevance to a task never overrides permission to share.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
