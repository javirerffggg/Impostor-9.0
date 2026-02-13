

import React, { useState, useEffect } from 'react';
import { ThemeConfig, CategoryPreset } from '../types';
import { CATEGORIES_DATA } from '../categories';
import { CURATED_COLLECTIONS } from '../constants';
import { X, CheckCheck, Check, Library, List, Sparkles, Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home, Search, LayoutGrid, Grid3x3, Shuffle, Save, Eye, Heart, Ban } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleCollection: (colId: string) => void;
    onToggleAll: () => void;
    theme: ThemeConfig;
    categoryUsageStats?: Record<string, number>;
    
    // ✨ NUEVO
    favoriteCategories?: string[];
    onToggleFavoriteCategory?: (cat: string) => void;
    onBlockCategory?: (cat: string) => void;
    temporaryBlacklist?: Record<string, number>;
}

// Mapeo de iconos dinámicos
const IconMap: Record<string, React.ComponentType<any>> = {
    Utensils, Zap, Clapperboard, Compass, Gamepad2, Diamond, Book, Leaf, Brain, Trophy, Home
};

export const CategorySelector: React.FC<Props> = ({ 
    isOpen, onClose, selectedCategories, onToggleCategory, onToggleCollection, onToggleAll, theme, categoryUsageStats,
    favoriteCategories = [], onToggleFavoriteCategory, onBlockCategory, temporaryBlacklist = {}
}) => {
    // STATES
    const [viewMode, setViewMode] = useState<'collections' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCompactMode, setIsCompactMode] = useState(false);
    const [presets, setPresets] = useState<CategoryPreset[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('impostor_category_presets') || '[]');
        } catch {
            return [];
        }
    });
    const [showSavePresetModal, setShowSavePresetModal] = useState(false);
    const [previewCategory, setPreviewCategory] = useState<string | null>(null);

    // Save presets to local storage
    useEffect(() => {
        localStorage.setItem('impostor_category_presets', JSON.stringify(presets));
    }, [presets]);

    const allCats = Object.keys(CATEGORIES_DATA);
    const totalSelectedCount = selectedCategories.length;

    // --- HELPERS ---

    const fuzzyMatch = (text: string, query: string): boolean => {
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        if (textLower.includes(queryLower)) return true;
        // Simple fuzzy: query chars must appear in text in order
        let textIndex = 0;
        for (let i = 0; i < queryLower.length; i++) {
            textIndex = textLower.indexOf(queryLower[i], textIndex);
            if (textIndex === -1) return false;
            textIndex++;
        }
        return true;
    };

    const getCategoryWordCount = (categoryName: string): number => {
        const category = CATEGORIES_DATA[categoryName];
        if (!category) return 0;
        return category.length;
    };

    const getPreviewWords = (categoryName: string, count: number = 10): string[] => {
        const category = CATEGORIES_DATA[categoryName];
        if (!category) return [];
        
        // Flatten category pairs to just words
        const allWords = category.map(item => item.civ);
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };

    const handleRandomSelection = (count: number = 15) => {
        // Desactivar todas primero
        selectedCategories.forEach(cat => onToggleCategory(cat));
        
        // Seleccionar N aleatorias
        const shuffled = [...allCats].sort(() => Math.random() - 0.5);
        const randomCats = shuffled.slice(0, count);
        
        randomCats.forEach(cat => onToggleCategory(cat));
    };

    const isCollectionActive = (colId: string) => {
        const collection = CURATED_COLLECTIONS.find(c => c.id === colId);
        if (!collection) return false;
        return collection.categories.every(cat => selectedCategories.includes(cat));
    };

    const filteredCategories = searchQuery.trim()
        ? allCats.filter(cat => fuzzyMatch(cat, searchQuery))
        : allCats;

    // Usage Stats Calculation
    const getMostUsedCategories = () => {
        if (!categoryUsageStats) return [];
        return Object.entries(categoryUsageStats)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 5)
            .map(([cat]) => cat);
    };

    const getLeastUsedCategories = () => {
        if (!categoryUsageStats) return [];
        const allUsed = Object.keys(categoryUsageStats);
        return allCats.filter(cat => !allUsed.includes(cat)).slice(0, 5); // Just grab 5 random unused
    };

    const mostUsed = getMostUsedCategories();
    const leastUsed = getLeastUsedCategories();

    return (
        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div style={{ backgroundColor: theme.bg }} className="absolute inset-0 flex flex-col overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] border-b border-white/10 shrink-0 bg-inherit z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h2 style={{ color: theme.text }} className="text-2xl font-black italic tracking-tighter">
                                Categorías
                            </h2>
                            
                            {/* Visual Counter */}
                            <div className="flex items-center gap-3 mt-2">
                                <div 
                                    className="px-3 py-1.5 rounded-full font-black text-xs transition-colors"
                                    style={{ 
                                        backgroundColor: `${theme.accent}20`,
                                        color: theme.accent
                                    }}
                                >
                                    {totalSelectedCount} / {allCats.length}
                                </div>
                                <p style={{ color: theme.sub }} className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    {totalSelectedCount === 0 
                                        ? 'Ninguna seleccionada' 
                                        : totalSelectedCount === allCats.length 
                                            ? '¡Todas activas!' 
                                            : 'Activas'
                                    }
                                </p>
                            </div>
                        </div>
                        <button style={{ color: theme.text }} onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-transform active:scale-90">
                            <X />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                        <div 
                            className="h-full transition-all duration-500 rounded-full"
                            style={{ 
                                width: `${(totalSelectedCount / allCats.length) * 100}%`,
                                backgroundColor: theme.accent
                            }}
                        />
                    </div>

                    {/* Presets List */}
                    {presets.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: theme.sub }}>
                                Tus Presets
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {presets.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            // 1. Activate preset categories
                                            preset.categories.forEach(cat => {
                                                if (!selectedCategories.includes(cat)) onToggleCategory(cat);
                                            });
                                            // 2. Deactivate others (optional, makes it a true preset switch)
                                            selectedCategories.forEach(cat => {
                                                if (!preset.categories.includes(cat)) onToggleCategory(cat);
                                            });
                                        }}
                                        className="shrink-0 px-4 py-2 rounded-xl border flex items-center gap-3 relative group active:scale-95 transition-transform"
                                        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                                    >
                                        <span className="text-lg">{preset.emoji}</span>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold" style={{ color: theme.text }}>{preset.name}</span>
                                            <span className="text-[8px] opacity-60" style={{ color: theme.sub }}>{preset.categories.length} temas</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('¿Borrar preset?')) {
                                                    setPresets(prev => prev.filter(p => p.id !== preset.id));
                                                }
                                            }}
                                            className="w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white shadow-sm"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs & Controls */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex bg-black/20 p-1 rounded-2xl border border-white/5 gap-1">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'}`}
                            >
                                <List size={14} /> Lista
                            </button>
                            <button 
                                onClick={() => setViewMode('collections')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'collections' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'}`}
                            >
                                <Library size={14} /> Packs
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowSavePresetModal(true)}
                            disabled={totalSelectedCount === 0}
                            className="p-3 rounded-xl border transition-all active:scale-95 disabled:opacity-30"
                            style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: 'white' }}
                            title="Guardar selección como Preset"
                        >
                            <Save size={18} />
                        </button>

                        <button
                            onClick={() => setIsCompactMode(!isCompactMode)}
                            className="p-3 rounded-xl border transition-all active:scale-95"
                            style={{ 
                                backgroundColor: isCompactMode ? theme.accent : theme.border, 
                                borderColor: isCompactMode ? theme.accent : theme.border,
                                color: isCompactMode ? 'white' : theme.text 
                            }}
                            title={isCompactMode ? "Vista expandida" : "Vista compacta"}
                        >
                            {isCompactMode ? <Grid3x3 size={18} /> : <LayoutGrid size={18} />}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-40">
                    
                    {viewMode === 'collections' ? (
                        /* INTERFAZ DE COLECCIONES */
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Sparkles size={14} style={{ color: theme.accent }} className="animate-pulse" />
                                <h3 style={{ color: theme.text }} className="text-[11px] font-black uppercase tracking-[0.2em]">Curator Mastery</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {CURATED_COLLECTIONS.map(col => {
                                    const active = isCollectionActive(col.id);
                                    const IconComponent = IconMap[col.icon] || Sparkles;
                                    const wordCount = col.categories.reduce((sum, cat) => sum + getCategoryWordCount(cat), 0);

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
                                                        {active && <Check size={12} className="text-black font-black" strokeWidth={4} />}
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
                                                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${theme.accent}40 0%, transparent 70%)` }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* LISTA COMPLETA - SEARCH + GRID */
                        <div className="animate-in fade-in slide-in-from-left duration-300">
                            
                            {/* Sticky Search Bar */}
                            <div className="sticky top-[-1.5rem] pt-2 pb-4 z-20" style={{ backgroundColor: theme.bg }}>
                                <div className="relative group">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-white" style={{ color: theme.sub }} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar entre 50+ categorías..."
                                        className="w-full pl-11 pr-10 py-3.5 rounded-2xl outline-none text-sm font-bold transition-all border"
                                        style={{ 
                                            backgroundColor: theme.cardBg, 
                                            color: theme.text,
                                            borderColor: searchQuery ? theme.accent : theme.border,
                                            boxShadow: searchQuery ? `0 0 20px -5px ${theme.accent}30` : 'none'
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                            style={{ backgroundColor: theme.accent }}
                                        >
                                            <X size={12} color="white" strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mb-6">
                                <button 
                                    onClick={onToggleAll}
                                    style={{ 
                                        borderColor: theme.accent, 
                                        color: theme.accent,
                                        backgroundColor: theme.cardBg 
                                    }}
                                    className="flex-1 py-4 border rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 shadow-sm hover:brightness-110"
                                >
                                    <CheckCheck size={16} />
                                    {selectedCategories.length === allCats.length ? 'DESACTIVAR TODO' : 'ACTIVAR TODO'}
                                </button>
                                
                                <button 
                                    onClick={() => handleRandomSelection(15)}
                                    style={{ 
                                        backgroundColor: theme.accent,
                                        color: 'white'
                                    }}
                                    className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg hover:brightness-110"
                                >
                                    <Shuffle size={16} />
                                    SORPRÉNDEME
                                </button>
                            </div>

                            {/* Results Info */}
                            {searchQuery && (
                                <p className="text-[10px] font-bold mb-4 px-1" style={{ color: theme.sub }}>
                                    {filteredCategories.length} RESULTADO{filteredCategories.length !== 1 ? 'S' : ''}
                                </p>
                            )}

                            {/* Categories Grid */}
                            <div className={`grid gap-2 md:gap-3 ${isCompactMode ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-3 sm:grid-cols-4'}`}>
                                {filteredCategories.map(cat => {
                                    const isActive = selectedCategories.includes(cat);
                                    const isFavorite = favoriteCategories.includes(cat);
                                    const blacklistRounds = temporaryBlacklist[cat] || 0;
                                    const isBlacklisted = blacklistRounds > 0;
                                    const count = getCategoryWordCount(cat);
                                    
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => onToggleCategory(cat)}
                                            disabled={isBlacklisted}
                                            style={{ 
                                                backgroundColor: isBlacklisted ? 'rgba(0,0,0,0.5)' : (isActive ? `${theme.accent}15` : 'transparent'),
                                                borderColor: isBlacklisted ? 'rgba(255,0,0,0.3)' : (isActive ? theme.accent : theme.border),
                                                color: isBlacklisted ? '#666' : (isActive ? theme.text : theme.sub),
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

                                            {/* Active Indicator */}
                                            {isActive && !isBlacklisted && (
                                                <div className="absolute inset-0 border-2 rounded-xl pointer-events-none" style={{ borderColor: theme.accent }} />
                                            )}

                                            <span className="uppercase tracking-tighter leading-tight line-clamp-2 px-1 z-10">
                                                {cat}
                                            </span>

                                            {/* Overlay Actions (Only in non-compact mode) */}
                                            {!isCompactMode && !isBlacklisted && (
                                                <div className="absolute bottom-0 inset-x-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewCategory(cat);
                                                        }}
                                                        className="p-1 hover:scale-125 transition-transform"
                                                    >
                                                        <Eye size={12} style={{ color: theme.text }} />
                                                    </div>
                                                    
                                                    {onToggleFavoriteCategory && (
                                                        <div 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onToggleFavoriteCategory(cat);
                                                            }}
                                                            className="p-1 hover:scale-125 transition-transform"
                                                        >
                                                            <Heart size={12} className={isFavorite ? "text-red-500 fill-red-500" : "text-white"} />
                                                        </div>
                                                    )}

                                                    {onBlockCategory && (
                                                        <div 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Block for 5 rounds
                                                                onBlockCategory(cat);
                                                            }}
                                                            className="p-1 hover:scale-125 transition-transform"
                                                        >
                                                            <Ban size={12} className="text-red-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* No Results */}
                            {searchQuery && filteredCategories.length === 0 && (
                                <div className="text-center py-12 opacity-50">
                                    <p className="text-xs font-bold" style={{ color: theme.text }}>Sin resultados</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black to-transparent pointer-events-none">
                    <button 
                        onClick={onClose}
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                        className="w-full py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all pointer-events-auto hover:brightness-110"
                    >
                        Confirmar Selección
                    </button>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {previewCategory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewCategory(null)}>
                    <div 
                        className="w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-300"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: theme.sub }}>VISTA PREVIA</p>
                                <h3 className="text-xl font-black uppercase" style={{ color: theme.text }}>{previewCategory}</h3>
                            </div>
                            <button onClick={() => setPreviewCategory(null)} className="p-2 rounded-full hover:bg-white/5" style={{ color: theme.text }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {getPreviewWords(previewCategory).map((word, i) => (
                                <span 
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                                    style={{ 
                                        backgroundColor: theme.cardBg, 
                                        color: theme.text,
                                        borderColor: theme.border 
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                            {getCategoryWordCount(previewCategory!) > 10 && (
                                <span className="px-2 py-1.5 text-xs opacity-50" style={{ color: theme.sub }}>... y más</span>
                            )}
                        </div>

                        <button 
                            onClick={() => {
                                if (!selectedCategories.includes(previewCategory!)) onToggleCategory(previewCategory!);
                                setPreviewCategory(null);
                            }}
                            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
                            style={{ backgroundColor: theme.accent, color: 'white' }}
                        >
                            Seleccionar Categoría
                        </button>
                    </div>
                </div>
            )}

            {/* SAVE PRESET MODAL */}
            {showSavePresetModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-300"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    >
                        <h3 className="text-lg font-black mb-4 uppercase" style={{ color: theme.text }}>Guardar Preset</h3>
                        
                        <input
                            id="preset-name"
                            type="text"
                            placeholder="Nombre del preset (ej: Fiesta Loca)"
                            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-sm font-bold border focus:border-white/50 transition-colors"
                            style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }}
                            autoFocus
                        />
                        
                        <input
                            id="preset-emoji"
                            type="text"
                            placeholder="Emoji (ej: 🍕)"
                            maxLength={2}
                            className="w-full px-4 py-3 rounded-xl mb-6 outline-none text-center text-2xl border focus:border-white/50 transition-colors"
                            style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }}
                        />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSavePresetModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase"
                                style={{ backgroundColor: theme.border, color: theme.text }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const nameInput = document.getElementById('preset-name') as HTMLInputElement;
                                    const emojiInput = document.getElementById('preset-emoji') as HTMLInputElement;
                                    const name = nameInput.value.trim();
                                    const emoji = emojiInput.value.trim() || '⭐';
                                    
                                    if (name) {
                                        const newPreset: CategoryPreset = {
                                            id: Date.now().toString(),
                                            name,
                                            emoji,
                                            categories: [...selectedCategories],
                                            createdAt: Date.now()
                                        };
                                        setPresets(prev => [...prev, newPreset]);
                                        setShowSavePresetModal(false);
                                    }
                                }}
                                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase shadow-lg"
                                style={{ backgroundColor: theme.accent, color: 'white' }}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};