

import React, { useState } from 'react';
import { ThemeConfig, ThemeName, GameState, MemoryDifficulty } from '../types';
import { THEMES } from '../constants';
import { X, BookOpen, Volume2, VolumeX, Cpu, Monitor, Smartphone, Layers, MousePointer2, ChevronUp, Brain, Zap, Sparkles, Filter, Star, Repeat, Compass } from 'lucide-react';
import { getMemoryConfigForDifficulty } from '../utils/memoryWordGenerator';

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

type ThemeCategory = 'exclusivo' | 'sensorial' | 'oscuro' | 'vibrante' | 'retro';

export const SettingsDrawer: React.FC<Props> = ({ 
    isOpen, onClose, theme, themeName, setThemeName, gameState, onUpdateSettings, onOpenHowToPlay, onBackToHome, volume, setVolume 
}) => {
    const themeCategories: Record<ThemeCategory, ThemeName[]> = {
        exclusivo: ['luminous', 'aura'],
        sensorial: ['silk_soul', 'nebula_dream', 'crystal_garden', 'aurora_borealis', 'liquid_gold', 'luminescent_ocean', 'zen_sunset'],
        oscuro: ['midnight', 'obsidian', 'space', 'zenith', 'bond', 'noir', 'protocol', 'ethereal'],
        vibrante: ['cyber', 'nightclub', 'solar', 'illojuan', 'material'],
        retro: ['terminal84', 'turing', 'paper', 'soft']
    };

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

    const handleMemoryDifficultyChange = (difficulty: MemoryDifficulty) => {
        const config = getMemoryConfigForDifficulty(difficulty);
        onUpdateSettings({
            memoryModeConfig: {
                ...gameState.settings.memoryModeConfig,
                difficulty,
                ...config
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <div 
                style={{ backgroundColor: isPremiumActive ? `${theme.bg}F0` : theme.bg }}
                className="absolute inset-0 flex flex-col overflow-hidden"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)\'/%3E%3C/svg%3E")` }} 
                />
                
                <header className="relative z-10 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                    <div className="flex flex-col">
                        <h2 style={{ color: theme.text }} className="text-3xl font-black italic tracking-tighter">SISTEMA</h2>
                        <span style={{ color: theme.sub }} className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                            Configuración v2.4 • Build 9045
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

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 relative z-10 pb-12">
                    
                    {/* CATEGORY LOGIC SETTINGS */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 opacity-60 px-1">
                            <Filter size={12} style={{ color: theme.text }} />
                            <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Lógica de Categorías
                            </h3>
                        </div>

                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span style={{ color: theme.text }} className="text-xs font-bold">Anti-Repetición</span>
                                    <span style={{ color: theme.sub }} className="text-[8px] opacity-70">Frecuencia de temas</span>
                                </div>
                                <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                    {(['none', 'soft', 'medium', 'hard'] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => onUpdateSettings({ categoryRepetitionAvoidance: mode })}
                                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${gameState.settings.categoryRepetitionAvoidance === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
                                        >
                                            {mode === 'none' ? 'Off' : mode === 'soft' ? 'Bajo' : mode === 'medium' ? 'Med' : 'Alto'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={10} className="text-yellow-400" fill="currentColor" />
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Boost de Rareza</span>
                                    </div>
                                    <span style={{ color: theme.sub }} className="text-[8px] opacity-70">Priorizar temas poco usados</span>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ rareCategoryBoost: !gameState.settings.rareCategoryBoost })}
                                    className="w-10 h-6 rounded-full relative transition-all"
                                    style={{ backgroundColor: gameState.settings.rareCategoryBoost ? theme.accent : 'rgba(255,255,255,0.1)' }}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameState.settings.rareCategoryBoost ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <Repeat size={10} style={{ color: theme.accent }} />
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Modo Rotación</span>
                                    </div>
                                    <span style={{ color: theme.sub }} className="text-[8px] opacity-70">Secuencial estricto</span>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ rotationMode: !gameState.settings.rotationMode })}
                                    className="w-10 h-6 rounded-full relative transition-all"
                                    style={{ backgroundColor: gameState.settings.rotationMode ? theme.accent : 'rgba(255,255,255,0.1)' }}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameState.settings.rotationMode ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <Compass size={10} className="text-emerald-400" />
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Modo Explorador</span>
                                    </div>
                                    <span style={{ color: theme.sub }} className="text-[8px] opacity-70">Garantiza variedad total (Deck)</span>
                                </div>
                                <button 
                                    onClick={() => onUpdateSettings({ explorerMode: !gameState.settings.explorerMode })}
                                    className="w-10 h-6 rounded-full relative transition-all"
                                    style={{ backgroundColor: gameState.settings.explorerMode ? theme.accent : 'rgba(255,255,255,0.1)' }}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameState.settings.explorerMode ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* MEMORY MODE SETTINGS (IF ENABLED) */}
                    {gameState.settings.memoryModeConfig.enabled && (
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 opacity-60 px-1">
                                <Brain size={12} style={{ color: theme.text }} />
                                <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Configuración de Memoria
                                </h3>
                            </div>
                            
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="space-y-2">
                                    <span style={{ color: theme.text }} className="text-xs font-bold">Dificultad</span>
                                    <div className="grid grid-cols-4 gap-1 bg-black/40 rounded-lg p-0.5 border border-white/5">
                                        {(['easy', 'normal', 'hard', 'extreme'] as const).map(d => (
                                            <button
                                                key={d}
                                                onClick={() => handleMemoryDifficultyChange(d)}
                                                className={`py-2 rounded-md text-[8px] font-black uppercase transition-all ${gameState.settings.memoryModeConfig.difficulty === d ? 'bg-white/10 text-white' : 'text-white/40'}`}
                                            >
                                                {d === 'easy' ? 'Fácil' : d === 'normal' ? 'Normal' : d === 'hard' ? 'Difícil' : 'Extremo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                        <p style={{ color: theme.accent }} className="text-lg font-black">{gameState.settings.memoryModeConfig.displayTime}s</p>
                                        <p style={{ color: theme.sub }} className="text-[8px] uppercase opacity-60">Tiempo</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                        <p style={{ color: theme.accent }} className="text-lg font-black">{gameState.settings.memoryModeConfig.wordCount}</p>
                                        <p style={{ color: theme.sub }} className="text-[8px] uppercase opacity-60">Palabras</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                        <p style={{ color: theme.accent }} className="text-lg font-black">{Math.round(gameState.settings.memoryModeConfig.highlightIntensity * 100)}%</p>
                                        <p style={{ color: theme.sub }} className="text-[8px] uppercase opacity-60">Pista Visual</p>
                                    </div>
                                </div>

                                {gameState.settings.memoryModeConfig.difficulty === 'extreme' && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <Zap size={14} className="text-red-400 shrink-0" />
                                        <p className="text-[9px] text-red-300 font-bold leading-tight">
                                            Sin ayuda visual. Debes encontrar la palabra correcta solo por contexto (imposible) o suerte. ¡Solo para expertos!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* REVEAL METHOD SELECTION */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 opacity-60 px-1">
                            <MousePointer2 size={12} style={{ color: theme.text }} />
                            <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Método de Revelación
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onUpdateSettings({ revealMethod: 'hold' })}
                                className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                style={{ 
                                    backgroundColor: gameState.settings.revealMethod === 'hold' ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.revealMethod === 'hold' ? theme.accent : theme.border,
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Volume2 size={16} style={{ color: theme.text }} className="opacity-60" />
                                    {gameState.settings.revealMethod === 'hold' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />}
                                </div>
                                <p style={{ color: theme.text }} className="text-sm font-bold">Mantener</p>
                                <p style={{ color: theme.sub }} className="text-[9px] opacity-60 uppercase">Clásico táctil</p>
                            </button>

                            <button
                                onClick={() => onUpdateSettings({ revealMethod: 'swipe' })}
                                className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden"
                                style={{ 
                                    backgroundColor: gameState.settings.revealMethod === 'swipe' ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.revealMethod === 'swipe' ? theme.accent : theme.border,
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <ChevronUp size={16} style={{ color: theme.text }} className="opacity-60" />
                                    <span className="text-[8px] font-black bg-white/10 px-1 rounded text-white">NEW</span>
                                </div>
                                <p style={{ color: theme.text }} className="text-sm font-bold">Deslizar</p>
                                <p style={{ color: theme.sub }} className="text-[9px] opacity-60 uppercase">Swipe interactivo</p>
                            </button>
                        </div>

                        {gameState.settings.revealMethod === 'swipe' && (
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center">
                                    <span style={{ color: theme.text }} className="text-xs font-bold">Sensibilidad</span>
                                    <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                                        {(['low', 'medium', 'high'] as const).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => onUpdateSettings({ swipeSensitivity: s })}
                                                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${gameState.settings.swipeSensitivity === s ? 'bg-white/10 text-white' : 'text-white/40'}`}
                                            >
                                                {s === 'low' ? 'Baja' : s === 'medium' ? 'Med' : 'Alta'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span style={{ color: theme.text }} className="text-xs font-bold">Vibración Háptica</span>
                                    <button 
                                        onClick={() => onUpdateSettings({ hapticFeedback: !gameState.settings.hapticFeedback })}
                                        className="w-10 h-6 rounded-full relative transition-all"
                                        style={{ backgroundColor: gameState.settings.hapticFeedback ? theme.accent : 'rgba(255,255,255,0.1)' }}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameState.settings.hapticFeedback ? 'left-5' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SECTION 1: CONTROL SENSORIAL */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 opacity-60 px-1">
                            <Cpu size={12} style={{ color: theme.text }} />
                            <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                Módulos de Experiencia
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div
                                className="col-span-1 relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.soundEnabled ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.soundEnabled ? theme.accent : theme.border,
                                }}
                            >
                                <button
                                    onClick={() => onUpdateSettings({ soundEnabled: !gameState.settings.soundEnabled })}
                                    className="w-full flex flex-col items-center"
                                >
                                    <div className="mb-3">
                                        <div className={`p-2 rounded-full transition-colors ${gameState.settings.soundEnabled ? 'bg-white/20' : 'bg-black/20'}`} style={{ color: theme.text }}>
                                            {gameState.settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Audio</p>
                                        <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">{gameState.settings.soundEnabled ? 'On' : 'Off'}</p>
                                    </div>
                                </button>

                                {/* Visual Indicator */}
                                {gameState.settings.soundEnabled && (
                                    <div className="flex items-center gap-1 absolute top-3 right-3 opacity-50">
                                        <div className="w-0.5 h-2 bg-current rounded-full animate-[bounce_1s_infinite] delay-0" style={{ color: theme.text }} />
                                        <div className="w-0.5 h-3 bg-current rounded-full animate-[bounce_1.2s_infinite] delay-100" style={{ color: theme.text }} />
                                        <div className="w-0.5 h-2 bg-current rounded-full animate-[bounce_0.8s_infinite] delay-200" style={{ color: theme.text }} />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onUpdateSettings({ shuffleEnabled: !gameState.settings.shuffleEnabled })}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.shuffleEnabled ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.shuffleEnabled ? theme.accent : theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div className={`p-2 rounded-full transition-colors ${gameState.settings.shuffleEnabled ? 'bg-white/20' : 'bg-black/20'}`} style={{ color: theme.text }}>
                                        <Layers size={18} />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Animación</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">{gameState.settings.shuffleEnabled ? 'On' : 'Off'}</p>
                                </div>
                            </button>

                            <button
                                onClick={() => onUpdateSettings({ impostorEffects: !gameState.settings.impostorEffects })}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.impostorEffects ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.impostorEffects ? theme.accent : theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div className={`p-2 rounded-full transition-colors ${gameState.settings.impostorEffects ? 'bg-white/20' : 'bg-black/20'}`} style={{ color: theme.text }}>
                                        <Sparkles size={18} />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Efectos FX</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">Confeti/Shake</p>
                                </div>
                            </button>

                            <button
                                onClick={() => onUpdateSettings({ passPhoneMode: !gameState.settings.passPhoneMode })}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center"
                                style={{ 
                                    backgroundColor: gameState.settings.passPhoneMode ? `${theme.accent}15` : theme.cardBg,
                                    borderColor: gameState.settings.passPhoneMode ? theme.accent : theme.border,
                                }}
                            >
                                <div className="mb-3">
                                    <div className={`p-2 rounded-full transition-colors ${gameState.settings.passPhoneMode ? 'bg-white/20' : 'bg-black/20'}`} style={{ color: theme.text }}>
                                        <Smartphone size={18} />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Pases</p>
                                    <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">{gameState.settings.passPhoneMode ? 'On' : 'Off'}</p>
                                </div>
                            </button>

                            <button
                                onClick={onOpenHowToPlay}
                                className="relative group overflow-hidden p-3 rounded-2xl border transition-all duration-300 active:scale-[0.98] flex flex-col items-center text-center col-span-2"
                                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-black/20" style={{ color: theme.text }}>
                                        <BookOpen size={18} />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <p style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-wide">Manual Operativo</p>
                                        <p style={{ color: theme.sub }} className="text-[8px] font-mono opacity-60 uppercase truncate">REGLAS Y GUÍA</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Volume Slider - Only show if volume prop is available and sound enabled */}
                        {setVolume && volume !== undefined && gameState.settings.soundEnabled && (
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2 animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                    <span style={{ color: theme.text }}>Volumen Maestro</span>
                                    <span style={{ color: theme.sub }}>{Math.round(volume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume * 100}
                                    onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        accentColor: theme.accent
                                    }}
                                />
                            </div>
                        )}
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

                        <div className="flex p-1 rounded-xl border border-white/5 bg-black/20 overflow-x-auto no-scrollbar gap-1">
                            {(Object.keys(themeCategories) as ThemeCategory[]).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === cat ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {themeCategories[activeTab].map(t => {
                                const isActive = themeName === t;
                                const tConfig = THEMES[t];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setThemeName(t)}
                                        className={`relative group h-24 rounded-xl border overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-offset-1 ring-offset-black scale-[1.02]' : 'hover:scale-[0.98] opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: tConfig.bg, borderColor: isActive ? tConfig.accent : 'rgba(255,255,255,0.1)', '--tw-ring-color': tConfig.accent } as React.CSSProperties}
                                    >
                                        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${tConfig.cardBg} 0%, transparent 100%)` }} />
                                        {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tConfig.accent, boxShadow: `0 0 10px ${tConfig.accent}` }} />}
                                        <div className="absolute bottom-3 left-3 text-left">
                                            <p className="text-xs font-black uppercase tracking-wider" style={{ color: tConfig.text }}>{tConfig.name}</p>
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