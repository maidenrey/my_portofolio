import React, { useEffect, useRef, memo } from 'react';
import { Mail, MessageSquare, ArrowUp, Send } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

import cubeSvg from '../assets/Shapes/cube.svg';
import hexaSvg from '../assets/Shapes/hexa.svg';
import octaSvg from '../assets/Shapes/octa.svg';
import pyramidSvg from '../assets/Shapes/pyramid.svg';

gsap.registerPlugin(ScrollTrigger);

const ContactFooter = memo(function ContactFooter() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, `contact.${key}`);

  const currentYear = new Date().getFullYear();
  const shapesRef = useRef([]);

  const socialLinks = [
    { name: 'Email', href: 'mailto:reymonjkmaiden@gmail.com', icon: Mail, isMail: true },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedinIcon },
    { name: 'GitHub', href: 'https://github.com/syafiqahmadannaufal9-bit', icon: GithubIcon },
    { name: 'WhatsApp', href: 'https://wa.me/6282121825192', icon: MessageSquare },
  ];

  useEffect(() => {
    // reveal from further below the footer
    gsap.fromTo(shapesRef.current,
      { y: 350, opacity: 0, rotation: -30 },
      {
        y: 0,
        opacity: 0.8,
        rotation: 0,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 85%',
        }
      }
    );

    // continuous float & rotate
    shapesRef.current.forEach((shape, i) => {
      gsap.to(shape, {
        y: (i % 2 === 0) ? -10 : 10,
        rotation: (i % 2 === 0) ? 8 : -8,
        duration: 3 + i * 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.5
      });
    });
  }, []);

  return (
    <footer
      id="contact"
      className="relative overflow-hidden pt-24 pb-12 px-6 border-t z-10 backdrop-blur-md bg-white/80 border-black/20 text-black"
    >
      {/* Floating Shapes */}
      <img ref={el => shapesRef.current[0] = el} src={cubeSvg} alt="" className="absolute top-20 left-10 w-24 h-24 hidden lg:block opacity-0 pointer-events-none" style={{ zIndex: -1 }} />
      <img ref={el => shapesRef.current[1] = el} src={hexaSvg} alt="" className="absolute bottom-32 left-26 w-32 h-32 hidden lg:block opacity-0 pointer-events-none" style={{ zIndex: -1 }} />
      <img ref={el => shapesRef.current[2] = el} src={octaSvg} alt="" className="absolute top-32 right-12 w-28 h-28 hidden lg:block opacity-0 pointer-events-none" style={{ zIndex: -1 }} />
      <img ref={el => shapesRef.current[3] = el} src={pyramidSvg} alt="" className="absolute bottom-30 right-40 w-20 h-20 hidden lg:block opacity-0 pointer-events-none" style={{ zIndex: -1 }} />

      <div className="max-w-5xl mx-auto relative z-20">
        <div className="p-8 sm:p-14 rounded-3xl border text-center relative overflow-hidden mb-16 shadow-2xl backdrop-blur-xl bg-black/90 text-white border-black">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-3 opacity-75">{t('subtitle')}</h2>
          <h3 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
            {t('title')}
          </h3>
          <p className="max-w-xl mx-auto text-sm sm:text-base opacity-80 mb-8 leading-relaxed">
            {t('desc')}
          </p>
          <a
            href="mailto:syafiqahmadannuafal9@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-extrabold text-base transition-all transform hover:scale-105 bg-white hover:bg-gray-100 text-black"
          >
            <Send className="w-5 h-5" />
            {t('sendEmail')}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 relative z-20">
          {socialLinks.map((link, idx) => {
            const IconComp = link.icon;
            return (
              <a
                key={idx}
                href={link.href}
                target={link.isMail ? '_self' : '_blank'}
                rel={link.isMail ? undefined : 'noopener noreferrer'}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold text-sm transition-all hover:-translate-y-1 bg-gray-50/90 border-black/20 text-black hover:border-black"
              >
                <IconComp className="w-4 h-4" />
                {link.name}
              </a>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold opacity-75 relative z-20">
          <p>© {currentYear} Syafiq Ahmad Annaufal. {t('rights')}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/20 text-black transition-all hover:opacity-100"
          >
            {t('backToTop')}
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
});

export default ContactFooter;
