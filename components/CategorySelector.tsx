import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ThemeConfig, CategoryPreset } from '../types';
import { CATEGORIES_DATA } from '../categories';
import { CURATED_COLLECTIONS } from '../constants';
import {
    X, CheckCheck, Library, List, Shuffle, Save,
    Search, LayoutGrid, Grid3x3, ArrowUp
} from 'lucide-react';
import { CategoryGrid } from './categorySelector/CategoryGrid';
import { CollectionGrid } from './categorySelector/CollectionGrid';
import { PreviewModal } from './categorySelector/PreviewModal';
import { SavePresetModal } from './categorySelector/SavePresetModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleCollection: (colId: string) => void;
    onToggleAll: () => void;
    theme: ThemeConfig;
    categoryUsageStats?: Record<string, number>;
    favoriteCategories?: string[];
    onToggleFavoriteCategory?: (cat: string) => void;
    onBlockCategory?: (cat: string) => void;
    temporaryBlacklist?: Record<string, number>;
    // Exposes a direct setter to avoid buggy multi-toggle logic
    onSetCategories?: (cats: string[]) => void;
}

const fuzzyMatch = (text: string, query: string): boolean => {
    const t = text.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return true;
    let idx = 0;
    for (const ch of q) {
        idx = t.indexOf(ch, idx);
        if (idx === -1) return false;
        idx++;
    }
    return true;
};

export const CategorySelector: React.FC<Props> = ({
    isOpen, onClose, selectedCategories, onToggleCategory, onToggleCollection,
    onToggleAll, theme, categoryUsageStats,
    favoriteCategories = [], onToggleFavoriteCategory, onBlockCategory,
    temporaryBlacklist = {},
    onSetCategories
}) => {
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
    const [isScrolled, setIsScrolled] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isGradientBg = theme.bg.toLowerCase().includes('gradient');
    const allCats = useMemo(() => Object.keys(CATEGORIES_DATA), []);
    const totalSelectedCount = selectedCategories.length;

    // Persist presets
    useEffect(() => {
        localStorage.setItem('impostor_category_presets', JSON.stringify(presets));
    }, [presets]);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 80);
        }
    }, []);

    const scrollToTopAndSearch = useCallback(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => searchInputRef.current?.focus(), 300);
    }, []);

    const filteredCategories = useMemo(
        () => searchQuery.trim() ? allCats.filter(cat => fuzzyMatch(cat, searchQuery)) : allCats,
        [allCats, searchQuery]
    );

    // Fix: use onSetCategories if available, otherwise fall back to toggling
    const handleRandomSelection = useCallback((count = 15) => {
        const shuffled = [...allCats].sort(() => Math.random() - 0.5);
        const randomCats = shuffled.slice(0, count);
        if (onSetCategories) {
            onSetCategories(randomCats);
        } else {
            // Fallback: compute symmetric diff and toggle accordingly
            const toDeactivate = selectedCategories.filter(c => !randomCats.includes(c));
            const toActivate = randomCats.filter(c => !selectedCategories.includes(c));
            toDeactivate.forEach(c => onToggleCategory(c));
            toActivate.forEach(c => onToggleCategory(c));
        }
    }, [allCats, selectedCategories, onSetCategories, onToggleCategory]);

    const handleApplyPreset = useCallback((preset: CategoryPreset) => {
        if (onSetCategories) {
            onSetCategories(preset.categories);
        } else {
            const toDeactivate = selectedCategories.filter(c => !preset.categories.includes(c));
            const toActivate = preset.categories.filter(c => !selectedCategories.includes(c));
            toDeactivate.forEach(c => onToggleCategory(c));
            toActivate.forEach(c => onToggleCategory(c));
        }
    }, [selectedCategories, onSetCategories, onToggleCategory]);

    const handleDeletePreset = useCallback((id: string) => {
        setPresets(prev => prev.filter(p => p.id !== id));
        setDeleteConfirmId(null);
    }, []);

    const handleSelectFromPreview = useCallback((cat: string) => {
        if (!selectedCategories.includes(cat)) onToggleCategory(cat);
    }, [selectedCategories, onToggleCategory]);

    return (
        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
            <div style={{ backgroundColor: theme.bg }} className="absolute inset-0 flex flex-col overflow-hidden">

                {/* Floating close button */}
                <div className="absolute top-0 right-0 z-50 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pointer-events-none">
                    <button
                        style={{ color: theme.text, backgroundColor: `${theme.bg}80` }}
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-transform active:scale-90 pointer-events-auto backdrop-blur-md border border-white/10 shadow-lg"
                    >
                        <X />
                    </button>
                </div>

                {/* Scrollable area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-36"
                >
                    {/* Header */}
                    <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
                        <div className="flex flex-col mb-4">
                            <h2 style={{ color: theme.text }} className="text-2xl font-black italic tracking-tighter">
                                Categorías
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <div
                                    className="px-3 py-1.5 rounded-full font-black text-xs transition-colors"
                                    style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
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

                        {/* Progress bar */}
                        <div className="mb-6 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                            <div
                                className="h-full transition-all duration-500 rounded-full"
                                style={{
                                    width: `${(totalSelectedCount / allCats.length) * 100}%`,
                                    backgroundColor: theme.accent
                                }}
                            />
                        </div>

                        {/* Presets row */}
                        {presets.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: theme.sub }}>
                                    Tus Presets
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {presets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleApplyPreset(preset)}
                                            className="shrink-0 px-4 py-2 rounded-xl border flex items-center gap-3 relative group active:scale-95 transition-transform"
                                            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                                        >
                                            <span className="text-lg">{preset.emoji}</span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-bold" style={{ color: theme.text }}>{preset.name}</span>
                                                <span className="text-[8px] opacity-60" style={{ color: theme.sub }}>{preset.categories.length} temas</span>
                                            </div>
                                            {/* Delete — requires confirmation tap */}
                                            {deleteConfirmId === preset.id ? (
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                                                    className="w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1 bg-red-500 text-white shadow-sm animate-pulse"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setDeleteConfirmId(preset.id); setTimeout(() => setDeleteConfirmId(null), 2500); }}
                                                    className="w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/70 text-white shadow-sm"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* View mode tabs + action buttons */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex-1 flex bg-black/20 p-1 rounded-2xl border border-white/5 gap-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'
                                    }`}
                                >
                                    <List size={14} /> Lista
                                </button>
                                <button
                                    onClick={() => setViewMode('collections')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        viewMode === 'collections' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 opacity-70'
                                    }`}
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
                                title={isCompactMode ? 'Vista expandida' : 'Vista compacta'}
                            >
                                {isCompactMode ? <Grid3x3 size={18} /> : <LayoutGrid size={18} />}
                            </button>
                        </div>

                        {/* Search bar — list mode only */}
                        {viewMode === 'list' && (
                            <div className="relative group mb-6">
                                <Search
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: theme.sub }}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={`Buscar entre ${allCats.length} categorías...`}
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
                                        onClick={() => { setSearchQuery(''); scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                        style={{ backgroundColor: theme.accent }}
                                    >
                                        <X size={12} color="white" strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Action buttons — list mode only */}
                        {viewMode === 'list' && (
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={onToggleAll}
                                    style={{ borderColor: theme.accent, color: theme.accent, backgroundColor: theme.cardBg }}
                                    className="flex-1 py-4 border rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 shadow-sm hover:brightness-110"
                                >
                                    <CheckCheck size={16} />
                                    {selectedCategories.length === allCats.length ? 'DESACTIVAR TODO' : 'ACTIVAR TODO'}
                                </button>

                                <button
                                    onClick={() => handleRandomSelection(15)}
                                    style={{ backgroundColor: theme.accent, color: 'white' }}
                                    className="flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg hover:brightness-110"
                                >
                                    <Shuffle size={16} />
                                    SORPRÉNDEME ×15
                                </button>
                            </div>
                        )}

                        {searchQuery && (
                            <p className="text-[10px] font-bold px-1 mt-2" style={{ color: theme.sub }}>
                                {filteredCategories.length} RESULTADO{filteredCategories.length !== 1 ? 'S' : ''}
                            </p>
                        )}
                    </div>

                    {/* Main content */}
                    <div className="px-6 pb-48">
                        {viewMode === 'collections' ? (
                            <CollectionGrid
                                selectedCategories={selectedCategories}
                                theme={theme}
                                onToggleCollection={onToggleCollection}
                            />
                        ) : (
                            <CategoryGrid
                                categories={filteredCategories}
                                selectedCategories={selectedCategories}
                                favoriteCategories={favoriteCategories}
                                temporaryBlacklist={temporaryBlacklist}
                                categoryUsageStats={categoryUsageStats}
                                isCompactMode={isCompactMode}
                                theme={theme}
                                onToggleCategory={onToggleCategory}
                                onPreviewCategory={setPreviewCategory}
                                onToggleFavoriteCategory={onToggleFavoriteCategory}
                                onBlockCategory={onBlockCategory}
                            />
                        )}

                        {searchQuery && filteredCategories.length === 0 && (
                            <div className="text-center py-12 opacity-50">
                                <p className="text-xs font-bold" style={{ color: theme.text }}>Sin resultados para "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pointer-events-none transition-all duration-300"
                    style={!isGradientBg ? {
                        background: `linear-gradient(to top, ${theme.bg} 40%, ${theme.bg}CC 80%, transparent 100%)`
                    } : undefined}
                >
                    {isGradientBg && (
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                                backgroundColor: theme.cardBg,
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                maskImage: 'linear-gradient(to bottom, transparent, black 30%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%)',
                                zIndex: -1
                            }}
                        />
                    )}

                    <div className="flex gap-2 items-end pointer-events-auto">
                        <button
                            onClick={onClose}
                            style={{ backgroundColor: theme.accent, color: '#fff' }}
                            className={`
                                py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl
                                active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2
                                ${isScrolled ? 'flex-1' : 'w-full'}
                            `}
                        >
                            CONFIRMAR SELECCIÓN
                        </button>

                        <div className={`flex gap-2 transition-all duration-500 ease-out overflow-hidden ${
                            isScrolled ? 'max-w-[120px] opacity-100 ml-1' : 'max-w-0 opacity-0'
                        }`}>
                            <button
                                onClick={onToggleAll}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 active:scale-90 transition-transform"
                                style={{ color: theme.text }}
                                title="Activar/Desactivar todo"
                            >
                                <CheckCheck size={18} />
                            </button>
                            <button
                                onClick={scrollToTopAndSearch}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 active:scale-90 transition-transform"
                                style={{ color: theme.text }}
                                title="Buscar"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {previewCategory && (
                <PreviewModal
                    category={previewCategory}
                    selectedCategories={selectedCategories}
                    theme={theme}
                    onClose={() => setPreviewCategory(null)}
                    onSelect={handleSelectFromPreview}
                />
            )}

            {showSavePresetModal && (
                <SavePresetModal
                    selectedCategories={selectedCategories}
                    theme={theme}
                    onSave={preset => setPresets(prev => [...prev, preset])}
                    onClose={() => setShowSavePresetModal(false)}
                />
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
