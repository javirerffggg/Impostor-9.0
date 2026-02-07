


import React, { useState } from 'react';
import { GameState, ThemeConfig, Player } from '../../types';
import { Users, X, Save, Check, Database, LayoutGrid, Settings, ChevronRight, Lock, Droplets, ScanEye, Ghost, ShieldCheck, Network, Beer, Eye, Zap, UserMinus, Brain, Gavel } from 'lucide-react';
import { GameModeGrid, GameModeItem } from '../GameModeGrid';
import { getMemoryConfigForDifficulty } from '../../utils/memoryWordGenerator';

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

export const SetupView: React.FC<Props> = ({ 
    gameState, setGameState, savedPlayers, onAddPlayer, onRemovePlayer, onSaveToBank, onDeleteFromBank,
    onUpdateSettings, onStartGame, onOpenSettings, onOpenCategories, onTitleTap,
    theme, isPixelating, hydrationTimer, onHydrationUnlock
}) => {
    const [newPlayerName, setNewPlayerName] = useState("");
    const isParty = gameState.settings.partyMode;
    const isValidToStart = gameState.players.length >= 3;

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
        {
            id: 'hint',
            name: 'Pistas',
            description: 'Impostores reciben pistas.',
            icon: <ScanEye size={20} />,
            isActive: gameState.settings.hintMode
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
            id: 'troll',
            name: 'Troll',
            description: 'Eventos de caos (5%).',
            icon: <Ghost size={20} />,
            isActive: gameState.settings.trollMode
        },
        {
            id: 'architect',
            name: 'Arquitecto',
            description: 'Civil elige la palabra.',
            icon: <ShieldCheck size={20} />,
            isActive: gameState.settings.architectMode
        },
        {
            id: 'nexus',
            name: 'Nexus',
            description: 'Impostores aliados.',
            icon: <Network size={20} />,
            isActive: gameState.settings.nexusMode
        },
        {
            id: 'party',
            name: 'Fiesta',
            description: 'Castigos y bebida.',
            icon: <Beer size={20} />,
            isActive: gameState.settings.partyMode
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
        },
        {
            id: 'renuncia',
            name: 'Renuncia',
            description: 'Rechazar rol.',
            icon: <UserMinus size={20} />,
            isActive: gameState.settings.renunciaMode,
            isDisabled: gameState.impostorCount < 2
        },
        {
            id: 'memory',
            name: 'Memoria',
            description: 'Palabras fugaces.',
            icon: <Brain size={20} />,
            isActive: gameState.settings.memoryModeConfig.enabled,
            isNew: true
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-widest">Jugadores ({gameState.players.length})</h3>
                        <Users size={16} color={theme.accent} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4"> 
                        {gameState.players.map(p => (
                            <div key={p.id} style={{ backgroundColor: theme.border }} className="flex justify-between items-center p-3 rounded-lg animate-in slide-in-from-left duration-300">
                                <span style={{ color: theme.text }} className="font-bold truncate text-sm mr-2">{p.name}</span>
                                <button onClick={() => onRemovePlayer(p.id)} style={{ color: theme.sub }} className="hover:text-red-500 transition-colors shrink-0">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input 
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { onAddPlayer(newPlayerName); setNewPlayerName(""); } }}
                            placeholder="Nuevo Jugador..."
                            className="flex-1 min-w-0 rounded-lg px-4 py-3 outline-none text-sm font-bold border border-transparent focus:border-white/30 transition-colors placeholder:text-inherit placeholder:opacity-40"
                            style={{ backgroundColor: theme.border, color: theme.text }}
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
                            onClick={() => { onAddPlayer(newPlayerName); setNewPlayerName(""); }}
                            style={{ backgroundColor: theme.accent }}
                            className="w-12 rounded-lg text-white font-bold active:scale-90 transition-transform shadow-lg flex items-center justify-center shrink-0"
                        >
                            <Check size={24} />
                        </button>
                    </div>

                    {savedPlayers.length > 0 && (
                         <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Database size={12} color={theme.sub}/>
                                <h4 style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-widest">Banco de Agentes</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {savedPlayers.map((name, idx) => {
                                    const isInGame = gameState.players.some(p => p.name === name);
                                    return (
                                        <div 
                                            key={idx}
                                            style={{ 
                                                backgroundColor: isInGame ? theme.accent : theme.border,
                                                opacity: isInGame ? 0.5 : 1,
                                                borderColor: theme.border
                                            }}
                                            className="pl-3 pr-1 py-1.5 rounded-full border flex items-center gap-2 transition-all"
                                        >
                                            <button 
                                                onClick={() => !isInGame && onAddPlayer(name)}
                                                disabled={isInGame}
                                                style={{ color: isInGame ? 'white' : theme.text }}
                                                className="text-xs font-bold disabled:cursor-not-allowed"
                                            >
                                                {name}
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteFromBank(name); }}
                                                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10"
                                                style={{ color: theme.sub }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
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

                    {/* NEW COMPACT MODE GRID */}
                    <div className="pt-4 border-t border-white/5">
                        <GameModeGrid 
                            modes={modes}
                            theme={theme}
                            onModeToggle={handleModeToggle}
                            compactLimit={6}
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
        </div>
    );
};