import React, { useState } from 'react';
import { ThemeConfig } from '../../types';
import { ManualCard } from './ManualCard';
import { ManualCodeBlock } from './ManualCodeBlock';
import { ManualSection as ManualSectionType } from './manualData';
import { ChevronDown } from 'lucide-react';

interface Props {
  section: ManualSectionType;
  theme: ThemeConfig;
  searchQuery?: string;
  // Fix 10: nivel de heading configurable para evitar múltiples h1
  headingLevel?: 1 | 2;
}

export const ManualSection: React.FC<Props> = ({ section, theme, searchQuery, headingLevel = 1 }) => {
  // Fix 8: estado React en lugar de <details> nativo para transiciones animadas
  const [openSubsections, setOpenSubsections] = useState<Record<number, boolean>>(
    // Auto-abrir todo si hay búsqueda activa
    () => searchQuery ? Object.fromEntries(section.subsections.map((_, i) => [i, true])) : {}
  );

  // Abrir todos cuando llega una búsqueda
  React.useEffect(() => {
    if (searchQuery) {
      setOpenSubsections(Object.fromEntries(section.subsections.map((_, i) => [i, true])));
    }
  }, [searchQuery, section.subsections]);

  const toggleSubsection = (idx: number) => {
    setOpenSubsections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Fix 9: highlightText con regex sin flag 'g' en .test() para evitar bug lastIndex
  const highlightText = (text: string): React.ReactNode => {
    if (!searchQuery || searchQuery.length < 2) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    const matchRegex = new RegExp(`^${escaped}$`, 'i'); // sin flag g, sin lastIndex
    return parts.map((part, i) =>
      matchRegex.test(part) ? (
        <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Fix 10: componente de título dinámico según headingLevel
  const SectionTitle = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-500 mb-12">
      {/* Fix 10: título con nivel correcto */}
      <SectionTitle
        className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-6 sm:mb-8 leading-tight tracking-tight drop-shadow-sm"
        style={{ color: theme.text }}
      >
        {highlightText(section.title)}
      </SectionTitle>

      {/* Main Content */}
      <div className="prose prose-invert max-w-none mb-10">
        <p className="text-sm sm:text-base leading-relaxed opacity-80" style={{ color: theme.text }}>
          {highlightText(section.content)}
        </p>
      </div>

      {/* Fix 8: Subsecciones con estado React, transición CSS animada */}
      <div className="space-y-3">
        {section.subsections?.map((subsection, idx) => {
          const isOpen = !!openSubsections[idx];
          return (
            <div
              key={idx}
              className="rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                borderColor: isOpen ? `${theme.accent}40` : 'rgba(255,255,255,0.08)',
                backgroundColor: isOpen ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'
              }}
            >
              {/* Header del acordeón */}
              <button
                onClick={() => toggleSubsection(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-white/5 transition-colors"
              >
                {/* Fix 10: subsecciones usan h3 dentro de cada sección */}
                <h3
                  className="text-base sm:text-lg font-black uppercase flex items-center gap-3"
                  style={{ color: theme.text }}
                >
                  {highlightText(subsection.title)}
                </h3>
                <ChevronDown
                  size={18}
                  style={{
                    color: theme.sub,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    flexShrink: 0
                  }}
                />
              </button>

              {/* Contenido animado */}
              <div
                style={{
                  maxHeight: isOpen ? '2000px' : '0px',
                  overflow: 'hidden',
                  transition: isOpen
                    ? 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease'
                    : 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <div className="px-4 sm:px-5 pb-6 pt-1">
                  <p
                    className="text-sm sm:text-base leading-relaxed mb-6 opacity-70"
                    style={{ color: theme.text }}
                  >
                    {highlightText(subsection.content)}
                  </p>

                  {subsection.cards?.map((card, cardIdx) => (
                    <ManualCard key={cardIdx} card={card} theme={theme} />
                  ))}

                  {subsection.codeBlocks?.map((code, codeIdx) => (
                    <ManualCodeBlock key={codeIdx} code={code} theme={theme} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
