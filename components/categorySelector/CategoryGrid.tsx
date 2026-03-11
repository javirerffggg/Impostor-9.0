import React, { useMemo } from 'react';
import { Eye, Heart, Ban } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { CATEGORIES_DATA } from '../../categories';

interface Props {
    categories: string[];
    selectedCategories: string[];
    favoriteCategories: string[];
    temporaryBlacklist: Record<string, number>;
    categoryUsageStats?: Record<string, number>;
    isCompactMode: boolean;
    theme: ThemeConfig;
    onToggleCategory: (cat: string) => void;
    onPreviewCategory: (cat: string) => void;
    onToggleFavoriteCategory?: (cat: string) => void;
    onBlockCategory?: (cat: string) => void;
}

const getCategoryWordCount = (categoryName: string): number =>
    CATEGORIES_DATA[categoryName]?.length ?? 0;

export const CategoryGrid: React.FC<Props> = ({
    categories, selectedCategories, favoriteCategories, temporaryBlacklist,
    categoryUsageStats, isCompactMode, theme,
    onToggleCategory, onPreviewCategory, onToggleFavoriteCategory, onBlockCategory
}) => {
    const mostUsed = useMemo(() => {
        if (!categoryUsageStats) return [];
        return Object.entries(categoryUsageStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat]) => cat);
    }, [categoryUsageStats]);

    // Pre-compute word counts once
    const wordCounts = useMemo(() =>
        Object.fromEntries(categories.map(cat => [cat, getCategoryWordCount(cat)])),
        [categories]
    );

    return (
        <div className={`${
            isCompactMode ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-3 sm:grid-cols-4'
        } grid gap-2 md:gap-3 animate-in fade-in slide-in-from-left duration-300`}>
            {categories.map(cat => {
                const isActive = selectedCategories.includes(cat);
                const isFavorite = favoriteCategories.includes(cat);
                const blacklistRounds = temporaryBlacklist[cat] ?? 0;
                const isBlacklisted = blacklistRounds > 0;
                const count = wordCounts[cat];

                return (
                    <button
                        key={cat}
                        onClick={() => onToggleCategory(cat)}
                        disabled={isBlacklisted}
                        style={{
                            backgroundColor: isBlacklisted
                                ? 'rgba(0,0,0,0.5)'
                                : isActive ? `${theme.accent}15` : 'transparent',
                            borderColor: isBlacklisted
                                ? 'rgba(255,0,0,0.3)'
                                : isActive ? theme.accent : theme.border,
                            color: isBlacklisted ? '#666' : isActive ? theme.text : theme.sub,
                            opacity: isBlacklisted ? 0.6 : 1
                        }}
                        className={`
                            group relative w-full rounded-xl border font-black text-center
                            transition-all active:scale-95 flex flex-col items-center justify-center overflow-hidden
                            ${isCompactMode ? 'h-16 p-1 text-[8px]' : 'h-24 p-2 text-[9px]'}
                        `}
                    >
                        {/* Word Count Badge */}
                        <div
                            className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[7px] font-bold"
                            style={{ backgroundColor: theme.border, color: theme.sub }}
                        >
                            {count}
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
                            {isFavorite && (
                                <Heart size={8} className="text-red-500 fill-red-500 animate-pulse" />
                            )}
                            {isBlacklisted && (
                                <div className="flex items-center gap-0.5 bg-red-500/20 px-1 rounded">
                                    <Ban size={8} className="text-red-500" />
                                    <span className="text-[7px] text-red-500">{blacklistRounds}</span>
                                </div>
                            )}
                            {!isBlacklisted && mostUsed.includes(cat) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Popular" />
                            )}
                        </div>

                        {/* Active border indicator */}
                        {isActive && !isBlacklisted && (
                            <div
                                className="absolute inset-0 border-2 rounded-xl pointer-events-none"
                                style={{ borderColor: theme.accent }}
                            />
                        )}

                        <span className="uppercase tracking-tighter leading-tight line-clamp-2 px-1 z-10">
                            {cat}
                        </span>

                        {/* Hover overlay actions — only non-compact and non-blacklisted */}
                        {!isCompactMode && !isBlacklisted && (
                            <div className="absolute bottom-0 inset-x-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent">
                                <button
                                    onClick={e => { e.stopPropagation(); onPreviewCategory(cat); }}
                                    className="p-1 hover:scale-125 transition-transform"
                                >
                                    <Eye size={12} style={{ color: theme.text }} />
                                </button>
                                {onToggleFavoriteCategory && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onToggleFavoriteCategory(cat); }}
                                        className="p-1 hover:scale-125 transition-transform"
                                    >
                                        <Heart size={12} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-white'} />
                                    </button>
                                )}
                                {onBlockCategory && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onBlockCategory(cat); }}
                                        className="p-1 hover:scale-125 transition-transform"
                                    >
                                        <Ban size={12} className="text-red-400" />
                                    </button>
                                )}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
