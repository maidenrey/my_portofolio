import React, { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * PixelBurnCurtain:
 * Efek burn pixel hitam-putih dari bawah ke atas di batas About → Skills.
 * - Canvas hanya ada di zona batas antara kedua section (bukan full viewport).
 * - Pixel berwarna hitam saja: saat terbakar ukuran mengecil + memudar hingga transparan.
 * - Di-drive oleh GSAP ScrollTrigger scrub smooth bersama Lenis.
 */
const PixelBurnCurtain = memo(function PixelBurnCurtain() {
  const wrapRef   = useRef(null);  // outer fixed wrapper (opacity controlled by GSAP)
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef      = useRef(null);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── Grid config ──────────────────────────────────────────────────────
    let W, H, dpr, pixelSize, cols, rows;
    let colOffsets, cellJitters;

    const initGrid = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      pixelSize = W <= 768 ? 12 : 16;
      cols = Math.ceil(W / pixelSize);
      rows = Math.ceil(H / pixelSize);

      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';

      // Per-column harmonic offsets → jagged burn frontier
      colOffsets = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        const w1 =  Math.sin(c * 0.17)        * 1.0;
        const w2 =  Math.sin(c * 0.41 + 1.3)  * 0.55;
        const w3 =  Math.cos(c * 0.08 + 0.7)  * 0.40;
        colOffsets[c] = (w1 + w2 + w3) * 0.045;
      }

      // Per-cell deterministic jitter → organic disintegration
      cellJitters = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          cellJitters[r * cols + c] = (s - Math.floor(s) - 0.5) * 0.10;
        }
      }
    };

    initGrid();

    // ── Draw ─────────────────────────────────────────────────────────────
    /**
     * burnSpan = porsi progress di mana satu cell sedang "terbakar"
     * Selama ignition ≤ p < ignition + burnSpan: pixel mengecil & memudar
     * Setelah itu: pixel lenyap (transparan)
     * Sebelum itu: pixel hitam penuh
     */
    const BURN_SPAN = 0.12;

    const draw = () => {
      const p = progressRef.current;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (p <= 0.0005) {
        // Belum mulai → hitam penuh
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        return;
      }

      if (p >= 0.9995) {
        // Selesai → transparan (tidak gambar apa-apa)
        ctx.restore();
        return;
      }

      // Pixel burn dari bawah ke atas
      for (let r = 0; r < rows; r++) {
        const rowFromBottom = rows - 1 - r;       // 0=bawah, rows-1=atas
        const normY = rowFromBottom / (rows - 1);  // 0.0 bawah → 1.0 atas
        const y = r * pixelSize;

        for (let c = 0; c < cols; c++) {
          const x = c * pixelSize;
          // ignition: baris bawah ignite lebih dahulu (normY kecil → ignition kecil)
          const ignition = normY * (1.0 - BURN_SPAN) + colOffsets[c] + cellJitters[r * cols + c];

          if (p < ignition) {
            // BELUM TERBAKAR: hitam solid
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, pixelSize + 0.5, pixelSize + 0.5);
          } else if (p < ignition + BURN_SPAN) {
            // TERBAKAR: pixel hitam mengecil + memudar → efek disintegrate
            const t = (p - ignition) / BURN_SPAN;   // 0 → 1
            const scale  = 1.0 - t;                  // mengecil dari penuh jadi 0
            const alpha  = Math.max(0, 1.0 - t);     // memudar
            if (scale < 0.02) continue;              // sudah sangat kecil → skip

            const drawn = pixelSize * scale;
            const off   = (pixelSize - drawn) / 2;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#000';
            ctx.fillRect(x + off, y + off, drawn, drawn);
          }
          // SUDAH TERBAKAR → tidak digambar (transparan)
        }
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // ── RAF Loop ──────────────────────────────────────────────────────────
    const loop = () => {
      draw();
      const p = progressRef.current;
      if (p > 0.0005 && p < 0.9995) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = null;
        // Gambar sekali lagi untuk state final bersih
        draw();
      }
    };

    const scheduleDraw = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    draw(); // render awal

    // ── GSAP ScrollTrigger ─────────────────────────────────────────────────
    const ctxGsap = gsap.context(() => {
      // ── 1. FADE IN HITAM: Saat top #about masuk viewport (Hero → About)
      //    Mengembalikan transisi background putih → hitam yang asli
      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 65%',   // mulai fade saat top About di 65% viewport (sama seperti asli)
          end:   'top 15%',   // hitam penuh saat top About di 15% viewport (sama seperti asli)
          scrub: true,
        }
      }).fromTo(wrap, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' });

      // ── 2. BURN: Pixel burn dari bawah ke atas saat scroll keluar bottom About
      const proxy = { val: 0 };
      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'bottom 82%',   // sama seperti trigger curtain asli
          end:   'bottom top',   // sampai bottom About keluar viewport
          scrub: 1.0,
          onUpdate: () => {
            progressRef.current = proxy.val;
            scheduleDraw();
          },
        }
      }).to(proxy, { val: 1, ease: 'none' });

      // ── 3. FADE OUT: Hilangkan layer saat sudah masuk section Skills
      gsap.timeline({
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 40%',
          end:   'top 10%',
          scrub: true,
        }
      }).fromTo(wrap, { opacity: 1 }, { opacity: 0, ease: 'none' });
    });

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => { initGrid(); draw(); };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctxGsap.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[2] pointer-events-none opacity-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
});

export default PixelBurnCurtain;
