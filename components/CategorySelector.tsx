
import React from 'react';
import { ThemeConfig } from '../types';
import { CATEGORIES_DATA } from '../categories';
import { X, CheckCheck, Check } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleAll: () => void;
    theme: ThemeConfig;
}

export const CategorySelector: React.FC<Props> = ({ isOpen, onClose, selectedCategories, onToggleCategory, onToggleAll, theme }) => {
    const allCats = Object.keys(CATEGORIES_DATA);
    const isNoneSelected = selectedCategories.length === 0;

    return (
        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div style={{ backgroundColor: theme.bg }} className="absolute inset-0 flex flex-col">
                <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-white/10 shrink-0 bg-inherit z-10">
                    <h2 style={{ color: theme.text }} className="text-2xl font-black italic">Categorías</h2>
                    <button style={{ color: theme.text }} onClick={onClose}><X /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                         <button 
                            onClick={onToggleAll}
                            style={{ 
                                borderColor: theme.accent, 
                                color: theme.accent,
                                backgroundColor: theme.cardBg 
                            }}
                            className="w-full py-4 border rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 transform-gpu"
                        >
                            <CheckCheck size={16} />
                            {selectedCategories.length === allCats.length ? 'Resetear (Todas Activas)' : 'Seleccionar Todo'}
                        </button>
                        <p 
                            style={{ color: theme.sub }} 
                            className={`text-center text-[10px] mt-2 font-bold uppercase tracking-widest transition-opacity duration-300 ${isNoneSelected ? 'opacity-70' : 'opacity-0'}`}
                        >
                            Todas las categorías están activas por defecto
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pb-32">
                        {allCats.map(cat => {
                            const isActive = selectedCategories.includes(cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => onToggleCategory(cat)}
                                    style={{ 
                                        backgroundColor: isActive ? theme.accent : 'transparent',
                                        borderColor: isActive ? theme.accent : theme.border,
                                        color: isActive ? '#fff' : theme.text,
                                        boxShadow: isActive ? `0 4px 12px ${theme.accent}40` : 'none'
                                    }}
                                    className="relative group w-full h-24 p-1 rounded-xl border font-bold flex flex-col items-center justify-center text-center transition-all active:scale-95 backdrop-blur-sm transform-gpu overflow-hidden"
                                >
                                    {isActive && (
                                        <div className="absolute top-1.5 right-1.5 animate-in fade-in zoom-in duration-200">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                    <span className="w-full px-0.5 opacity-90 text-[9px] uppercase tracking-wide leading-tight break-words hyphens-auto">
                                        {cat}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
