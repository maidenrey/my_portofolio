import React, { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * PixelBurnCurtain:
 * Menggantikan efek tirai hitam konvensional dengan efek Burn Pixel dari bawah ke atas.
 * Saat scroll melewati section #about menuju section #skills:
 * - Tirai hitam terbakar (burn away) menjadi pixel-pixel retro/cyberpunk dari bawah ke atas.
 * - Ujung pembakaran (burn frontier) menyala dengan gradasi api:
 *   putih berpijar -> kuning emas -> oranye api menyala -> merah bara -> abu/transparan.
 * - Partikel bara api (pixel ember sparks) melayang ke atas dengan dinamis.
 * - Transisi di-drive oleh GSAP ScrollTrigger yang di-scrub halus bersamaan dengan Lenis smooth scroll.
 */
const PixelBurnCurtain = memo(function PixelBurnCurtain() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const isBurningRef = useRef(false);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let pixelSize = width <= 768 ? 14 : 18;
    let cols = Math.ceil(width / pixelSize);
    let rows = Math.ceil(height / pixelSize);

    // Precalculated organic flame wave per column (harmonic frequencies)
    let colOffsets = new Float32Array(cols);
    // Deterministic pseudo-random jitter per cell for organic pixel disintegration
    let cellJitters = new Float32Array(cols * rows);

    const initGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      pixelSize = width <= 768 ? 14 : 18;
      cols = Math.ceil(width / pixelSize);
      rows = Math.ceil(height / pixelSize);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      colOffsets = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        // Multi-harmonic sine waves to give flame tongues natural peaks and valleys
        const w1 = Math.sin(c * 0.16);
        const w2 = Math.sin(c * 0.38 + 1.2) * 0.55;
        const w3 = Math.cos(c * 0.07 + 0.6) * 0.45;
        colOffsets[c] = (w1 + w2 + w3) * 0.045; // amplitude offset
      }

      cellJitters = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seed = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          // Normalized between -0.06 and +0.06
          cellJitters[r * cols + c] = (seed - Math.floor(seed) - 0.5) * 0.12;
        }
      }
    };

    initGrid();

    // ─── Spark Particle Pool ──────────────────────────────────────────
    const sparks = [];
    const MAX_SPARKS = 36;
    const SPARK_COLORS = ['#ffffff', '#fff385', '#ff9800', '#ff5722', '#dc2626'];

    const spawnSpark = (yApprox) => {
      return {
        x: Math.random() * width,
        y: yApprox + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(1.8 + Math.random() * 2.8), // float upwards
        size: Math.random() > 0.6 ? (width <= 768 ? 3 : 4) : 2,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.04,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      };
    };

    // Color ramp for burning pixel stage
    const getBurnStyle = (t) => {
      // t ranges from 0.0 (just caught fire) to 1.0 (fully burned to ash)
      if (t < 0.12) {
        // Stage 1: White-hot incandescent ignition flash
        return {
          color: '#ffffff',
          scale: 1.06,
          alpha: 1.0,
        };
      } else if (t < 0.32) {
        // Stage 2: Blazing bright lemon & amber gold
        return {
          color: t < 0.22 ? '#fff176' : '#fbc02d',
          scale: 1.0,
          alpha: 1.0,
        };
      } else if (t < 0.60) {
        // Stage 3: Vivid electric fire orange & tangerine
        return {
          color: t < 0.46 ? '#ff9100' : '#f97316',
          scale: 0.9,
          alpha: 1.0,
        };
      } else if (t < 0.82) {
        // Stage 4: Fiery crimson & burning red ember
        return {
          color: t < 0.72 ? '#ef4444' : '#dc2626',
          scale: 0.72,
          alpha: 0.95,
        };
      } else {
        // Stage 5: Charred ash / disintegrating ruby spark
        const local = (t - 0.82) / 0.18;
        return {
          color: local < 0.5 ? '#991b1b' : '#7f1d1d',
          scale: Math.max(0.15, 0.55 * (1.0 - local)),
          alpha: Math.max(0, 1.0 - local),
        };
      }
    };

    // ─── Render Canvas Frame ──────────────────────────────────────────
    const draw = () => {
      const p = progressRef.current;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. If not started burning yet (p <= 0), draw full solid black
      if (p <= 0.001) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return;
      }

      // 2. If completely burned (p >= 1), nothing is drawn (transparent canvas)
      if (p >= 0.999) {
        ctx.restore();
        return;
      }

      // 3. Pixel burn calculations (from bottom to top)
      const burnSpan = 0.15; // duration of burn per cell
      let minBurningY = height;
      let activeBurningCount = 0;

      for (let r = 0; r < rows; r++) {
        // rowFromBottom = 0 at the bottom (burns first), rows-1 at top (burns last)
        const rowFromBottom = rows - 1 - r;
        const normY = rowFromBottom / rows; // 0.0 at bottom -> 1.0 at top
        const y = r * pixelSize;

        for (let c = 0; c < cols; c++) {
          const x = c * pixelSize;
          const ignition = normY * 0.82 + colOffsets[c] + cellJitters[r * cols + c];

          if (p < ignition) {
            // UNBURNED: Solid black pixel with subtle subpixel overlap for crisp rendering on HiDPI/fractional DPR screens
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, pixelSize + 0.5, pixelSize + 0.5);
          } else if (p < ignition + burnSpan) {
            // ACTIVELY BURNING:
            const t = (p - ignition) / burnSpan;
            const style = getBurnStyle(t);

            const drawnSize = pixelSize * style.scale;
            const offset = (pixelSize - drawnSize) / 2;

            ctx.globalAlpha = style.alpha;
            ctx.fillStyle = style.color;
            ctx.fillRect(x + offset, y + offset, drawnSize, drawnSize);

            if (y < minBurningY) {
              minBurningY = y;
            }
            activeBurningCount++;
          }
          // If p >= ignition + burnSpan: BURNED AWAY -> Transparent (do not draw)
        }
      }

      ctx.globalAlpha = 1.0;

      // 4. Update and draw floating pixel ember sparks
      if (activeBurningCount > 0 && p > 0.02 && p < 0.98) {
        // Spawn sparks near current active burn line
        if (sparks.length < MAX_SPARKS && Math.random() < 0.7) {
          sparks.push(spawnSpark(minBurningY + Math.random() * 80));
        }
      }

      // Render sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0 || s.y < -20) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        // Square pixel sparks for consistent retro/digital aesthetic
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      ctx.restore();
    };

    // Animation frame loop manager
    const scheduleNextFrame = () => {
      draw();
      const p = progressRef.current;
      // Continue loop if currently burning or sparks exist
      if (isBurningRef.current || (p > 0.001 && p < 0.999) || sparks.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(scheduleNextFrame);
      } else {
        animFrameIdRef.current = null;
      }
    };

    const triggerDraw = () => {
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(scheduleNextFrame);
      }
    };

    // Initial render
    draw();

    // ─── GSAP ScrollTrigger Setup ──────────────────────────────────────
    const ctxGsap = gsap.context(() => {
      // 1. Smoothly fade IN black background as we approach About
      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 65%',
          end: 'top 15%',
          scrub: true,
          onUpdate: (self) => {
            if (self.progress === 0 && progressRef.current <= 0) {
              // Reset if scrolled back to top
              draw();
            }
          }
        }
      })
      .fromTo(container, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0);

      // 2. Pixel Burn effect from bottom to top as we exit About towards Skills
      const progressProxy = { val: 0 };

      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'bottom 82%',
          end: 'bottom top',
          scrub: 1.2, // Smooth damping scrub synchronized with Lenis
          onToggle: (self) => {
            isBurningRef.current = self.isActive;
            if (self.isActive) triggerDraw();
          },
          onUpdate: (self) => {
            progressRef.current = progressProxy.val;
            isBurningRef.current = self.isActive;
            triggerDraw();
          }
        }
      })
      .to(progressProxy, {
        val: 1,
        ease: 'none',
      });
    });

    // ─── Window Resize Listener ───────────────────────────────────────
    const handleResize = () => {
      initGrid();
      draw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      ctxGsap.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[2] pointer-events-none opacity-0 overflow-hidden"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
});

export default PixelBurnCurtain;
