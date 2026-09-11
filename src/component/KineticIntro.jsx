import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

gsap.registerPlugin(ScrollTrigger);

export default function KineticIntro() {
  const { language } = useLanguage();
  const sentences = getTranslation(language, 'kinetic');

  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const sentenceRefs = useRef([]);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── First sentence: appear immediately on page load ── */
      const firstRef = sentenceRefs.current[0];
      if (firstRef) {
        const firstWords = firstRef.querySelectorAll('.word');
        // Reveal word-by-word with a quick entrance animation (not scroll-driven)
        gsap.fromTo(
          firstWords,
          { opacity: 0, y: 30, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.12,
            ease: 'power2.out',
            duration: 0.6,
            delay: 0.3,
          }
        );
      }

      /* ── Scroll hint: fade in after first sentence appears ── */
      if (scrollHintRef.current) {
        gsap.fromTo(
          scrollHintRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.0 }
        );
        // Continuous subtle bounce loop
        gsap.to(scrollHintRef.current, {
          y: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          duration: 1.1,
          delay: 1.6,
        });
      }

      /* ── ScrollTrigger timeline ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        }
      });

      /* Step 1 – Fade OUT first sentence + scroll hint on scroll */
      if (firstRef) {
        const firstWords = firstRef.querySelectorAll('.word');
        tl.to(
          firstWords,
          { opacity: 0, y: -25, filter: 'blur(6px)', stagger: 0.04, ease: 'power2.in', duration: 0.5 }
        );
      }
      if (scrollHintRef.current) {
        tl.to(
          scrollHintRef.current,
          { opacity: 0, duration: 0.2, ease: 'power2.in' },
          0
        );
      }

      /* Step 2 – Reveal remaining sentences one by one via scroll without dead scroll space */
      sentenceRefs.current.forEach((ref, idx) => {
        if (!ref || idx === 0) return;
        const words = ref.querySelectorAll('.word');

        // Reveal smoothly right after previous sentence
        tl.fromTo(
          words,
          { opacity: 0, y: 25, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.06, ease: 'power2.out', duration: 0.6 },
          '-=0.15'
        )
        // Fade out
        .to(
          words,
          { opacity: 0, y: -25, filter: 'blur(6px)', stagger: 0.04, ease: 'power2.in', duration: 0.5 },
          '+=0.1'
        );
      });

      /* Step 3 – Fade out the white background overlay to reveal home page */
      tl.to(bgRef.current, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.inOut',
      }, '-=0.15');

      // Refresh ScrollTrigger so main-scroll-container triggers calculate accurate start offset
      setTimeout(() => ScrollTrigger.refresh(), 100);

    }, containerRef);

    return () => ctx.revert();
  }, [sentences]);

  return (
    <section ref={containerRef} className="w-full h-[180vh] bg-transparent pointer-events-none">
      <div 
        ref={bgRef} 
        className="fixed top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden bg-white px-6 pointer-events-auto z-[60]"
      >
        {sentences.map((sentence, sIdx) => {
          const words = sentence.split(' ');
          return (
            <div 
              key={sIdx}
              ref={el => sentenceRefs.current[sIdx] = el}
              className="absolute max-w-6xl text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-light tracking-wide text-gray-900 flex flex-wrap justify-center gap-x-2 sm:gap-x-3 gap-y-2 leading-relaxed"
            >
              {words.map((word, wIdx) => (
                <span key={wIdx} className="word inline-block opacity-0 will-change-[opacity,filter,transform]">
                  {word}
                </span>
              ))}
            </div>
          );
        })}

        {/* Smaller, elegant scroll hint at the bottom */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-0 pointer-events-none"
        >
          <span className="text-[10px] sm:text-xs font-normal tracking-[0.25em] text-gray-400 uppercase">
            Lets scroll to see
          </span>
          {/* Subtle Chevron arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
