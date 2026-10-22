import React, { useState } from 'react';
import { EVALUATION_TRACKS } from '../data/researchData';

interface MethodologyTracksSectionProps {
  onInspectModuleInDemo: () => void;
}

export const MethodologyTracksSection: React.FC<MethodologyTracksSectionProps> = ({
  onInspectModuleInDemo,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    EVALUATION_TRACKS[0].id
  );
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const activeCategory =
    EVALUATION_TRACKS.find((c) => c.id === selectedCategoryId) ||
    EVALUATION_TRACKS[0];

  return (
    <section
      id="evaluation-methodology"
      aria-label="Evaluation Methodology and Research Modules"
      className="py-24 md:py-32 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Top Section Header matching 00:35 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-baseline pb-14 md:pb-20">
          <div className="lg:col-span-6">
            <h2 className="font-serif-editorial text-[36px] sm:text-[46px] leading-[1.08] tracking-[-0.02em] text-[#141413]">
              Evaluation modules &amp; methodology.
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="font-serif-editorial text-[19px] sm:text-[22px] leading-[1.45] text-[#4a4945]">
              For security teams who verify permissions before trusting
              automation.
            </p>
          </div>
        </div>

        {/* 2-Column Interactive Category Selector matching 00:35-00:38 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: 4 Category Cards with Corner Ticks */}
          <div className="lg:col-span-5 space-y-2.5">
            {EVALUATION_TRACKS.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setExpandedItemId(null);
                  }}
                  className={`w-full text-left p-6 sm:p-8 transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#5c5b57] text-[#f4f3ef] corner-ticks-light'
                      : 'bg-[#dfddd7] hover:bg-[#d6d4cd] text-[#141413] corner-ticks'
                  }`}
                >
                  <span
                    className={
                      isSelected ? 'corner-ticks-light-inner' : 'corner-ticks-inner'
                    }
                  />
                  <div
                    className={`font-mono-tech text-[9px] tracking-[0.14em] uppercase mb-2 ${
                      isSelected ? 'text-[#d8d6d0]' : 'text-[#686762]'
                    }`}
                  >
                    TRACK
                  </div>
                  <div
                    className={`font-serif-editorial text-[26px] sm:text-[30px] leading-[1.15] ${
                      isSelected ? 'text-[#f4f3ef]' : 'text-[#141413]'
                    }`}
                  >
                    {cat.name}
                  </div>
                  <div
                    className={`mt-4 text-[12px] ${
                      isSelected ? 'text-[#e5e4de]' : 'text-[#686762]'
                    }`}
                  >
                    {cat.countLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Module Rows with Hover Pill Action matching 00:36-00:38 */}
          <div className="lg:col-span-7 border-t border-[#141413]/15">
            {activeCategory.items.length > 0 ? (
              <div className="divide-y divide-[#141413]/15">
                {activeCategory.items.map((item) => {
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setExpandedItemId(isExpanded ? null : item.id)
                      }
                      className="group py-6 sm:py-7 px-2 flex flex-col justify-between transition-colors hover:bg-[#d8d6cf]/45 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#141413]">
                            {item.title}
                          </h3>
                          <div className="mt-1.5 text-[13px] text-[#686762]">
                            {item.meta}
                          </div>
                          <div className="mt-0.5 text-[13px] text-[#52514d]">
                            {item.scope}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspectModuleInDemo();
                            }}
                            className="px-5 py-2 rounded-full bg-[#141413] text-[#f4f3ef] text-[12px] font-medium opacity-95 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer"
                          >
                            Test in Sandbox
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <p className="mt-4 pt-3 border-t border-[#141413]/10 text-[13px] leading-relaxed text-[#222220]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty / Honest Research Posture State matching 00:38 ("No open roles in Operations right now.") */
              <div className="py-8 text-[14px] text-[#52514d] leading-relaxed">
                No fabricated production benchmarks, customer testimonials, or
                absolute security guarantees are claimed right now. ContextGuard
                is presented strictly as a research-driven security architecture
                for evaluating sensitive context, task relevance, and
                destination permissions.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
