import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, Menu } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { ManualSidebar } from './ManualSidebar';
import { ManualSection } from './ManualSection';
import { manualSections } from './manualData';

interface Props {
  theme: ThemeConfig;
  onClose: () => void;
  isOpen: boolean;
}

export const ManualView: React.FC<Props> = ({ theme, onClose, isOpen }) => {
  const [activeSection, setActiveSection] = useState('introduccion');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when section changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [activeSection]);

  // Fix 1: Sync activeSection with first search result
  useEffect(() => {
    if (!searchQuery) return;
    const first = manualSections.find(
      s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subsections.some(
          sub =>
            sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    if (first) setActiveSection(first.id);
  }, [searchQuery]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = scrollHeight - clientHeight > 0
      ? (scrollTop / (scrollHeight - clientHeight)) * 100
      : 0;
    setScrollProgress(Math.min(progress, 100));
  };

  const filteredSections = useMemo(() =>
    searchQuery
      ? manualSections.filter(
          section =>
            section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.subsections.some(
              sub =>
                sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : [manualSections.find(s => s.id === activeSection)!]
  , [searchQuery, activeSection]);

  // Fix 2: quickNavItems derivado de manualSections, no hardcoded
  const quickNavItems = useMemo(() => {
    const preferred = ['introduccion', 'roles', 'modos', 'faq'];
    const available = manualSections.map(s => s.id);
    return preferred.filter(id => available.includes(id));
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col animate-in slide-in-from-bottom duration-500"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] relative"
        style={{
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: `${theme.cardBg}F5`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 4px 20px -5px rgba(0,0,0,0.1)`
        }}
      >
        {/* Fix 4: progress bar fuera del header overflow para que no se recorte en iOS */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-20"
          style={{ backgroundColor: `${theme.border}30` }}
        >
          <div
            className="h-full transition-all duration-100 ease-out"
            style={{
              width: `${scrollProgress}%`,
              backgroundColor: theme.accent,
              boxShadow: `0 0 8px ${theme.accent}`
            }}
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 rounded-lg transition-all active:scale-95 bg-white/5"
          style={{ color: theme.text }}
        >
          <Menu size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 flex-1 justify-center lg:justify-start lg:pl-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.accent }}
          >
            <span className="text-white font-black text-sm">i9</span>
          </div>
          <h1
            className="hidden sm:block text-xl font-black uppercase tracking-wider"
            style={{ color: theme.text }}
          >
            Manual Impostor 9.0
          </h1>
        </div>

        {/* Desktop Search */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border mr-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: theme.border }}
        >
          <Search size={16} style={{ color: theme.sub }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-32 sm:w-48 placeholder:opacity-50"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={12} style={{ color: theme.sub }} />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 hover:bg-white/10 border"
          style={{
            color: theme.text,
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.1)'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Mobile Search */}
      <div
        className="sm:hidden px-4 py-3 border-b"
        style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg border"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: theme.border }}
        >
          <Search size={16} style={{ color: theme.sub }} />
          <input
            type="text"
            placeholder="Buscar en el manual..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:opacity-50"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={12} style={{ color: theme.sub }} />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        <ManualSidebar
          theme={theme}
          activeSection={activeSection}
          onSectionChange={id => { setActiveSection(id); setSearchQuery(''); }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* CONTENT AREA */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 scroll-smooth relative"
        >
          {filteredSections.map((section, idx) => (
            <ManualSection
              key={section.id}
              section={section}
              theme={theme}
              searchQuery={searchQuery}
              // Fix 10: solo el primer resultado usa h1, el resto h2
              headingLevel={idx === 0 ? 1 : 2}
            />
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Search size={32} className="opacity-30" style={{ color: theme.text }} />
              </div>
              <p className="text-lg opacity-50 font-medium" style={{ color: theme.text }}>
                No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold px-4 py-2 rounded-full border hover:bg-white/5 transition-colors"
                style={{ borderColor: theme.border, color: theme.sub }}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* Fix 3: version footer sincronizada */}
          <div
            className="mt-16 pt-8 border-t text-center pb-24"
            style={{ borderColor: theme.border }}
          >
            <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest" style={{ color: theme.text }}>
              Impostor 9.0 v12.5 — Manual Actualizado Marzo 2026
            </p>
          </div>
        </div>

        {/* FLOATING NAVIGATION PILL — Fix 2: derivado de manualSections */}
        {!searchQuery && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 duration-500">
            <div
              className="flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border shadow-2xl"
              style={{ backgroundColor: `${theme.cardBg}E6`, borderColor: theme.border }}
            >
              {quickNavItems.map(id => {
                const section = manualSections.find(s => s.id === id);
                const label = id === 'introduccion' ? 'Intro' : (section?.title.split(' ')[0] ?? id);
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                      activeSection === id
                        ? 'bg-white/10 text-white shadow-sm scale-105'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
