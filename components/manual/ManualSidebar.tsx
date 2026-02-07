
import React from 'react';
import { 
  BookOpen, Users, Brain, Gamepad2, Shield, 
  HelpCircle, FileText, ChevronRight, X 
} from 'lucide-react';
import { ThemeConfig } from '../../types';
import { manualTheme } from './manualTheme';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const sections: Section[] = [
  { id: 'introduccion', title: 'Introducción', icon: <BookOpen size={18} />, color: manualTheme.icon.intro },
  { id: 'reglas', title: 'Reglas Básicas', icon: <FileText size={18} />, color: manualTheme.icon.rules },
  { id: 'roles', title: 'Roles del Juego', icon: <Users size={18} />, color: manualTheme.icon.roles },
  { id: 'infinitum', title: 'Sistema INFINITUM', icon: <Brain size={18} />, color: manualTheme.icon.infinitum },
  { id: 'modos', title: 'Modos de Juego', icon: <Gamepad2 size={18} />, color: manualTheme.icon.modes },
  { id: 'protocolos', title: 'Protocolos Avanzados', icon: <Shield size={18} />, color: manualTheme.icon.protocols },
  { id: 'faq', title: 'Preguntas Frecuentes', icon: <HelpCircle size={18} />, color: manualTheme.icon.faq },
];

interface Props {
  theme: ThemeConfig;
  activeSection: string;
  onSectionChange: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ManualSidebar: React.FC<Props> = ({ 
  theme, 
  activeSection, 
  onSectionChange,
  isOpen,
  onClose
}) => {
  
  const handleSectionClick = (id: string) => {
    onSectionChange(id);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full z-50
        w-72 border-r overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
        style={{ 
          backgroundColor: manualTheme.bg.secondary,
          borderColor: manualTheme.border.subtle 
        }}>
        
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between px-6 py-6 border-b"
          style={{ borderColor: manualTheme.border.subtle }}>
          <span className="font-black text-sm uppercase tracking-wider"
            style={{ color: theme.text }}>
            Índice
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all active:scale-95 bg-white/5"
            style={{ color: theme.text }}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 mt-4 lg:mt-0">
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.01] hover:bg-white/5'}
                  active:scale-95
                `}
                style={{
                  backgroundColor: isActive 
                    ? manualTheme.bg.accent 
                    : 'transparent',
                  borderWidth: '1px',
                  borderColor: isActive 
                    ? manualTheme.border.strong 
                    : 'transparent',
                  boxShadow: isActive 
                    ? manualTheme.border.glow 
                    : 'none',
                }}>
                
                {/* Icon */}
                <div className="shrink-0" style={{ color: section.color }}>
                  {section.icon}
                </div>

                {/* Title */}
                <span className={`flex-1 text-left text-xs font-bold uppercase tracking-wide`}
                  style={{ 
                    color: isActive ? theme.text : manualTheme.text.secondary 
                  }}>
                  {section.title}
                </span>

                {/* Arrow */}
                {isActive && (
                  <ChevronRight 
                    size={14} 
                    className="shrink-0 animate-pulse"
                    style={{ color: theme.accent }} 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Links Footer */}
        <div className="px-6 py-8 mt-auto border-t"
          style={{ borderColor: manualTheme.border.subtle }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-4 opacity-40"
            style={{ color: theme.text }}>
            Accesos Rápidos
          </p>
          <div className="space-y-1">
            {['Glosario Técnico', 'Changelog', 'Soporte'].map((link) => (
                <button key={link} className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
                style={{ color: manualTheme.text.secondary }}>
                → {link}
                </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
