import React, { useRef, useEffect, memo, useMemo } from 'react';
import styled from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import skillsData from '../content/skills.json';
import {
  Code2, FileCode, Palette, Layout, Box, Cpu, Sparkles,
  Zap, GitBranch, Layers, Globe, Terminal, Server, Atom
} from 'lucide-react';
import { FigmaIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  Code2, FileCode, Palette, Layout, Box, Cpu, Sparkles,
  Zap, GitBranch, Layers, Globe, Terminal, Server, Atom,
  Figma: FigmaIcon
};

const SkillCard = styled.div`
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 1.15rem;
  padding: 1.15rem 1.25rem;
  width: 260px;
  flex-shrink: 0;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 6px 20px -4px rgba(139, 92, 246, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #9333ea;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: rgba(147, 51, 234, 0.7);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 16px 30px -8px rgba(139, 92, 246, 0.3), 0 0 20px rgba(168, 85, 247, 0.25);

    &::before {
      opacity: 1;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 0.65rem;

  & > div {
    height: 100%;
    width: ${props => props.$level}%;
    background: #9333ea;
    border-radius: 9999px;
    box-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
  }
`;

function flattenSkills(data) {
  const items = [];
  data.forEach((group) => {
    group.skills.forEach((skill) => {
      items.push({ ...skill, category: group.category });
    });
  });
  return items;
}

const Skills = memo(function Skills() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, `skills.${key}`);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const activeThreadRef = useRef(null);

  const allSkills = useMemo(() => flattenSkills(skillsData), []);

  // Total width of horizontal line across all stations
  // 260px card + 48px gap = 308px pitch
  const stationPitch = 308;
  const threadWidth = allSkills.length * stationPitch + 800;

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const getScrollAmount = () => {
          const trackWidth = trackRef.current.scrollWidth;
          return -(trackWidth - window.innerWidth + 160);
        };

        const totalScrollDist = () => Math.abs(getScrollAmount()) * 1.35;

        // Setup progressive straight purple thread draw
        if (activeThreadRef.current) {
          const pathLength = threadWidth;
          gsap.set(activeThreadRef.current, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: () => `+=${totalScrollDist()}`,
              pin: true,
              scrub: 1.5,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            }
          });

          // Slide track horizontally
          tl.to(trackRef.current, {
            x: getScrollAmount,
            ease: 'none',
          }, 0);

          // Fill straight purple thread progressively
          tl.to(activeThreadRef.current, {
            strokeDashoffset: 0,
            ease: 'none',
          }, 0);

          // Staggered node illumination: Every point lights up purple when scroll reaches it
          gsap.utils.toArray('.station-node-container').forEach((container) => {
            const dot = container.querySelector('.station-node-dot');
            const ping = container.querySelector('.station-node-ping');
            const card = container.querySelector('.skill-card-inner');

            const nodeTl = gsap.timeline({
              scrollTrigger: {
                trigger: container,
                containerAnimation: tl,
                start: 'center 85%',
                end: 'center 50%',
                scrub: true,
              }
            });

            if (dot) {
              nodeTl.fromTo(
                dot,
                {
                  backgroundColor: '#cbd5e1',
                  borderColor: '#94a3b8',
                  boxShadow: '0 0 0px rgba(168, 85, 247, 0)',
                  scale: 0.85,
                  opacity: 0.35,
                },
                {
                  backgroundColor: '#9333ea', // Glow bright purple
                  borderColor: '#ffffff',
                  boxShadow: '0 0 22px rgba(168, 85, 247, 1), 0 0 45px rgba(147, 51, 234, 0.75)',
                  scale: 1.3,
                  opacity: 1,
                  ease: 'power2.out',
                },
                0
              );
            }

            if (ping) {
              nodeTl.fromTo(
                ping,
                { opacity: 0, scale: 0.6 },
                { opacity: 0.8, scale: 1.35, ease: 'power2.out' },
                0
              );
            }

            if (card) {
              nodeTl.fromTo(
                card,
                { opacity: 0.35, y: 16, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, ease: 'power2.out' },
                0
              );
            }
          });
        }
      });

      mm.add('(max-width: 767px)', () => {
        gsap.set(trackRef.current, { clearProps: 'all' });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [threadWidth]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative min-h-screen h-screen w-full overflow-hidden bg-transparent z-10 pointer-events-auto mt-45"
    >
      {/* ─── Top Center Header (Judul diatas tengah, TANPA warna gradasi pada font) ─── */}
      <div className="absolute top-12 sm:top-14 md:top-16 left-0 right-0 z-20 flex flex-col items-center text-center px-4 pointer-events-none">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight mt-12">
          {t('title')} <span className="text-purple-600">Flow</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium max-w-md">
          {t('desc')}
        </p>
      </div>

      {/* ─── Bottom Area: Benang Lurus & Poin-Poin Skill di Bawah Model Mobil ─── */}
      <div className="absolute bottom-10 sm:bottom-12 md:bottom-14 left-0 right-0 z-20 pointer-events-auto overflow-hidden">
        <div
          ref={trackRef}
          className="flex flex-row items-end pl-8 md:pl-20 pr-48 will-change-transform pb-2 relative"
        >
          {/* Straight Purple Thread SVG Line (Lurus & Menyambung Solid Tidak Putus-Putus) */}
          <svg
            className="absolute left-0 pointer-events-none z-0 hidden md:block"
            style={{
              width: `${threadWidth}px`,
              height: '36px',
              top: '22px', // Centered vertically with the station dot
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="purpleGlow" x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base straight guide line (Menyambung solid, tidak putus-putus) */}
            <line
              x1="0"
              y1="18"
              x2={threadWidth}
              y2="18"
              stroke="rgba(168, 85, 247, 0.35)"
              strokeWidth="3.5"
            />

            {/* Active straight glowing purple line (terisi lurus) */}
            <line
              ref={activeThreadRef}
              x1="0"
              y1="18"
              x2={threadWidth}
              y2="18"
              stroke="#9333ea"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#purpleGlow)"
            />
          </svg>

          {/* Skill Stations on the Straight Thread */}
          <div className="flex flex-row items-start gap-10 md:gap-12 relative z-10">
            {allSkills.map((skill, idx) => {
              const IconComp = ICON_MAP[skill.icon] || Code2;
              const showCategoryLabel =
                idx === 0 || allSkills[idx - 1].category !== skill.category;

              return (
                <div
                  key={idx}
                  className="station-node-container flex flex-col items-center flex-shrink-0"
                  style={{ width: '260px' }}
                >
                  {/* Category / Number Label above node */}
                  <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-bold h-5">
                    {showCategoryLabel ? (
                      <span className="text-purple-700 bg-purple-100/95 border border-purple-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs">
                        {skill.category}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-purple-700/80 font-bold tracking-wider ml-auto">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Straight Thread Station Node Dot (Lurus sejajar garis) */}
                  <div className="relative flex items-center justify-center h-9 w-full mb-3">
                    {/* Ping ripple effect when active */}
                    <span className="station-node-ping absolute w-7 h-7 rounded-full bg-purple-500/40 pointer-events-none" />
                    {/* Center Point: Starts dimmed, turns glowing purple when scrolled */}
                    <span className="station-node-dot w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-200 transition-all duration-300 z-10" />
                  </div>

                  {/* Individual Skill Card below node */}
                  <SkillCard className="skill-card-inner">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-600/10 text-purple-700 border border-purple-200/70 shadow-sm">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block leading-tight">
                            {skill.name}
                          </span>
                          <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">
                            {skill.category.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/70">
                        {skill.level}%
                      </span>
                    </div>
                    <ProgressBar $level={skill.level}>
                      <div />
                    </ProgressBar>
                  </SkillCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

export default Skills;