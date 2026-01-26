
import React, { useState } from 'react';
import { ThemeConfig } from '../types';
import { CATEGORIES_DATA } from '../categories';
import { CURATED_COLLECTIONS } from '../constants';
import { X, CheckCheck, Check, Library, List, Sparkles, Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleCollection: (colId: string) => void;
    onToggleAll: () => void;
    theme: ThemeConfig;
}

// Mapeo de iconos dinámicos basado en el nombre del icono en la constante
const IconMap: Record<string, React.ComponentType<any>> = {
    Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home
};

export const CategorySelector: React.FC<Props> = ({ isOpen, onClose, selectedCategories, onToggleCategory, onToggleCollection, onToggleAll, theme }) => {
    // REGLA: Entrar en 'list' (Lista Completa) por defecto
    const [viewMode, setViewMode] = useState<'collections' | 'list'>('list');
    const allCats = Object.keys(CATEGORIES_DATA);
    const totalSelectedCount = selectedCategories.length;

    const isCollectionActive = (colId: string) => {
        const collection = CURATED_COLLECTIONS.find(c => c.id === colId);
        if (!collection) return false;
        return collection.categories.every(cat => selectedCategories.includes(cat));
    };

    return (
        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div style={{ backgroundColor: theme.bg }} className="absolute inset-0 flex flex-col overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] border-b border-white/10 shrink-0 bg-inherit z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <h2 style={{ color: theme.text }} className="text-2xl font-black italic tracking-tighter">Categorías</h2>
                            <p style={{ color: theme.sub }} className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {totalSelectedCount === allCats.length ? 'Toda la base de datos activa' : `${totalSelectedCount} temas seleccionados`}
                            </p>
                        </div>
                        <button style={{ color: theme.text }} onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-transform active:scale-90"><X /></button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 gap-1">
                        <button 
                            onClick={() => setViewMode('collections')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'collections' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'}`}
                        >
                            <Library size={14} /> Colecciones
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'}`}
                        >
                            <List size={14} /> Lista Completa
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-40">
                    
                    {viewMode === 'collections' ? (
                        /* PROTOCOLO CURATOR: INTERFAZ DE COLECCIONES - 2 COLUMNAS POR FILA */
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Sparkles size={14} style={{ color: theme.accent }} className="animate-pulse" />
                                <h3 style={{ color: theme.text }} className="text-[11px] font-black uppercase tracking-[0.2em]">Curator Mastery</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {CURATED_COLLECTIONS.map(col => {
                                    const active = isCollectionActive(col.id);
                                    const IconComponent = IconMap[col.icon] || Sparkles;

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
                                                {/* Card Header: Icon + Check */}
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
                                                        {active && <Check size={12} className="text-black font-black" strokeWidth={4} />}
                                                    </div>
                                                </div>

                                                {/* Info Area */}
                                                <div className="flex-1 space-y-1.5">
                                                    <span 
                                                        className="text-sm font-black tracking-tight leading-tight block"
                                                        style={{ color: theme.text }}
                                                    >
                                                        {col.name}
                                                    </span>
                                                    <p style={{ color: theme.sub }} className="text-[10px] leading-snug opacity-70 line-clamp-2">
                                                        {col.description}
                                                    </p>
                                                </div>

                                                {/* Footer Area */}
                                                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1">
                                                    <p style={{ color: theme.accent }} className="text-[8px] font-black uppercase tracking-widest opacity-60 italic truncate">
                                                        {col.vibe}
                                                    </p>
                                                    <span style={{ color: theme.sub }} className="text-[8px] font-mono opacity-50 uppercase">
                                                        {col.categories.length} temas
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Decorative Elements */}
                                            {active && (
                                                <div 
                                                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                                                    style={{ 
                                                        background: `radial-gradient(circle at top right, ${theme.accent}40 0%, transparent 70%)`
                                                    }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* LISTA COMPLETA DE CATEGORÍAS - 3 COLUMNAS POR FILA */
                        <div className="animate-in fade-in slide-in-from-left duration-300">
                            <div className="mb-6">
                                <button 
                                    onClick={onToggleAll}
                                    style={{ 
                                        borderColor: theme.accent, 
                                        color: theme.accent,
                                        backgroundColor: theme.cardBg 
                                    }}
                                    className="w-full py-4 border rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 shadow-sm"
                                >
                                    <CheckCheck size={16} />
                                    {selectedCategories.length === allCats.length ? 'DESACTIVAR TODO' : 'ACTIVAR TODO'}
                                </button>
                                <p 
                                    style={{ color: theme.sub }} 
                                    className="text-center text-[9px] mt-4 font-bold uppercase tracking-widest opacity-50"
                                >
                                    Haz clic sobre un tema para activarlo.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                                {allCats.map(cat => {
                                    const isActive = selectedCategories.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => onToggleCategory(cat)}
                                            style={{ 
                                                backgroundColor: isActive ? `${theme.accent}15` : 'transparent',
                                                borderColor: isActive ? theme.accent : theme.border,
                                                color: isActive ? theme.text : theme.sub,
                                            }}
                                            className="group relative w-full h-16 p-2 rounded-xl border font-black text-center transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                                        >
                                            {isActive && (
                                                <div className="absolute top-1 right-1 animate-in fade-in zoom-in duration-200">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
                                                </div>
                                            )}
                                            <span className="text-[8px] uppercase tracking-tighter leading-tight line-clamp-2">
                                                {cat}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black to-transparent pointer-events-none">
                    <button 
                        onClick={onClose}
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                        className="w-full py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all pointer-events-auto"
                    >
                        Confirmar Selección
                    </button>
                </div>
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
