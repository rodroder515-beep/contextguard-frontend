import React from 'react';

export type ActiveTab = 'overview' | 'research' | 'methodology' | 'terminal';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isScrolled: boolean;
  onJumpToDemo: () => void;
  onJumpToArchitecture: () => void;
  onOpenMvpDemo?: () => void;
  isMvpDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isScrolled,
  onJumpToDemo,
  onJumpToArchitecture,
  onOpenMvpDemo,
  isMvpDemoActive,
}) => {
  const isDarkTheme = activeTab === 'terminal';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 md:px-9 pt-4 sm:pt-5 pointer-events-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Left Navigation Pill (matching Blog | Careers | Government in reference) */}
        <nav
          aria-label="Primary sections"
          className={`pointer-events-auto flex items-center gap-0.5 p-1 rounded-full border backdrop-blur-md transition-colors duration-300 ${
            isDarkTheme
              ? 'bg-[#1c1c1a]/85 border-white/12 text-[#e5e4de]'
              : 'bg-[#e8e6e0]/85 border-[#141413]/10 text-[#141413]'
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectTab('research')}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'research'
                ? isDarkTheme
                  ? 'bg-white/15 text-white'
                  : 'bg-[#141413]/10 text-[#141413]'
                : isDarkTheme
                ? 'text-[#a09f99] hover:text-white'
                : 'text-[#52514d] hover:text-[#141413]'
            }`}
          >
            Research
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('methodology')}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'methodology'
                ? isDarkTheme
                  ? 'bg-white/15 text-white'
                  : 'bg-[#141413]/10 text-[#141413]'
                : isDarkTheme
                ? 'text-[#a09f99] hover:text-white'
                : 'text-[#52514d] hover:text-[#141413]'
            }`}
          >
            Modules
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('terminal')}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-white/15 text-white'
                : 'text-[#52514d] hover:text-[#141413]'
            }`}
          >
            Policy CLI
          </button>
        </nav>

        {/* Zone 2: Center Morphing Brand Pill (contracts to circle on scroll or narrow mobile) */}
        <div className="pointer-events-auto flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
            }}
            aria-label="ContextGuard Home"
            className={`group flex items-center justify-center gap-2.5 h-9 sm:h-10 rounded-full border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
              isScrolled && activeTab === 'overview'
                ? 'w-9 sm:w-10 px-0'
                : 'w-9 px-0 md:w-[300px] md:px-5'
            } ${
              isDarkTheme
                ? 'bg-[#1c1c1a]/90 border-white/15 text-[#f4f3ef] hover:border-white/30'
                : 'bg-[#eceae4]/90 border-[#141413]/10 text-[#141413] hover:border-[#141413]/25 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
            }`}
          >
            {/* Geometric Pyramid / Shield Mark matching reference */}
            <svg
              width="16"
              height="15"
              viewBox="0 0 18 16"
              fill="none"
              className="shrink-0 transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <path
                d="M9 1L1 15H6.2L9 10.1L11.8 15H17L9 1Z"
                fill="currentColor"
              />
            </svg>
            <span
              className={`hidden md:inline text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap overflow-hidden transition-all duration-500 ${
                isScrolled && activeTab === 'overview'
                  ? 'max-w-0 opacity-0'
                  : 'max-w-[160px] opacity-100'
              }`}
            >
              ContextGuard
            </span>
          </button>
        </div>

        {/* Zone 3: Right Action Pill Group */}
        <div
          className={`pointer-events-auto flex items-center gap-1 p-1 rounded-full border backdrop-blur-md transition-colors duration-300 shrink-0 ${
            isDarkTheme
              ? 'bg-[#1c1c1a]/85 border-white/12'
              : 'bg-[#e8e6e0]/85 border-[#141413]/10'
          }`}
        >
          {onOpenMvpDemo && (
            <button
              type="button"
              onClick={onOpenMvpDemo}
              className={`inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                isMvpDemoActive
                  ? 'bg-[#d94e34] text-white shadow-xs'
                  : isDarkTheme
                  ? 'text-[#d99b16] hover:bg-white/10'
                  : 'text-[#b45309] hover:bg-[#141413]/5'
              }`}
              title="Play 2:50 ContextGuard MVP Demonstration walkthrough"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isMvpDemoActive ? 'bg-white' : 'bg-[#d94e34]'} animate-pulse`} />
              <span>MVP Demo</span>
            </button>
          )}
          <button
            type="button"
            onClick={onJumpToArchitecture}
            className={`hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              isDarkTheme
                ? 'text-[#d8d6d0] hover:text-white hover:bg-white/10'
                : 'text-[#141413] hover:bg-[#141413]/5'
            }`}
          >
            Architecture
          </button>
          <button
            type="button"
            onClick={onJumpToDemo}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              isDarkTheme
                ? 'bg-[#f4f3ef] text-[#141413] hover:bg-white'
                : 'bg-[#141413] text-[#f4f3ef] hover:bg-[#2b2b29]'
            }`}
          >
            <span className="sm:hidden">Sandbox</span>
            <span className="hidden sm:inline">Interactive Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
