import React, { useState } from 'react';
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
  { id: 'introduccion', title: 'Introducción',      icon: <BookOpen size={18} />,    color: manualTheme.icon.intro },
  { id: 'reglas',       title: 'Reglas Básicas',    icon: <FileText size={18} />,    color: manualTheme.icon.rules },
  { id: 'ejemplos',     title: 'Ejemplos Reales',   icon: <PlayCircle size={18} />,  color: manualTheme.icon.examples },
  { id: 'roles',        title: 'Roles del Juego',   icon: <Users size={18} />,       color: manualTheme.icon.roles },
  { id: 'infinitum',    title: 'Sistema INFINITUM', icon: <Brain size={18} />,       color: manualTheme.icon.infinitum },
  { id: 'modos',        title: 'Modos de Juego',    icon: <Gamepad2 size={18} />,    color: manualTheme.icon.modes },
  { id: 'logros',       title: 'Logros y Desafíos', icon: <Trophy size={18} />,      color: manualTheme.icon.achievements },
  { id: 'categorias',   title: 'Categorías',        icon: <Library size={18} />,     color: manualTheme.icon.categories },
  { id: 'configuracion',title: 'Configuración',     icon: <Settings size={18} />,    color: manualTheme.icon.config },
  { id: 'estrategias',  title: 'Estrategias',       icon: <Lightbulb size={18} />,   color: manualTheme.icon.strategies },
  { id: 'troubleshooting', title: 'Solución Problemas', icon: <Wrench size={18} />, color: manualTheme.icon.troubleshoot },
  { id: 'faq',          title: 'Preguntas Frecuentes', icon: <HelpCircle size={18} />, color: manualTheme.icon.faq },
  { id: 'changelog',    title: 'Versiones',         icon: <History size={18} />,     color: manualTheme.icon.changelog },
  { id: 'dev-docs',     title: 'Para Devs',         icon: <Code size={18} />,        color: manualTheme.icon.dev },
  { id: 'secretos',     title: 'Secretos',          icon: <Key size={18} />,         color: manualTheme.icon.secrets },
  { id: 'glosario',     title: 'Glosario Técnico',  icon: <Book size={18} />,        color: manualTheme.icon.glossary },
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
  // Fix 6: rastrear secciones visitadas para mostrar progreso
  const [visited, setVisited] = useState<Set<string>>(new Set([activeSection]));

  const handleSectionClick = (id: string) => {
    setVisited(prev => new Set([...prev, id]));
    onSectionChange(id);
    onClose();
  };

  const progressPct = Math.round((visited.size / sections.length) * 100);

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
      <div
        className={`
          fixed lg:relative top-0 left-0 h-full z-50
          w-72 border-r overflow-y-auto flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundColor: `${theme.cardBg}F5`,
          borderColor: theme.border,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Fix 7: safe-area-inset-top en mobile */}
        <div
          className="lg:hidden flex items-center justify-between px-6 border-b"
          style={{
            borderColor: theme.border,
            paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
            paddingBottom: '1.5rem'
          }}
        >
          <span className="font-black text-sm uppercase tracking-wider" style={{ color: theme.text }}>
            Índice
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all active:scale-95 bg-white/5"
            style={{ color: theme.text }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 mt-4 lg:mt-6 flex-1">
          {sections.map(section => {
            const isActive = section.id === activeSection;
            const isVisited = visited.has(section.id);

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
                  backgroundColor: isActive ? `${theme.accent}20` : 'transparent',
                  borderWidth: '1px',
                  borderColor: isActive ? theme.accent : 'transparent',
                  boxShadow: isActive ? `0 0 15px ${theme.accent}30` : 'none'
                }}
              >
                {/* Icon */}
                <div className="shrink-0" style={{ color: section.color }}>
                  {section.icon}
                </div>

                {/* Title */}
                <span
                  className="flex-1 text-left text-xs font-bold uppercase tracking-wide"
                  style={{ color: isActive ? theme.text : theme.sub }}
                >
                  {section.title}
                </span>

                {/* Fix 5: ChevronRight estático (sin animate-pulse) */}
                {isActive && (
                  <ChevronRight size={14} className="shrink-0" style={{ color: theme.accent }} />
                )}

                {/* Dot para secciones visitadas no activas */}
                {!isActive && isVisited && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 opacity-40"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Fix 6: Footer con progreso de lectura en lugar de atajos redundantes */}
        <div
          className="px-6 py-6 border-t"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-40" style={{ color: theme.text }}>
              Progreso
            </p>
            <span className="text-[10px] font-mono" style={{ color: theme.accent }}>
              {visited.size}/{sections.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.border}60` }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: theme.accent,
                boxShadow: `0 0 6px ${theme.accent}60`
              }}
            />
          </div>
          <p className="text-[9px] font-mono opacity-30 mt-1.5" style={{ color: theme.sub }}>
            {progressPct === 100 ? '¡Manual completado!' : `${progressPct}% explorado`}
          </p>
        </div>
      </div>
    </>
  );
};
