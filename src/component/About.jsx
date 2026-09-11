import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { loadSingleMarkdown } from '../utils/markdown';
import aboutRaw from '../content/about.md?raw';
import { Download, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';
import anamBwPhoto from '../assets/Anam B&W.png';
import anamNegativePhoto from '../assets/Anam negative.png';
import PixelTrail from './PixelTrail';

const About = memo(function About() {
  const { language } = useLanguage();
  const { frontmatter } = loadSingleMarkdown(aboutRaw);

  const t = (key) => getTranslation(language, `about.${key}`);
  const educationList = getTranslation(language, 'about.education');
  const markdownContent = getTranslation(language, 'about.markdownContent');

  return (
    <section
      id="about"
      className="min-h-[100vh] py-24 px-6 md:px-12 lg:px-20 flex flex-col justify-center z-10 text-white relative"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* 2-column layout: text left, photo right */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch">

          {/* ─── Left column: Text content ─── */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-xs uppercase tracking-widest font-bold mb-2 opacity-60 text-gray-300">
                {t('subtitle')}
              </h2>
              <h3 className="text-4xl sm:text-5xl font-black text-white">{t('title')}</h3>
              <div className="w-16 h-1 mt-4 rounded-full bg-white" />
            </div>

            <div className="flex flex-col justify-center">
              <h4 className="text-xl sm:text-2xl font-bold mb-4 text-white">{frontmatter.title}</h4>

              <div className="prose prose-invert max-w-none text-base leading-relaxed mb-8 text-gray-200">
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              </div>

              {/* Latar Belakang Pendidikan */}
              <div className="mb-8 border-t border-white/15 pt-6">
                <h5 className="text-xs uppercase tracking-widest font-bold mb-4 opacity-60 flex items-center gap-2 text-gray-300">
                  <GraduationCap className="w-4 h-4 text-white" />
                  {t('eduHeader')}
                </h5>
                <div className="space-y-4">
                  {Array.isArray(educationList) && educationList.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md transition-all hover:border-white/40 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="font-bold text-sm sm:text-base text-white">{edu.degree}</h6>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-gray-300 whitespace-nowrap ml-2">
                          {edu.period}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5">{edu.institution}</p>
                      <p className="text-xs text-gray-300 leading-relaxed opacity-90">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <a
                  href="/assets/Syafiq Ahmad Annaufal CV.pdf"
                  download="Syafiq Ahmad Annaufal CV.pdf"
                  className="inline-flex items-center justify-center w-full sm:w-auto gap-3 px-6 py-4 rounded-xl font-bold transition-all bg-white hover:bg-gray-200 text-black shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  {t('downloadCv')}
                </a>
              </div>
            </div>
          </div>

          {/* ─── Right column: Photo with negative overlay in PixelTrail ─── */}
          <div className="w-full md:w-1/2 relative flex items-center justify-end">
            <div className="group relative w-full sm:w-[92%] md:w-[95%] lg:w-[90%] max-w-xl ml-auto overflow-hidden rounded-t-2xl cursor-pointer">
              {/* Base B&W Photo */}
              <img
                src={anamBwPhoto}
                alt="Anam B&W"
                className="w-full h-auto object-contain block"
              />

              {/* PixelTrail canvas revealing Negative Photo through the cursor trail */}
              <div className="absolute inset-0 z-20 pointer-events-auto">
                <PixelTrail
                  gridSize={48}
                  trailSize={0.16}
                  maxAge={450}
                  interpolate={6}
                  image={anamNegativePhoto}
                />
              </div>

              {/* Subtle gradient at the bottom — blends into black bg */}
              <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-30" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

export default About;

