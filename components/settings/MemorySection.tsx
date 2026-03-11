import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { ThemeConfig, GameState, MemoryDifficulty } from '../../types';
import { getMemoryConfigForDifficulty } from '../../utils/memoryWordGenerator';
import { SectionContainer, SectionHeader, ContentCard, SegmentedControl } from './SettingsComponents';
import { DIFFICULTY_LABELS } from './settingsUtils';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
}

const DIFFICULTY_OPTIONS = ['easy', 'normal', 'hard', 'extreme'] as const;

export const MemorySection: React.FC<Props> = ({ gameState, theme, onUpdateSettings }) => {
    const { memoryModeConfig } = gameState.settings;

    const handleDifficultyChange = (difficulty: MemoryDifficulty) => {
        const config = getMemoryConfigForDifficulty(difficulty);
        onUpdateSettings({
            memoryModeConfig: { ...memoryModeConfig, difficulty, ...config }
        });
    };

    if (!memoryModeConfig.enabled) return null;

    return (
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
                        <span className="text-xs font-bold block mb-3" style={{ color: theme.text }}>
                            Nivel de Dificultad
                        </span>
                        {/* Custom segmented for difficulty — extreme gets red color */}
                        <div
                            className="grid grid-cols-4 gap-2 p-1.5 rounded-xl border"
                            style={{ backgroundColor: `${theme.bg}40`, borderColor: `${theme.border}40` }}
                        >
                            {DIFFICULTY_OPTIONS.map(d => {
                                const isActive = memoryModeConfig.difficulty === d;
                                const isExtreme = d === 'extreme';
                                return (
                                    <button
                                        key={d}
                                        onClick={() => handleDifficultyChange(d)}
                                        className="py-2.5 rounded-lg text-[9px] font-black uppercase transition-all duration-200"
                                        style={{
                                            backgroundColor: isActive
                                                ? isExtreme ? '#dc262660' : `${theme.accent}25`
                                                : 'transparent',
                                            color: isActive
                                                ? isExtreme ? '#fca5a5' : theme.accent
                                                : theme.sub
                                        }}
                                    >
                                        {DIFFICULTY_LABELS[d]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: '⏱️', val: `${memoryModeConfig.displayTime}s`, lbl: 'Tiempo' },
                            { icon: '📝', val: memoryModeConfig.wordCount, lbl: 'Palabras' },
                            { icon: '💡', val: `${Math.round(memoryModeConfig.highlightIntensity * 100)}%`, lbl: 'Pista Visual' }
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="p-4 rounded-2xl border text-center"
                                style={{ backgroundColor: `${theme.accent}08`, borderColor: `${theme.border}40` }}
                            >
                                <div className="text-lg mb-1">{stat.icon}</div>
                                <p className="text-xl font-black mb-1" style={{ color: theme.accent }}>{stat.val}</p>
                                <p className="text-[9px] uppercase opacity-60 font-bold" style={{ color: theme.sub }}>{stat.lbl}</p>
                            </div>
                        ))}
                    </div>

                    {memoryModeConfig.difficulty === 'extreme' && (
                        <div
                            className="flex items-start gap-3 p-4 rounded-2xl border animate-in fade-in zoom-in duration-300"
                            style={{ backgroundColor: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.3)' }}
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
    );
};
