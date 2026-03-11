import React from 'react';
import { Filter, Star, Repeat, Compass } from 'lucide-react';
import { ThemeConfig, GameState } from '../../types';
import {
    SectionContainer, SectionHeader, ContentCard,
    SettingRow, PremiumToggle, SegmentedControl
} from './SettingsComponents';
import { REPETITION_LABELS } from './settingsUtils';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
}

export const CategoryLogicSection: React.FC<Props> = ({ gameState, theme, onUpdateSettings }) => (
    <SectionContainer>
        <SectionHeader
            icon={<Filter size={16} />}
            title="Lógica de Categorías"
            subtitle="Distribución y repetición"
            theme={theme}
        />

        <ContentCard theme={theme} variant="solid">
            <div
                className="p-4 rounded-2xl mb-5 border"
                style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}20` }}
            >
                <div className="mb-3">
                    <span className="text-sm font-bold block mb-1" style={{ color: theme.text }}>
                        Control Anti-Repetición
                    </span>
                    <span className="text-[10px] opacity-60" style={{ color: theme.sub }}>
                        Evita categorías usadas recientemente
                    </span>
                </div>
                <SegmentedControl
                    options={['none', 'soft', 'medium', 'hard'] as const}
                    value={gameState.settings.categoryRepetitionAvoidance}
                    onChange={v => onUpdateSettings({ categoryRepetitionAvoidance: v })}
                    labels={REPETITION_LABELS}
                    theme={theme}
                />
            </div>

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
                            active={!!gameState.settings.rotationMode}
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
                    subtitle="Sin repetir hasta agotar el mazo"
                    action={
                        <PremiumToggle
                            active={!!gameState.settings.explorerMode}
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
);
