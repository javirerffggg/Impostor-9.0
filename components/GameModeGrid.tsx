
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeConfig } from '../types';

export interface GameModeItem {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    isActive: boolean;
    isDisabled?: boolean;
    isNew?: boolean;
    isComingSoon?: boolean;
}

interface Props {
    modes: GameModeItem[];
    theme: ThemeConfig;
    onModeToggle: (modeId: string) => void;
    compactLimit?: number;
}

export const GameModeGrid: React.FC<Props> = ({
    modes,
    theme,
    onModeToggle,
    compactLimit = 6
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Determine visible modes based on expanded state
    const visibleModes = isExpanded ? modes : modes.slice(0, compactLimit);
    const hasMore = modes.length > compactLimit;

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {visibleModes.map((mode, index) => (
                    <ModeCard
                        key={mode.id}
                        mode={mode}
                        theme={theme}
                        onClick={() => onModeToggle(mode.id)}
                        index={index}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="mt-3 relative">
                    {!isExpanded && (
                        <div 
                            className="absolute -top-12 left-0 right-0 h-12 pointer-events-none"
                            style={{
                                background: `linear-gradient(to bottom, transparent, ${theme.bg})`
                            }}
                        />
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-[0.98] border hover:bg-white/5"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: theme.border,
                            color: theme.sub
                        }}>
                        <span>
                            {isExpanded 
                                ? 'Mostrar menos' 
                                : `Ver todos (${modes.length - compactLimit} más)`
                            }
                        </span>
                        {isExpanded ? (
                            <ChevronUp size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                    </button>
                </div>
            )}
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
            disabled={mode.isDisabled || mode.isComingSoon}
            className={`
                relative p-4 rounded-xl border transition-all duration-300 text-left
                flex flex-col h-full justify-between min-h-[110px]
                ${mode.isActive ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01] hover:bg-white/5 opacity-80 hover:opacity-100'}
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            `}
            style={{
                backgroundColor: mode.isActive ? `${theme.accent}15` : theme.cardBg,
                borderColor: mode.isActive ? theme.accent : theme.border,
                animationDelay: `${index * 50}ms`
            }}>
            
            <div className="flex justify-between items-start w-full mb-3">
                <div 
                    className="text-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: mode.isActive ? theme.accent : theme.text }}
                >
                    {mode.icon}
                </div>
                
                {mode.isActive && (
                    <div 
                        className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                        style={{ backgroundColor: theme.accent, color: theme.accent }}
                    />
                )}
            </div>

            <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: theme.text }}>
                        {mode.name}
                    </span>
                    {mode.isNew && (
                        <span className="text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                            NEW
                        </span>
                    )}
                </div>
                <p className="text-[9px] leading-tight opacity-70 line-clamp-2 font-medium" style={{ color: theme.sub }}>
                    {mode.description}
                </p>
            </div>
        </button>
    );
};
