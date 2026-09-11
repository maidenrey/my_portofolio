import React, { useState, useEffect, memo } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import { GitCommit, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

const GithubStats = memo(function GithubStats() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, `github.${key}`);

  const username = 'maidenrey';
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    async function fetchGithubProfile() {
      try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error('Failed to fetch GitHub profile:', err);
      }
    }
    fetchGithubProfile();
  }, [username]);

  const calendarTheme = {
    light: ['#f3f0ff', '#d8ccff', '#b399ff', '#8d66ff', '#5227FF'],
    dark: ['#161b22', '#2d1a4d', '#4c2e8c', '#7146cc', '#5227FF']
  };

  return (
    <section id="github-stats" className="py-24 px-6 z-10 text-black">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-2 text-[#5227FF] opacity-90 flex items-center justify-center gap-2">
            <GithubIcon className="w-4 h-4 text-[#5227FF]" />
            {t('subtitle')}
          </h2>
          <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-[#5227FF]">
            {t('title')}
          </h3>
          <p className="mt-3 max-w-xl mx-auto text-base text-gray-700">
            {t('desc')}
          </p>
          <div className="w-16 h-1 mx-auto mt-4 rounded-full bg-[#5227FF]" />
        </div>

        {/* Profile Overview Banner */}
        <div className="p-6 sm:p-8 rounded-3xl border border-black/20 bg-white/80 backdrop-blur-xl shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-black overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={profileData?.avatar_url || `https://github.com/${username}.png`}
                alt={username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                {profileData?.name || 'Maiden Reyy as Anam'}
              </h4>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                @{username}
              </p>
              {profileData?.bio && (
                <p className="text-xs mt-1 text-gray-500 line-clamp-1">
                  {profileData.bio}
                </p>
              )}
            </div>
          </div>

          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-[#5227FF] hover:bg-[#5227FF]/80 text-white shadow-md text-sm"
          >
            <GithubIcon className="w-4 h-4" />
            {t('visitBtn')}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* GitHub Calendar Component */}
        <div className="p-6 sm:p-10 rounded-3xl border border-black/20 bg-white/80 backdrop-blur-xl shadow-xl">
          <h4 className="text-lg font-extrabold mb-6 flex items-center justify-center gap-2">
            <GitCommit className="w-5 h-5" />
            {t('calendarTitle')}
          </h4>
          <div className="flex justify-center overflow-x-auto py-2">
            <GitHubCalendar
              username={username}
              blockSize={13}
              blockMargin={4}
              fontSize={14}
              theme={calendarTheme}
              colorScheme="light"
              labels={{
                totalCount: t('totalCountLabel'),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default GithubStats;
