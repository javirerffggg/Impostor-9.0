import React from 'react';
import { MousePointer2, ChevronUp, Hand, Smartphone } from 'lucide-react';
import { ThemeConfig, GameState } from '../../types';
import {
    SectionContainer, SectionHeader, ContentCard,
    SettingRow, PremiumToggle, SegmentedControl
} from './SettingsComponents';
import { SENSITIVITY_LABELS } from './settingsUtils';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
}

const REVEAL_METHODS = [
    {
        id: 'hold' as const,
        icon: <Hand size={24} />,
        title: 'Mantener',
        subtitle: 'Clásico táctil',
        badge: null
    },
    {
        id: 'swipe' as const,
        icon: <ChevronUp size={24} />,
        title: 'Deslizar',
        subtitle: 'Swipe dinámico',
        badge: 'NEW'
    }
];

const HOLD_SPEED_LABELS: Record<string, string> = { low: 'Lenta', medium: 'Media', high: 'Rápida' };

export const RevealMethodSection: React.FC<Props> = ({ gameState, theme, onUpdateSettings }) => (
    <SectionContainer>
        <SectionHeader
            icon={<MousePointer2 size={16} />}
            title="Método de Revelación"
            subtitle="Cómo descubrir tu rol"
            theme={theme}
        />

        <div className="grid grid-cols-2 gap-3">
            {REVEAL_METHODS.map(method => {
                const isActive = gameState.settings.revealMethod === method.id;
                return (
                    <button
                        key={method.id}
                        onClick={() => onUpdateSettings({ revealMethod: method.id })}
                        className="relative p-5 rounded-2xl border transition-all duration-300 active:scale-[0.97] overflow-hidden group"
                        style={{
                            backgroundColor: isActive ? `${theme.accent}15` : theme.cardBg,
                            borderColor: isActive ? theme.accent : theme.border,
                            boxShadow: isActive ? `0 8px 24px -8px ${theme.accent}40` : 'none'
                        }}
                    >
                        {/* Active indicator dot — only when active, no collision with badge */}
                        {isActive && (
                            <div
                                className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse"
                                style={{ backgroundColor: theme.accent, boxShadow: `0 0 12px ${theme.accent}` }}
                            />
                        )}

                        {/* Badge — only when NOT active to avoid collision */}
                        {method.badge && !isActive && (
                            <div
                                className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[8px] font-black"
                                style={{ backgroundColor: `${theme.accent}30`, color: theme.accent }}
                            >
                                {method.badge}
                            </div>
                        )}

                        <div className="mb-4 opacity-80" style={{ color: theme.text }}>{method.icon}</div>
                        <div className="text-left">
                            <p className="text-base font-bold mb-1" style={{ color: theme.text }}>{method.title}</p>
                            <p className="text-[10px] font-medium opacity-60 uppercase" style={{ color: theme.sub }}>
                                {method.subtitle}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>

        {/* Swipe options */}
        {gameState.settings.revealMethod === 'swipe' && (
            <ContentCard theme={theme} variant="glass">
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div>
                        <span className="text-xs font-bold block mb-3" style={{ color: theme.text }}>
                            Sensibilidad de Deslizamiento
                        </span>
                        <SegmentedControl
                            options={['low', 'medium', 'high'] as const}
                            value={gameState.settings.swipeSensitivity}
                            onChange={v => onUpdateSettings({ swipeSensitivity: v })}
                            labels={SENSITIVITY_LABELS}
                            theme={theme}
                        />
                    </div>
                    <div className="pt-4 border-t" style={{ borderColor: `${theme.border}30` }}>
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

        {/* Hold speed — only shown when hold is selected (was missing from original) */}
        {gameState.settings.revealMethod === 'hold' && (
            <ContentCard theme={theme} variant="glass">
                <div className="animate-in fade-in zoom-in duration-300">
                    <span className="text-xs font-bold block mb-3" style={{ color: theme.text }}>
                        Velocidad de Revelación
                    </span>
                    <SegmentedControl
                        options={['low', 'medium', 'high'] as const}
                        value={gameState.settings.holdRevealSpeed}
                        onChange={v => onUpdateSettings({ holdRevealSpeed: v })}
                        labels={HOLD_SPEED_LABELS}
                        theme={theme}
                    />
                </div>
            </ContentCard>
        )}
    </SectionContainer>
);
