import React, { useEffect, useRef, memo } from 'react';
import Navbar from './component/Navbar';
import Hero from './component/Hero';
import About from './component/About';
import Skills from './component/Skills';
import Portfolio from './component/Portfolio';
import GithubStats from './component/GithubStats';
import ContactFooter from './component/ContactFooter';
import CarScene from './component/CarScene';
import KineticIntro from './component/KineticIntro';

// ponytail: Minimum viable smooth scroll to fix DOM vs Canvas desync.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const App = memo(function App() {
  const curtainWrapRef = useRef(null);
  const bar1LeftRef = useRef(null);
  const bar1RightRef = useRef(null);
  const bar2LeftRef = useRef(null);
  const bar2RightRef = useRef(null);
  const bar3LeftRef = useRef(null);
  const bar3RightRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (
      !curtainWrapRef.current ||
      !bar1LeftRef.current || !bar1RightRef.current ||
      !bar2LeftRef.current || !bar2RightRef.current ||
      !bar3LeftRef.current || !bar3RightRef.current
    ) return;

    const ctx = gsap.context(() => {
      // ── 1. Smoothly fade IN black background as we approach About ──
      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 65%',
          end: 'top 15%',
          scrub: true,
        }
      })
        .fromTo(curtainWrapRef.current, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0);

      // ── 2. Header & Menu turn white when in About section ──
      ScrollTrigger.create({
        trigger: '#about',
        start: 'top 50%',
        end: 'bottom 60%',
        toggleClass: { targets: '.staggered-menu-wrapper', className: 'theme-white' },
      });

      // ── 3. 3 Horizontal rectangular bars slide open to left & right with stagger (Bottom to Top) below About section ──
      const curtainTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'bottom 82%',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Bar 3 (Bottom) opens first — dinaikkan ke atas sedikit saat membuka
      curtainTl
        .to(bar3LeftRef.current, { xPercent: -100, ease: 'power2.inOut' }, 0)
        .to(bar3RightRef.current, { xPercent: 100, ease: 'power2.inOut' }, 0)
        // Bar 2 (Middle) opens next
        .to(bar2LeftRef.current, { xPercent: -100, ease: 'power2.inOut' }, 0.12)
        .to(bar2RightRef.current, { xPercent: 100, ease: 'power2.inOut' }, 0.12)
        // Bar 1 (Top) opens last
        .to(bar1LeftRef.current, { xPercent: -100, ease: 'power2.inOut' }, 0.24)
        .to(bar1RightRef.current, { xPercent: 100, ease: 'power2.inOut' }, 0.24);

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen font-sans relative bg-[#f8fafc] text-[#0f172a]">
      <CarScene />
      <Navbar />
      <KineticIntro />

      {/* 3 Horizontal rectangular bars overlay — sliding to left & right in staggered sequence */}
      <div
        ref={curtainWrapRef}
        className="fixed inset-0 z-[2] pointer-events-none opacity-0 flex flex-col overflow-hidden"
      >
        {/* Bar 1 (Top Bar) */}
        <div className="flex-1 w-full flex overflow-hidden">
          <div ref={bar1LeftRef} className="w-1/2 h-full bg-black will-change-transform" />
          <div ref={bar1RightRef} className="w-1/2 h-full bg-black will-change-transform" />
        </div>

        {/* Bar 2 (Middle Bar) */}
        <div className="flex-1 w-full flex overflow-hidden">
          <div ref={bar2LeftRef} className="w-1/2 h-full bg-black will-change-transform" />
          <div ref={bar2RightRef} className="w-1/2 h-full bg-black will-change-transform" />
        </div>

        {/* Bar 3 (Bottom Bar) */}
        <div className="flex-1 w-full flex overflow-hidden">
          <div ref={bar3LeftRef} className="w-1/2 h-full bg-black will-change-transform" />
          <div ref={bar3RightRef} className="w-1/2 h-full bg-black will-change-transform" />
        </div>
      </div>

      <main id="main-scroll-container" className="relative z-10 w-full overflow-hidden">
        <Hero />
        <About />
        <Skills />
        <Portfolio />
        <GithubStats />
        <ContactFooter />
      </main>
    </div>
  );
});

export default App;
