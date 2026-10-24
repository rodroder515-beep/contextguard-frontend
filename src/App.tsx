/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { StackLayerSection } from './components/StackLayerSection';
import { InteractiveDemoSection } from './components/InteractiveDemoSection';
import { ArchitectureStagesSection } from './components/ArchitectureStagesSection';
import { ResearchNotesSection } from './components/ResearchNotesSection';
import { MethodologyTracksSection } from './components/MethodologyTracksSection';
import { DarkTerminalSection } from './components/DarkTerminalSection';
import { Footer } from './components/Footer';
import { MvpDemoPresentationPlayer } from './components/MvpDemoPresentationPlayer';

gsap.registerPlugin(ScrollTrigger);

const NAVBAR_SCROLL_OFFSET = -88;

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [heroScrollProgress, setHeroScrollProgress] = useState<number>(0);
  const [isMvpDemoOpen, setIsMvpDemoOpen] = useState<boolean>(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll with proper React lifecycle, reduced-motion support, and cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenisInstance: Lenis | null = null;
    let rafId: number | null = null;
    let unsubscribeScroll: (() => void) | null = null;

    const destroyLenis = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (unsubscribeScroll) {
        unsubscribeScroll();
        unsubscribeScroll = null;
      }
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
      lenisRef.current = null;
    };

    const initLenis = () => {
      destroyLenis();

      if (mediaQuery.matches) {
        return;
      }

      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        autoResize: true,
        allowNestedScroll: true,
        anchors: {
          offset: NAVBAR_SCROLL_OFFSET,
        },
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
        prevent: (node: HTMLElement) =>
          node.tagName === 'TEXTAREA' ||
          node.tagName === 'SELECT' ||
          node.isContentEditable ||
          node.getAttribute('role') === 'dialog' ||
          node.getAttribute('role') === 'listbox',
      });

      lenisInstance = lenis;
      lenisRef.current = lenis;
      unsubscribeScroll = lenis.on('scroll', () => {
        ScrollTrigger.update();
      });

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    initLenis();

    const handleMotionPreferenceChange = () => {
      initLenis();
    };

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
      destroyLenis();
    };
  }, []);

  // Recalculate scroll dimensions when switching views
  useEffect(() => {
    const timer = window.setTimeout(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  // Track scroll position for morphing center brand pill and hero radial transition
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 90);
      setHeroScrollProgress(Math.min(1, y / 380));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.9 });
      return;
    }
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const performScrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      const lenis = lenisRef.current;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(el, {
          offset: NAVBAR_SCROLL_OFFSET,
          duration: 1.05,
        });
        return;
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const targetTop =
        el.getBoundingClientRect().top + window.scrollY + NAVBAR_SCROLL_OFFSET;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    []
  );

  const scrollToElement = useCallback(
    (id: string) => {
      if (activeTab !== 'overview') {
        setActiveTab('overview');
        window.setTimeout(() => {
          performScrollToSection(id);
        }, 60);
      } else {
        performScrollToSection(id);
      }
    },
    [activeTab, performScrollToSection]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        activeTab === 'terminal'
          ? 'bg-[#0e0e0d] text-[#f4f3ef]'
          : 'bg-[#dfddd7] text-[#141413]'
      }`}
    >
      {/* Fixed 3-Zone Floating Navigation Chrome (matching 00:00-00:44) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          scrollToTop();
        }}
        isScrolled={isScrolled}
        onJumpToDemo={() => scrollToElement('interactive-demo')}
        onJumpToArchitecture={() => scrollToElement('architecture-stack')}
        onOpenMvpDemo={() => setIsMvpDemoOpen(true)}
        isMvpDemoActive={isMvpDemoOpen}
      />

      {/* Main Content Router */}
      <main>
        {activeTab === 'overview' && (
          <>
            {/* 1. Hero + Sculpture Video */}
            <HeroSection
              scrollProgress={heroScrollProgress}
              onEvaluateClick={() => scrollToElement('interactive-demo')}
              onExploreResearchClick={() => scrollToElement('research-notes')}
              onOpenMvpDemo={() => setIsMvpDemoOpen(true)}
            />

            {/* 2. The Problem: Briefing Player, Pull-Quote, Divergence Graph & Coral Drop-Cap (00:07-00:11) */}
            <ProblemSection
              onOpenMvpDemo={() => setIsMvpDemoOpen(true)}
            />

            {/* 3. The Protection Workflow: "A new layer of the stack" Isometric 3D Stack (00:11-00:19) */}
            <StackLayerSection />

            {/* 4. Interactive Demonstration & Destination Authorization Inspector (00:19-00:22) */}
            <InteractiveDemoSection />

            {/* 5. System Architecture: 4-Stage Accordion & Dark 3D Geodesic Sphere (00:22-00:29) */}
            <ArchitectureStagesSection />

            {/* 6. Research & Evaluation Methodology Blueprint Grid (00:30-00:34) */}
            <ResearchNotesSection
              onLoadScenarioInDemo={() => scrollToElement('interactive-demo')}
            />

            {/* 7. Evaluation Modules & Methodology Tracks (00:35-00:38) */}
            <MethodologyTracksSection
              onInspectModuleInDemo={() => scrollToElement('interactive-demo')}
            />

            {/* 8. Closing Call to Action & Interactive Dark Starburst Policy CLI (00:39-00:44) */}
            <DarkTerminalSection
              onJumpToDemo={() => scrollToElement('interactive-demo')}
            />
          </>
        )}

        {activeTab === 'research' && (
          <div className="pt-12">
            <ResearchNotesSection
              onLoadScenarioInDemo={() => scrollToElement('interactive-demo')}
            />
          </div>
        )}

        {activeTab === 'methodology' && (
          <div className="pt-12">
            <MethodologyTracksSection
              onInspectModuleInDemo={() => scrollToElement('interactive-demo')}
            />
          </div>
        )}

        {activeTab === 'terminal' && (
          <DarkTerminalSection
            isStandaloneView
            onJumpToDemo={() => scrollToElement('interactive-demo')}
          />
        )}
      </main>

      {/* 10. 5-Column Architectural Footer (00:32-00:34 & 00:42-00:44) */}
      <Footer
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          scrollToTop();
        }}
        onJumpToSection={(sectionId) => scrollToElement(sectionId)}
      />

      {/* Interactive ContextGuard MVP Demonstration Player & Script Cue Sheet */}
      <MvpDemoPresentationPlayer
        isOpen={isMvpDemoOpen}
        onClose={() => setIsMvpDemoOpen(false)}
        onJumpToSection={(sectionId) => scrollToElement(sectionId)}
        onRunDemoEvaluation={() => scrollToElement('interactive-demo')}
      />
    </div>
  );
}
