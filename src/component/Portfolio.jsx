import React, { useState, memo } from 'react';
import { loadMarkdownCollection } from '../utils/markdown';
import ProjectModal from './ProjectModal';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../i18n/translations';

const Portfolio = memo(function Portfolio() {
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, `portfolio.${key}`);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalProject, setActiveModalProject] = useState(null);

  const rawProjectModules = import.meta.glob('../content/projects/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  const projects = loadMarkdownCollection(rawProjectModules);
  const rawCategories = [...new Set(projects.map(p => p.frontmatter.category).filter(Boolean))];

  const filteredProjects = selectedCategory === 'ALL'
    ? projects
    : projects.filter(p => p.frontmatter.category === selectedCategory);

  return (
    <section
      id="portfolio"
      className="min-h-[100vh] py-24 px-6 z-10 text-black"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-2 text-[#5227FF] opacity-90">{t('subtitle')}</h2>
          <h3 className="text-4xl sm:text-5xl font-black text-[#5227FF]">{t('title')}</h3>
          <p className="mt-3 max-w-xl mx-auto text-base text-gray-800">
            {t('desc')}
          </p>
          <div className="w-16 h-1 mx-auto mt-4 rounded-full bg-[#5227FF]" />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border backdrop-blur-md ${
              selectedCategory === 'ALL'
                ? 'bg-[#5227FF] text-white border-[#5227FF]'
                : 'bg-white/80 text-gray-700 border-black/20 hover:border-[#5227FF] hover:text-[#5227FF]'
            }`}
          >
            {t('allCategory')}
          </button>
          {rawCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border backdrop-blur-md ${
                selectedCategory === cat
                  ? 'bg-[#5227FF] text-white border-[#5227FF]'
                  : 'bg-white/80 text-gray-700 border-black/20 hover:border-[#5227FF] hover:text-[#5227FF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
          {filteredProjects.map((project) => {
            const { title, summary, category, thumbnail, techStack } = project.frontmatter;
            return (
              <div
                key={project.id}
                onClick={() => setActiveModalProject(project)}
                className="group rounded-3xl border overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-2 shadow-xl flex flex-col justify-between bg-white/70 border-black/20 hover:border-[#5227FF]"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-gray-200/80 transition-colors">
                        <FolderGit2 className="w-10 h-10 mb-2 opacity-60" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{t('preview')}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5227FF] text-white">
                        {category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#5227FF]">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2 group-hover:underline group-hover:text-[#5227FF] line-clamp-1">{title}</h4>
                    <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 text-gray-800">{summary}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  {techStack && (
                    <div className="flex flex-wrap gap-1.5">
                      {techStack.slice(0, 3).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#5227FF]/10 text-[#5227FF]">
                          {tech}
                        </span>
                      ))}
                      {techStack.length > 3 && (
                        <span className="text-[11px] opacity-60 self-center font-bold text-[#5227FF]">+{techStack.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProjectModal project={activeModalProject} onClose={() => setActiveModalProject(null)} />
    </section>
  );
});

export default Portfolio;
