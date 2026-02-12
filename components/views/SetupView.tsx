import React, { useState, useEffect } from 'react';
import { GameState, ThemeConfig, Player } from '../../types';
import { Users, X, Save, Check, Database, LayoutGrid, Settings, ChevronRight, Lock, Droplets, ScanEye, Ghost, ShieldCheck, Network, Beer, Eye, Zap, UserMinus, Brain, Gavel, GripVertical, TrendingUp, Crown, Target, Shield } from 'lucide-react';
import { GameModeWithTabs, GameModeItem } from '../GameModeWithTabs';
import { getMemoryConfigForDifficulty } from '../../utils/memoryWordGenerator';
import { getPlayerColor, getPlayerInitials } from '../../utils/playerHelpers';
import { getVault } from '../../utils/core/vault';

// DnD Kit Imports
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    savedPlayers: string[];
    onAddPlayer: (name: string) => void;
    onRemovePlayer: (id: string) => void;
    onSaveToBank: (name: string) => void;
    onDeleteFromBank: (name: string) => void;
    onToggleCategory: (cat: string) => void;
    onToggleAllCategories: () => void;
    onUpdateSettings: (s: Partial<GameState['settings']>) => void;
    onStartGame: () => void;
    onOpenSettings: () => void;
    onOpenCategories: () => void;
    onTitleTap: () => void;
    theme: ThemeConfig;
    isPixelating: boolean;
    hydrationTimer: number;
    onHydrationUnlock: () => void;
}

// Sub-component for Sortable Player Item
const SortablePlayer: React.FC<{
    player: Player;
    index: number;
    theme: ThemeConfig;
    onRemove: (id: string) => void;
    stats?: { games: number; wins: number; civilStreak: number; impostorRatio: number } | null;
}> = ({ player, index, theme, onRemove, stats }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: player.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: theme.border,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as 'relative',
    };

    const avatarColor = getPlayerColor(index);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex justify-between items-center p-3 rounded-lg animate-in slide-in-from-left duration-300 group touch-manipulation"
        >
            {/* Drag Handle */}
            <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing mr-2 flex-shrink-0 opacity-50 hover:opacity-100"
                style={{ color: theme.sub }}
            >
                <GripVertical size={16} />
            </div>

            {/* Avatar */}
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs mr-2 shrink-0 shadow-sm"
                style={{
                    backgroundColor: avatarColor.bg,
                    color: avatarColor.text
                }}
            >
                {getPlayerInitials(player.name)}
            </div>
            
            <span style={{ color: theme.text }} className="font-bold truncate text-sm flex-1 mr-2">
                {player.name}
            </span>
            
            <button 
                onClick={() => onRemove(player.id)} 
                style={{ color: theme.sub }} 
                className="hover:text-red-500 transition-colors shrink-0 p-1"
            >
                <X size={14} />
            </button>

            {/* Stats Tooltip */}
            {stats && (
                <div 
                    className="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 backdrop-blur-xl border"
                    style={{ 
                        backgroundColor: theme.cardBg,
                        borderColor: theme.accent,
                    }}
                >
                    <div className="flex items-center justify-between text-[10px] gap-2">
                        <div className="flex items-center gap-1">
                            <TrendingUp size={10} style={{ color: theme.accent }} />
                            <span style={{ color: theme.text }} className="font-bold">
                                {stats.games}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Crown size={10} style={{ color: '#f59e0b' }} />
                            <span style={{ color: theme.text }} className="font-bold">
                                {stats.wins}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Shield size={10} style={{ color: '#10b981' }} />
                            <span style={{ color: theme.text }} className="font-bold">
                                {stats.civilStreak}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const SetupView: React.FC<Props> = ({ 
    gameState, setGameState, savedPlayers, onAddPlayer, onRemovePlayer, onSaveToBank, onDeleteFromBank,
    onUpdateSettings, onStartGame, onOpenSettings, onOpenCategories, onTitleTap,
    theme, isPixelating, hydrationTimer, onHydrationUnlock
}) => {
    const [newPlayerName, setNewPlayerName] = useState("");
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    const isParty = gameState.settings.partyMode;
    const isValidToStart = gameState.players.length >= 3;

    // Limits
    const MIN_PLAYERS = 3;
    const MAX_PLAYERS = 20; // Increased max for better flexibility
    const RECOMMENDED_PLAYERS = { min: 4, max: 10 };
    const playerCount = gameState.players.length;
    const isUnderMin = playerCount < MIN_PLAYERS;
    const isOverMax = playerCount > MAX_PLAYERS;
    const isRecommended = playerCount >= RECOMMENDED_PLAYERS.min && playerCount <= RECOMMENDED_PLAYERS.max;

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de movimiento antes de activar drag
            },
        })
    );

    // Validation Logic
    const validatePlayerName = (name: string): { valid: boolean; error?: string } => {
        const trimmed = name.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'El nombre no puede estar vacío' };
        }
        if (trimmed.length < 2) {
            return { valid: false, error: 'Mínimo 2 caracteres' };
        }
        if (trimmed.length > 20) {
            return { valid: false, error: 'Máximo 20 caracteres' };
        }
        if (gameState.players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
            return { valid: false, error: 'Ya existe un jugador con este nombre' };
        }
        return { valid: true };
    };

    // Input Effects
    useEffect(() => {
        const trimmed = newPlayerName.trim();
        if (trimmed.length >= 1) {
            // Autocomplete filter
            const matches = savedPlayers.filter(name =>
                name.toLowerCase().includes(trimmed.toLowerCase()) &&
                !gameState.players.some(p => p.name === name)
            ).slice(0, 5); // Limit results
            setAutocompleteResults(matches);
            setShowAutocomplete(matches.length > 0);

            // Validation check
            const validation = validatePlayerName(newPlayerName);
            setValidationError(validation.valid ? null : validation.error);
        } else {
            setShowAutocomplete(false);
            setValidationError(null);
        }
    }, [newPlayerName, savedPlayers, gameState.players]);

    const handleAddPlayer = () => {
        const validation = validatePlayerName(newPlayerName);
        
        if (!validation.valid) {
            // Shake animation logic would go here
            const input = document.getElementById('player-name-input');
            input?.classList.remove('animate-shake');
            void input?.offsetWidth; // trigger reflow
            input?.classList.add('animate-shake');
            return;
        }
        
        onAddPlayer(newPlayerName);
        setNewPlayerName('');
        setShowAutocomplete(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setGameState(prev => {
                const oldIndex = prev.players.findIndex(p => p.id === active.id);
                const newIndex = prev.players.findIndex(p => p.id === over.id);
                
                return {
                    ...prev,
                    players: arrayMove(prev.players, oldIndex, newIndex)
                };
            });
        }
    };

    const handleModeToggle = (id: string) => {
        switch(id) {
            case 'hint': onUpdateSettings({ hintMode: !gameState.settings.hintMode }); break;
            case 'troll': onUpdateSettings({ trollMode: !gameState.settings.trollMode }); break;
            case 'architect': onUpdateSettings({ architectMode: !gameState.settings.architectMode }); break;
            case 'nexus': onUpdateSettings({ nexusMode: !gameState.settings.nexusMode }); break;
            case 'party': onUpdateSettings({ partyMode: !gameState.settings.partyMode }); break;
            case 'oracle': onUpdateSettings({ oracleMode: !gameState.settings.oracleMode }); break;
            case 'vanguardia': onUpdateSettings({ vanguardiaMode: !gameState.settings.vanguardiaMode }); break;
            case 'renuncia': onUpdateSettings({ renunciaMode: !gameState.settings.renunciaMode }); break;
            case 'magistrado': onUpdateSettings({ protocolMagistrado: !gameState.settings.protocolMagistrado }); break;
            case 'memory': 
                const config = gameState.settings.memoryModeConfig;
                if (!config.enabled) {
                     const defaults = getMemoryConfigForDifficulty(config.difficulty);
                     onUpdateSettings({ memoryModeConfig: { ...config, enabled: true, ...defaults } });
                } else {
                     onUpdateSettings({ memoryModeConfig: { ...config, enabled: false } });
                }
                break;
        }
    };

    const modes: GameModeItem[] = [
        // TAB: BÁSICOS
        {
            id: 'hint',
            name: 'Pistas',
            description: 'Impostores reciben pistas.',
            icon: <ScanEye size={20} />,
            isActive: gameState.settings.hintMode
        },
        {
            id: 'troll',
            name: 'Troll',
            description: 'Eventos de caos (5%).',
            icon: <Ghost size={20} />,
            isActive: gameState.settings.trollMode
        },
        {
            id: 'party',
            name: 'Fiesta',
            description: 'Castigos y bebida.',
            icon: <Beer size={20} />,
            isActive: gameState.settings.partyMode
        },
        {
            id: 'memory',
            name: 'Memoria',
            description: 'Palabras fugaces.',
            icon: <Brain size={20} />,
            isActive: gameState.settings.memoryModeConfig.enabled,
            isNew: true
        },
        // TAB: PROTOCOLOS
        {
            id: 'architect',
            name: 'Arquitecto',
            description: 'Civil elige la palabra.',
            icon: <ShieldCheck size={20} />,
            isActive: gameState.settings.architectMode
        },
        {
            id: 'magistrado',
            name: 'Magistrado',
            description: 'Alcalde con voto doble.',
            icon: <Gavel size={20} />,
            isActive: gameState.settings.protocolMagistrado,
            isDisabled: gameState.players.length < 6,
            isNew: true
        },
        {
            id: 'renuncia',
            name: 'Renuncia',
            description: 'Rechazar rol impostor.',
            icon: <UserMinus size={20} />,
            isActive: gameState.settings.renunciaMode,
            isDisabled: gameState.impostorCount < 2
        },
        // TAB: ALIANZAS
        {
            id: 'nexus',
            name: 'Nexus',
            description: 'Impostores aliados.',
            icon: <Network size={20} />,
            isActive: gameState.settings.nexusMode
        },
        {
            id: 'oracle',
            name: 'Oráculo',
            description: 'Pista pública inicial.',
            icon: <Eye size={20} />,
            isActive: gameState.settings.oracleMode && gameState.settings.hintMode,
            isDisabled: !gameState.settings.hintMode
        },
        {
            id: 'vanguardia',
            name: 'Vanguardia',
            description: 'Ventaja al inicio.',
            icon: <Zap size={20} />,
            isActive: gameState.settings.vanguardiaMode && gameState.settings.hintMode,
            isDisabled: !gameState.settings.hintMode
        }
    ];

    if (gameState.partyState.isHydrationLocked) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                <div className="w-48 h-48 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-20"/>
                    <Droplets size={80} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)] animate-bounce"/>
                </div>
                
                <h2 className="text-3xl font-black text-blue-400 uppercase text-center mb-4 tracking-tighter">
                    Protocolo Hidratación
                </h2>
                
                <p className="text-blue-200/70 text-center text-sm font-bold uppercase tracking-widest max-w-xs mb-12 leading-relaxed">
                    ¡ALTO! Los procesadores biológicos están sobrecalentados. Todo el grupo debe beber un vaso de agua antes de la siguiente fase de infiltración.
                </p>

                <button 
                    onClick={onHydrationUnlock}
                    disabled={hydrationTimer > 0}
                    style={{ 
                        backgroundColor: hydrationTimer > 0 ? '#1e293b' : '#3b82f6',
                        color: hydrationTimer > 0 ? '#64748b' : 'white'
                    }}
                    className="w-full max-w-xs py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {hydrationTimer > 0 ? (
                        <>
                            <Lock size={16} /> Espere {hydrationTimer}s
                        </>
                    ) : (
                        <>
                            <Check size={20} strokeWidth={3} /> Sistemas Refrigerados
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full relative z-10 animate-in fade-in duration-500 pt-[env(safe-area-inset-top)] ${isPixelating ? 'animate-dissolve' : ''}`}>
             
             {gameState.debugState.isEnabled && (
                 <div className="fixed inset-0 pointer-events-none z-[60] border-4 border-amber-500/50 animate-pulse" />
             )}

            <div className="flex-1 overflow-y-auto px-6 pb-48 space-y-6">
                <header className="pt-6 text-center space-y-2 mb-2">
                    <h1 
                        onClick={onTitleTap}
                        style={{ color: theme.text, fontFamily: theme.font }} 
                        className="text-5xl font-black italic tracking-tighter select-none cursor-default active:opacity-80 transition-opacity"
                    >
                        IMPOSTOR
                    </h1>
                    {isParty && <p style={{ color: theme.accent }} className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">DRINKING EDITION</p>}
                </header>

                <div 
                    style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: theme.border, 
                        borderRadius: theme.radius,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                    className="p-5 border backdrop-blur-md premium-border"
                >
                    {/* PLAYER HEADER & PROGRESS */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col flex-1 mr-4">
                            <div className="flex justify-between items-end mb-1">
                                <h3 style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-widest">
                                    Jugadores
                                </h3>
                                <span 
                                    className="text-[10px] font-black tabular-nums"
                                    style={{ 
                                        color: isUnderMin ? '#ef4444' : isRecommended ? theme.accent : theme.text 
                                    }}
                                >
                                    {playerCount}/{MAX_PLAYERS}
                                </span>
                            </div>
                            
                            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden w-full">
                                <div 
                                    className="h-full transition-all duration-300 rounded-full"
                                    style={{
                                        width: `${Math.min((playerCount / MAX_PLAYERS) * 100, 100)}%`,
                                        backgroundColor: isUnderMin 
                                            ? '#ef4444' 
                                            : isRecommended 
                                                ? theme.accent 
                                                : '#f59e0b'
                                    }}
                                />
                            </div>
                            <p className="text-[9px] font-bold mt-1.5 opacity-80" style={{ 
                                color: isUnderMin ? '#ef4444' : isRecommended ? theme.accent : theme.sub 
                            }}>
                                {isUnderMin 
                                    ? `Faltan ${MIN_PLAYERS - playerCount} jugadores` 
                                    : isRecommended 
                                        ? '✓ Cantidad ideal'
                                        : isOverMax 
                                            ? '⚠️ Límite alcanzado'
                                            : 'Puedes añadir más'
                                }
                            </p>
                        </div>
                        <Users size={20} color={theme.accent} className="shrink-0" />
                    </div>
                    
                    {/* DRAG & DROP PLAYER GRID */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={gameState.players.map(p => p.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {gameState.players.map((p, idx) => {
                                    const key = p.name.trim().toLowerCase();
                                    const vault = getVault(key, gameState.history.playerStats);
                                    const stats = vault.metrics.totalSessions > 0 ? {
                                        games: vault.metrics.totalSessions,
                                        wins: vault.metrics.totalImpostorWins,
                                        civilStreak: vault.metrics.civilStreak,
                                        impostorRatio: vault.metrics.impostorRatio
                                    } : null;

                                    return (
                                        <SortablePlayer
                                            key={p.id}
                                            player={p}
                                            index={idx}
                                            theme={theme}
                                            onRemove={onRemovePlayer}
                                            stats={stats}
                                        />
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* INPUT & AUTOCOMPLETE */}
                    <div className="relative">
                        <div className="flex gap-2 mb-2">
                            <input 
                                id="player-name-input"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyDown={(e) => { 
                                    if (e.key === 'Enter') handleAddPlayer();
                                }}
                                onFocus={() => newPlayerName.length >= 1 && setShowAutocomplete(true)}
                                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                                placeholder="Nuevo Jugador..."
                                disabled={playerCount >= MAX_PLAYERS}
                                className={`flex-1 min-w-0 rounded-lg px-4 py-3 outline-none text-sm font-bold transition-all placeholder:text-inherit placeholder:opacity-40 ${
                                    validationError ? 'border border-red-500' : 'border border-transparent focus:border-white/30'
                                }`}
                                style={{ backgroundColor: theme.border, color: theme.text }}
                                autoComplete="off"
                            />
                            <button 
                                onClick={() => { onSaveToBank(newPlayerName); setNewPlayerName(""); }}
                                style={{ backgroundColor: theme.border, color: theme.sub }}
                                className="w-12 rounded-lg font-bold hover:bg-white/10 active:scale-90 transition-transform flex items-center justify-center shrink-0"
                                title="Guardar en banco"
                            >
                                <Save size={20} />
                            </button>
                            <button 
                                onClick={handleAddPlayer}
                                disabled={playerCount >= MAX_PLAYERS}
                                style={{ backgroundColor: playerCount >= MAX_PLAYERS ? theme.border : theme.accent }}
                                className="w-12 rounded-lg text-white font-bold active:scale-90 transition-transform shadow-lg flex items-center justify-center shrink-0 disabled:opacity-50"
                            >
                                <Check size={24} />
                            </button>
                        </div>

                        {/* Error Message */}
                        {validationError && (
                            <p className="text-[10px] font-bold text-red-500 absolute -bottom-5 left-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                {validationError}
                            </p>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showAutocomplete && autocompleteResults.length > 0 && (
                            <div 
                                className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden z-30 shadow-2xl animate-in slide-in-from-top-2 duration-200"
                                style={{ 
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.border,
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {autocompleteResults.map((name, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onAddPlayer(name);
                                            setNewPlayerName('');
                                            setShowAutocomplete(false);
                                        }}
                                        className="w-full px-4 py-3 text-left font-bold text-xs transition-colors hover:bg-white/10 flex items-center gap-3 border-b border-white/5 last:border-0"
                                        style={{ color: theme.text }}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0"
                                            style={{
                                                backgroundColor: getPlayerColor(idx).bg,
                                                color: getPlayerColor(idx).text
                                            }}
                                        >
                                            {getPlayerInitials(name)}
                                        </div>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BANK SHORTCUT (If autocomplete empty but bank exists) */}
                    {!showAutocomplete && savedPlayers.length > 0 && gameState.players.length === 0 && (
                         <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Database size={12} color={theme.sub}/>
                                <h4 style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-widest">Sugerencias</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {savedPlayers.slice(0, 6).map((name, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => onAddPlayer(name)}
                                        style={{ 
                                            borderColor: theme.border,
                                            color: theme.sub
                                        }}
                                        className="px-3 py-1.5 rounded-full border text-[10px] font-bold hover:bg-white/5 transition-colors"
                                    >
                                        + {name}
                                    </button>
                                ))}
                            </div>
                         </div>
                    )}
                </div>

                <div 
                    style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: theme.border, 
                        borderRadius: theme.radius,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                    className="p-5 border backdrop-blur-md premium-border"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-widest">Impostores</p>
                        </div>
                        <div style={{ backgroundColor: theme.border }} className="flex items-center gap-4 rounded-lg p-1">
                            <button 
                                onClick={() => setGameState(prev => ({...prev, impostorCount: Math.max(1, prev.impostorCount - 1)}))}
                                style={{ color: theme.text }}
                                className="w-8 h-8 flex items-center justify-center font-bold hover:opacity-70 active:scale-75 transition-transform rounded"
                            >-</button>
                            <span style={{ color: theme.text }} className="font-bold w-4 text-center">{gameState.impostorCount}</span>
                            <button 
                                onClick={() => setGameState(prev => ({...prev, impostorCount: Math.min(gameState.players.length - 1, prev.impostorCount + 1)}))}
                                style={{ color: theme.text }}
                                className="w-8 h-8 flex items-center justify-center font-bold hover:opacity-70 active:scale-75 transition-transform rounded"
                            >+</button>
                        </div>
                    </div>

                    {/* NEW TABBED MODE SELECTOR */}
                    <div className="pt-4 border-t border-white/5">
                        <GameModeWithTabs 
                            modes={modes}
                            theme={theme}
                            onModeToggle={handleModeToggle}
                        />
                    </div>
                </div>
                
                <div className="flex w-full gap-3">
                    <button 
                        onClick={onOpenCategories}
                        style={{ 
                            borderColor: theme.border, 
                            color: theme.text, 
                            backgroundColor: theme.cardBg, 
                            borderRadius: theme.radius,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        className="flex-1 py-4 border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all backdrop-blur-md transform-gpu"
                    >
                        <LayoutGrid size={16} /> Categorías
                    </button>

                    <button 
                        onClick={onOpenSettings}
                        style={{ 
                            borderColor: theme.border, 
                            color: theme.sub,
                            backgroundColor: theme.border,
                            borderRadius: theme.radius,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        className="flex-1 py-4 px-2 border flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all backdrop-blur-md transform-gpu"
                    >
                        <Settings size={16} className="shrink-0" /> <span className="truncate">Ajustes y ayuda</span>
                    </button>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 pointer-events-none flex justify-center items-center">
                <div className="relative w-full max-w-xs group">
                    {isValidToStart && (
                        <div
                            className="absolute inset-1 rounded-full opacity-50 blur-xl"
                            style={{
                                backgroundColor: theme.accent,
                                animation: 'aura-pulse 2s ease-in-out infinite'
                            }}
                        />
                    )}

                    <button 
                        onClick={onStartGame}
                        disabled={!isValidToStart}
                        style={{ 
                            backgroundColor: !isValidToStart ? 'gray' : theme.accent,
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.1)'
                        }}
                        className="w-full py-3.5 relative z-10 text-white font-black text-base active:scale-90 transition-all duration-100 flex items-center justify-center gap-3 pointer-events-auto rounded-full overflow-hidden transform-gpu"
                    >
                        {isValidToStart && (
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]" 
                                 style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} 
                            />
                        )}
                        
                        <span className="relative z-10 flex items-center gap-3">
                            {isParty ? "COMENZAR EL BOTELLÓN" : "EMPEZAR PARTIDA"} <ChevronRight strokeWidth={4} size={20} />
                        </span>
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};