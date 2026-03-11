import React from 'react';
import { CheckCheck, Sparkles, Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { CURATED_COLLECTIONS } from '../../constants';
import { CATEGORIES_DATA } from '../../categories';

interface Props {
    selectedCategories: string[];
    theme: ThemeConfig;
    onToggleCollection: (colId: string) => void;
}

const IconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home
};

const getCategoryWordCount = (categoryName: string): number =>
    CATEGORIES_DATA[categoryName]?.length ?? 0;

export const CollectionGrid: React.FC<Props> = ({ selectedCategories, theme, onToggleCollection }) => {
    const isCollectionActive = (colId: string) => {
        const col = CURATED_COLLECTIONS.find(c => c.id === colId);
        return col ? col.categories.every(cat => selectedCategories.includes(cat)) : false;
    };

    // Count how many categories in the collection are selected (for partial progress)
    const getCollectionProgress = (colId: string): number => {
        const col = CURATED_COLLECTIONS.find(c => c.id === colId);
        if (!col || col.categories.length === 0) return 0;
        const activeCount = col.categories.filter(cat => selectedCategories.includes(cat)).length;
        return activeCount / col.categories.length;
    };

    return (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right duration-300">
            {CURATED_COLLECTIONS.map(col => {
                const active = isCollectionActive(col.id);
                const progress = getCollectionProgress(col.id);
                const IconComponent = IconMap[col.icon] || Sparkles;
                const wordCount = col.categories.reduce(
                    (sum, cat) => sum + getCategoryWordCount(cat), 0
                );

                return (
                    <button
                        key={col.id}
                        onClick={() => onToggleCollection(col.id)}
                        className="group relative w-full p-4 rounded-2xl border text-left transition-all duration-300 active:scale-[0.98] overflow-hidden flex flex-col h-full"
                        style={{
                            backgroundColor: active ? `${theme.accent}15` : theme.cardBg,
                            borderColor: active ? theme.accent : theme.border,
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`p-2 rounded-xl border transition-colors ${active ? 'bg-white/10' : 'bg-black/20'}`}
                                    style={{
                                        color: active ? theme.accent : theme.text,
                                        borderColor: active ? `${theme.accent}40` : 'transparent'
                                    }}
                                >
                                    <IconComponent size={18} />
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-white border-white' : 'border-white/20'}`}>
                                    {active && <CheckCheck size={12} className="text-black" strokeWidth={4} />}
                                </div>
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <span className="text-sm font-black tracking-tight leading-tight block" style={{ color: theme.text }}>
                                    {col.name}
                                </span>
                                <p style={{ color: theme.sub }} className="text-[10px] leading-snug opacity-70 line-clamp-2">
                                    {col.description}
                                </p>
                            </div>

                            {/* Partial progress bar */}
                            {!active && progress > 0 && (
                                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progress * 100}%`, backgroundColor: theme.accent }}
                                    />
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1">
                                <p style={{ color: theme.accent }} className="text-[8px] font-black uppercase tracking-widest opacity-60 italic truncate">
                                    {col.vibe}
                                </p>
                                <span style={{ color: theme.sub }} className="text-[8px] font-mono opacity-50 uppercase">
                                    {col.categories.length} temas · {wordCount} palabras
                                </span>
                            </div>
                        </div>

                        {active && (
                            <div
                                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                                style={{ background: `radial-gradient(circle at top right, ${theme.accent}40 0%, transparent 70%)` }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
