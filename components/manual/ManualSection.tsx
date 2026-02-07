


import React from 'react';
import { ThemeConfig } from '../../types';
import { ManualCard } from './ManualCard';
import { ManualCodeBlock } from './ManualCodeBlock';
import { manualTheme } from './manualTheme';
import { ManualSection as ManualSectionType } from './manualData';

interface Props {
  section: ManualSectionType;
  theme: ThemeConfig;
  searchQuery?: string;
}

export const ManualSection: React.FC<Props> = ({ section, theme, searchQuery }) => {
  
  // Highlight search terms
  const highlightText = (text: string) => {
    if (!searchQuery || searchQuery.length < 2) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-500">
      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-6 sm:mb-8 leading-tight tracking-tight"
        style={{ color: theme.text }}>
        {highlightText(section.title)}
      </h1>

      {/* Main Content */}
      <div className="prose prose-invert max-w-none mb-10">
        <p className="text-sm sm:text-base leading-relaxed opacity-80"
          style={{ color: theme.text }}>
          {highlightText(section.content)}
        </p>
      </div>

      {/* Subsections */}
      {section.subsections?.map((subsection, idx) => (
        <div key={idx} className="mb-12 border-l-2 pl-4 sm:pl-6" style={{ borderColor: theme.border }}>
          
          {/* Subsection Title */}
          <h2 className="text-xl sm:text-2xl font-black uppercase mb-3 flex items-center gap-3"
            style={{ color: theme.text }}>
            {highlightText(subsection.title)}
          </h2>

          {/* Subsection Content */}
          <p className="text-sm sm:text-base leading-relaxed mb-6 opacity-70"
            style={{ color: theme.text }}>
            {highlightText(subsection.content)}
          </p>

          {/* Cards */}
          {subsection.cards?.map((card, cardIdx) => (
            <ManualCard key={cardIdx} card={card} theme={theme} />
          ))}

          {/* Code Blocks */}
          {subsection.codeBlocks?.map((code, codeIdx) => (
            <ManualCodeBlock key={codeIdx} code={code} theme={theme} />
          ))}
        </div>
      ))}
    </div>
  );
};