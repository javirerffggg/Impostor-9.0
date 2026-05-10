import React from 'react';
import { Gauge, Sparkles, Layers, Smartphone, Wind, Zap } from 'lucide-react';
import { ThemeConfig, GameState } from '../../types';
import {
    SectionContainer, SectionHeader, ContentCard, SettingRow, PremiumToggle
} from './SettingsComponents';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
}

/** What the preset applies when performance mode is ON */
const PERF_PRESET = {
    impostorEffects: false,
    shuffleEnabled: false,
    hapticFeedback: false,
    holdRevealSpeed: 'high' as const,
};

/** What we restore when performance mode is turned OFF */
const PERF_DEFAULTS = {
    impostorEffects: true,
    shuffleEnabled: false,   // keep user's original preference (false = default)
    hapticFeedback: true,
    holdRevealSpeed: 'medium' as const,
};

const CHIPS: Array<{
    icon: React.ReactNode;
    label: string;
    detail: string;
    activeKey: keyof typeof PERF_PRESET;
    /** true means the chip is ON when the setting is false (inverted) */
    inverted?: boolean;
}> = [
    {
        icon: <Sparkles size={12} />,
        label: 'Partículas FX',
        detail: 'GPU compositor',
        activeKey: 'impostorEffects',
        inverted: true,
    },
    {
        icon: <Layers size={12} />,
        label: 'Anim. Barajado',
        detail: '3D transform',
        activeKey: 'shuffleEnabled',
        inverted: true,
    },
    {
        icon: <Smartphone size={12} />,
        label: 'Vibración',
        detail: 'Haptic engine',
        activeKey: 'hapticFeedback',
        inverted: true,
    },
    {
        icon: <Wind size={12} />,
        label: 'Reveal rápido',
        detail: 'Animación hold',
        activeKey: 'holdRevealSpeed',
        inverted: false,
    },
];

export const PerformanceSection: React.FC<Props> = ({ gameState, theme, onUpdateSettings }) => {
    const isPerfMode = gameState.settings.performanceMode ?? false;

    const handleToggle = () => {
        const next = !isPerfMode;
        if (next) {
            onUpdateSettings({ performanceMode: true, ...PERF_PRESET });
        } else {
            onUpdateSettings({ performanceMode: false, ...PERF_DEFAULTS });
        }
    };

    /** Returns whether a chip is currently "active" (optimised) */
    const chipActive = (key: keyof typeof PERF_PRESET, inverted: boolean) => {
        const val = gameState.settings[key];
        return inverted ? val === false : val === 'high';
    };

    return (
        <SectionContainer>
            <SectionHeader
                icon={<Gauge size={16} />}
                title="Rendimiento"
                subtitle="Optimización para hardware mid-range"
                theme={theme}
            />

            {/* Main toggle card */}
            <ContentCard theme={theme} variant="solid">
                {/* Hero row */}
                <div
                    className="flex items-start gap-4 p-1 pb-4 border-b"
                    style={{ borderColor: `${theme.border}40` }}
                >
                    {/* Icon badge */}
                    <div
                        className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500"
                        style={{
                            backgroundColor: isPerfMode ? `${theme.accent}20` : `${theme.border}30`,
                            color: isPerfMode ? theme.accent : theme.sub,
                            boxShadow: isPerfMode ? `0 0 20px ${theme.accent}30` : 'none',
                        }}
                    >
                        <Gauge size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black" style={{ color: theme.text }}>
                                    Modo OnePlus 9
                                </p>
                                <p className="text-[10px] leading-snug mt-0.5 opacity-70" style={{ color: theme.sub }}>
                                    Reduce la carga GPU/CPU para una experiencia más fluida en dispositivos mid-range
                                </p>
                            </div>
                            <PremiumToggle
                                active={isPerfMode}
                                onClick={handleToggle}
                                theme={theme}
                            />
                        </div>
                    </div>
                </div>

                {/* Status chips */}
                <div className="pt-4 space-y-1.5">
                    <p
                        className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 px-0.5"
                        style={{ color: theme.sub, opacity: 0.6 }}
                    >
                        Optimizaciones aplicadas
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        {CHIPS.map(chip => {
                            const active = chipActive(chip.activeKey, chip.inverted ?? false);
                            return (
                                <div
                                    key={chip.label}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-400"
                                    style={{
                                        backgroundColor: active
                                            ? `${theme.accent}12`
                                            : `${theme.border}18`,
                                        borderColor: active
                                            ? `${theme.accent}40`
                                            : `${theme.border}30`,
                                    }}
                                >
                                    {/* dot indicator */}
                                    <div
                                        className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
                                        style={{
                                            backgroundColor: active ? theme.accent : theme.sub,
                                            opacity: active ? 1 : 0.3,
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <div
                                            className="flex items-center gap-1"
                                            style={{ color: active ? theme.accent : theme.sub }}
                                        >
                                            <span className="opacity-80">{chip.icon}</span>
                                            <span
                                                className="text-[10px] font-bold truncate"
                                                style={{
                                                    color: active ? theme.text : theme.sub,
                                                    opacity: active ? 1 : 0.45,
                                                }}
                                            >
                                                {chip.label}
                                            </span>
                                        </div>
                                        <p
                                            className="text-[8px] font-mono truncate"
                                            style={{ color: theme.sub, opacity: active ? 0.6 : 0.3 }}
                                        >
                                            {chip.detail}
                                        </p>
                                    </div>
                                    {active && (
                                        <Zap
                                            size={10}
                                            className="ml-auto shrink-0"
                                            style={{ color: theme.accent }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Blur CSS note */}
                <div
                    className="mt-4 px-3 py-2.5 rounded-xl border text-[9px] leading-snug font-mono"
                    style={{
                        borderColor: `${theme.border}25`,
                        backgroundColor: `${theme.border}10`,
                        color: theme.sub,
                        opacity: 0.7,
                    }}
                >
                    Además reduce <span style={{ color: theme.text }}>backdrop-blur</span>,
                    &nbsp;<span style={{ color: theme.text }}>box-shadow</span> y duración de
                    &nbsp;<span style={{ color: theme.text }}>transiciones CSS</span> en toda la app via{' '}
                    <span style={{ color: theme.accent }}>data-perf="low"</span>.
                </div>
            </ContentCard>
        </SectionContainer>
    );
};
