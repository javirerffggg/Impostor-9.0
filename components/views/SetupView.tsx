
import React, { useState, useEffect, useRef } from 'react';
import { GameState, ThemeConfig, Player } from '../../types';
import { Users, X, Save, Check, Database, LayoutGrid, Settings, ChevronRight, Lock, Droplets, ScanEye, Ghost, ShieldCheck, Network, Beer, Eye, Zap, UserMinus, Brain, Gavel, TrendingUp, Crown, Target, Shield, Bug, AlertTriangle, Gamepad2 } from 'lucide-react';
import { GameModeWithTabs, GameModeItem } from '../GameModeWithTabs';
import { getMemoryConfigForDifficulty } from '../../utils/memoryWordGenerator';
import { getPlayerColor, getPlayerInitials } from '../../utils/playerHelpers';
import { getVault } from '../../utils/core/vault';
import { GAME_LIMITS } from '../../constants';
// @ts-ignore
import confetti from 'canvas-confetti';

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

// Sub-component for Sortable Player Item (Premium Version)
const PlayerCardPremium: React.FC<{
  player: Player;
  index: number;
  theme: ThemeConfig;
  onRemove: (id: string) => void;
  stats?: { games: number; wins: number; civilStreak: number } | null;
}> = ({ player, index, theme, onRemove, stats }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player.id });

  const [showStats, setShowStats] = useState(false);
  const avatarColor = getPlayerColor(index);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group animate-in slide-in-from-left fade-in duration-300 touch-none"
      // style={{ animationDelay: `${index * 50}ms` }} // JSX style override issue if mixed with style variable
      onMouseEnter={() => setShowStats(true)}
      onMouseLeave={() => setShowStats(false)}
      {...attributes}
      {...listeners}
    >
      {/* Card principal */}
      <div 
        className={`
          relative overflow-hidden rounded-xl p-2.5
          transition-all duration-300 cursor-grab active:cursor-grabbing
          ${isDragging ? 'scale-105 rotate-2' : 'scale-100 hover:scale-102'}
        `}
        style={{
          backgroundColor: avatarColor.bg,
          boxShadow: isDragging 
            ? `0 20px 40px -10px ${avatarColor.bg}, 0 0 0 2px ${avatarColor.bg}40`
            : `0 4px 12px -6px ${avatarColor.bg}80`,
          animationDelay: `${index * 50}ms`
        }}
      >
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`
          }}
        />
        
        {/* Pattern decorativo */}
        <div 
          className="absolute -right-4 -top-4 w-20 h-20 opacity-5"
          style={{
            background: `radial-gradient(circle, white 2px, transparent 2px)`,
            backgroundSize: '10px 10px'
          }}
        />
        
        <div className="relative z-10 flex items-center gap-2 pl-1">
          {/* Indicador de stats (dot) si existe */}
          {stats && (
             <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm shrink-0" />
          )}

          {/* Nombre */}
          <span 
            className="
              flex-1 font-bold text-xs leading-tight
              drop-shadow-sm line-clamp-1
            "
            style={{ color: 'white' }}
          >
            {player.name}
          </span>
          
          {/* Botón eliminar */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(player.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="
              w-6 h-6 rounded-md flex items-center justify-center
              opacity-60 hover:opacity-100
              transition-all duration-200
              hover:bg-white/20 active:scale-90
              shrink-0
            "
            style={{ color: 'white' }}
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
        
        {/* Stats tooltip (hover) */}
        {showStats && stats && (
          <div 
            className="
              absolute top-full left-0 right-0 mt-2 p-3 rounded-xl
              backdrop-blur-2xl border z-50
              animate-in slide-in-from-top-2 fade-in duration-200
            "
            style={{ 
              backgroundColor: `${theme.cardBg}`,
              borderColor: avatarColor.bg,
              boxShadow: `0 10px 40px -10px ${avatarColor.bg}60`
            }}
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp size={12} style={{ color: theme.accent }} />
                </div>
                <p 
                  className="text-lg font-black"
                  style={{ color: theme.text }}
                >
                  {stats.games}
                </p>
                <p 
                  className="text-[8px] font-bold uppercase opacity-60"
                  style={{ color: theme.sub }}
                >
                  Partidas
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Crown size={12} className="text-yellow-400" />
                </div>
                <p 
                  className="text-lg font-black"
                  style={{ color: theme.text }}
                >
                  {stats.wins}
                </p>
                <p 
                  className="text-[8px] font-bold uppercase opacity-60"
                  style={{ color: theme.sub }}
                >
                  Victorias
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Shield size={12} className="text-green-400" />
                </div>
                <p 
                  className="text-lg font-black"
                  style={{ color: theme.text }}
                >
                  {stats.civilStreak}
                </p>
                <p 
                  className="text-[8px] font-bold uppercase opacity-60"
                  style={{ color: theme.sub }}
                >
                  Racha
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
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
    
    const autocompleteTimeoutRef = useRef<number | null>(null);

    // --- ACTIVATION LOGIC (VISUAL FEEDBACK) ---
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [showActivationProgress, setShowActivationProgress] = useState(false);
    const tapTimeoutRef = useRef<number | null>(null);

    const handleLogoTap = () => {
        if (gameState.debugState.isEnabled) return;

        const now = Date.now();
        
        if (now - lastTapTime > 2000) {
            setTapCount(1);
        } else {
            setTapCount(prev => prev + 1);
        }
        
        setLastTapTime(now);
        setShowActivationProgress(true);
        
        if (navigator.vibrate) {
            const pattern = tapCount < 4 ? 30 : [50, 50, 100];
            navigator.vibrate(pattern);
        }
        
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        
        tapTimeoutRef.current = window.setTimeout(() => {
            setShowActivationProgress(false);
            setTapCount(0);
        }, 2000);
        
        if (tapCount + 1 >= 5) {
            setGameState(prev => ({
                ...prev,
                debugState: { ...prev.debugState, isEnabled: true }
            }));
            
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.3 },
                colors: [theme.accent, '#00ff00', '#ffffff']
            });
            
            setTapCount(0);
            setShowActivationProgress(false);
        }
    };

    useEffect(() => {
        return () => {
            if (autocompleteTimeoutRef.current) {
                clearTimeout(autocompleteTimeoutRef.current);
            }
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
            }
        };
    }, []);

    const isParty = gameState.settings.partyMode;
    const isValidToStart = gameState.players.length >= 3;

    const MIN_PLAYERS = GAME_LIMITS.MIN_PLAYERS;
    const MAX_PLAYERS = GAME_LIMITS.MAX_PLAYERS;
    const RECOMMENDED_PLAYERS = { min: GAME_LIMITS.RECOMMENDED_MIN, max: GAME_LIMITS.RECOMMENDED_MAX };
    
    const playerCount = gameState.players.length;
    const isUnderMin = playerCount < MIN_PLAYERS;
    const isOverMax = playerCount > MAX_PLAYERS;
    const isRecommended = playerCount >= RECOMMENDED_PLAYERS.min && playerCount <= RECOMMENDED_PLAYERS.max;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

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

    useEffect(() => {
        const trimmed = newPlayerName.trim();
        if (trimmed.length >= 1) {
            const matches = savedPlayers.filter(name =>
                name.toLowerCase().includes(trimmed.toLowerCase()) &&
                !gameState.players.some(p => p.name === name)
            ).slice(0, 5);
            setAutocompleteResults(matches);
            setShowAutocomplete(matches.length > 0);

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
            isActive: gameState.settings.memoryModeConfig.enabled
        },
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
            isDisabled: gameState.players.length < 6
        },
        {
            id: 'renuncia',
            name: 'Renuncia',
            description: 'Rechazar rol impostor.',
            icon: <UserMinus size={20} />,
            isActive: gameState.settings.renunciaMode,
            isDisabled: gameState.impostorCount < 2
        },
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
        <div className={`flex flex-col h-full relative z-10 animate-in fade-in duration-500 overflow-x-hidden ${isPixelating ? 'animate-dissolve' : ''}`}>
             
             {gameState.debugState.isEnabled && (
                 <div className="fixed inset-0 pointer-events-none z-[60] border-4 border-amber-500/50 animate-pulse" />
             )}

            {/* Scroll Gradients - FIXED PERMANENT VISIBILITY */}
            {/* Top gradient removed as requested */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none" />

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-48 space-y-4 no-scrollbar">
                
                {/* --- HEADER ULTRA PREMIUM --- */}
                <header className="pt-[calc(2rem+env(safe-area-inset-top))] pb-6 text-center space-y-4 mb-4 relative">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full opacity-30"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          backgroundColor: theme.accent,
                          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
                          animationDirection: Math.random() > 0.5 ? 'normal' : 'alternate'
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative inline-block group">
                    <div 
                      className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${theme.accent}80 0%, transparent 70%)`,
                        transform: 'scale(1.5)'
                      }}
                    />
                    
                    <div 
                      className="relative px-8 py-4 rounded-3xl backdrop-blur-xl"
                      style={{
                        backgroundColor: `${theme.cardBg}40`,
                        border: `1px solid ${theme.border}`,
                        boxShadow: `
                          0 20px 60px -15px ${theme.accent}20,
                          inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `
                      }}
                    >
                      <h1 
                        onClick={handleLogoTap}
                        className="
                          text-5xl sm:text-6xl font-black italic tracking-tighter select-none 
                          cursor-pointer transition-all duration-300
                          hover:scale-105 active:scale-95
                          relative z-10 pr-2
                        "
                        style={{ 
                          color: theme.text,
                          fontFamily: theme.font,
                          textShadow: `
                            0 0 30px ${theme.accent}40,
                            0 2px 10px rgba(0, 0, 0, 0.3)
                          `,
                          background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.accent} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        IMPOSTOR
                      </h1>
                      
                      <div 
                        className="absolute -bottom-2 right-4 px-2 py-0.5 rounded-full border text-[8px] font-mono"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.sub,
                          opacity: 0.4
                        }}
                      >
                        v12.5
                      </div>
                    </div>
                    
                    {showActivationProgress && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="relative overflow-hidden rounded-full"
                            style={{
                              width: i < tapCount ? '24px' : '8px',
                              height: '4px',
                              backgroundColor: i < tapCount ? theme.accent : `${theme.sub}40`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: i < tapCount ? `0 0 10px ${theme.accent}` : 'none'
                            }}
                          >
                            {i < tapCount && (
                              <div 
                                className="absolute inset-0"
                                style={{
                                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
                                  animation: 'shimmer 1s infinite'
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {gameState.debugState.isEnabled && (
                      <div 
                        className="absolute -top-3 -right-3 animate-in zoom-in duration-300"
                      >
                        <div 
                          className="relative px-3 py-1.5 rounded-xl border-2 backdrop-blur-xl"
                          style={{
                            backgroundColor: `${theme.cardBg}F0`,
                            borderColor: theme.accent,
                            boxShadow: `0 0 20px ${theme.accent}60, inset 0 1px 0 rgba(255,255,255,0.2)`
                          }}
                        >
                          <div 
                            className="absolute inset-0 rounded-xl opacity-50"
                            style={{
                              background: `linear-gradient(45deg, ${theme.accent}, transparent, ${theme.accent})`,
                              backgroundSize: '200% 200%',
                              animation: 'gradient-rotate 3s linear infinite',
                              filter: 'blur(4px)'
                            }}
                          />
                          
                          <div className="relative z-10 flex items-center gap-1.5">
                            <Bug size={12} style={{ color: theme.accent }} className="animate-pulse" />
                            <span 
                              className="text-[9px] font-black uppercase tracking-wider"
                              style={{ color: theme.accent }}
                            >
                              CENTINELA
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isParty && (
                    <div className="relative inline-block animate-in zoom-in duration-500 delay-200">
                      <div 
                        className="absolute inset-0 blur-xl opacity-50"
                        style={{ backgroundColor: '#ec4899' }}
                      />
                      <div 
                        className="relative px-4 py-1.5 rounded-full border backdrop-blur-xl"
                        style={{
                          backgroundColor: 'rgba(236, 72, 153, 0.1)',
                          borderColor: 'rgba(236, 72, 153, 0.3)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Beer size={12} className="text-pink-400 animate-bounce" />
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-pink-400">
                            DRINKING EDITION
                          </span>
                          <Beer size={12} className="text-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </header>

                {/* --- CARD DE JUGADORES PREMIUM --- */}
                <div 
                  className="p-5 border backdrop-blur-2xl relative overflow-hidden group"
                  style={{ 
                    backgroundColor: `${theme.cardBg}F5`,
                    borderColor: theme.border,
                    borderRadius: '24px',
                    boxShadow: `
                      0 20px 60px -15px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05)
                    `
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${theme.accent}, transparent 70%)`,
                      animation: 'pulse-slow 4s ease-in-out infinite'
                    }}
                  />
                  
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} style={{ color: theme.accent }} />
                        <h3 
                          className="text-xs font-black uppercase tracking-[0.25em]"
                          style={{ color: theme.sub }}
                        >
                          Sala de Jugadores
                        </h3>
                      </div>
                      
                      <div className="relative h-2 rounded-full overflow-hidden bg-black/20 backdrop-blur-sm">
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                              90deg,
                              transparent,
                              transparent 10px,
                              rgba(255,255,255,0.1) 10px,
                              rgba(255,255,255,0.1) 11px
                            )`
                          }}
                        />
                        
                        <div 
                          className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min((playerCount / MAX_PLAYERS) * 100, 100)}%`,
                            background: isUnderMin 
                              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                              : isRecommended 
                                ? `linear-gradient(90deg, ${theme.accent}, ${theme.accent}CC)`
                                : 'linear-gradient(90deg, #f59e0b, #d97706)',
                            boxShadow: isRecommended ? `0 0 10px ${theme.accent}40` : 'none'
                          }}
                        >
                          <div 
                            className="absolute inset-0 opacity-40"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer-progress 2s linear infinite'
                            }}
                          />
                        </div>
                        
                        {[MIN_PLAYERS, RECOMMENDED_PLAYERS.min, RECOMMENDED_PLAYERS.max, MAX_PLAYERS].map((milestone, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-white/20"
                            style={{
                              left: `${(milestone / MAX_PLAYERS) * 100}%`
                            }}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p 
                          className="text-[10px] font-bold flex items-center gap-1.5"
                          style={{ 
                            color: isUnderMin ? '#ef4444' : isRecommended ? theme.accent : theme.sub 
                          }}
                        >
                          {isUnderMin && <AlertTriangle size={10} />}
                          {isRecommended && <Check size={10} />}
                          <span>
                            {isUnderMin 
                              ? `Faltan ${MIN_PLAYERS - playerCount} jugadores` 
                              : isRecommended 
                                ? 'Cantidad ideal' 
                                : isOverMax 
                                  ? 'Límite alcanzado'
                                  : 'Puedes añadir más'
                            }
                          </span>
                        </p>
                        
                        <span 
                          className="text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: isRecommended ? `${theme.accent}20` : 'rgba(0,0,0,0.2)',
                            color: isUnderMin ? '#ef4444' : isRecommended ? theme.accent : theme.text 
                          }}
                        >
                          {playerCount}/{MAX_PLAYERS}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={gameState.players.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
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
                            <PlayerCardPremium
                              key={p.id}
                              player={p}
                              index={idx}
                              theme={theme}
                              onRemove={onRemovePlayer}
                              stats={stats}
                            />
                          );
                        })}
                        
                        {gameState.players.length === 0 && (
                          <div 
                            className="col-span-2 py-12 text-center space-y-4 rounded-2xl border-2 border-dashed"
                            style={{ borderColor: `${theme.border}40` }}
                          >
                            <div className="relative inline-block">
                              <div 
                                className="absolute inset-0 blur-xl opacity-20"
                                style={{ backgroundColor: theme.accent }}
                              />
                              <Users 
                                size={48} 
                                style={{ color: theme.sub }}
                                className="opacity-40 relative z-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <p 
                                className="text-sm font-bold"
                                style={{ color: theme.text }}
                              >
                                Ningún jugador aún
                              </p>
                              <p 
                                className="text-xs opacity-60"
                                style={{ color: theme.sub }}
                              >
                                Añade al menos {MIN_PLAYERS} para empezar
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  <div className="relative z-10">
                    <div 
                      className="relative rounded-2xl overflow-hidden backdrop-blur-xl mb-3"
                      style={{
                        backgroundColor: `${theme.border}80`,
                        border: `2px solid ${validationError ? '#ef4444' : 'transparent'}`,
                        boxShadow: validationError 
                          ? '0 0 0 4px rgba(239, 68, 68, 0.1)' 
                          : `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                      }}
                    >
                      <div className="flex gap-2 p-2">
                        <input 
                          id="player-name-input"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter' && !validationError) handleAddPlayer();
                          }}
                          onFocus={() => {
                            if (autocompleteTimeoutRef.current) clearTimeout(autocompleteTimeoutRef.current);
                            if (newPlayerName.length >= 1) setShowAutocomplete(true);
                          }}
                          onBlur={() => {
                            autocompleteTimeoutRef.current = window.setTimeout(() => setShowAutocomplete(false), 200);
                          }}
                          placeholder="Nuevo Jugador..."
                          disabled={playerCount >= MAX_PLAYERS}
                          className="
                            flex-1 min-w-0 bg-transparent px-4 py-3 
                            outline-none text-sm font-bold 
                            placeholder:opacity-40 disabled:opacity-50
                          "
                          style={{ color: theme.text }}
                          autoComplete="off"
                        />
                        
                        <button 
                          onClick={() => { 
                            if (newPlayerName.trim()) {
                              onSaveToBank(newPlayerName); 
                              setNewPlayerName(""); 
                            }
                          }}
                          className="
                            w-11 h-11 rounded-xl flex items-center justify-center
                            transition-all duration-200
                            hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                          style={{ 
                            backgroundColor: `${theme.border}CC`,
                            color: theme.sub 
                          }}
                          title="Guardar en banco"
                          disabled={!newPlayerName.trim()}
                        >
                          <Save size={18} />
                        </button>
                        
                        <button 
                          onClick={handleAddPlayer}
                          disabled={playerCount >= MAX_PLAYERS || !!validationError}
                          className="
                            w-11 h-11 rounded-xl flex items-center justify-center
                            transition-all duration-200
                            hover:scale-105 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                            shadow-lg
                          "
                          style={{ 
                            backgroundColor: playerCount >= MAX_PLAYERS || validationError 
                              ? theme.border 
                              : theme.accent,
                            color: '#ffffff'
                          }}
                        >
                          <Check size={20} strokeWidth={3} />
                        </button>
                      </div>
                      
                      {newPlayerName.length > 0 && (
                        <div 
                          className="absolute bottom-1 right-14 text-[9px] font-mono opacity-40"
                          style={{ color: theme.sub }}
                        >
                          {newPlayerName.length}/20
                        </div>
                      )}
                    </div>

                    {validationError && (
                      <div 
                        className="
                          flex items-center gap-2 px-3 py-2 rounded-xl mb-3
                          animate-in slide-in-from-top-2 fade-in duration-200
                        "
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <AlertTriangle size={12} className="text-red-400 shrink-0" />
                        <p className="text-[10px] font-bold text-red-400 flex-1">
                          {validationError}
                        </p>
                      </div>
                    )}

                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div 
                        className="
                          absolute top-full left-0 right-0 mt-2 
                          rounded-2xl border overflow-hidden z-50 
                          backdrop-blur-2xl
                          animate-in slide-in-from-top-4 fade-in duration-300
                        "
                        style={{ 
                          backgroundColor: `${theme.cardBg}F8`,
                          borderColor: theme.accent,
                          boxShadow: `
                            0 20px 60px -15px ${theme.accent}30,
                            0 0 0 1px ${theme.accent}10 inset
                          `
                        }}
                      >
                        <div 
                          className="px-4 py-2 border-b flex items-center gap-2"
                          style={{ 
                            backgroundColor: `${theme.accent}10`,
                            borderColor: `${theme.border}50`
                          }}
                        >
                          <Database size={10} style={{ color: theme.accent }} />
                          <span 
                            className="text-[9px] font-black uppercase tracking-wider"
                            style={{ color: theme.accent }}
                          >
                            Desde tu banco
                          </span>
                        </div>
                        
                        {autocompleteResults.map((name, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onAddPlayer(name);
                              setNewPlayerName('');
                              setShowAutocomplete(false);
                            }}
                            className="
                              w-full px-4 py-3 text-left 
                              transition-all duration-200
                              hover:bg-white/10 active:bg-white/5
                              flex items-center gap-3 
                              border-b border-white/5 last:border-0
                              group
                            "
                          >
                            <div 
                              className="
                                w-10 h-10 rounded-xl flex items-center justify-center 
                                font-black text-sm shrink-0
                                transition-transform duration-200
                                group-hover:scale-110
                              "
                              style={{
                                backgroundColor: getPlayerColor(idx).bg,
                                color: getPlayerColor(idx).text,
                                boxShadow: `0 4px 12px ${getPlayerColor(idx).bg}40`
                              }}
                            >
                              {getPlayerInitials(name)}
                            </div>
                            
                            <div className="flex-1">
                              <p 
                                className="font-bold text-sm"
                                style={{ color: theme.text }}
                              >
                                {name}
                              </p>
                              {(() => {
                                const key = name.trim().toLowerCase();
                                const vault = getVault(key, gameState.history.playerStats);
                                return vault.metrics.totalSessions > 0 && (
                                  <div className="flex items-center gap-3 mt-1">
                                    <span 
                                      className="text-[9px] font-mono opacity-60"
                                      style={{ color: theme.sub }}
                                    >
                                      {vault.metrics.totalSessions} partidas
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            <ChevronRight 
                              size={16} 
                              style={{ color: theme.sub }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div 
                    className="mt-5 pt-5 border-t relative"
                    style={{ borderColor: `${theme.border}50` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-xl"
                          style={{ backgroundColor: `${theme.accent}10` }}
                        >
                          <Ghost size={16} style={{ color: theme.accent }} />
                        </div>
                        <div>
                          <p 
                            className="text-xs font-black uppercase tracking-wider"
                            style={{ color: theme.text }}
                          >
                            Impostores
                          </p>
                          <p 
                            className="text-[9px] font-bold opacity-60"
                            style={{ color: theme.sub }}
                          >
                            {gameState.impostorCount === 1 ? 'Clásico' : 'Caos múltiple'}
                          </p>
                        </div>
                      </div>
                      
                      <div 
                        className="flex items-center gap-1 p-1 rounded-xl backdrop-blur-xl"
                        style={{ 
                          backgroundColor: `${theme.border}80`,
                          border: `1px solid ${theme.border}`
                        }}
                      >
                        <button 
                          onClick={() => setGameState(prev => ({
                            ...prev, 
                            impostorCount: Math.max(1, prev.impostorCount - 1)
                          }))}
                          className="
                            w-9 h-9 rounded-lg flex items-center justify-center 
                            font-black text-lg
                            transition-all duration-200
                            hover:bg-white/10 active:scale-90
                          "
                          style={{ color: theme.text }}
                        >
                          −
                        </button>
                        
                        <div 
                          className="w-12 h-9 rounded-lg flex items-center justify-center font-black text-lg"
                          style={{ 
                            backgroundColor: `${theme.accent}20`,
                            color: theme.accent 
                          }}
                        >
                          {gameState.impostorCount}
                        </div>
                        
                        <button 
                          onClick={() => setGameState(prev => ({
                            ...prev, 
                            impostorCount: Math.min(gameState.players.length - 1, prev.impostorCount + 1)
                          }))}
                          className="
                            w-9 h-9 rounded-lg flex items-center justify-center 
                            font-black text-lg
                            transition-all duration-200
                            hover:bg-white/10 active:scale-90
                          "
                          style={{ color: theme.text }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- CENTRO DE MANDO (MODOS) --- */}
                <div 
                    className="p-5 border backdrop-blur-2xl relative overflow-hidden group"
                    style={{ 
                        backgroundColor: `${theme.cardBg}F5`, 
                        borderColor: theme.border, 
                        borderRadius: '24px',
                        boxShadow: `
                          0 20px 60px -15px rgba(0, 0, 0, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.05)
                        `
                    }}
                >
                    <div 
                      className="absolute inset-0 opacity-[0.02] pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${theme.accent}, transparent 70%)`,
                        animation: 'pulse-slow 4s ease-in-out infinite'
                      }}
                    />
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                       <Gamepad2 size={16} style={{ color: theme.accent }} />
                       <h3 className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: theme.sub }}>
                          Protocolos de Misión
                       </h3>
                    </div>
                    
                    <div className="relative z-10">
                        <GameModeWithTabs 
                            modes={modes}
                            theme={theme}
                            onModeToggle={handleModeToggle}
                        />
                    </div>
                </div>
                
                {/* --- ACCIONES --- */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onOpenCategories}
                        className="
                            relative p-4 rounded-[24px] border overflow-hidden group text-left
                            transition-all duration-300 active:scale-95 hover:scale-[1.02]
                        "
                        style={{ 
                            backgroundColor: `${theme.cardBg}F5`,
                            borderColor: theme.border,
                            boxShadow: `0 10px 40px -10px rgba(0,0,0,0.2)`
                        }}
                    >
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${theme.accent}10, transparent)` }} 
                        />
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[80px]">
                            <div className="p-2 rounded-xl w-fit mb-2" style={{ backgroundColor: `${theme.accent}15` }}>
                                <LayoutGrid size={20} style={{ color: theme.accent }} />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider block" style={{ color: theme.text }}>Categorías</span>
                                <span className="text-[9px] opacity-60 font-medium" style={{ color: theme.sub }}>Gestionar temas</span>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={onOpenSettings}
                        className="
                            relative p-4 rounded-[24px] border overflow-hidden group text-left
                            transition-all duration-300 active:scale-95 hover:scale-[1.02]
                        "
                        style={{ 
                            backgroundColor: `${theme.cardBg}F5`,
                            borderColor: theme.border,
                            boxShadow: `0 10px 40px -10px rgba(0,0,0,0.2)`
                        }}
                    >
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${theme.sub}10, transparent)` }} 
                        />
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[80px]">
                            <div className="p-2 rounded-xl w-fit mb-2" style={{ backgroundColor: `${theme.border}` }}>
                                <Settings size={20} style={{ color: theme.sub }} />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider block" style={{ color: theme.text }}>Ajustes</span>
                                <span className="text-[9px] opacity-60 font-medium" style={{ color: theme.sub }}>Configuración y ayuda</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* --- START BUTTON ULTRA PREMIUM (CLEAN) --- */}
            <div className="fixed bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 pointer-events-none">
              <div className="max-w-md mx-auto relative group">
                {/* Glow effect sutil */}
                {isValidToStart && (
                  <div
                    className="absolute inset-0 blur-3xl opacity-30 animate-pulse"
                    style={{
                      backgroundColor: theme.accent,
                      animation: 'pulse-glow 3s ease-in-out infinite'
                    }}
                  />
                )}

                <button 
                  onClick={onStartGame}
                  disabled={!isValidToStart}
                  className="
                    relative w-full h-16 pointer-events-auto
                    rounded-full overflow-hidden
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-95
                    group
                  "
                  style={{ 
                    backgroundColor: !isValidToStart ? '#334155' : theme.accent,
                    boxShadow: isValidToStart 
                      ? `
                        0 20px 60px -15px ${theme.accent},
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset
                      `
                      : '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {/* Animated gradient overlay */}
                  {isValidToStart && (
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(
                          135deg,
                          transparent 0%,
                          rgba(255, 255, 255, 0.3) 50%,
                          transparent 100%
                        )`,
                        backgroundSize: '200% 200%',
                        animation: 'gradient-slide 3s ease-in-out infinite'
                      }}
                    />
                  )}
                  
                  {/* Shimmer effect */}
                  {isValidToStart && (
                    <div 
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                  
                  {/* Contenido del botón - Layout FLEX para evitar solapamiento */}
                  <div className="relative z-10 h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        {isParty ? "EL BOTELLÓN" : "EMPEZAR"}
                      </span>
                      <div 
                        className={`
                          transition-all duration-300
                          ${isValidToStart ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                        `}
                      >
                        <ChevronRight 
                          strokeWidth={4} 
                          size={20} 
                          className="text-white"
                        />
                      </div>
                    </div>
                    
                    {/* Contador de jugadores en el botón */}
                    {isValidToStart && (
                      <div 
                        className="
                          px-3 py-1 rounded-full
                          text-[9px] font-black uppercase
                          backdrop-blur-xl shrink-0 ml-2
                        "
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          color: 'white'
                        }}
                      >
                        {playerCount} jugadores
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                @keyframes scan-vertical {
                    0%, 100% { transform: translateY(-100%); }
                    50% { transform: translateY(300%); }
                }
                
                @keyframes gradient-rotate {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(0.95); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                
                @keyframes gradient-slide {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes shimmer-progress {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};
