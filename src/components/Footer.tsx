import React from 'react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onJumpToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onSelectTab,
  onJumpToSection,
}) => {
  const isDark = activeTab === 'terminal';

  return (
    <footer
      aria-label="Site Footer"
      className={`border-t transition-colors duration-300 ${
        isDark
          ? 'bg-[#0e0e0d] text-[#f4f3ef] border-white/12'
          : 'bg-[#dfddd7] text-[#141413] border-[#141413]/12'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20 py-14 md:py-20">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x ${
            isDark ? 'divide-white/12' : 'divide-[#141413]/12'
          }`}
        >
          {/* Col 1: Product */}
          <div className="lg:col-span-3 py-6 sm:py-2 sm:pr-6 flex flex-col justify-between min-h-[190px]">
            <div>
              <div
                className={`font-mono-tech text-[9px] tracking-[0.16em] uppercase mb-5 ${
                  isDark ? 'text-[#a09f99]' : 'text-[#686762]'
                }`}
              >
                PRODUCT
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('overview');
                }}
                className="text-left font-serif-editorial text-[22px] sm:text-[24px] leading-[1.18] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Context-Aware
                <br />
                AI Security
              </button>
            </div>

            <div
              className={`font-mono-tech text-[10px] mt-8 ${
                isDark ? 'text-[#a09f99]' : 'text-[#686762]'
              }`}
            >
              ContextGuard Research
            </div>
          </div>

          {/* Col 2: Architecture */}
          <div className="lg:col-span-2 py-6 sm:py-2 sm:px-6 flex flex-col justify-between min-h-[190px]">
            <div>
              <div
                className={`font-mono-tech text-[9px] tracking-[0.16em] uppercase mb-5 ${
                  isDark ? 'text-[#a09f99]' : 'text-[#686762]'
                }`}
              >
                WORKFLOW
              </div>
              <ul className="space-y-2 font-serif-editorial text-[20px] sm:text-[22px] leading-snug">
                <li>
                  <button
                    type="button"
                    onClick={() => onJumpToSection('problem')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Problem
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onJumpToSection('architecture-stack')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Stack Layer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onJumpToSection('interactive-demo')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Live Sandbox
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Research */}
          <div className="lg:col-span-2 py-6 sm:py-2 sm:px-6 flex flex-col justify-between min-h-[190px]">
            <div>
              <div
                className={`font-mono-tech text-[9px] tracking-[0.16em] uppercase mb-5 ${
                  isDark ? 'text-[#a09f99]' : 'text-[#686762]'
                }`}
              >
                RESEARCH
              </div>
              <ul className="space-y-2 font-serif-editorial text-[20px] sm:text-[22px] leading-snug">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectTab('research')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Field Notes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectTab('methodology')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Methodology
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectTab('terminal')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Policy CLI
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Governance */}
          <div className="lg:col-span-2 py-6 sm:py-2 sm:px-6 flex flex-col justify-between min-h-[190px]">
            <div>
              <div
                className={`font-mono-tech text-[9px] tracking-[0.16em] uppercase mb-5 ${
                  isDark ? 'text-[#a09f99]' : 'text-[#686762]'
                }`}
              >
                GOVERNANCE
              </div>
              <ul className="space-y-2 font-serif-editorial text-[20px] sm:text-[22px] leading-snug">
                <li>
                  <button
                    type="button"
                    onClick={() => onJumpToSection('system-architecture')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Permissions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onJumpToSection('evaluation-methodology')}
                    className="hover:underline underline-offset-4 cursor-pointer"
                  >
                    Audit Trace
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 5: Right Summary & 10-Dot Pyramid Emblem matching 00:32-00:34 and 00:42-00:44 */}
          <div className="lg:col-span-3 py-6 sm:py-2 sm:pl-6 flex flex-col justify-between min-h-[190px]">
            <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[9px] tracking-[0.12em] uppercase">
              <span
                className={`px-2 py-1 border ${
                  isDark
                    ? 'bg-white text-[#141413] border-white'
                    : 'bg-[#141413] text-[#f4f3ef] border-[#141413]'
                }`}
              >
                RELEVANCE ≠ PERMISSION
              </span>
              <span
                className={`px-2 py-1 border ${
                  isDark
                    ? 'border-white/20 text-[#c8c6c0]'
                    : 'border-[#141413]/20 text-[#52514d]'
                }`}
              >
                RESEARCH ARCHITECTURE
              </span>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <p
                className={`font-mono-tech text-[9px] tracking-[0.1em] uppercase leading-[1.6] max-w-[230px] ${
                  isDark ? 'text-[#a09f99]' : 'text-[#686762]'
                }`}
              >
                PROPOSED SECURITY LAYER FOR AI WORKFLOWS. ALLOW, REDACT, OR
                BLOCK WITH TRANSPARENT POLICY EXPLANATIONS.
              </p>

              {/* Signature 10-Dot Triangular Pyramid Emblem matching 00:32 & 00:44 */}
              <div
                className="flex flex-col items-center gap-1.5 shrink-0"
                aria-hidden="true"
              >
                <div className="flex gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                </div>
                <div className="flex gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                </div>
                <div className="flex gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                </div>
                <div className="flex gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDark ? 'bg-[#f4f3ef]' : 'bg-[#141413]'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
