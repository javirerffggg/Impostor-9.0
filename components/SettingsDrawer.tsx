import React, { useState } from 'react';
import { ThemeConfig, ThemeName, GameState } from '../types';
import { THEMES } from '../constants';
import { X, BookOpen, Volume2, VolumeX, Cpu, Monitor, Smartphone } from 'lucide-react';

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
}

type ThemeCategory = 'exclusivo' | 'sensorial' | 'oscuro' | 'vibrante' | 'retro';

export const SettingsDrawer: React.FC<Props> = ({ 
    isOpen, onClose, theme, themeName, setThemeName, gameState, onUpdateSettings, onOpenHowToPlay, onBackToHome 
}) => {
    // Categorización de temas
    const themeCategories: Record<ThemeCategory, ThemeName[]> = {
        exclusivo: ['luminous', 'aura'],
        sensorial: ['silk_soul', 'nebula_dream', 'crystal_garden', 'aurora_borealis', 'liquid_gold', 'luminescent_ocean', 'zen_sunset'],
        oscuro: ['midnight', 'obsidian', 'space', 'zenith', 'bond', 'noir', 'protocol', 'ethereal'],
        vibrante: ['cyber', 'nightclub', 'solar', 'illojuan', 'material'],
        retro: ['terminal84', 'turing', 'paper', 'soft']
    };

    // Determinar la categoría inicial basada en el tema seleccionado
    const getInitialCategory = (name: ThemeName): ThemeCategory => {
        for (const [cat, themes] of Object.entries(themeCategories)) {
            if (themes.includes(name)) return cat as ThemeCategory;
        }
        return 'sensorial';
    };

    const [activeTab, setActiveTab] = useState<ThemeCategory>(() => getInitialCategory(themeName));

    const totalThemes = Object.keys(THEMES).length;
    const isPremiumActive = themeName === 'aura' || themeName === 'luminous' || themeCategories.sensorial.includes(themeName);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
            {/* Background Backdrop with Blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            
            {/* Main Container */}
            <div 
                style={{ backgroundColor: isPremiumActive ? `${theme.bg}F0` : theme.bg }}
                className="absolute inset-0 flex flex-col overflow-hidden"
            >
                {/* Decorative Noise & Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)\'/%3E%3C/svg%3E")` }} 
                />
                
                {/* HEADER */}
                <header className="relative z-10 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                    <div className="flex flex-col">
                        <h2 style={{ color: theme.text }} className="text-3xl font-black italic tracking-tighter">SISTEMA</h2>
                        <span style={{ color: theme.sub }} className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                            Configuración v2.1 • Build 8403
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors active:scale-95"
                        style={{ color: theme.text }}
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 relative z-10 pb-12">
                    
                    {/* SECTION 1: CONTROL SENSORIAL */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 opacity-60 px-1">
                            <Cpu size={12} style={{ color: theme.text }} />
                            <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Módulos de Experiencia
                            </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {/* AUDIO MODULE */}
                            <button
                                onClick={() => onUpdateSettings({ soundEnabled: !gameState.settings.soundEnabled })}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.soundEnabled ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.soundEnabled ? theme.accent : theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div 
                                        className={`p-2 rounded-full transition-colors ${gameState.settings.soundEnabled ? 'bg-white/20' : 'bg-black/20'}`}
                                        style={{ color: theme.text }}
                                    >
                                        {gameState.settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Audio</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">
                                        {gameState.settings.soundEnabled ? 'On' : 'Off'}
                                    </p>
                                </div>
                            </button>

                            {/* PASS PHONE MODULE */}
                            <button
                                onClick={() => onUpdateSettings({ passPhoneMode: !gameState.settings.passPhoneMode })}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.passPhoneMode ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.passPhoneMode ? theme.accent : theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div 
                                        className={`p-2 rounded-full transition-colors ${gameState.settings.passPhoneMode ? 'bg-white/20' : 'bg-black/20'}`}
                                        style={{ color: theme.text }}
                                    >
                                        <Smartphone size={18} />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Pases</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">
                                        {gameState.settings.passPhoneMode ? 'On' : 'Off'}
                                    </p>
                                </div>
                            </button>

                            {/* MANUAL MODULE */}
                            <button
                                onClick={onOpenHowToPlay}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div 
                                        className="p-2 rounded-full bg-black/20"
                                        style={{ color: theme.text }}
                                    >
                                        <BookOpen size={18} />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Manual</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">
                                        REGLAS
                                    </p>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* SECTION 2: MOTOR VISUAL (THEMES) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-60">
                                <Monitor size={12} style={{ color: theme.text }} />
                                <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Motor Visual ({totalThemes})
                                </h3>
                            </div>
                        </div>

                        {/* Theme Tabs */}
                        <div className="flex p-1 rounded-xl border border-white/5 bg-black/20 overflow-x-auto no-scrollbar gap-1">
                            {(Object.keys(themeCategories) as ThemeCategory[]).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                        activeTab === cat 
                                            ? 'bg-white/10 text-white shadow-sm' 
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Theme Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {themeCategories[activeTab].map(t => {
                                const isActive = themeName === t;
                                const tConfig = THEMES[t];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setThemeName(t)}
                                        className={`relative group h-24 rounded-xl border overflow-hidden transition-all duration-300 ${
                                            isActive ? 'ring-2 ring-offset-1 ring-offset-black scale-[1.02]' : 'hover:scale-[0.98] opacity-80 hover:opacity-100'
                                        }`}
                                        style={{ 
                                            backgroundColor: tConfig.bg,
                                            borderColor: isActive ? tConfig.accent : 'rgba(255,255,255,0.1)',
                                            '--tw-ring-color': tConfig.accent
                                        } as React.CSSProperties}
                                    >
                                        {/* Theme Preview Elements */}
                                        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${tConfig.cardBg} 0%, transparent 100%)` }} />
                                        
                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tConfig.accent, boxShadow: `0 0 10px ${tConfig.accent}` }} />
                                        )}

                                        <div className="absolute bottom-3 left-3 text-left">
                                            <p 
                                                className="text-xs font-black uppercase tracking-wider"
                                                style={{ color: tConfig.text }}
                                            >
                                                {tConfig.name}
                                            </p>
                                            <div className="flex gap-1 mt-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tConfig.accent }} />
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tConfig.sub }} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
                
            </div>
        </div>
    );
};