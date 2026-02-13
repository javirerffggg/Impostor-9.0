
import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Menu } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { ManualSidebar } from './ManualSidebar';
import { ManualSection } from './ManualSection';
import { manualSections } from './manualData';
import { manualTheme } from './manualTheme';

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

  // Handle Scroll Progress
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
  };

  // Filter sections by search
  const filteredSections = searchQuery
    ? manualSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.subsections.some(sub => 
            sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [manualSections.find(s => s.id === activeSection)!];

  if (!isOpen) return null;

  const quickNavItems = ['introduccion', 'roles', 'modos', 'faq'];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col animate-in slide-in-from-bottom duration-500"
      style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b pt-[calc(1rem+env(safe-area-inset-top))] relative"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(20px)'
        }}>
        
        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] transition-all duration-100 ease-out z-20"
             style={{ width: `${scrollProgress}%`, backgroundColor: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }} />

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 rounded-lg transition-all active:scale-95 bg-white/5"
          style={{ color: theme.text }}>
          <Menu size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 flex-1 justify-center lg:justify-start lg:pl-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.accent }}>
            <span className="text-white font-black text-sm">i9</span>
          </div>
          <h1 className="hidden sm:block text-xl font-black uppercase tracking-wider"
            style={{ color: theme.text }}>
            Manual Impostor 9.0
          </h1>
        </div>

        {/* Desktop Search */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border mr-4"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: theme.border 
          }}>
          <Search size={16} style={{ color: theme.sub }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-32 sm:w-48 placeholder:opacity-50"
            style={{ color: theme.text }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-all active:scale-95 hover:bg-white/10 border border-white/5"
          style={{ color: theme.text }}>
          <X size={20} />
        </button>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 py-3 border-b"
        style={{ 
          borderColor: theme.border,
          backgroundColor: theme.cardBg 
        }}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: theme.border 
          }}>
          <Search size={16} style={{ color: theme.sub }} />
          <input
            type="text"
            placeholder="Buscar en el manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm flex-1 placeholder:opacity-50"
            style={{ color: theme.text }}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <ManualSidebar
          theme={theme}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* CONTENT AREA */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 scroll-smooth relative"
        >
          {filteredSections.map((section) => (
            <ManualSection
              key={section.id}
              section={section}
              theme={theme}
              searchQuery={searchQuery}
            />
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Search size={32} className="opacity-30" style={{ color: theme.text }} />
              </div>
              <p className="text-lg opacity-50 font-medium" style={{ color: theme.text }}>
                No se encontraron resultados para "{searchQuery}"
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t text-center pb-24"
            style={{ borderColor: theme.border }}>
            <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest" style={{ color: theme.text }}>
              Impostor 9.0 v12.2 - Manual Actualizado Febrero 2026
            </p>
          </div>
        </div>

        {/* FLOATING NAVIGATION PILL */}
        {!searchQuery && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border shadow-2xl"
                     style={{ backgroundColor: `${theme.cardBg}E6`, borderColor: theme.border }}>
                    {quickNavItems.map(id => (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeSection === id ? 'bg-white/10 text-white shadow-sm scale-105' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            {id === 'introduccion' ? 'Intro' : id.charAt(0).toUpperCase() + id.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
