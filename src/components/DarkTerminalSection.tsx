import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ShieldCheck,
  Shield,
  Bot,
  Database,
  Terminal,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  DestinationId,
  evaluateWorkflowContext,
} from '../utils/contextGuardEngine';

interface DarkTerminalSectionProps {
  isStandaloneView?: boolean;
  onJumpToDemo: () => void;
}

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  attribute float aSeed;

  varying float vBrightness;
  varying float vFogDepth;
  varying float vBokeh;

  // Multi-layered organic 3D wave heightfield matching reference topography
  float waveHeight(vec2 p, float t) {
    // Primary rolling swells at oblique angles
    float s1 = sin(p.x * 0.28 + p.y * 0.22 + t * 0.45);
    float s2 = cos(p.x * 0.21 - p.y * 0.34 + t * 0.36);

    // Secondary sculpted ridges (trochoidal crest sharpening)
    float r1 = sin(p.x * 0.52 + p.y * 0.44 - t * 0.31 + s1 * 0.75);
    float crest1 = pow(0.5 + 0.5 * r1, 1.85) * 2.0 - 1.0;

    float r2 = cos(p.x * 0.41 - p.y * 0.58 + t * 0.26 + s2 * 0.65);
    float crest2 = pow(0.5 + 0.5 * r2, 1.75) * 2.0 - 1.0;

    // Tertiary undulating sub-ridges for rich valley/crest contours
    float r3 = sin(p.x * 0.78 - p.y * 0.62 + t * 0.48) * cos(p.x * 0.55 + p.y * 0.74 - t * 0.29);

    return s1 * 1.25 + s2 * 1.05 + crest1 * 0.92 + crest2 * 0.68 + r3 * 0.32;
  }

  void main() {
    vec3 pos = position;

    // Gentle horizontal flow warp + subtle pointer parallax
    vec2 p = pos.xz + uPointer * vec2(0.75, 0.45);
    pos.x += sin(p.y * 0.32 + uTime * 0.3) * 0.18;
    pos.z += cos(p.x * 0.28 + uTime * 0.25) * 0.18;

    float h = waveHeight(p, uTime);

    // Finite-difference surface normal for realistic grazing ridge illumination
    float eps = 0.22;
    float hx = waveHeight(p + vec2(eps, 0.0), uTime);
    float hz = waveHeight(p + vec2(0.0, eps), uTime);
    vec3 normal = normalize(vec3(h - hx, eps, h - hz));

    pos.y = h;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mvPosition.z;

    // Grazing rim angle + directional rim light + crest elevation
    vec3 viewDir = normalize(-mvPosition.xyz);
    vec3 lightDir = normalize(vec3(-0.3, 0.48, 0.82));
    float ndotl = max(dot(normal, lightDir), 0.0);
    float rim = 1.0 - abs(dot(normal, viewDir));
    float crest = smoothstep(-1.6, 2.3, h);

    // High-contrast monochromatic shading: deep dark valleys, soft gray slopes, bright white ridge crests
    float ridgeHighlight = pow(crest, 1.65) * 0.62 + pow(rim, 2.35) * 0.58 + pow(ndotl, 2.2) * 0.34;
    float lum = 0.10 + ridgeHighlight;
    lum *= (0.86 + 0.24 * aSeed);

    vBrightness = clamp(lum, 0.06, 1.0);

    // Shallow depth-of-field bokeh on very near foreground and distant horizon
    float dof = abs(dist - 14.5) / 11.5;
    vBokeh = clamp(dof, 0.0, 1.0);

    // Distance & lateral boundary fade into pure black background
    float farFade = smoothstep(32.0, 12.0, dist);
    float nearFade = smoothstep(3.2, 6.8, dist);
    float sideFade = smoothstep(26.0, 16.5, abs(pos.x));
    vFogDepth = farFade * nearFade * sideFade;

    // Perspective-scaled point size with subtle bokeh expansion
    float pointScale = mix(2.55, 4.1, vBokeh) * (0.9 + 0.2 * aSeed);
    gl_PointSize = clamp(pointScale * uPixelRatio * (14.0 / max(dist, 3.2)), 1.2, 8.5);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying float vBrightness;
  varying float vFogDepth;
  varying float vBokeh;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;

    // Sharp luminous point core in focal plane; soft bokeh disc in foreground/background
    float falloffExp = mix(2.2, 1.15, vBokeh);
    float radial = pow(1.0 - r, falloffExp);

    float alpha = radial * vBrightness * vFogDepth;
    alpha *= mix(1.0, 0.58, vBokeh);

    // Monochromatic palette: soft graphite-gray in troughs -> pure crisp white on ridge crests
    vec3 color = mix(vec3(0.62, 0.63, 0.65), vec3(1.0, 1.0, 1.0), smoothstep(0.28, 0.78, vBrightness));

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.98));
  }
`;

const ParticleWaveBackdrop: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      renderer = null;
    }

    if (renderer) {
      const width = container.clientWidth || 1200;
      const height = container.clientHeight || 760;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      renderer.setClearColor(0x040404, 1);

      const domCanvas = renderer.domElement;
      domCanvas.style.width = '100%';
      domCanvas.style.height = '100%';
      domCanvas.style.display = 'block';
      container.innerHTML = '';
      container.appendChild(domCanvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 65);
      camera.position.set(0, 3.65, 15.8);
      camera.lookAt(0, -0.35, -2.5);

      const isCompact = width < 768;
      const cols = isCompact ? 165 : 270;
      const rows = isCompact ? 115 : 175;
      const total = cols * rows;

      const positions = new Float32Array(total * 3);
      const seeds = new Float32Array(total);

      const spanX = 46;
      const spanZ = 31;

      let seed = 4219;
      const nextRand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      let ptr = 0;
      for (let r = 0; r < rows; r++) {
        const v = r / (rows - 1);
        const z = -18.0 + v * spanZ;
        for (let c = 0; c < cols; c++) {
          const u = c / (cols - 1);
          const x = (u - 0.5) * spanX;

          // Very fine micro-jitter preserves the flowing contour lines along ridges while avoiding digital moiré
          const jx = (nextRand() - 0.5) * 0.028;
          const jz = (nextRand() - 0.5) * 0.028;

          positions[ptr * 3] = x + jx;
          positions[ptr * 3 + 1] = 0;
          positions[ptr * 3 + 2] = z + jz;
          seeds[ptr] = nextRand();
          ptr++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

      const uniforms = {
        uTime: { value: 2.35 },
        uPixelRatio: { value: dpr },
        uPointer: { value: new THREE.Vector2(0, 0) },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 1200;
        const h = container.clientHeight || 760;
        const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(nextDpr);
        renderer.setSize(w, h);
        uniforms.uPixelRatio.value = nextDpr;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      window.addEventListener('resize', handleResize);

      let rafId = 0;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = (now - startTime) * 0.001;
        if (!prefersReducedMotion) {
          uniforms.uTime.value = 2.35 + elapsed * 0.62;
        }

        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.04;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.04;
        uniforms.uPointer.value.set(pointerCurrent.x, pointerCurrent.y);

        camera.position.x = pointerCurrent.x * 0.5;
        camera.position.y = 3.65 - pointerCurrent.y * 0.2;
        camera.lookAt(0, -0.35, -2.5);

        renderer?.render(scene, camera);
        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointermove', handlePointerMove);
        geometry.dispose();
        material.dispose();
        renderer?.dispose();
      };
    }

    // Fallback 2D Canvas 3D-projected particle wave surface if WebGL is unavailable
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let rafId = 0;
    const startTime = performance.now();

    const renderFallback = (now: number) => {
      if (!ctx || !container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 760;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#040404';
      ctx.fillRect(0, 0, w, h);

      const t = prefersReducedMotion ? 2.35 : 2.35 + (now - startTime) * 0.00062;
      const cols = w < 768 ? 100 : 150;
      const rows = w < 768 ? 70 : 100;
      const fov = h * 0.98;

      for (let r = 0; r < rows; r++) {
        const v = r / (rows - 1);
        const z = 5.2 + v * 22.0;
        for (let c = 0; c < cols; c++) {
          const u = c / (cols - 1);
          const x = (u - 0.5) * 38.0;

          const s1 = Math.sin(x * 0.28 + z * 0.22 + t * 0.45);
          const s2 = Math.cos(x * 0.21 - z * 0.34 + t * 0.36);
          const ridge =
            Math.pow(0.5 + 0.5 * Math.sin(x * 0.52 + z * 0.44 - t * 0.31 + s1 * 0.75), 1.85) *
              2 -
            1;
          const y = s1 * 1.2 + s2 * 1.0 + ridge * 0.9 - 2.3;

          const scale = fov / z;
          const sx = w * 0.5 + x * scale;
          const sy = h * 0.52 - y * scale;
          if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

          const crest = Math.max(0, Math.min(1, (y + 3.6) / 3.2));
          const depthFade = Math.sin(v * Math.PI);
          const alpha = Math.min(0.95, (0.12 + Math.pow(crest, 1.65) * 0.82) * depthFade);
          const radius = Math.max(0.7, Math.min(2.4, (12.0 / z) * 1.2));

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFallback);
    };

    rafId = requestAnimationFrame(renderFallback);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
    />
  );
};

export const DarkTerminalSection: React.FC<DarkTerminalSectionProps> = ({
  isStandaloneView = false,
  onJumpToDemo,
}) => {
  const [commandInput, setCommandInput] = useState<string>(
    'Evaluate Project Helios Q4 revenue $48.2M and sk_live_98a7f65c44b2'
  );
  const [cliDest, setCliDest] = useState<DestinationId>('mcp-plugin');
  const [cliTask, setCliTask] = useState<string>(
    'Summarize Q4 revenue multiple for valuation memo'
  );

  const cliResult = evaluateWorkflowContext(commandInput, cliTask, cliDest);

  return (
    <section
      id="closing-cta"
      aria-label="ContextGuard Policy CLI and Closing Call to Action"
      className={`bg-[#040404] text-[#f4f3ef] relative overflow-hidden border-b border-white/10 ${
        isStandaloneView ? 'min-h-[82vh] pt-32 pb-24 flex items-center' : 'py-24 md:py-32'
      }`}
    >
      {/* Scoped Real-Time 3D Particle-Wave Surface Background */}
      <ParticleWaveBackdrop />

      {/* Subtle Top & Bottom Edge Vignette Preserving Full Midground Wave Luminance */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(4,4,4,0.72) 0%, rgba(4,4,4,0.18) 34%, rgba(4,4,4,0.06) 68%, rgba(4,4,4,0.65) 100%)',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20 w-full relative z-10">
        {!isStandaloneView && (
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <div className="font-mono-tech text-[10px] tracking-[0.16em] uppercase text-[#c2c0b8] mb-4">
              03 · PRE-FLIGHT BOUNDARY VERIFICATION
            </div>
            <h2
              className="font-serif-editorial text-[36px] sm:text-[48px] leading-[1.08] tracking-[-0.02em] text-[#f4f3ef] drop-shadow-[0_2px_22px_rgba(0,0,0,0.95)]"
              style={{ textWrap: 'balance' }}
            >
              Relevance to a task is not authorization to share.
            </h2>
            <p className="mt-4 font-serif-editorial text-[18px] sm:text-[20px] leading-[1.5] text-[#cccac2] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              Test how ContextGuard detects sensitive entities, scores task
              necessity, and enforces destination permissions before data leaves
              an AI workflow.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onJumpToDemo}
                className="px-6 py-3 rounded-full bg-[#f4f3ef] text-[#141413] text-[13px] font-medium hover:bg-white transition-colors cursor-pointer shadow-[0_6px_28px_rgba(0,0,0,0.65)]"
              >
                Open Full Interactive Inspector
              </button>
            </div>
          </div>
        )}

        {/* Center Redesigned Warm Ivory/Grey Evaluation Panel over 3D Particle Wave */}
        <div className="relative flex items-center justify-center min-h-[500px] sm:min-h-[600px]">
          {/* Main Panel: Warm Ivory/Grey matching website palette */}
          <div className="relative z-20 w-full max-w-[490px] bg-[#eae8e2] text-[#141413] border border-[#141413]/15 shadow-[0_24px_70px_rgba(0,0,0,0.85)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141413] text-[#f4f3ef] flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#f4f3ef]" />
                </div>
                <div>
                  <div className="font-sans font-bold text-[17px] sm:text-[18px] text-[#141413] tracking-tight leading-tight">
                    ContextGuard
                  </div>
                  <div className="font-mono-tech text-[9.5px] sm:text-[10px] tracking-[0.14em] uppercase text-[#686762] leading-tight mt-1 font-medium">
                    OUTBOUND POLICY EVALUATION
                  </div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-[#141413] text-[#f4f3ef] text-[10px] sm:text-[10.5px] font-mono-tech tracking-[0.12em] uppercase font-semibold shrink-0">
                LIVE TRACE
              </div>
            </div>

            {/* Inner Card: Warm Ivory */}
            <div className="bg-[#f7f6f2] border border-[#141413]/12 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              {/* Inner Sub-Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono-tech text-[10.5px] sm:text-[11px] tracking-[0.14em] uppercase font-semibold text-[#52514d]">
                  <Terminal className="w-3.5 h-3.5 text-[#686762]" />
                  <span>EVALUATE OUTBOUND PROMPT</span>
                </div>
                <span className="font-mono-tech text-[9px] tracking-wider text-[#8c8a84] uppercase">
                  {cliDest.toUpperCase()}
                </span>
              </div>

              {/* Prompt Input Area: Subtly Darker Warm Grey */}
              <div>
                <label htmlFor="cli-prompt-input" className="sr-only">
                  Enter prompt to evaluate in CLI
                </label>
                <div className="flex items-start gap-2 bg-[#dedcd4] border border-[#141413]/12 rounded-xl px-3.5 py-3 shadow-inner">
                  <span className="font-mono-tech text-[12.5px] sm:text-[13px] text-[#686762] font-semibold shrink-0 select-none mt-0.5">
                    &gt; [cg]
                  </span>
                  <input
                    id="cli-prompt-input"
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Type a prompt with sensitive data..."
                    className="w-full bg-transparent text-[#141413] font-mono-tech text-[12.5px] sm:text-[13px] font-medium focus:outline-none placeholder:text-[#8c8a84]"
                  />
                </div>
              </div>

              {/* Destination Selector Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762] font-semibold">
                    DESTINATION
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCommandInput(
                        'Refund $1,420.00 to elena.rostova@acme.io (SSN 419-00-8821)'
                      );
                      setCliTask('Draft billing refund confirmation for customer email');
                    }}
                    className="font-mono-tech text-[10.5px] text-[#b45309] hover:text-[#92400e] hover:underline cursor-pointer font-medium"
                  >
                    Load Billing Trace
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {(
                    [
                      ['mcp-plugin', 'Untrusted MCP', Shield],
                      ['external-llm', 'External LLM', Bot],
                      ['support-crm', 'Scoped CRM', Database],
                    ] as [DestinationId, string, React.ComponentType<{ className?: string }>][]
                  ).map(([id, label, Icon]) => {
                    const isSelected = cliDest === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCliDest(id)}
                        className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer min-h-[68px] sm:min-h-[74px] text-center ${
                          isSelected
                            ? 'bg-[#141413] text-[#f4f3ef] border border-[#141413] shadow-xs'
                            : 'bg-[#f4f3ef] text-[#141413] border border-[#141413]/15 hover:border-[#141413]/35 hover:bg-[#eae8e2]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#f4f3ef]' : 'text-[#686762]'
                          }`}
                        />
                        <span
                          className={`text-[11px] sm:text-[11.5px] font-sans font-medium leading-tight mt-1.5 ${
                            isSelected ? 'text-[#f4f3ef]' : 'text-[#141413]'
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evaluation Output / Result Area with Restrained Amber Accents for Security Warnings */}
              <div
                className={`rounded-xl border p-3.5 sm:p-4 space-y-2.5 shadow-xs transition-colors ${
                  cliResult.overallAction === 'HALT_OUTBOUND'
                    ? 'bg-[#fbf9f4] border-[#d97706]/35'
                    : 'bg-[#f8f9f4] border-[#659a24]/35'
                }`}
              >
                <div className="flex items-center gap-2 font-sans font-bold text-[14px] sm:text-[14.5px] tracking-wide">
                  {cliResult.overallAction === 'HALT_OUTBOUND' ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-[#b45309] shrink-0" />
                      <span className="text-[#b45309]">HALT OUTBOUND</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#55821c] shrink-0" />
                      <span className="text-[#55821c]">
                        {cliResult.overallAction.replace(/_/g, ' ')}
                      </span>
                    </>
                  )}
                </div>

                <div className="font-mono-tech text-[11.5px] sm:text-[12px] text-[#52514d]">
                  Detected: {cliResult.metrics.totalDetected} · Redacted:{' '}
                  {cliResult.metrics.redactedCount} · Blocked:{' '}
                  {cliResult.metrics.blockedCount}
                  {cliResult.metrics.allowedCount > 0 &&
                    ` · Allowed: ${cliResult.metrics.allowedCount}`}
                </div>

                <div className="border-t border-[#141413]/10 pt-2.5">
                  <span className="font-mono-tech text-[9.5px] sm:text-[10px] tracking-[0.14em] uppercase text-[#787670] font-semibold block mb-1">
                    SANITIZED EGRESS PAYLOAD
                  </span>
                  <div className="font-mono-tech text-[12px] sm:text-[12.5px] text-[#141413] leading-relaxed break-words font-medium">
                    {cliResult.sanitizedPrompt}
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
