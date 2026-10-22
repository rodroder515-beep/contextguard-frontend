import React from 'react';
import { HeroRadialNetwork } from './HeroRadialNetwork';

interface HeroSectionProps {
  scrollProgress: number;
  onEvaluateClick: () => void;
  onExploreResearchClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  scrollProgress,
  onEvaluateClick,
  onExploreResearchClick,
}) => {
  return (
    <section
      aria-label="ContextGuard Hero"
      className="relative pt-24 md:pt-28 pb-12 md:pb-16 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 lg:gap-6 items-center min-h-[600px] lg:min-h-[680px]">
          {/* Left Column: Editorial Headline, Supporting Prose, and Signature Dual CTAs */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start justify-center z-10">
            <h1
              className="font-serif-editorial text-[40px] sm:text-[50px] xl:text-[58px] font-normal leading-[1.06] tracking-[-0.025em] text-[#141413] max-w-[540px]"
              style={{ textWrap: 'balance' }}
            >
              Intelligence should not override permission.
            </h1>

            <p className="mt-6 font-serif-editorial text-[17px] sm:text-[19px] leading-[1.52] text-[#686762] max-w-[450px] font-normal">
              ContextGuard evaluates sensitive information, task relevance, and
              destination permissions before data leaves an AI workflow.
            </p>

            {/* Primary Pill CTA + Corner-Bracketed Secondary CTA matching 00:01-00:06 */}
            <div className="mt-9 flex flex-wrap items-center gap-4 sm:gap-5">
              <button
                type="button"
                onClick={onEvaluateClick}
                className="px-6 py-3 rounded-full bg-[#141413] text-[#f4f3ef] text-[13px] font-medium tracking-[-0.01em] hover:bg-[#2a2a28] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Evaluate a prompt
              </button>

              <button
                type="button"
                onClick={onExploreResearchClick}
                className="corner-ticks group relative px-6 py-3 text-[13px] font-medium text-[#141413] hover:bg-[#141413]/4 transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="corner-ticks-inner" />
                Explore the research
              </button>
            </div>

            {/* Quiet Principle Footnote */}
            <div className="mt-12 pt-5 border-t border-[#141413]/10 max-w-[430px]">
              <p className="font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[#686762]">
                FIRST PRINCIPLE · CONTEXTUAL INTEGRITY
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-[#52514d]">
                Information being relevant to a task does not automatically mean
                it is authorized to be shared with an external model or tool.
              </p>
            </div>
          </div>

          {/* Right Column: 3D Sculpture positioned toward the right and slightly upward on tablet/desktop */}
          <div className="md:col-span-6 lg:col-span-7 flex items-center justify-center md:justify-end md:-mt-10 lg:-mt-14">
            <HeroRadialNetwork scrollProgress={scrollProgress} />
          </div>
        </div>
      </div>
    </section>
  );
};
