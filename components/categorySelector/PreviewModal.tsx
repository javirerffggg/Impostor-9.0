import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { CATEGORIES_DATA } from '../../categories';

interface Props {
    category: string;
    selectedCategories: string[];
    theme: ThemeConfig;
    onClose: () => void;
    onSelect: (cat: string) => void;
}

export const PreviewModal: React.FC<Props> = ({ category, selectedCategories, theme, onClose, onSelect }) => {
    // Memoize so words don't reshuffle on every re-render
    const previewWords = useMemo(() => {
        const items = CATEGORIES_DATA[category];
        if (!items) return [];
        return [...items]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
            .map(item => item.civ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const totalCount = CATEGORIES_DATA[category]?.length ?? 0;
    const isAlreadySelected = selectedCategories.includes(category);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-300"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: theme.sub }}>VISTA PREVIA</p>
                        <h3 className="text-xl font-black uppercase" style={{ color: theme.text }}>{category}</h3>
                        <p className="text-[10px] mt-0.5" style={{ color: theme.sub }}>{totalCount} palabras en total</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5" style={{ color: theme.text }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {previewWords.map((word, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                            style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }}
                        >
                            {word}
                        </span>
                    ))}
                    {totalCount > 10 && (
                        <span className="px-2 py-1.5 text-xs opacity-50" style={{ color: theme.sub }}>... y {totalCount - 10} más</span>
                    )}
                </div>

                <button
                    onClick={() => { onSelect(category); onClose(); }}
                    className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
                    style={{ backgroundColor: isAlreadySelected ? theme.border : theme.accent, color: 'white' }}
                >
                    {isAlreadySelected ? 'Ya seleccionada ✓' : 'Seleccionar Categoría'}
                </button>
            </div>
        </div>
    );
};
