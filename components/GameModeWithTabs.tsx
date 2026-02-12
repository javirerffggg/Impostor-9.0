import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

export interface GameModeItem {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    isActive: boolean;
    isDisabled?: boolean;
    isNew?: boolean;
}

interface Props {
    modes: GameModeItem[];
    theme: ThemeConfig;
    onModeToggle: (modeId: string) => void;
}

type TabId = 'basic' | 'protocols' | 'alliances';

const TABS: Record<TabId, { label: string; icon: string; modeIds: string[] }> = {
    basic: { 
        label: 'Básicos', 
        icon: '⚡', 
        modeIds: ['hint', 'troll', 'party', 'memory'] 
    },
    protocols: { 
        label: 'Protocolos', 
        icon: '🛡️', 
        modeIds: ['architect', 'magistrado', 'renuncia'] 
    },
    alliances: { 
        label: 'Alianzas', 
        icon: '🔗', 
        modeIds: ['nexus', 'oracle', 'vanguardia'] 
    }
};

export const GameModeWithTabs: React.FC<Props> = ({ modes, theme, onModeToggle }) => {
    const [activeTab, setActiveTab] = useState<TabId>(() => {
        try {
            const saved = localStorage.getItem('impostor_active_mode_tab');
            // Validate that the saved tab actually exists in TABS
            return (saved && Object.keys(TABS).includes(saved)) ? (saved as TabId) : 'basic';
        } catch {
            return 'basic';
        }
    });

    useEffect(() => {
        localStorage.setItem('impostor_active_mode_tab', activeTab);
    }, [activeTab]);
    
    const currentModes = modes.filter(mode => 
        TABS[activeTab].modeIds.includes(mode.id)
    );

    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {(Object.keys(TABS) as TabId[]).map(tabId => {
                    const tab = TABS[tabId];
                    const isActive = activeTab === tabId;
                    const activeCount = modes.filter(m => 
                        tab.modeIds.includes(m.id) && m.isActive
                    ).length;
                    
                    return (
                        <button
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className="relative px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 flex items-center gap-2 shrink-0 overflow-hidden"
                            style={{
                                backgroundColor: isActive ? theme.accent : theme.border,
                                color: isActive ? 'white' : theme.sub,
                                opacity: isActive ? 1 : 0.7,
                                boxShadow: isActive ? `0 0 0 2px ${theme.accent}20` : 'none'
                            }}
                        >
                            <span className="text-sm">{tab.icon}</span>
                            <span>{tab.label}</span>
                            {activeCount > 0 && (
                                <span 
                                    className="ml-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black px-1"
                                    style={{ 
                                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.accent,
                                        color: isActive ? 'white' : 'white'
                                    }}
                                >
                                    {activeCount}
                                </span>
                            )}
                            {isActive && (
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mode Grid */}
            <div 
                className="grid grid-cols-3 max-[370px]:grid-cols-2 gap-2.5 min-h-[90px]"
                style={{
                    animationDelay: '100ms'
                }}
            >
                {currentModes.map((mode, index) => (
                    <ModeCard
                        key={mode.id}
                        mode={mode}
                        theme={theme}
                        onClick={() => onModeToggle(mode.id)}
                        index={index}
                    />
                ))}
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

const ModeCard: React.FC<{
    mode: GameModeItem;
    theme: ThemeConfig;
    onClick: () => void;
    index: number;
}> = ({ mode, theme, onClick, index }) => {
    return (
        <button
            onClick={onClick}
            disabled={mode.isDisabled}
            className={`
                relative p-3 rounded-lg border transition-all duration-300 text-left
                flex flex-col h-full justify-between min-h-[85px]
                ${mode.isActive 
                    ? 'scale-[1.02] shadow-lg' 
                    : 'hover:scale-[1.01] hover:bg-white/5 opacity-80 hover:opacity-100'
                }
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                animate-in slide-in-from-bottom duration-300
            `}
            style={{
                backgroundColor: mode.isActive ? `${theme.accent}15` : theme.cardBg,
                borderColor: mode.isActive ? theme.accent : theme.border,
                animationDelay: `${index * 50}ms`
            }}
        >
            <div className="flex justify-between items-start w-full mb-2">
                <div 
                    className="text-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: mode.isActive ? theme.accent : theme.text }}
                >
                    {mode.icon}
                </div>
                
                {mode.isActive && (
                    <div 
                        className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] animate-pulse"
                        style={{ backgroundColor: theme.accent, color: theme.accent }}
                    />
                )}
            </div>

            <div className="w-full">
                <div className="flex items-center gap-1.5 mb-1">
                    <span 
                        className="text-[10px] font-black uppercase tracking-wide truncate" 
                        style={{ color: theme.text }}
                    >
                        {mode.name}
                    </span>
                    {mode.isNew && (
                        <span className="text-[7px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-full shrink-0 animate-pulse">
                            NEW
                        </span>
                    )}
                </div>
                <p 
                    className="text-[8px] leading-tight opacity-70 line-clamp-1 font-medium" 
                    style={{ color: theme.sub }}
                >
                    {mode.description}
                </p>
            </div>
        </button>
    );
};