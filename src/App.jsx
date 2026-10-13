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

import PixelBurnCurtain from './component/PixelBurnCurtain';

// ponytail: Minimum viable smooth scroll to fix DOM vs Canvas desync.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const App = memo(function App() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // If mobile, directly go to About section on load
    if (isMobile) {
      setTimeout(() => {
        const aboutEl = document.getElementById('about');
        if (aboutEl) {
          aboutEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [isMobile]);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header & Menu turn white when in About section
      ScrollTrigger.create({
        trigger: '#about',
        start: 'top 50%',
        end: 'bottom 60%',
        toggleClass: { targets: '.staggered-menu-wrapper', className: 'theme-white' },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen font-sans relative bg-[#f8fafc] text-[#0f172a]">
      {!isMobile && <CarScene />}
      <Navbar />
      <KineticIntro />

      {/* Burn pixel overlay: Transisi tirai hitam ke background putih section skills */}
      <PixelBurnCurtain />

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
