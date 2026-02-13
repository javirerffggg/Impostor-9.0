
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
        <div className="space-y-4 animate-in fade-in duration-300">
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
                            className={`
                                relative py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider 
                                transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-95 
                                flex items-center justify-center shrink-0 overflow-hidden border
                                ${isActive ? 'px-5 flex-grow' : 'px-0 w-12'}
                            `}
                            style={{
                                backgroundColor: isActive ? theme.accent : theme.cardBg,
                                borderColor: isActive ? theme.accent : theme.border,
                                color: isActive ? 'white' : theme.sub,
                                opacity: isActive ? 1 : 0.6,
                                boxShadow: isActive ? `0 4px 15px -5px ${theme.accent}50` : 'none'
                            }}
                        >
                            <span className="text-base relative z-10 transition-transform duration-300 group-hover:scale-110">{tab.icon}</span>
                            
                            <div className={`
                                overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center
                                ${isActive ? 'max-w-[150px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}
                            `}>
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </div>

                            {activeCount > 0 && (
                                isActive ? (
                                    <div className={`
                                        ml-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black px-1
                                        animate-in zoom-in duration-300
                                    `}
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.25)',
                                        color: 'white'
                                    }}>
                                        {activeCount}
                                    </div>
                                ) : (
                                    <div 
                                        className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white/10 animate-in zoom-in duration-300 shadow-sm"
                                        style={{ backgroundColor: theme.accent }}
                                    />
                                )
                            )}
                            
                            {/* Active Shine Effect */}
                            {isActive && (
                                <div 
                                    className="absolute inset-0 pointer-events-none opacity-20"
                                    style={{
                                        background: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)`,
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer-tab 3s infinite'
                                    }}
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
                @keyframes shimmer-tab {
                    0% { background-position: 150% 0; }
                    100% { background-position: -50% 0; }
                }
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
