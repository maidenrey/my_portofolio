import React, { useRef, memo } from 'react';
import { StaggeredMenu } from './StaggeredMenu';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

const scrollTo = (id) => {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
};

const Navbar = memo(function Navbar() {
  const menuRef = useRef(null);
  const { language, setLanguage } = useLanguage();

  const navT = (key) => getTranslation(language, `nav.${key}`);

  const menuItems = [
    { label: navT('home'),      link: '#home',      ariaLabel: `Go to ${navT('home')}`,      onClick: (e) => { e.preventDefault(); scrollTo('home'); } },
    { label: navT('about'),     link: '#about',     ariaLabel: `Go to ${navT('about')}`,     onClick: (e) => { e.preventDefault(); scrollTo('about'); } },
    { label: navT('skills'),    link: '#skills',    ariaLabel: `Go to ${navT('skills')}`,    onClick: (e) => { e.preventDefault(); scrollTo('skills'); } },
    { label: navT('portfolio'), link: '#portfolio', ariaLabel: `Go to ${navT('portfolio')}`, onClick: (e) => { e.preventDefault(); scrollTo('portfolio'); } },
    { label: navT('contact'),   link: '#contact',   ariaLabel: `Go to ${navT('contact')}`,   onClick: (e) => { e.preventDefault(); scrollTo('contact'); } },
  ];

  const socialItems = [
    { label: 'GitHub',    link: 'https://github.com/syafiqahmadannaufal9-bit' },
    { label: 'LinkedIn',  link: 'https://linkedin.com' },
    { label: 'WhatsApp',  link: 'https://wa.me/082121825192' },
    { label: 'Email',     link: 'mailto:syafiqahmadannuafal9@gmail.com' },
  ];

  const languageSwitcher = (
    <div className="sm-lang-toggle" role="group" aria-label="Language selector">
      <button
        type="button"
        className={`sm-lang-btn ${language === 'id' ? 'active' : ''}`}
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
      >
        ID
      </button>
      <button
        type="button"
        className={`sm-lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
      >
        ENG
      </button>
    </div>
  );

  return (
    <StaggeredMenu
      ref={menuRef}
      isFixed
      position="right"
      logoText={<><span style={{ color: '#5227FF' }}>Web</span> Dev</>}
      colors={['#c8c8c8', '#1a1a1a']}
      items={menuItems}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      menuButtonColor="#000"
      openMenuButtonColor="#000"
      accentColor="#5227FF"
      changeMenuColorOnOpen={false}
      langSwitcher={languageSwitcher}
    />
  );
});

export default Navbar;
