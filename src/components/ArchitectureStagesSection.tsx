import React, { useEffect, useRef, useState } from 'react';
import { ARCHITECTURE_STAGES } from '../data/researchData';

interface Point3D {
  // Mode 0: Off-center radial scan (00:26)
  m0x: number;
  m0y: number;
  m0z: number;
  // Mode 1: Geodesic wireframe sphere (00:25)
  m1x: number;
  m1y: number;
  m1z: number;
  // Mode 2: Centered radial starburst (00:24)
  m2x: number;
  m2y: number;
  m2z: number;
  // Mode 3: Floating cluster constellation (00:27)
  m3x: number;
  m3y: number;
  m3z: number;
  radius: number;
  isAccent: boolean;
}

const SPHERE_POINTS: { points: Point3D[]; edges: [number, number][] } = (() => {
  const points: Point3D[] = [];
  const total = 74;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < total; i++) {
    // Fibonacci sphere distribution for Mode 1 (Geodesic Sphere at 00:25)
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
    const sx = Math.cos(theta) * Math.sin(phi);
    const sy = Math.sin(theta) * Math.sin(phi);
    const sz = Math.cos(phi);

    // Mode 0: Asymmetric focal burst (00:26)
    const r0 = i === 0 ? 0 : 0.35 + ((i * 13) % 10) * 0.085;
    const m0x = i === 0 ? 0.12 : 0.12 + sx * r0;
    const m0y = i === 0 ? -0.08 : -0.08 + sy * r0;
    const m0z = sz * r0;

    // Mode 1: Crisp Geodesic Sphere surface (00:25)
    const r1 = 0.84;
    const m1x = sx * r1;
    const m1y = sy * r1;
    const m1z = sz * r1;

    // Mode 2: Centered Radial Starburst (00:24)
    const r2 = i === 0 ? 0 : 0.25 + ((i * 7) % 12) * 0.062;
    const m2x = sx * r2;
    const m2y = sy * r2;
    const m2z = sz * r2;

    // Mode 3: Floating Cluster Bubbles (00:27)
    const r3 = 0.2 + ((i * 19) % 11) * 0.068;
    const m3x = sx * r3 * 0.9;
    const m3y = sy * r3 * 0.9 - 0.05;
    const m3z = sz * r3;

    points.push({
      m0x,
      m0y,
      m0z,
      m1x,
      m1y,
      m1z,
      m2x,
      m2y,
      m2z,
      m3x,
      m3y,
      m3z,
      radius: i % 8 === 0 ? 5.5 : i % 4 === 0 ? 3.8 : 2.2,
      isAccent: i % 11 === 0,
    });
  }

  // Precompute geodesic neighbor edges for Mode 1 (00:25 wireframe sphere)
  const edges: [number, number][] = [];
  for (let i = 0; i < total; i++) {
    for (let j = i + 1; j < total; j++) {
      const dx = points[i].m1x - points[j].m1x;
      const dy = points[i].m1y - points[j].m1y;
      const dz = points[i].m1z - points[j].m1z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < 0.56) {
        edges.push([i, j]);
      }
    }
  }

  return { points, edges };
})();

export const ArchitectureStagesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(1); // Default to Relevance (Mode 1 geodesic sphere or Mode 2)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const weightsRef = useRef<[number, number, number, number]>([0, 1, 0, 0]);
  const activeStage = ARCHITECTURE_STAGES[activeIndex] || ARCHITECTURE_STAGES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    let animationFrameId: number;
    let lastTime = 0;
    let rotY = 0.4;
    let rotX = 0.2;

    const render = (timestamp: number) => {
      if (isHeadless && timestamp - lastTime < 66) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = timestamp;
      rotY += isHeadless ? 0.008 : 0.005;
      rotX = Math.sin(rotY * 0.5) * 0.18;

      // Interpolate weights toward activeIndex
      const w = weightsRef.current;
      for (let m = 0; m < 4; m++) {
        const target = m === activeIndex ? 1 : 0;
        w[m] += (target - w[m]) * (isHeadless ? 0.35 : 0.08);
      }

      const dpr = isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const radiusScale = Math.min(width, height) * 0.38;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project all 3D points
      const projected = SPHERE_POINTS.points.map((pt) => {
        const x =
          pt.m0x * w[0] + pt.m1x * w[1] + pt.m2x * w[2] + pt.m3x * w[3];
        const y =
          pt.m0y * w[0] + pt.m1y * w[1] + pt.m2y * w[2] + pt.m3y * w[3];
        const z =
          pt.m0z * w[0] + pt.m1z * w[1] + pt.m2z * w[2] + pt.m3z * w[3];

        // 3D rotation
        const rx = x * cosY - z * sinY;
        const rz1 = x * sinY + z * cosY;
        const ry = y * cosX - rz1 * sinX;
        const rz = y * sinX + rz1 * cosX;

        const perspective = 2.6 / (2.6 - rz * 0.65);
        return {
          sx: cx + rx * radiusScale * perspective,
          sy: cy + ry * radiusScale * perspective,
          depth: rz,
          perspective,
          pt,
        };
      });

      // Draw radial spokes in Mode 0 (Detection) & Mode 2 (Authorization)
      const radialWeight = w[0] + w[2];
      if (radialWeight > 0.05) {
        const hubX = cx + 0.12 * radiusScale * w[0];
        const hubY = cy - 0.08 * radiusScale * w[0];
        ctx.lineWidth = 0.75;
        for (let i = 1; i < projected.length; i++) {
          const p = projected[i];
          const alpha = Math.max(0.05, (p.depth + 1) * 0.14) * radialWeight;
          ctx.beginPath();
          ctx.moveTo(hubX, hubY);
          ctx.lineTo(p.sx, p.sy);
          ctx.strokeStyle = `rgba(220, 218, 210, ${alpha})`;
          ctx.stroke();
        }
      }

      // Draw geodesic wireframe triangle edges in Mode 1 (Relevance - matching 00:25)
      if (w[1] > 0.05) {
        ctx.lineWidth = 0.8;
        for (const [i, j] of SPHERE_POINTS.edges) {
          const p1 = projected[i];
          const p2 = projected[j];
          const avgDepth = (p1.depth + p2.depth) * 0.5;
          const alpha = Math.max(0.06, (avgDepth + 1.1) * 0.18) * w[1];
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.strokeStyle = `rgba(228, 226, 218, ${alpha})`;
          ctx.stroke();
        }
      }

      // Draw nodes sorted back-to-front
      const sorted = [...projected].sort((a, b) => a.depth - b.depth);
      for (const item of sorted) {
        const r =
          item.pt.radius *
          item.perspective *
          (1 + w[3] * 0.45); // Larger clustered spheres in Mode 3 (00:27)
        const depthAlpha = Math.max(0.2, Math.min(0.95, (item.depth + 1.2) * 0.45));

        ctx.beginPath();
        ctx.arc(item.sx, item.sy, r, 0, Math.PI * 2);

        if (item.pt.isAccent && (w[0] > 0.4 || w[2] > 0.4)) {
          ctx.fillStyle = `rgba(217, 78, 52, ${depthAlpha})`;
        } else {
          ctx.fillStyle = `rgba(215, 213, 206, ${depthAlpha})`;
        }
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeIndex]);

  return (
    <section
      id="system-architecture"
      aria-label="System Architecture and Four Decision Stages"
      className="py-24 md:py-32 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Top Section Header matching 00:22-00:23 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-14 md:pb-16">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-12 font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762] mb-4">
              <span>02</span>
              <span>HOW CONTEXTGUARD OPERATES</span>
            </div>
            <h2 className="font-serif-editorial text-[36px] sm:text-[46px] leading-[1.08] tracking-[-0.02em] text-[#141413]">
              One architecture.
              <br />
              Four decision stages.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:pt-7">
            <p className="font-serif-editorial text-[19px] sm:text-[22px] leading-[1.45] text-[#4a4945] max-w-[480px]">
              Specialized evaluation stages that govern different slices of
              outbound context. Composable, deterministic, and fully
              explainable.
            </p>
          </div>
        </div>

        {/* 2-Column Split: Left 4 Interactive Accordion Cards + Right Square Dark Sphere Canvas (00:23-00:29) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: 4 Interactive Rows with Corner Ticks */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3">
            {ARCHITECTURE_STAGES.map((stage, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left p-6 sm:p-7 transition-all duration-200 cursor-pointer relative flex-1 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#161615] text-[#f4f3ef] corner-ticks-light shadow-sm'
                      : 'bg-[#dfddd7] hover:bg-[#d6d4cd] text-[#141413] border-t border-b border-[#141413]/8 corner-ticks'
                  }`}
                >
                  <span
                    className={
                      isSelected ? 'corner-ticks-light-inner' : 'corner-ticks-inner'
                    }
                  />
                  <div>
                    <div
                      className={`font-mono-tech text-[9px] tracking-[0.14em] uppercase mb-2 ${
                        isSelected ? 'text-[#a09f99]' : 'text-[#686762]'
                      }`}
                    >
                      {stage.kicker}
                    </div>
                    <h3
                      className={`font-serif-editorial text-[26px] sm:text-[31px] leading-[1.12] tracking-[-0.015em] ${
                        isSelected ? 'text-[#f4f3ef]' : 'text-[#141413]'
                      }`}
                    >
                      {stage.title}
                    </h3>
                  </div>

                  <p
                    className={`mt-4 text-[13px] sm:text-[14px] leading-[1.55] max-w-[490px] ${
                      isSelected ? 'text-[#c8c6c0]' : 'text-[#686762]'
                    }`}
                  >
                    {stage.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Dark Textured Canvas with 4-Mode 3D Sphere Visualization matching 00:24-00:29 */}
          <div className="lg:col-span-6">
            <div className="relative w-full h-full min-h-[420px] sm:min-h-[540px] bg-cosmic-obsidian border border-[#141413]/20 flex flex-col justify-between p-6 overflow-hidden">
              {/* Top Stage Metadata Overlay inside Dark Canvas */}
              <div className="relative z-10 flex items-center justify-between text-[#a09f99] font-mono-tech text-[10px] tracking-[0.12em] uppercase">
                <span>{activeStage.kicker}</span>
                <span className="text-[#f4f3ef]">STAGE 0{activeIndex + 1} / 04</span>
              </div>

              {/* Interactive 3D Geodesic / Radial Canvas */}
              <div className="relative flex-1 flex items-center justify-center my-2">
                <canvas
                  ref={canvasRef}
                  data-testid="architecture-sphere-canvas"
                  aria-label={`3D topology visualization for ${activeStage.title}`}
                  className="w-full h-[340px] sm:h-[400px]"
                />
              </div>

              {/* Bottom Input -> Output Specification Overlay */}
              <div className="relative z-10 bg-[#181817]/90 backdrop-blur-xs border border-white/10 p-4 text-[#f4f3ef]">
                <p className="text-[12px] text-[#c8c6c0] leading-relaxed mb-3">
                  {activeStage.technicalDetail}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-white/10 font-mono-tech text-[10px]">
                  <div>
                    <span className="text-[#a09f99] block text-[9px] uppercase">
                      INPUT SIGNAL
                    </span>
                    <span className="text-[#f4f3ef]">{activeStage.inputSignal}</span>
                  </div>
                  <div>
                    <span className="text-[#a09f99] block text-[9px] uppercase">
                      OUTPUT ARTIFACT
                    </span>
                    <span className="text-[#6E9B26]">{activeStage.outputArtifact}</span>
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
