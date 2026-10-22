import React, { useEffect, useRef, useState } from 'react';
import { STACK_CARDS } from '../data/researchData';

export const StackLayerSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(2);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (userInteracted || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const progress = (viewportH * 0.65 - rect.top) / Math.max(rect.height * 0.75, 1);

      if (progress < 0.32) {
        setActiveStage(0);
      } else if (progress < 0.66) {
        setActiveStage(1);
      } else {
        setActiveStage(2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userInteracted]);

  const toolIcons = [
    { name: 'LLM', label: 'Frontier LLM' },
    { name: 'MCP', label: 'MCP Server' },
    { name: 'GH', label: 'GitHub Tool' },
    { name: 'SLK', label: 'Slack Bot' },
    { name: 'SQL', label: 'DB Reader' },
    { name: 'CRM', label: 'Support CRM' },
    { name: 'API', label: 'REST Webhook' },
  ];

  return (
    <section
      id="architecture-stack"
      ref={sectionRef}
      aria-label="A new layer of the stack"
      className="py-24 md:py-32 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Top Section Header matching 00:11-00:12 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-14 md:pb-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-12 font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762] mb-4">
              <span>01</span>
              <span>WHERE WE SIT</span>
            </div>
            <h2 className="font-serif-editorial text-[36px] sm:text-[46px] leading-[1.08] tracking-[-0.02em] text-[#141413]">
              A new layer of the stack
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="font-serif-editorial text-[19px] sm:text-[22px] leading-[1.45] text-[#4a4945] max-w-[490px]">
              ContextGuard is the authorization layer between your AI workflows
              and external destinations.
            </p>
          </div>
        </div>

        {/* Main 2-Column Split: Left Sequential Cards + Right Isometric Stack Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          {/* Left Column: 3 Selectable Stage Cards matching 00:12-00:19 */}
          <div className="lg:col-span-5 space-y-5">
            {STACK_CARDS.map((card, idx) => {
              const isActive = activeStage === idx;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setUserInteracted(true);
                    setActiveStage(idx);
                  }}
                  className={`w-full text-left p-6 sm:p-8 transition-all duration-300 cursor-pointer relative ${
                    isActive
                      ? 'bg-[#161615] text-[#f4f3ef] shadow-md corner-ticks-light'
                      : 'bg-[#dad8d1]/55 text-[#52514d] border border-[#141413]/12 hover:bg-[#dad8d1] corner-ticks'
                  }`}
                >
                  <span
                    className={
                      isActive ? 'corner-ticks-light-inner' : 'corner-ticks-inner'
                    }
                  />
                  <div
                    className={`font-mono-tech text-[10px] tracking-[0.14em] uppercase mb-3 ${
                      isActive ? 'text-[#a09f99]' : 'text-[#686762]'
                    }`}
                  >
                    {card.kicker}
                  </div>
                  <h3
                    className={`font-serif-editorial text-[24px] sm:text-[28px] leading-[1.15] tracking-[-0.015em] mb-4 ${
                      isActive ? 'text-[#f4f3ef]' : 'text-[#141413]'
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-[13px] sm:text-[14px] leading-[1.6] ${
                      isActive ? 'text-[#c8c6c0]' : 'text-[#52514d]'
                    }`}
                  >
                    {card.description}
                  </p>
                </button>
              );
            })}

            {/* Stage Selector Pill Controls for explicit inspection */}
            <div className="pt-2 flex items-center gap-2">
              <span className="font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[#686762] mr-2">
                STACK VIEW:
              </span>
              {['01. Flat Boundary', '02. Relevance Engine', '03. Full Policy Matrix'].map(
                (label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setUserInteracted(true);
                      setActiveStage(idx);
                    }}
                    className={`px-3 py-1 rounded-full font-mono-tech text-[10px] tracking-[0.06em] transition-colors cursor-pointer ${
                      activeStage === idx
                        ? 'bg-[#141413] text-[#f4f3ef]'
                        : 'bg-[#d5d3cc] text-[#52514d] hover:text-[#141413]'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Right Column: Interactive Isometric 3D Wireframe Stack Diagram matching 00:12-00:18 */}
          <div className="lg:col-span-7 lg:pl-8 pt-4 lg:pt-8">
            <div className="relative py-8 px-2 sm:px-8">
              {/* Vertical dashed isometric projection guide lines matching 00:14-00:18 */}
              <div
                className={`pointer-events-none absolute inset-y-2 left-6 sm:left-12 right-6 sm:right-12 border-l border-r border-dashed border-[#141413]/20 transition-opacity duration-500 ${
                  activeStage >= 1 ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div
                className={`space-y-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeStage >= 1
                    ? 'lg:-skew-y-6 lg:scale-[0.98]'
                    : 'skew-y-0 scale-100'
                }`}
              >
                {/* LAYER 1: Top Slice — Your AI Workflow (Always visible) */}
                <div className="corner-ticks relative bg-[#dfddd7]/90 border border-[#141413]/20 p-5 sm:p-6 transition-all duration-500">
                  <span className="corner-ticks-inner" />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif-editorial text-[20px] sm:text-[22px] text-[#141413]">
                        AI Workflow &amp; User Intent
                      </h4>
                      <p className="text-[12px] sm:text-[13px] text-[#686762] mt-0.5">
                        Prompts, retrieved RAG documents, task objectives, and agent memory
                      </p>
                    </div>
                    <span className="font-mono-tech text-[10px] tracking-[0.1em] uppercase text-[#686762] shrink-0">
                      TRUSTED ORIGIN
                    </span>
                  </div>
                </div>

                {/* LAYER 2: Middle Slice A — ContextGuard Evaluators (Expands in Stage 1 & 2, matching 00:14-00:18) */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeStage >= 1
                      ? 'max-h-[240px] opacity-100'
                      : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="corner-ticks relative bg-[#e6e4de] border border-[#141413]/30 p-5 sm:p-6">
                    <span className="corner-ticks-inner" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#D94E34]" />
                          <h4 className="font-serif-editorial text-[20px] sm:text-[22px] text-[#141413]">
                            ContextGuard Evaluators
                          </h4>
                        </div>
                        <p className="text-[12px] sm:text-[13px] text-[#52514d] mt-1">
                          Sensitive entity recognition &amp; semantic task-relevance analysis
                        </p>
                      </div>

                      {/* Signature 10-dot Pyramid Cluster matching 00:15-00:18 */}
                      <div
                        className="flex flex-col items-center gap-1.5 shrink-0 pr-2"
                        aria-hidden="true"
                      >
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                          <span className="w-2 h-2 rounded-full bg-[#D94E34]" />
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                          <span className="w-2 h-2 rounded-full bg-[#141413]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LAYER 3: Middle Slice B — Destination Authorization Matrix & Tool Tiles (Expands in Stage 2, matching 00:16-00:18) */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeStage >= 2
                      ? 'max-h-[320px] opacity-100'
                      : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="corner-ticks relative bg-[#e6e4de] border border-[#141413]/30 p-5 sm:p-6">
                    <span className="corner-ticks-inner" />
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-serif-editorial text-[20px] sm:text-[22px] text-[#141413]">
                          Destination Authorization Matrix
                        </h4>
                        <p className="text-[12px] sm:text-[13px] text-[#52514d] mt-0.5">
                          Per-endpoint policy decisions (Allow, Redact, Block) &amp; transparent explanations
                        </p>
                      </div>
                      <span className="font-mono-tech text-[10px] tracking-[0.1em] uppercase text-[#4d7317] shrink-0">
                        POLICY ENFORCED
                      </span>
                    </div>

                    {/* Row of Monochrome Destination Connector Boxes matching 00:17-00:18 */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2 border-t border-[#141413]/10">
                      {toolIcons.map((tool) => (
                        <div
                          key={tool.name}
                          title={tool.label}
                          className="h-11 bg-[#dfddd7] border border-[#141413]/15 flex flex-col items-center justify-center p-1 hover:border-[#141413]/40 transition-colors"
                        >
                          <span className="font-mono-tech text-[11px] font-semibold text-[#141413]">
                            {tool.name}
                          </span>
                          <span className="font-mono-tech text-[8px] text-[#686762] truncate max-w-full">
                            {tool.label.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                      <div className="h-11 bg-[#dfddd7]/60 border border-[#141413]/15 flex items-center justify-center px-1">
                        <span className="font-mono-tech text-[9px] text-[#686762] whitespace-nowrap">
                          + 12 rules
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LAYER 4: Bottom Slice — External Destinations (Always visible) */}
                <div className="corner-ticks relative bg-[#dfddd7]/90 border border-[#141413]/20 p-5 sm:p-6 transition-all duration-500">
                  <span className="corner-ticks-inner" />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif-editorial text-[20px] sm:text-[22px] text-[#141413]">
                        External AI Services &amp; Tools
                      </h4>
                      <p className="text-[12px] sm:text-[13px] text-[#686762] mt-0.5">
                        External model APIs, third-party MCP servers, webhooks, and SaaS integrations
                      </p>
                    </div>
                    <span className="font-mono-tech text-[10px] tracking-[0.1em] uppercase text-[#686762] shrink-0">
                      EXTERNAL BOUNDARY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
