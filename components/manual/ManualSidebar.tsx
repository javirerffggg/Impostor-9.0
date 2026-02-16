
import React from 'react';
import { 
  BookOpen, Users, Brain, Gamepad2, 
  HelpCircle, FileText, ChevronRight, X,
  Library, Settings, Lightbulb, Book,
  PlayCircle, Trophy, Wrench, History, Code, Key
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
  { id: 'ejemplos', title: 'Ejemplos Reales', icon: <PlayCircle size={18} />, color: manualTheme.icon.examples },
  { id: 'roles', title: 'Roles del Juego', icon: <Users size={18} />, color: manualTheme.icon.roles },
  { id: 'infinitum', title: 'Sistema INFINITUM', icon: <Brain size={18} />, color: manualTheme.icon.infinitum },
  { id: 'modos', title: 'Modos de Juego', icon: <Gamepad2 size={18} />, color: manualTheme.icon.modes },
  { id: 'logros', title: 'Logros y Desafíos', icon: <Trophy size={18} />, color: manualTheme.icon.achievements },
  { id: 'categorias', title: 'Categorías', icon: <Library size={18} />, color: manualTheme.icon.categories },
  { id: 'configuracion', title: 'Configuración', icon: <Settings size={18} />, color: manualTheme.icon.config },
  { id: 'estrategias', title: 'Estrategias', icon: <Lightbulb size={18} />, color: manualTheme.icon.strategies },
  { id: 'troubleshooting', title: 'Solución Problemas', icon: <Wrench size={18} />, color: manualTheme.icon.troubleshoot },
  { id: 'faq', title: 'Preguntas Frecuentes', icon: <HelpCircle size={18} />, color: manualTheme.icon.faq },
  { id: 'changelog', title: 'Versiones', icon: <History size={18} />, color: manualTheme.icon.changelog },
  { id: 'dev-docs', title: 'Para Devs', icon: <Code size={18} />, color: manualTheme.icon.dev },
  { id: 'secretos', title: 'Secretos', icon: <Key size={18} />, color: manualTheme.icon.secrets },
  { id: 'glosario', title: 'Glosario Técnico', icon: <Book size={18} />, color: manualTheme.icon.glossary },
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
          backgroundColor: `${theme.cardBg}F5`, // Matched opacity
          borderColor: theme.border,
          backdropFilter: 'blur(20px)'
        }}>
        
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between px-6 py-6 border-b"
          style={{ borderColor: theme.border }}>
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
        <nav className="p-4 space-y-1.5 mt-4 lg:mt-0">
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
                    ? `${theme.accent}20` 
                    : 'transparent',
                  borderWidth: '1px',
                  borderColor: isActive 
                    ? theme.accent 
                    : 'transparent',
                  boxShadow: isActive 
                    ? `0 0 15px ${theme.accent}30` 
                    : 'none',
                }}>
                
                {/* Icon */}
                <div className="shrink-0" style={{ color: section.color }}>
                  {section.icon}
                </div>

                {/* Title */}
                <span className={`flex-1 text-left text-xs font-bold uppercase tracking-wide`}
                  style={{ 
                    color: isActive ? theme.text : theme.sub 
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
          style={{ borderColor: theme.border }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-4 opacity-40"
            style={{ color: theme.text }}>
            Atajos
          </p>
          <div className="space-y-1">
            <button 
                onClick={() => handleSectionClick('glosario')}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
                style={{ color: theme.sub }}
            >
                → Glosario Técnico
            </button>
            <button 
                onClick={() => handleSectionClick('faq')}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors opacity-60 hover:opacity-100"
                style={{ color: theme.sub }}
            >
                → Dudas Comunes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
