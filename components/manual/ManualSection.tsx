
import React from 'react';
import { ThemeConfig } from '../../types';
import { ManualCard } from './ManualCard';
import { ManualCodeBlock } from './ManualCodeBlock';
import { ManualSection as ManualSectionType } from './manualData';
import { ChevronDown } from 'lucide-react';

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
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-6 sm:mb-8 leading-tight tracking-tight drop-shadow-sm"
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

      {/* Subsections as Accordions */}
      <div className="space-y-4">
        {section.subsections?.map((subsection, idx) => (
          <details 
            key={idx} 
            className="group rounded-xl border overflow-hidden transition-all duration-300 open:bg-black/10"
            style={{ 
                borderColor: 'rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.02)'
            }}
            open={!!searchQuery} // Auto-open if searching
          >
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none hover:bg-white/5 transition-colors">
                <h2 className="text-lg sm:text-xl font-black uppercase flex items-center gap-3"
                    style={{ color: theme.text }}>
                    {highlightText(subsection.title)}
                </h2>
                <ChevronDown 
                    size={20} 
                    style={{ color: theme.sub }} 
                    className="transition-transform duration-300 group-open:rotate-180" 
                />
            </summary>

            <div className="px-4 sm:px-5 pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
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
          </details>
        ))}
      </div>
    </div>
  );
};
