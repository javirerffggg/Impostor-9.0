import React from 'react';
import { Cpu, Layers, Sparkles, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { ThemeConfig, GameState } from '../../types';
import {
    SectionContainer, SectionHeader, ContentCard,
    SettingRow, PremiumToggle, AudioWaveform
} from './SettingsComponents';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    volume?: number;
    setVolume?: (v: number) => void;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
}

export const SensorialSection: React.FC<Props> = ({
    gameState, theme, volume, setVolume, onUpdateSettings
}) => (
    <SectionContainer>
        <SectionHeader
            icon={<Cpu size={16} />}
            title="Experiencia Sensorial"
            subtitle="Audio, efectos y feedback"
            theme={theme}
        />

        <ContentCard theme={theme} variant="solid">
            {/* Audio master */}
            {setVolume && volume !== undefined && (
                <div
                    className="p-4 rounded-2xl mb-5 border"
                    style={{ backgroundColor: `${theme.accent}08`, borderColor: `${theme.accent}30` }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    backgroundColor: gameState.settings.soundEnabled
                                        ? `${theme.accent}20`
                                        : `${theme.border}50`,
                                    color: gameState.settings.soundEnabled ? theme.accent : theme.sub
                                }}
                            >
                                {gameState.settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </div>
                            <div>
                                <span className="text-sm font-bold block" style={{ color: theme.text }}>Volumen Maestro</span>
                                <span className="text-[10px] font-mono opacity-60" style={{ color: theme.sub }}>
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
                    subtitle="Pantalla de transición entre jugadores"
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
);
