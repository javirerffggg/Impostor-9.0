import React from 'react';
import { ThemeConfig, ThemeName, GameState } from '../types';
import { X, BookOpen, ChevronRight } from 'lucide-react';
import { VisualEngineSection } from './settings/VisualEngineSection';
import { SensorialSection } from './settings/SensorialSection';
import { RevealMethodSection } from './settings/RevealMethodSection';
import { CategoryLogicSection } from './settings/CategoryLogicSection';
import { MemorySection } from './settings/MemorySection';
import { PREMIUM_THEMES } from './settings/settingsUtils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    theme: ThemeConfig;
    themeName: ThemeName;
    setThemeName: React.Dispatch<React.SetStateAction<ThemeName>>;
    gameState: GameState;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
    onOpenHowToPlay: () => void;
    onBackToHome: () => void;
    volume?: number;
    setVolume?: (v: number) => void;
}

export const SettingsDrawer: React.FC<Props> = ({
    isOpen, onClose, theme, themeName, setThemeName,
    gameState, onUpdateSettings, onOpenHowToPlay,
    volume, setVolume
}) => {
    const isPremium = PREMIUM_THEMES.includes(themeName);

    // Visibility controlled via transform to preserve exit animations
    // and avoid conditional hook issues
    return (
        <div
            className={`fixed inset-0 z-[100] transition-all duration-300 ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className={`absolute inset-0 flex flex-col overflow-hidden transition-transform duration-300 ${
                    isOpen ? 'translate-y-0' : 'translate-y-4'
                }`}
                style={{ backgroundColor: isPremium ? `${theme.bg}F5` : theme.bg }}
            >
                {/* Background noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Floating close button */}
                <div className="absolute top-0 right-0 z-50 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pointer-events-none">
                    <button
                        onClick={onClose}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 pointer-events-auto backdrop-blur-md border shadow-lg hover:bg-white/10"
                        style={{ backgroundColor: `${theme.bg}80`, borderColor: 'rgba(255,255,255,0.1)', color: theme.text }}
                        aria-label="Cerrar ajustes"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scroll gradients */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />

                {/* Scrollable content */}
                <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 pb-32 no-scrollbar">

                    {/* Header */}
                    <div className="pt-[calc(1.5rem+env(safe-area-inset-top))]">
                        <h2
                            style={{ color: theme.text }}
                            className="text-3xl font-black italic tracking-tighter drop-shadow-sm mb-2"
                        >
                            SISTEMA
                        </h2>
                        <div className="flex items-center gap-2">
                            <span
                                style={{ color: theme.sub }}
                                className="text-[10px] font-mono uppercase tracking-widest opacity-70"
                            >
                                Configuración v2.5 · Ultra
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                    </div>

                    {/* ── Sections ── */}
                    <VisualEngineSection
                        themeName={themeName}
                        setThemeName={setThemeName}
                        theme={theme}
                    />

                    <SensorialSection
                        gameState={gameState}
                        theme={theme}
                        volume={volume}
                        setVolume={setVolume}
                        onUpdateSettings={onUpdateSettings}
                    />

                    <RevealMethodSection
                        gameState={gameState}
                        theme={theme}
                        onUpdateSettings={onUpdateSettings}
                    />

                    <CategoryLogicSection
                        gameState={gameState}
                        theme={theme}
                        onUpdateSettings={onUpdateSettings}
                    />

                    <MemorySection
                        gameState={gameState}
                        theme={theme}
                        onUpdateSettings={onUpdateSettings}
                    />

                    {/* Manual button */}
                    <button
                        onClick={onOpenHowToPlay}
                        className="w-full relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 active:scale-[0.98] group"
                        style={{
                            backgroundColor: `${theme.accent}10`,
                            borderColor: `${theme.accent}40`,
                            boxShadow: `0 8px 32px -12px ${theme.accent}30`
                        }}
                        aria-label="Abrir manual operativo"
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${theme.accent}15 0%, transparent 100%)` }}
                        />
                        <div className="flex items-center gap-4 relative z-10">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                            >
                                <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-base font-black uppercase tracking-wide mb-1" style={{ color: theme.text }}>
                                    Manual Operativo
                                </p>
                                <p className="text-[10px] font-mono opacity-60 uppercase" style={{ color: theme.sub }}>
                                    Reglas · Roles · Guías completas
                                </p>
                            </div>
                            <ChevronRight
                                size={20}
                                style={{ color: theme.accent }}
                                className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                            />
                        </div>
                    </button>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
