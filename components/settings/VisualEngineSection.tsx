import React, { useState, useMemo } from 'react';
import { Monitor, CheckCheck } from 'lucide-react';
import { ThemeConfig, ThemeName } from '../../types';
import { THEMES } from '../../constants';
import { SectionContainer, SectionHeader, ContentCard } from './SettingsComponents';
import { THEME_CATEGORIES, PREMIUM_THEMES, ThemeCategory, getThemeCategory } from './settingsUtils';

interface Props {
    themeName: ThemeName;
    setThemeName: (name: ThemeName) => void;
    theme: ThemeConfig;
}

export const VisualEngineSection: React.FC<Props> = ({ themeName, setThemeName, theme }) => {
    const [activeTab, setActiveTab] = useState<ThemeCategory>(() => getThemeCategory(themeName));

    const totalThemes = useMemo(() => Object.keys(THEMES).length, []);
    const isPremium = PREMIUM_THEMES.includes(themeName);

    return (
        <SectionContainer>
            <SectionHeader
                icon={<Monitor size={16} />}
                title="Motor Visual"
                subtitle={`${totalThemes} temas disponibles`}
                badge={isPremium ? 'PREMIUM' : undefined}
                theme={theme}
            />

            {/* Sticky tabs */}
            <div
                className="sticky top-0 z-20 p-1.5 rounded-2xl border backdrop-blur-2xl shadow-lg mb-4"
                style={{ backgroundColor: `${theme.bg}F0`, borderColor: `${theme.border}50` }}
            >
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {(Object.keys(THEME_CATEGORIES) as ThemeCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className="flex-1 min-w-[80px] py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 relative overflow-hidden"
                            style={{
                                backgroundColor: activeTab === cat ? `${theme.accent}20` : 'transparent',
                                color: activeTab === cat ? theme.accent : theme.sub
                            }}
                        >
                            {activeTab === cat && (
                                <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundColor: theme.accent }} />
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
                    {THEME_CATEGORIES[activeTab].map(t => {
                        const isActive = themeName === t;
                        const tConfig = THEMES[t];
                        return (
                            <button
                                key={t}
                                onClick={() => setThemeName(t)}
                                className={`relative group h-24 rounded-2xl border overflow-hidden transition-all duration-500 ${
                                    isActive
                                        ? 'ring-2 ring-offset-2 ring-offset-black/50 scale-[1.02]'
                                        : 'hover:scale-[0.98] opacity-80 hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: tConfig.bg,
                                    borderColor: isActive ? tConfig.accent : 'rgba(255,255,255,0.1)',
                                    '--tw-ring-color': tConfig.accent
                                } as React.CSSProperties}
                            >
                                <div
                                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                                    style={{ background: `linear-gradient(135deg, ${tConfig.cardBg} 0%, transparent 100%)` }}
                                />
                                {isActive && (
                                    <div
                                        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                                        style={{ backgroundColor: tConfig.accent, boxShadow: `0 0 10px ${tConfig.accent}` }}
                                    />
                                )}
                                <div className="absolute bottom-3 left-3 text-left">
                                    <p
                                        className="text-xs font-black uppercase tracking-wider drop-shadow-sm"
                                        style={{ color: tConfig.text }}
                                    >
                                        {tConfig.name}
                                    </p>
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
    );
};
