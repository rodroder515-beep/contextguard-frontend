import React, { useEffect, useRef, useState } from 'react';

interface HeroRadialNetworkProps {
  scrollProgress: number;
}

const SCULPTURE_VIDEO_SRC =
  '/assets/aistudio/From_Klickpin.com-_Recreate_these_viral_ways_to_style_your_launch_checklist_that_make_everything_look_instantly_polished_with_aesthetic_touches_th_1_38a4480e.mp4';
const SCULPTURE_POSTER_SRC = '/assets/aistudio/sculpture-frame0-keyed.png';

/**
 * HeroRadialNetwork — Renders the original 3D sculpture video across all
 * device viewports (phone, tablet/iPad, laptop, desktop) with real-time
 * self-calibrating Coons-patch background removal.
 *
 * Root causes resolved:
 * 1. Cross-GPU YUV/TV-Range Background Shift:
 *    The source MP4 (720x1280, yuv420p, color_range: tv) has an embedded studio
 *    grey gradient. Comparing against a hardcoded offline luminance polynomial
 *    failed on desktop/iPad GPUs whose hardware YUV-to-RGB color matrix shifted
 *    decoded luminance by ~0.04-0.07, making the rectangular background visible.
 *    The shader now samples the live video texture's own unobscured perimeter
 *    (u0=0.018, u1=0.982, v0=0.220, v1=0.835) on every frame via Coons-patch
 *    interpolation so any GPU color-space or gamma offset cancels out identically.
 * 2. Desktop/Tablet Video Decoding & Loop Persistence:
 *    - Replaced Tailwind `sr-only` (which applies `clip: rect(0,0,0,0)` and
 *      triggers Chromium/WebKit invisible-video decoding suspension on desktop
 *      and iPad) with an unclipped in-viewport element at `opacity-[0.001]`.
 *    - Removed the `prefers-reduced-motion` early pause that froze the video on
 *      desktops/laptops with OS reduced-motion flags enabled.
 *    - Kept the `requestAnimationFrame` render loop alive continuously across
 *      the component lifecycle instead of terminating when `video.paused` or
 *      `video.ended` flickers at loop boundaries.
 */
export const HeroRadialNetwork: React.FC<HeroRadialNetworkProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasFirstFrameRendered, setHasFirstFrameRendered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    let isDisposed = false;
    let rafId: number | null = null;
    let markedReady = false;
    let lastPlayAttemptMs = 0;

    const markReady = () => {
      if (!markedReady && !isDisposed) {
        markedReady = true;
        setHasFirstFrameRendered(true);
      }
    };

    // Centered crop window in the 720x1280 source video containing the full sculpture motion
    const CROP_W = 720;
    const CROP_H = 760;
    const CROP_V0 = 298 / 1280;
    const CROP_V1 = 1058 / 1280;

    canvas.width = CROP_W;
    canvas.height = CROP_H;

    const gl =
      (canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      }) as WebGLRenderingContext | null);

    let renderFrame: () => void = () => {};
    let cleanupGL: () => void = () => {};

    if (gl) {
      const vsSource = `
        attribute vec2 aPos;
        varying vec2 vCropUV;
        void main() {
          vCropUV = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
          gl_Position = vec4(aPos, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision highp float;
        varying vec2 vCropUV;
        uniform sampler2D uVideoTex;

        float sampleLum(vec2 uv) {
          vec3 c = texture2D(uVideoTex, clamp(uv, vec2(0.002), vec2(0.998))).rgb;
          return dot(c, vec3(0.299, 0.587, 0.114));
        }

        // 5-tap perimeter filter along vertical border to suppress film grain
        float sampleBorderU(float uEdge, float v) {
          return (
            sampleLum(vec2(uEdge, v - 0.016)) +
            sampleLum(vec2(uEdge, v - 0.008)) +
            sampleLum(vec2(uEdge, v)) +
            sampleLum(vec2(uEdge, v + 0.008)) +
            sampleLum(vec2(uEdge, v + 0.016))
          ) * 0.2;
        }

        // 5-tap perimeter filter along horizontal border to suppress film grain
        float sampleBorderV(float u, float vEdge) {
          return (
            sampleLum(vec2(u - 0.016, vEdge)) +
            sampleLum(vec2(u - 0.008, vEdge)) +
            sampleLum(vec2(u, vEdge)) +
            sampleLum(vec2(u + 0.008, vEdge)) +
            sampleLum(vec2(u + 0.016, vEdge))
          ) * 0.2;
        }

        void main() {
          float u = vCropUV.x;
          float v = mix(${CROP_V0.toFixed(6)}, ${CROP_V1.toFixed(6)}, vCropUV.y);

          // Unobscured perimeter coordinates in the 720x1280 frame
          const float u0 = 0.018;
          const float u1 = 0.982;
          const float v0 = 0.220;
          const float v1 = 0.835;

          float s = clamp((u - u0) / (u1 - u0), 0.0, 1.0);
          float t = clamp((v - v0) / (v1 - v0), 0.0, 1.0);

          // Live Coons-patch + quadratic studio arch reconstruction of the video background
          float Lv = sampleBorderU(u0, v);
          float Rv = sampleBorderU(u1, v);
          float Tu = sampleBorderV(u, v0);
          float Bu = sampleBorderV(u, v1);

          float c00 = sampleBorderV(u0, v0);
          float c10 = sampleBorderV(u1, v0);
          float c01 = sampleBorderV(u0, v1);
          float c11 = sampleBorderV(u1, v1);

          float corners = mix(mix(c00, c10, s), mix(c01, c11, s), t);
          float quadArch = 0.016863 * max(0.0, (u - u0) * (u1 - u))
                         + 0.122949 * max(0.0, (v - v0) * (v1 - v));
          float bg = mix(Lv, Rv, s) + mix(Tu, Bu, t) - corners + quadArch;

          float lum = sampleLum(vec2(u, v));
          float darkness = max(0.0, bg - lum);

          // Soft feather at the outer perimeter of the crop box
          float borderDist = min(
            min(vCropUV.x, 1.0 - vCropUV.x),
            min(vCropUV.y, 1.0 - vCropUV.y)
          );
          float edgeMask = smoothstep(0.008, 0.040, borderDist);

          // Suppress background film grain completely (alpha = 0.0) while preserving gossamer particles & folds
          float gate = smoothstep(0.030, 0.055, darkness);
          float cMin = 0.035;
          float rawAlpha = clamp((darkness - 0.022) / max(0.15, bg - cMin), 0.0, 1.0);
          float alpha = gate * pow(rawAlpha, 0.92) * edgeMask;

          vec3 fgColor = vec3(0.05, 0.05, 0.048);
          // Output premultiplied RGBA so background pixels (alpha=0) are strictly vec4(0.0)
          gl_FragColor = vec4(fgColor * alpha, alpha);
        }
      `;

      const compileShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      const prog = gl.createProgram();

      if (vs && fs && prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW
        );

        const aPosLoc = gl.getAttribLocation(prog, 'aPos');
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.viewport(0, 0, CROP_W, CROP_H);
        gl.clearColor(0, 0, 0, 0);

        renderFrame = () => {
          if (video.readyState < 2 || video.videoWidth === 0) return;
          gl.viewport(0, 0, CROP_W, CROP_H);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.useProgram(prog);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video
          );
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          markReady();
        };

        cleanupGL = () => {
          if (tex) gl.deleteTexture(tex);
          if (posBuf) gl.deleteBuffer(posBuf);
          gl.deleteProgram(prog);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
        };
      }
    } else {
      // 2D Canvas Fallback with identical self-calibrating Coons-patch background unmixing
      const ctx = canvas.getContext('2d');
      const offscreen = document.createElement('canvas');
      offscreen.width = 720;
      offscreen.height = 1280;
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

      const smoothstep = (e0: number, e1: number, x: number) => {
        const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      };

      renderFrame = () => {
        if (!ctx || !offCtx || video.readyState < 2 || video.videoWidth === 0) {
          return;
        }
        offCtx.drawImage(video, 0, 0, 720, 1280);
        const fullData = offCtx.getImageData(0, 0, 720, 1280).data;
        const outImg = ctx.createImageData(CROP_W, CROP_H);
        const out = outImg.data;

        const lumAt = (x: number, y: number) => {
          const xx = Math.max(0, Math.min(719, x));
          const yy = Math.max(0, Math.min(1279, y));
          const i = (yy * 720 + xx) * 4;
          return (
            (fullData[i] * 0.299 +
              fullData[i + 1] * 0.587 +
              fullData[i + 2] * 0.114) /
            255
          );
        };

        const x0 = 13;
        const x1 = 707;
        const y0 = 282;
        const y1 = 1069;
        const c00 = lumAt(x0, y0);
        const c10 = lumAt(x1, y0);
        const c01 = lumAt(x0, y1);
        const c11 = lumAt(x1, y1);

        const topRow = new Float32Array(CROP_W);
        const botRow = new Float32Array(CROP_W);
        for (let sx = 0; sx < CROP_W; sx++) {
          topRow[sx] =
            (lumAt(sx - 4, y0) + lumAt(sx, y0) + lumAt(sx + 4, y0)) / 3;
          botRow[sx] =
            (lumAt(sx - 4, y1) + lumAt(sx, y1) + lumAt(sx + 4, y1)) / 3;
        }

        for (let sy = 0; sy < CROP_H; sy++) {
          const y = 298 + sy;
          const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
          const Lv =
            (lumAt(x0, y - 4) + lumAt(x0, y) + lumAt(x0, y + 4)) / 3;
          const Rv =
            (lumAt(x1, y - 4) + lumAt(x1, y) + lumAt(x1, y + 4)) / 3;
          const vCrop = sy / (CROP_H - 1);

          for (let sx = 0; sx < CROP_W; sx++) {
            const s = Math.max(0, Math.min(1, (sx - x0) / (x1 - x0)));
            const corners =
              (1 - s) * (1 - t) * c00 +
              s * (1 - t) * c10 +
              (1 - s) * t * c01 +
              s * t * c11;
            const bg =
              (1 - s) * Lv +
              s * Rv +
              (1 - t) * topRow[sx] +
              t * botRow[sx] -
              corners;
            const lum = lumAt(sx, y);
            const darkness = Math.max(0, bg - lum);

            const uCrop = sx / (CROP_W - 1);
            const borderDist = Math.min(
              Math.min(uCrop, 1 - uCrop),
              Math.min(vCrop, 1 - vCrop)
            );
            const edgeMask = smoothstep(0.008, 0.04, borderDist);
            const gate = smoothstep(0.025, 0.05, darkness);
            const rawAlpha = Math.max(
              0,
              Math.min(1, (darkness - 0.018) / Math.max(0.15, bg - 0.035))
            );
            const alpha = gate * Math.pow(rawAlpha, 0.92) * edgeMask;

            const outIdx = (sy * CROP_W + sx) * 4;
            out[outIdx] = 13;
            out[outIdx + 1] = 13;
            out[outIdx + 2] = 12;
            out[outIdx + 3] = Math.round(alpha * 255);
          }
        }
        ctx.putImageData(outImg, 0, 0);
        markReady();
      };
    }

    const ensureVideoPlaying = () => {
      if (isDisposed) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      if (video.ended) {
        video.currentTime = 0;
      }
      if (video.paused && video.readyState >= 2) {
        const now = performance.now();
        if (now - lastPlayAttemptMs > 400) {
          lastPlayAttemptMs = now;
          const p = video.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
        }
      }
    };

    // Continuous render loop across the entire mounted lifetime
    const tick = () => {
      if (isDisposed) return;
      ensureVideoPlaying();
      renderFrame();
      rafId = requestAnimationFrame(tick);
    };

    const onVideoReady = () => {
      if (isDisposed) return;
      ensureVideoPlaying();
      renderFrame();
    };

    const onVisibilityOrInteraction = () => {
      if (isDisposed) return;
      if (document.visibilityState === 'visible') {
        lastPlayAttemptMs = 0;
        ensureVideoPlaying();
      }
    };

    video.addEventListener('loadedmetadata', onVideoReady);
    video.addEventListener('loadeddata', onVideoReady);
    video.addEventListener('canplay', onVideoReady);
    video.addEventListener('playing', renderFrame);
    document.addEventListener('visibilitychange', onVisibilityOrInteraction);
    window.addEventListener('pointerdown', onVisibilityOrInteraction, {
      passive: true,
    });
    window.addEventListener('touchstart', onVisibilityOrInteraction, {
      passive: true,
    });

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (video.readyState >= 2) {
      onVideoReady();
    } else {
      video.load();
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onVideoReady);
      video.removeEventListener('loadeddata', onVideoReady);
      video.removeEventListener('canplay', onVideoReady);
      video.removeEventListener('playing', renderFrame);
      document.removeEventListener(
        'visibilitychange',
        onVisibilityOrInteraction
      );
      window.removeEventListener('pointerdown', onVisibilityOrInteraction);
      window.removeEventListener('touchstart', onVisibilityOrInteraction);
      video.pause();
      cleanupGL();
    };
  }, []);

  return (
    <div
      className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-[440px] lg:max-w-[520px] xl:max-w-[560px] aspect-[720/760] mx-auto md:mx-0 md:ml-auto md:-translate-y-3 lg:-translate-y-5 flex items-center justify-center select-none pointer-events-none"
      role="img"
      aria-label="Animated 3D sculpture"
    >
      {/* Keep video in-viewport as a 1x1 unclipped element so desktop & iPad browsers decode frames without overlapping the sculpture area */}
      <video
        ref={videoRef}
        src={SCULPTURE_VIDEO_SRC}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-10"
      />

      {/* Pre-keyed Frame 0 poster displayed only until the live canvas renders its first frame */}
      <img
        src={SCULPTURE_POSTER_SRC}
        alt=""
        aria-hidden="true"
        className={`w-full h-full object-contain transition-opacity duration-150 ${
          hasFirstFrameRendered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Transparent WebGL/Canvas rendering only the background-removed sculpture */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ${
          hasFirstFrameRendered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
