
import React, { useState } from 'react';
import { ThemeConfig, ThemeName, GameState, MemoryDifficulty } from '../types';
import { THEMES } from '../constants';
import { X, BookOpen, Volume2, VolumeX, Cpu, Monitor, Smartphone, Layers, MousePointer2, ChevronUp, Brain, Zap, Sparkles, Filter, Star, Repeat, Compass, ChevronRight } from 'lucide-react';
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

// --- SYSTEM COMPONENTS ---

const SectionContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <section className={`space-y-4 ${className}`}>
    {children}
  </section>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  theme: ThemeConfig;
}> = ({ icon, title, subtitle, badge, theme }) => (
  <div 
    className="
      flex items-center justify-between px-2 py-2 mb-2
    "
  >
    <div className="flex items-center gap-3">
      <div 
        className="p-2 rounded-xl"
        style={{ 
          backgroundColor: `${theme.accent}15`,
          color: theme.accent 
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 
          className="text-xs font-black uppercase tracking-wider"
          style={{ color: theme.text }}
        >
          {title}
        </h3>
        {subtitle && (
          <span 
            className="text-[9px] font-mono opacity-60"
            style={{ color: theme.sub }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
    
    {badge && (
      <div 
        className="px-2 py-1 rounded-lg text-[8px] font-black uppercase"
        style={{
          backgroundColor: `${theme.accent}20`,
          color: theme.accent
        }}
      >
        {badge}
      </div>
    )}
  </div>
);

const ContentCard: React.FC<{
  children: React.ReactNode;
  theme: ThemeConfig;
  variant?: 'default' | 'glass' | 'solid';
}> = ({ children, theme, variant = 'default' }) => (
  <div 
    className="p-5 rounded-[24px] border backdrop-blur-2xl relative overflow-hidden group"
    style={{
      backgroundColor: variant === 'glass' 
        ? `${theme.cardBg}40`
        : `${theme.cardBg}F5`,
      borderColor: theme.border,
      boxShadow: `
        0 20px 60px -15px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
      `
    }}
  >
    <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.accent}, transparent 70%)`
        }}
    />
    <div className="relative z-10">
        {children}
    </div>
  </div>
);

const SettingRow: React.FC<{
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  action: React.ReactNode;
  theme: ThemeConfig;
  noBorder?: boolean;
}> = ({ icon, iconColor, title, subtitle, action, theme, noBorder = false }) => (
  <div 
    className={`
      flex items-center justify-between gap-4 py-3
      ${!noBorder ? 'border-b' : ''}
      last:border-0
    `}
    style={{
      borderColor: `${theme.border}30`
    }}
  >
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {icon && (
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ 
            backgroundColor: `${iconColor || theme.accent}15`,
            color: iconColor || theme.accent 
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <span 
          className="text-sm font-bold truncate"
          style={{ color: theme.text }}
        >
          {title}
        </span>
        {subtitle && (
          <span 
            className="text-[10px] font-medium opacity-60 truncate"
            style={{ color: theme.sub }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
    <div className="shrink-0">
      {action}
    </div>
  </div>
);

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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500" onClick={onClose} />
            <div 
                style={{ backgroundColor: isPremiumActive ? `${theme.bg}F5` : theme.bg }}
                className="absolute inset-0 flex flex-col overflow-hidden"
            >
                {/* Background Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)\'/%3E%3C/svg%3E")` }} 
                />
                
                {/* Fixed Floating Close Button */}
                <div className="absolute top-0 right-0 z-50 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pointer-events-none">
                    <button 
                        onClick={onClose}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 pointer-events-auto backdrop-blur-md border shadow-lg hover:bg-white/10"
                        style={{ 
                            backgroundColor: `${theme.bg}80`, 
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: theme.text 
                        }}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="relative flex-1 overflow-hidden">
                    {/* Blur Gradients for Scroll */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />

                    <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 relative z-0 pb-32 scroll-smooth no-scrollbar">
                        
                        {/* HEADER IN CONTENT */}
                        <div className="pt-[calc(1.5rem+env(safe-area-inset-top))]">
                            <h2 style={{ color: theme.text }} className="text-3xl font-black italic tracking-tighter drop-shadow-sm mb-2">SISTEMA</h2>
                            <div className="flex items-center gap-2">
                                <span style={{ color: theme.sub }} className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                                    Configuración v2.5 • Ultra
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                        </div>

                        {/* 1. MOTOR VISUAL */}
                        <SectionContainer>
                          <SectionHeader
                            icon={<Monitor size={16} />}
                            title="Motor Visual"
                            subtitle={`${totalThemes} temas disponibles`}
                            badge={isPremiumActive ? "PREMIUM" : undefined}
                            theme={theme}
                          />
                          
                          {/* Tabs */}
                          <div 
                            className="
                              sticky top-0 z-20 
                              p-1.5 rounded-2xl border backdrop-blur-2xl
                              shadow-lg mb-4
                            "
                            style={{
                              backgroundColor: `${theme.bg}F0`,
                              borderColor: `${theme.border}50`
                            }}
                          >
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                              {(Object.keys(themeCategories) as ThemeCategory[]).map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => setActiveTab(cat)}
                                  className={`
                                    flex-1 min-w-[80px] py-2.5 px-4 rounded-xl
                                    text-[10px] font-black uppercase tracking-wider
                                    transition-all duration-300
                                    relative overflow-hidden
                                  `}
                                  style={{
                                    backgroundColor: activeTab === cat 
                                      ? `${theme.accent}20` 
                                      : 'transparent',
                                    color: activeTab === cat 
                                      ? theme.accent 
                                      : theme.sub
                                  }}
                                >
                                  {activeTab === cat && (
                                    <div 
                                      className="absolute inset-0 opacity-10 animate-pulse"
                                      style={{ backgroundColor: theme.accent }}
                                    />
                                  )}
                                  <span className="relative z-10">{cat}</span>
                                  {activeTab === cat && (
                                    <div 
                                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full"
                                      style={{ backgroundColor: theme.accent }}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <ContentCard theme={theme} variant="glass">
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
                          </ContentCard>
                        </SectionContainer>

                        {/* 2. EXPERIENCIA SENSORIAL */}
                        <SectionContainer>
                          <SectionHeader
                            icon={<Cpu size={16} />}
                            title="Experiencia Sensorial"
                            subtitle="Audio, efectos y feedback"
                            theme={theme}
                          />
                          
                          <ContentCard theme={theme} variant="solid">
                            {/* Audio Master Control */}
                            {setVolume && volume !== undefined && (
                              <div 
                                className="p-4 rounded-2xl mb-5 border"
                                style={{
                                  backgroundColor: `${theme.accent}08`,
                                  borderColor: `${theme.accent}30`
                                }}
                              >
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                                      style={{ 
                                        backgroundColor: gameState.settings.soundEnabled 
                                          ? `${theme.accent}20` 
                                          : `${theme.border}50`,
                                        color: gameState.settings.soundEnabled 
                                          ? theme.accent 
                                          : theme.sub 
                                      }}
                                    >
                                      {gameState.settings.soundEnabled 
                                        ? <Volume2 size={18} /> 
                                        : <VolumeX size={18} />
                                      }
                                    </div>
                                    <div>
                                      <span 
                                        className="text-sm font-bold block"
                                        style={{ color: theme.text }}
                                      >
                                        Volumen Maestro
                                      </span>
                                      <span 
                                        className="text-[10px] font-mono opacity-60"
                                        style={{ color: theme.sub }}
                                      >
                                        {Math.round(volume * 100)}%
                                      </span>
                                    </div>
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
                            
                            {/* Resto de configuraciones */}
                            <div className="space-y-0">
                              <SettingRow
                                icon={<Layers size={16} />}
                                title="Animación de Barajado"
                                subtitle="Visualización 3D de cartas"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.shuffleEnabled} 
                                    onClick={() => onUpdateSettings({ shuffleEnabled: !gameState.settings.shuffleEnabled })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                              />
                              
                              <SettingRow
                                icon={<Sparkles size={16} />}
                                title="Efectos FX"
                                subtitle="Partículas y feedback visual"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.impostorEffects} 
                                    onClick={() => onUpdateSettings({ impostorEffects: !gameState.settings.impostorEffects })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                              />
                              
                              <SettingRow
                                icon={<Smartphone size={16} />}
                                title="Modo Pases"
                                subtitle="Pantalla de transición"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.passPhoneMode} 
                                    onClick={() => onUpdateSettings({ passPhoneMode: !gameState.settings.passPhoneMode })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                                noBorder
                              />
                            </div>
                          </ContentCard>
                        </SectionContainer>

                        {/* 3. MÉTODO DE REVELACIÓN */}
                        <SectionContainer>
                          <SectionHeader
                            icon={<MousePointer2 size={16} />}
                            title="Método de Revelación"
                            subtitle="Cómo descubrir tu rol"
                            theme={theme}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              {
                                id: 'hold',
                                icon: <Volume2 size={24} />,
                                title: 'Mantener',
                                subtitle: 'Clásico táctil',
                                badge: null
                              },
                              {
                                id: 'swipe',
                                icon: <ChevronUp size={24} />,
                                title: 'Deslizar',
                                subtitle: 'Swipe dinámico',
                                badge: 'NEW'
                              }
                            ].map(method => (
                              <button
                                key={method.id}
                                onClick={() => onUpdateSettings({ revealMethod: method.id as any })}
                                className={`
                                  relative p-5 rounded-2xl border
                                  transition-all duration-300
                                  active:scale-[0.97]
                                  group overflow-hidden
                                `}
                                style={{ 
                                  backgroundColor: gameState.settings.revealMethod === method.id 
                                    ? `${theme.accent}15` 
                                    : theme.cardBg,
                                  borderColor: gameState.settings.revealMethod === method.id 
                                    ? theme.accent 
                                    : theme.border,
                                  boxShadow: gameState.settings.revealMethod === method.id
                                    ? `0 8px 24px -8px ${theme.accent}40`
                                    : 'none'
                                }}
                              >
                                {gameState.settings.revealMethod === method.id && (
                                  <div 
                                    className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse"
                                    style={{ 
                                      backgroundColor: theme.accent,
                                      boxShadow: `0 0 12px ${theme.accent}`
                                    }}
                                  />
                                )}
                                
                                {method.badge && (
                                  <div 
                                    className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[8px] font-black"
                                    style={{
                                      backgroundColor: `${theme.accent}30`,
                                      color: theme.accent
                                    }}
                                  >
                                    {method.badge}
                                  </div>
                                )}
                                
                                <div 
                                  className="mb-4 opacity-80"
                                  style={{ color: theme.text }}
                                >
                                  {method.icon}
                                </div>
                                
                                <div className="text-left">
                                  <p 
                                    className="text-base font-bold mb-1"
                                    style={{ color: theme.text }}
                                  >
                                    {method.title}
                                  </p>
                                  <p 
                                    className="text-[10px] font-medium opacity-60 uppercase"
                                    style={{ color: theme.sub }}
                                  >
                                    {method.subtitle}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>

                          {gameState.settings.revealMethod === 'swipe' && (
                            <ContentCard theme={theme} variant="glass">
                              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span 
                                      className="text-xs font-bold"
                                      style={{ color: theme.text }}
                                    >
                                      Sensibilidad de Deslizamiento
                                    </span>
                                  </div>
                                  <div 
                                    className="flex gap-2 p-1.5 rounded-xl border"
                                    style={{
                                      backgroundColor: `${theme.bg}80`,
                                      borderColor: `${theme.border}50`
                                    }}
                                  >
                                    {(['low', 'medium', 'high'] as const).map(s => (
                                      <button
                                        key={s}
                                        onClick={() => onUpdateSettings({ swipeSensitivity: s })}
                                        className={`
                                          flex-1 py-2.5 rounded-lg
                                          text-[10px] font-black uppercase
                                          transition-all duration-200
                                        `}
                                        style={{
                                          backgroundColor: gameState.settings.swipeSensitivity === s 
                                            ? `${theme.accent}20` 
                                            : 'transparent',
                                          color: gameState.settings.swipeSensitivity === s 
                                            ? theme.accent 
                                            : theme.sub
                                        }}
                                      >
                                        {s === 'low' ? 'Baja' : s === 'medium' ? 'Media' : 'Alta'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div 
                                  className="pt-4 border-t"
                                  style={{ borderColor: `${theme.border}30` }}
                                >
                                  <SettingRow
                                    icon={<Smartphone size={14} />}
                                    title="Feedback Háptico"
                                    subtitle="Vibración durante el swipe"
                                    action={
                                      <PremiumToggle 
                                        active={gameState.settings.hapticFeedback} 
                                        onClick={() => onUpdateSettings({ hapticFeedback: !gameState.settings.hapticFeedback })} 
                                        theme={theme} 
                                      />
                                    }
                                    theme={theme}
                                    noBorder
                                  />
                                </div>
                              </div>
                            </ContentCard>
                          )}
                        </SectionContainer>

                        {/* 4. LÓGICA DE CATEGORÍAS */}
                        <SectionContainer>
                          <SectionHeader
                            icon={<Filter size={16} />}
                            title="Lógica de Categorías"
                            subtitle="Distribución y repetición"
                            theme={theme}
                          />
                          
                          <ContentCard theme={theme} variant="solid">
                            {/* Anti-repetición */}
                            <div 
                              className="p-4 rounded-2xl mb-5 border"
                              style={{
                                backgroundColor: `${theme.accent}05`,
                                borderColor: `${theme.accent}20`
                              }}
                            >
                              <div className="mb-3">
                                <span 
                                  className="text-sm font-bold block mb-1"
                                  style={{ color: theme.text }}
                                >
                                  Control Anti-Repetición
                                </span>
                                <span 
                                  className="text-[10px] opacity-60"
                                  style={{ color: theme.sub }}
                                >
                                  Evita categorías usadas recientemente
                                </span>
                              </div>
                              
                              <div 
                                className="flex gap-1.5 p-1.5 rounded-xl border"
                                style={{
                                  backgroundColor: `${theme.bg}40`,
                                  borderColor: `${theme.border}40`
                                }}
                              >
                                {(['none', 'soft', 'medium', 'hard'] as const).map(mode => (
                                  <button
                                    key={mode}
                                    onClick={() => onUpdateSettings({ categoryRepetitionAvoidance: mode })}
                                    className={`
                                      flex-1 py-2.5 rounded-lg
                                      text-[9px] font-black uppercase
                                      transition-all duration-200
                                    `}
                                    style={{
                                      backgroundColor: gameState.settings.categoryRepetitionAvoidance === mode 
                                        ? `${theme.accent}25` 
                                        : 'transparent',
                                      color: gameState.settings.categoryRepetitionAvoidance === mode 
                                        ? theme.accent 
                                        : theme.sub,
                                      boxShadow: gameState.settings.categoryRepetitionAvoidance === mode
                                        ? `0 4px 12px -4px ${theme.accent}40`
                                        : 'none'
                                    }}
                                  >
                                    {mode === 'none' ? 'Off' : mode === 'soft' ? 'Bajo' : mode === 'medium' ? 'Med' : 'Alto'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Modos especiales */}
                            <div className="space-y-0">
                              <SettingRow
                                icon={<Star size={14} />}
                                iconColor="#eab308"
                                title="Boost de Rareza"
                                subtitle="Priorizar categorías poco usadas"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.rareCategoryBoost} 
                                    onClick={() => onUpdateSettings({ rareCategoryBoost: !gameState.settings.rareCategoryBoost })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                              />
                              
                              <SettingRow
                                icon={<Repeat size={14} />}
                                title="Modo Rotación"
                                subtitle="Ciclo secuencial estricto"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.rotationMode} 
                                    onClick={() => onUpdateSettings({ rotationMode: !gameState.settings.rotationMode })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                              />
                              
                              <SettingRow
                                icon={<Compass size={14} />}
                                iconColor="#10b981"
                                title="Modo Explorador"
                                subtitle="Sin repetir hasta agotar"
                                action={
                                  <PremiumToggle 
                                    active={gameState.settings.explorerMode} 
                                    onClick={() => onUpdateSettings({ explorerMode: !gameState.settings.explorerMode })} 
                                    theme={theme} 
                                  />
                                }
                                theme={theme}
                                noBorder
                              />
                            </div>
                          </ContentCard>
                        </SectionContainer>

                        {/* 5. CONFIGURACIÓN MEMORIA */}
                        {gameState.settings.memoryModeConfig.enabled && (
                          <SectionContainer>
                            <SectionHeader
                              icon={<Brain size={16} />}
                              title="Configuración de Memoria"
                              subtitle="Ajustes de dificultad"
                              badge="ACTIVO"
                              theme={theme}
                            />
                            
                            <ContentCard theme={theme} variant="glass">
                              <div className="space-y-5">
                                <div>
                                  <span 
                                    className="text-xs font-bold block mb-3"
                                    style={{ color: theme.text }}
                                  >
                                    Nivel de Dificultad
                                  </span>
                                  <div 
                                    className="grid grid-cols-4 gap-2 p-1.5 rounded-xl border"
                                    style={{
                                      backgroundColor: `${theme.bg}40`,
                                      borderColor: `${theme.border}40`
                                    }}
                                  >
                                    {(['easy', 'normal', 'hard', 'extreme'] as const).map(d => (
                                      <button
                                        key={d}
                                        onClick={() => handleMemoryDifficultyChange(d)}
                                        className={`
                                          py-2.5 rounded-lg
                                          text-[9px] font-black uppercase
                                          transition-all duration-200
                                        `}
                                        style={{
                                          backgroundColor: gameState.settings.memoryModeConfig.difficulty === d 
                                            ? d === 'extreme' 
                                              ? '#dc262660' 
                                              : `${theme.accent}25`
                                            : 'transparent',
                                          color: gameState.settings.memoryModeConfig.difficulty === d 
                                            ? d === 'extreme'
                                              ? '#fca5a5'
                                              : theme.accent 
                                            : theme.sub
                                        }}
                                      >
                                        {d === 'easy' ? 'Fácil' : d === 'normal' ? 'Normal' : d === 'hard' ? 'Difícil' : 'Extr.'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                  {[
                                    { 
                                      icon: '⏱️',
                                      val: gameState.settings.memoryModeConfig.displayTime + 's', 
                                      lbl: 'Tiempo' 
                                    },
                                    { 
                                      icon: '📝',
                                      val: gameState.settings.memoryModeConfig.wordCount, 
                                      lbl: 'Palabras' 
                                    },
                                    { 
                                      icon: '💡',
                                      val: Math.round(gameState.settings.memoryModeConfig.highlightIntensity * 100) + '%', 
                                      lbl: 'Pista Visual' 
                                    }
                                  ].map((stat, i) => (
                                    <div 
                                      key={i} 
                                      className="p-4 rounded-2xl border text-center"
                                      style={{
                                        backgroundColor: `${theme.accent}08`,
                                        borderColor: `${theme.border}40`
                                      }}
                                    >
                                      <div className="text-lg mb-1">{stat.icon}</div>
                                      <p 
                                        className="text-xl font-black mb-1"
                                        style={{ color: theme.accent }}
                                      >
                                        {stat.val}
                                      </p>
                                      <p 
                                        className="text-[9px] uppercase opacity-60 font-bold"
                                        style={{ color: theme.sub }}
                                      >
                                        {stat.lbl}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {gameState.settings.memoryModeConfig.difficulty === 'extreme' && (
                                  <div 
                                    className="flex items-start gap-3 p-4 rounded-2xl border animate-in fade-in zoom-in duration-300"
                                    style={{
                                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                      borderColor: 'rgba(220, 38, 38, 0.3)'
                                    }}
                                  >
                                    <Zap size={16} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-red-200 font-bold leading-relaxed">
                                      Modo extremo sin ayuda visual. Deberás confiar en tu memoria y contexto para identificar la palabra correcta.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </ContentCard>
                          </SectionContainer>
                        )}

                        {/* Manual - Siempre al final */}
                        <button
                          onClick={onOpenHowToPlay}
                          className="
                            w-full relative overflow-hidden
                            p-6 rounded-3xl border
                            transition-all duration-300
                            active:scale-[0.98]
                            group
                          "
                          style={{ 
                            backgroundColor: `${theme.accent}10`,
                            borderColor: `${theme.accent}40`,
                            boxShadow: `0 8px 32px -12px ${theme.accent}30`
                          }}
                        >
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accent}15 0%, transparent 100%)`,
                            }}
                          />
                          
                          <div className="flex items-center gap-4 relative z-10">
                            <div 
                              className="
                                w-14 h-14 rounded-2xl flex items-center justify-center
                                transition-transform duration-300
                                group-hover:scale-110 group-hover:rotate-3
                              "
                              style={{ 
                                backgroundColor: `${theme.accent}20`,
                                color: theme.accent 
                              }}
                            >
                              <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            
                            <div className="flex-1 text-left">
                              <p 
                                className="text-base font-black uppercase tracking-wide mb-1"
                                style={{ color: theme.text }}
                              >
                                Manual Operativo
                              </p>
                              <p 
                                className="text-[10px] font-mono opacity-60 uppercase"
                                style={{ color: theme.sub }}
                              >
                                Reglas • Roles • Guías completas
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
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
