
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

// --- PREMIUM COMPONENTS ---

const PremiumToggle: React.FC<{
    active: boolean;
    onClick: () => void;
    theme: ThemeConfig;
}> = ({ active, onClick, theme }) => (
    <button
        onClick={onClick}
        className="relative w-12 h-7 rounded-full transition-all duration-300 shadow-inner group focus:outline-none"
        style={{
            backgroundColor: active ? theme.accent : 'rgba(255,255,255,0.1)',
            boxShadow: active
                ? `inset 0 2px 4px rgba(0,0,0,0.3), 0 0 10px ${theme.accent}40`
                : 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}
    >
        <div className={`
            absolute top-1 w-5 h-5 bg-white rounded-full 
            transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
            shadow-[0_2px_4px_rgba(0,0,0,0.2)]
            group-active:scale-90 flex items-center justify-center
            ${active ? 'left-6' : 'left-1'}
        `}>
             {/* Micro visual feedback */}
             {active && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" style={{ color: theme.accent }} />}
        </div>
    </button>
);

const AudioWaveform: React.FC<{
    volume: number;
    onChange: (v: number) => void;
    theme: ThemeConfig;
}> = ({ volume, onChange, theme }) => {
    return (
        <div className="relative h-8 w-full flex items-center gap-1 group cursor-pointer"
             onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const pct = Math.max(0, Math.min(1, x / rect.width));
                 onChange(pct);
             }}
             onMouseMove={(e) => {
                 if (e.buttons === 1) {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left;
                     const pct = Math.max(0, Math.min(1, x / rect.width));
                     onChange(pct);
                 }
             }}
        >
            {[...Array(20)].map((_, i) => {
                const isActive = volume * 20 > i;
                const height = 4 + (Math.sin(i * 0.5) * 4) + (isActive ? 8 : 0);
                return (
                    <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-200 ease-out"
                        style={{
                            height: `${height}px`,
                            backgroundColor: isActive ? theme.accent : 'rgba(255,255,255,0.1)',
                            opacity: isActive ? 1 : 0.3,
                            boxShadow: isActive ? `0 0 8px ${theme.accent}60` : 'none'
                        }}
                    />
                );
            })}
        </div>
    );
};

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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500" />
            <div 
                style={{ backgroundColor: isPremiumActive ? `${theme.bg}F5` : theme.bg }}
                className="absolute inset-0 flex flex-col overflow-hidden"
            >
                {/* Background Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)\'/%3E%3C/svg%3E")` }} 
                />
                
                <header className="relative z-10 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/10 to-transparent shadow-sm">
                    <div className="flex flex-col">
                        <h2 style={{ color: theme.text }} className="text-3xl font-black italic tracking-tighter drop-shadow-sm">SISTEMA</h2>
                        <span style={{ color: theme.sub }} className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                            Configuración v2.5 • Ultra
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        style={{ color: theme.text }}
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="relative flex-1 overflow-hidden">
                    {/* Blur Gradients for Scroll */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />

                    <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 relative z-0 pb-32 scroll-smooth">
                        
                        {/* 1. MOTOR VISUAL (THEMES) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2 opacity-80">
                                    <Monitor size={14} style={{ color: theme.accent }} />
                                    <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        Motor Visual ({totalThemes})
                                    </h3>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex p-1 rounded-2xl border border-white/5 bg-black/20 overflow-x-auto no-scrollbar gap-1 sticky top-0 z-20 backdrop-blur-md shadow-lg">
                                {(Object.keys(themeCategories) as ThemeCategory[]).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap relative overflow-hidden ${activeTab === cat ? 'text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        {activeTab === cat && (
                                            <div className="absolute inset-0 bg-white/10 animate-in fade-in zoom-in duration-300" />
                                        )}
                                        <span className="relative z-10">{cat}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {themeCategories[activeTab].map(t => {
                                    const isActive = themeName === t;
                                    const tConfig = THEMES[t];
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setThemeName(t)}
                                            className={`relative group h-24 rounded-2xl border overflow-hidden transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) ${isActive ? 'ring-2 ring-offset-2 ring-offset-black/50 scale-[1.02]' : 'hover:scale-[0.98] opacity-80 hover:opacity-100'}`}
                                            style={{ backgroundColor: tConfig.bg, borderColor: isActive ? tConfig.accent : 'rgba(255,255,255,0.1)', '--tw-ring-color': tConfig.accent } as React.CSSProperties}
                                        >
                                            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `linear-gradient(135deg, ${tConfig.cardBg} 0%, transparent 100%)` }} />
                                            {isActive && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: tConfig.accent, color: tConfig.accent }} />
                                            )}
                                            <div className="absolute bottom-3 left-3 text-left">
                                                <p className="text-xs font-black uppercase tracking-wider shadow-black drop-shadow-sm" style={{ color: tConfig.text }}>{tConfig.name}</p>
                                                <div className="flex gap-1 mt-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tConfig.accent }} />
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tConfig.sub }} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 2. AUDIO & FX */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 opacity-80 px-1">
                                <Cpu size={14} style={{ color: theme.accent }} />
                                <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Experiencia Sensorial
                                </h3>
                            </div>

                            <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-5">
                                {/* Volume */}
                                {setVolume && volume !== undefined && (
                                    <div className="space-y-3 pb-4 border-b border-white/5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {gameState.settings.soundEnabled ? <Volume2 size={16} style={{ color: theme.text }} /> : <VolumeX size={16} style={{ color: theme.sub }} />}
                                                <span style={{ color: theme.text }} className="text-xs font-bold">Volumen Maestro</span>
                                            </div>
                                            <PremiumToggle 
                                                active={gameState.settings.soundEnabled} 
                                                onClick={() => onUpdateSettings({ soundEnabled: !gameState.settings.soundEnabled })} 
                                                theme={theme} 
                                            />
                                        </div>
                                        {gameState.settings.soundEnabled && (
                                            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                                <AudioWaveform volume={volume} onChange={setVolume} theme={theme} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Other Toggles */}
                                <div className="grid gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/5 text-white"><Layers size={16} /></div>
                                            <div className="flex flex-col">
                                                <span style={{ color: theme.text }} className="text-xs font-bold">Animación de Barajado</span>
                                                <span style={{ color: theme.sub }} className="text-[9px] opacity-60">Visualización 3D de cartas</span>
                                            </div>
                                        </div>
                                        <PremiumToggle 
                                            active={gameState.settings.shuffleEnabled} 
                                            onClick={() => onUpdateSettings({ shuffleEnabled: !gameState.settings.shuffleEnabled })} 
                                            theme={theme} 
                                        />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/5 text-white"><Sparkles size={16} /></div>
                                            <div className="flex flex-col">
                                                <span style={{ color: theme.text }} className="text-xs font-bold">Efectos FX</span>
                                                <span style={{ color: theme.sub }} className="text-[9px] opacity-60">Partículas y feedback háptico</span>
                                            </div>
                                        </div>
                                        <PremiumToggle 
                                            active={gameState.settings.impostorEffects} 
                                            onClick={() => onUpdateSettings({ impostorEffects: !gameState.settings.impostorEffects })} 
                                            theme={theme} 
                                        />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/5 text-white"><Smartphone size={16} /></div>
                                            <div className="flex flex-col">
                                                <span style={{ color: theme.text }} className="text-xs font-bold">Modo Pases</span>
                                                <span style={{ color: theme.sub }} className="text-[9px] opacity-60">Pantalla intermedia de seguridad</span>
                                            </div>
                                        </div>
                                        <PremiumToggle 
                                            active={gameState.settings.passPhoneMode} 
                                            onClick={() => onUpdateSettings({ passPhoneMode: !gameState.settings.passPhoneMode })} 
                                            theme={theme} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. REVEAL METHOD */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 opacity-80 px-1">
                                <MousePointer2 size={14} style={{ color: theme.accent }} />
                                <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Método de Revelación
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onUpdateSettings({ revealMethod: 'hold' })}
                                    className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-[0.98]"
                                    style={{ 
                                        backgroundColor: gameState.settings.revealMethod === 'hold' ? `${theme.accent}15` : theme.cardBg,
                                        borderColor: gameState.settings.revealMethod === 'hold' ? theme.accent : theme.border,
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Volume2 size={20} style={{ color: theme.text }} className="opacity-80" />
                                        {gameState.settings.revealMethod === 'hold' && <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: theme.accent, color: theme.accent }} />}
                                    </div>
                                    <p style={{ color: theme.text }} className="text-sm font-bold">Mantener</p>
                                    <p style={{ color: theme.sub }} className="text-[9px] opacity-60 uppercase mt-1">Clásico táctil</p>
                                </button>

                                <button
                                    onClick={() => onUpdateSettings({ revealMethod: 'swipe' })}
                                    className="p-4 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-[0.98]"
                                    style={{ 
                                        backgroundColor: gameState.settings.revealMethod === 'swipe' ? `${theme.accent}15` : theme.cardBg,
                                        borderColor: gameState.settings.revealMethod === 'swipe' ? theme.accent : theme.border,
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <ChevronUp size={20} style={{ color: theme.text }} className="opacity-80" />
                                        <span className="text-[8px] font-black bg-white/10 px-1.5 py-0.5 rounded text-white backdrop-blur-sm">NEW</span>
                                    </div>
                                    <p style={{ color: theme.text }} className="text-sm font-bold">Deslizar</p>
                                    <p style={{ color: theme.sub }} className="text-[9px] opacity-60 uppercase mt-1">Swipe interactivo</p>
                                </button>
                            </div>

                            {/* Sensitivity Options */}
                            {gameState.settings.revealMethod === 'swipe' && (
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3 animate-in fade-in zoom-in duration-300">
                                    <div className="flex justify-between items-center">
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Sensibilidad</span>
                                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                                            {(['low', 'medium', 'high'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => onUpdateSettings({ swipeSensitivity: s })}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${gameState.settings.swipeSensitivity === s ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {s === 'low' ? 'Baja' : s === 'medium' ? 'Med' : 'Alta'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Vibración Háptica</span>
                                        <PremiumToggle 
                                            active={gameState.settings.hapticFeedback} 
                                            onClick={() => onUpdateSettings({ hapticFeedback: !gameState.settings.hapticFeedback })} 
                                            theme={theme} 
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 4. CATEGORY LOGIC */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 opacity-80 px-1">
                                <Filter size={14} style={{ color: theme.accent }} />
                                <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    Lógica de Categorías
                                </h3>
                            </div>

                            <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-5">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Anti-Repetición</span>
                                        <span style={{ color: theme.sub }} className="text-[9px] opacity-60">Control de frecuencia</span>
                                    </div>
                                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                                        {(['none', 'soft', 'medium', 'hard'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => onUpdateSettings({ categoryRepetitionAvoidance: mode })}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${gameState.settings.categoryRepetitionAvoidance === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {mode === 'none' ? 'Off' : mode === 'soft' ? 'Bajo' : mode === 'medium' ? 'Med' : 'Alto'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-white/5">
                                    {[
                                        { label: 'Boost de Rareza', sub: 'Priorizar temas poco usados', icon: <Star size={12} className="text-yellow-400" />, active: gameState.settings.rareCategoryBoost, toggle: () => onUpdateSettings({ rareCategoryBoost: !gameState.settings.rareCategoryBoost }) },
                                        { label: 'Modo Rotación', sub: 'Orden secuencial estricto', icon: <Repeat size={12} style={{ color: theme.accent }} />, active: gameState.settings.rotationMode, toggle: () => onUpdateSettings({ rotationMode: !gameState.settings.rotationMode }) },
                                        { label: 'Modo Explorador', sub: 'Baraja de cartas (sin repetir)', icon: <Compass size={12} className="text-emerald-400" />, active: gameState.settings.explorerMode, toggle: () => onUpdateSettings({ explorerMode: !gameState.settings.explorerMode }) }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    {item.icon}
                                                    <span style={{ color: theme.text }} className="text-xs font-bold">{item.label}</span>
                                                </div>
                                                <span style={{ color: theme.sub }} className="text-[9px] opacity-60 pl-5">{item.sub}</span>
                                            </div>
                                            <PremiumToggle active={item.active || false} onClick={item.toggle} theme={theme} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 5. MEMORY MODE CONFIG */}
                        {gameState.settings.memoryModeConfig.enabled && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 opacity-80 px-1">
                                    <Brain size={14} style={{ color: theme.accent }} />
                                    <h3 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        Ajustes de Memoria
                                    </h3>
                                </div>
                                
                                <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="space-y-2">
                                        <span style={{ color: theme.text }} className="text-xs font-bold">Dificultad</span>
                                        <div className="grid grid-cols-4 gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                                            {(['easy', 'normal', 'hard', 'extreme'] as const).map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => handleMemoryDifficultyChange(d)}
                                                    className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${gameState.settings.memoryModeConfig.difficulty === d ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {d === 'easy' ? 'Fácil' : d === 'normal' ? 'Normal' : d === 'hard' ? 'Difícil' : 'Extr.'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {[
                                            { val: gameState.settings.memoryModeConfig.displayTime + 's', lbl: 'Tiempo' },
                                            { val: gameState.settings.memoryModeConfig.wordCount, lbl: 'Palabras' },
                                            { val: Math.round(gameState.settings.memoryModeConfig.highlightIntensity * 100) + '%', lbl: 'Pista' }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                                <p style={{ color: theme.accent }} className="text-lg font-black">{stat.val}</p>
                                                <p style={{ color: theme.sub }} className="text-[8px] uppercase opacity-60 font-bold">{stat.lbl}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {gameState.settings.memoryModeConfig.difficulty === 'extreme' && (
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <Zap size={16} className="text-red-400 shrink-0" />
                                            <p className="text-[10px] text-red-200 font-bold leading-tight">
                                                Sin ayuda visual. Debes encontrar la palabra correcta solo por contexto (imposible) o pura intuición.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <button
                            onClick={onOpenHowToPlay}
                            className="w-full relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] group"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-full bg-black/20 group-hover:bg-white/10 transition-colors" style={{ color: theme.text }}>
                                    <BookOpen size={20} />
                                </div>
                                <div className="space-y-0.5 text-left">
                                    <p style={{ color: theme.text }} className="text-xs font-black uppercase tracking-wide">Manual Operativo</p>
                                    <p style={{ color: theme.sub }} className="text-[9px] font-mono opacity-60 uppercase truncate">REGLAS, ROLES Y GUÍA</p>
                                </div>
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};
