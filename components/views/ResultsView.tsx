


import React, { useState, useEffect, useRef } from 'react';
import { GameState, ThemeConfig } from '../../types';
import { Fingerprint, Unlock, Lock, Eye, AlertTriangle, Ghost, Clock, Beer, RotateCcw, Crown, Zap, Network, Menu } from 'lucide-react';
import { PLAYER_COLORS } from '../../constants';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onBack: () => void;
    onReplay: () => void;
}

export const ResultsView: React.FC<Props> = ({ gameState, theme, onBack, onReplay }) => {
    const impostors = gameState.gameData.filter(p => p.isImp);
    const civilWord = gameState.gameData.find(p => !p.isImp)?.realWord || "???";
    const isTroll = gameState.isTrollEvent;
    const trollScenario = gameState.trollScenario;
    const isParty = gameState.settings.partyMode;
    
    // Stats calculation
    const allViewTimes = gameState.gameData.map(p => p.viewTime || 0);
    const avgViewTime = allViewTimes.reduce((a, b) => a + b, 0) / (allViewTimes.length || 1);

    const getSuspicionLevel = (time: number): { label: string, color: string, dotColor: string } => {
        if (time === 0) return { label: "-", color: theme.sub, dotColor: 'bg-gray-500' };
        if (time > avgViewTime * 1.5) return { label: "Lento", color: '#fbbf24', dotColor: 'bg-amber-400' };
        if (time < avgViewTime * 0.5) return { label: "Rápido", color: '#f87171', dotColor: 'bg-red-400' };
        return { label: "Normal", color: theme.sub, dotColor: 'bg-emerald-400' };
    };
    
    // --- REVEAL LOGIC ---
    const [isDecrypted, setIsDecrypted] = useState(false);
    const [decryptProgress, setDecryptProgress] = useState(0);
    const [isHoldingDecrypt, setIsHoldingDecrypt] = useState(false);

    // --- VOCALIS ANIMATION STATE ---
    const [scannedName, setScannedName] = useState("CALCULANDO...");
    const [vocalisLocked, setVocalisLocked] = useState(false);

    // --- STOPWATCH STATE ---
    const [timerSeconds, setTimerSeconds] = useState(0);

    // --- MENU CONFIRMATION STATE ---
    const [showMenuConfirm, setShowMenuConfirm] = useState(false);
    const confirmTimeoutRef = useRef<number | null>(null);

    // --- TOOLTIP STATE ---
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isDecrypted) return;
        const interval = setInterval(() => {
            setTimerSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isDecrypted]);

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Vocalis Effect (Speaker Selection)
    useEffect(() => {
        if (isDecrypted) return; 

        let interval: number;
        const targetName = gameState.startingPlayer || "Nadie";
        const allNames = gameState.players.map(p => p.name);
        
        const scanDuration = 2500;
        const startTime = Date.now();

        interval = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < scanDuration) {
                setScannedName(allNames[Math.floor(Math.random() * allNames.length)]);
            } else {
                setScannedName(targetName);
                setVocalisLocked(true);
                if (navigator.vibrate) navigator.vibrate([30, 80]);
                clearInterval(interval);
            }
        }, 80);

        return () => clearInterval(interval);
    }, [isDecrypted, gameState.startingPlayer, gameState.players]);

    // Haptics & Progress Loop for Button
    useEffect(() => {
        let interval: number;
        if (isHoldingDecrypt && !isDecrypted) {
            if (navigator.vibrate) navigator.vibrate(20);
            interval = window.setInterval(() => {
                setDecryptProgress(prev => {
                    const next = prev + 2.5;
                    return next >= 100 ? 100 : next;
                });
            }, 16);
        } else if (!isHoldingDecrypt && !isDecrypted) {
            setDecryptProgress(prev => Math.max(0, prev - 8));
        }
        return () => clearInterval(interval);
    }, [isHoldingDecrypt, isDecrypted]);

    // Trigger Unlock
    useEffect(() => {
        if (decryptProgress >= 100 && !isDecrypted) {
            setIsDecrypted(true);
            if (navigator.vibrate) navigator.vibrate([50, 50, 200]);
        }
    }, [decryptProgress, isDecrypted]);

    // --- CONFIRMATION HANDLER ---
    const handleMenuClick = (e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        
        if (showMenuConfirm) {
            if (navigator.vibrate) navigator.vibrate(50);
            onBack();
        } else {
            if (navigator.vibrate) navigator.vibrate(20);
            setShowMenuConfirm(true);
            
            // Auto-reset after 3 seconds if not confirmed
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = window.setTimeout(() => {
                setShowMenuConfirm(false);
            }, 3000);
        }
    };

    // Clean up timeout
    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        };
    }, []);

    // --- RENDER: PRE-REVEAL (TIMER & BUTTON) ---
    if (!isDecrypted) {
        return (
            <div className="flex flex-col h-full items-center justify-between p-6 pb-12 relative z-10 animate-in fade-in duration-700 pt-[calc(3rem+env(safe-area-inset-top))]">
                
                {/* 1. TOP SECTION: TIMER */}
                <div className="w-full text-center space-y-6 relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-[0.2em]">Debate en Curso</span>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-[50px]" />
                        <h1 
                            className="text-8xl font-black tracking-tighter tabular-nums relative z-10"
                            style={{ 
                                color: theme.text,
                                fontFamily: "'JetBrains Mono', monospace",
                                textShadow: `0 0 40px ${theme.accent}30`
                            }}
                        >
                            {formatTime(timerSeconds)}
                        </h1>
                    </div>
                </div>

                {/* 2. MIDDLE SECTION: VOCALIS (SPEAKER) */}
                <div className="flex-1 flex items-center justify-center w-full relative">
                    <div 
                        className="w-full max-w-sm relative rounded-3xl p-8 flex flex-col items-center gap-4 transition-all duration-700"
                        style={{
                            backgroundColor: vocalisLocked ? `${theme.cardBg}` : 'transparent',
                            backdropFilter: vocalisLocked ? 'blur(20px)' : 'none',
                            border: vocalisLocked ? `1px solid ${theme.border}` : '1px solid transparent',
                            boxShadow: vocalisLocked ? `0 20px 40px -10px ${theme.accent}10` : 'none'
                        }}
                    >
                         <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-[60px] opacity-10 transition-opacity duration-1000"
                            style={{ backgroundColor: theme.accent, opacity: vocalisLocked ? 0.2 : 0 }}
                        />

                        <div className="flex flex-col items-center relative z-10">
                            <span style={{ color: theme.sub }} className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2 opacity-70">
                                {vocalisLocked ? "Empieza a hablar" : "Va a empezar a hablar..."}
                            </span>
                            
                            <h2 
                                className={`text-4xl font-black text-center leading-none tracking-tight transition-all duration-500 
                                ${vocalisLocked ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-50 blur-sm'}`}
                                style={{ color: theme.text }}
                            >
                                {scannedName}
                            </h2>

                            {isParty && vocalisLocked && (
                                <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                                    <Beer size={12} className="text-pink-400" />
                                    <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">SHOT</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM SECTION: BUTTON */}
                <div className="w-full max-w-sm relative z-30">
                    <button
                        className="group relative w-full h-20 rounded-full overflow-hidden touch-none select-none transition-all duration-300 active:scale-[0.98]"
                        style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.border}`,
                            boxShadow: isHoldingDecrypt 
                                ? `0 0 30px ${theme.accent}40` 
                                : '0 10px 30px -10px rgba(0,0,0,0.3)'
                        }}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            setIsHoldingDecrypt(true);
                        }}
                        onPointerUp={(e) => {
                            e.preventDefault();
                            setIsHoldingDecrypt(false);
                        }}
                        onPointerLeave={() => setIsHoldingDecrypt(false)}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-[50ms] ease-linear"
                            style={{ 
                                width: `${decryptProgress}%`,
                                background: `linear-gradient(90deg, ${theme.accent}20, ${theme.accent}60)`,
                                opacity: isHoldingDecrypt ? 1 : 0
                            }}
                        />

                        {!isHoldingDecrypt && (
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" 
                                 style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} 
                            />
                        )}

                        <div className="relative z-10 w-full h-full flex items-center justify-between px-2">
                            <div 
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 
                                ${isHoldingDecrypt ? 'bg-white text-black scale-90' : 'bg-white/5 text-white/80'}`}
                                style={{ color: isHoldingDecrypt ? theme.accent : theme.text }}
                            >
                                <Fingerprint 
                                    size={28} 
                                    className={`transition-all duration-300 ${isHoldingDecrypt ? 'scale-110' : 'scale-100'}`} 
                                />
                            </div>

                            <div className="flex-1 flex flex-col items-start pl-4 pointer-events-none">
                                <span 
                                    className="text-sm font-black uppercase tracking-[0.25em] transition-all duration-300"
                                    style={{ 
                                        color: theme.text,
                                        textShadow: isHoldingDecrypt ? `0 0 20px ${theme.accent}` : 'none',
                                        letterSpacing: isHoldingDecrypt ? '0.35em' : '0.25em'
                                    }}
                                >
                                    {isHoldingDecrypt ? "ANALIZANDO" : "MANTENER"}
                                </span>
                                <span 
                                    className="text-[9px] font-bold uppercase tracking-widest transition-opacity duration-300"
                                    style={{ color: theme.sub, opacity: isHoldingDecrypt ? 0.8 : 0.5 }}
                                >
                                    {isHoldingDecrypt ? `${Math.floor(decryptProgress)}% COMPLETADO` : "PARA REVELAR RESULTADOS"}
                                </span>
                            </div>

                            <div className="pr-6 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
                                {isHoldingDecrypt ? (
                                    <Unlock size={20} className="text-white animate-pulse" />
                                ) : (
                                    <Lock size={20} style={{ color: theme.text }} />
                                )}
                            </div>
                        </div>
                    </button>
                    
                    <div className={`mt-4 text-center transition-opacity duration-500 ${isHoldingDecrypt ? 'opacity-0' : 'opacity-40'}`}>
                         <p className="text-[9px] font-medium uppercase tracking-widest" style={{ color: theme.sub }}>
                             Sistema Seguro • Encriptación v2.0
                         </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: RESULTS (MODERN & PREMIUM) ---
    return (
        <div className="flex flex-col h-full items-center p-6 pb-24 animate-in slide-in-from-bottom duration-700 relative z-10 pt-[calc(1.5rem+env(safe-area-inset-top))] overflow-y-auto">
            
            {/* 1. HERO SECTION: THE WORD */}
            <div className="w-full max-w-sm mb-10 mt-4 text-center relative group">
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[80px] rounded-full pointer-events-none opacity-20 transition-opacity duration-1000 group-hover:opacity-40"
                    style={{ backgroundColor: theme.accent }}
                />
                
                <p style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">
                    {isTroll ? "ERROR DE SISTEMA" : "LA PALABRA SECRETA ERA"}
                </p>
                
                <h1 
                    className="text-5xl md:text-6xl font-black uppercase break-words leading-[0.9] tracking-tight relative z-10 drop-shadow-2xl"
                    style={{ 
                        color: isTroll ? '#ef4444' : theme.text,
                        background: isTroll ? 'none' : `linear-gradient(180deg, ${theme.text} 20%, ${theme.accent} 100%)`,
                        WebkitBackgroundClip: isTroll ? 'none' : 'text',
                        WebkitTextFillColor: isTroll ? '#ef4444' : 'transparent',
                    }}
                >
                    {isTroll ? (
                        <span className="glitch-text-anim" data-text="SABOTAJE">SABOTAJE</span>
                    ) : (
                        civilWord
                    )}
                </h1>
                
                {!isTroll && (
                    <div className="h-1 w-12 mx-auto mt-6 rounded-full opacity-50" style={{ backgroundColor: theme.accent }} />
                )}
            </div>

            {/* 🎭 BANNER DE TROLL EVENT */}
            {isTroll && (
                <div 
                    className="relative overflow-hidden rounded-2xl border-2 p-5 animate-in fade-in slide-in-from-top duration-700 w-full max-w-sm mb-6"
                    style={{
                        borderColor: theme.accent,
                        background: `linear-gradient(135deg, ${theme.accent}15, ${theme.cardBg})`,
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Animated background pattern */}
                    <div 
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                ${theme.accent}40,
                                ${theme.accent}40 10px,
                                transparent 10px,
                                transparent 20px
                            )`
                        }}
                    />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div 
                                className="text-3xl animate-pulse"
                                style={{ filter: `drop-shadow(0 0 10px ${theme.accent})` }}
                            >
                                🎭
                            </div>
                            <div>
                                <h3 
                                    className="text-lg font-black uppercase tracking-wider"
                                    style={{ 
                                        color: theme.accent,
                                        textShadow: `0 0 20px ${theme.accent}40`
                                    }}
                                >
                                    Protocolo PANDORA
                                </h3>
                                <p className="text-xs opacity-60" style={{ color: theme.sub }}>
                                    Evento Especial de Caos
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                                {trollScenario === 'espejo_total' && (
                                    <>
                                        <strong className="font-bold">Espejo Total:</strong> Todos recibieron pistas falsas. 
                                        Nadie sabía quién era realmente el impostor.
                                    </>
                                )}
                                {trollScenario === 'civil_solitario' && (
                                    <>
                                        <strong className="font-bold">Civil Solitario:</strong> Solo hubo 1 civil. 
                                        Todos los demás fueron impostores con pistas confusas.
                                    </>
                                )}
                                {trollScenario === 'falsa_alarma' && (
                                    <>
                                        <strong className="font-bold">Falsa Alarma:</strong> No había impostores reales. 
                                        Todos tenían la misma palabra.
                                    </>
                                )}
                            </p>
                            
                            <div 
                                className="flex items-center gap-2 pt-2 mt-2 border-t"
                                style={{ borderColor: `${theme.accent}20` }}
                            >
                                <span className="text-lg">💾</span>
                                <p className="text-xs font-bold" style={{ color: theme.accent }}>
                                    Tu historial NO se vio afectado. Esta ronda no cuenta para estadísticas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. THE REVEAL: IMPOSTORS */}
            <div className="w-full max-w-sm mb-10">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 style={{ color: theme.text }} className="text-sm font-black uppercase tracking-widest">
                        {isTroll ? "Informe de Daños" : "Los Impostores"}
                    </h3>
                    {isTroll ? <AlertTriangle size={14} className="text-red-500" /> : <Ghost size={14} style={{ color: theme.sub }} />}
                </div>

                {isTroll ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center backdrop-blur-md">
                        <p className="text-xs text-red-200/60 leading-relaxed font-bold">
                            Nivel de Paranoia reseteado. Los sistemas vuelven a la normalidad para la próxima ronda.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {impostors.map(imp => (
                            <div 
                                key={imp.id} 
                                className="relative overflow-hidden group rounded-2xl p-4 border transition-all hover:scale-[1.02]"
                                style={{ 
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.accent,
                                    boxShadow: `0 8px 32px -10px ${theme.accent}15`
                                }}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: theme.accent }} />
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black bg-white/5 border border-white/10" style={{ color: theme.text }}>
                                            {imp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold leading-none mb-1" style={{ color: theme.text }}>{imp.name}</p>
                                            <p className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1" style={{ color: theme.sub }}>
                                                {imp.nexusPartners && imp.nexusPartners.length > 0 && <Network size={10} />}
                                                Infiltrado
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {imp.isVanguardia && (
                                        <div className="flex flex-col items-end">
                                            <Zap size={16} className="text-amber-400 mb-1" />
                                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Vanguardia</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. PLAYER STATS LIST (CLEAN) */}
            <div className="w-full max-w-sm space-y-3">
                <div className="flex items-center justify-between px-2 mb-2 opacity-60">
                    <h4 style={{ color: theme.text }} className="text-[10px] font-black uppercase tracking-widest">
                        Resumen de Agentes
                    </h4>
                    <span className="text-[10px] font-mono" style={{ color: theme.sub }}>TIEMPO / ESTADO</span>
                </div>

                <div className="space-y-2">
                    {gameState.gameData.map((p, idx) => {
                        const isImp = p.isImp && !isTroll;
                        const suspicion = getSuspicionLevel(p.viewTime);
                        const isArchitect = p.isArchitect;
                        const isOracle = p.isOracle;
                        const isBartender = p.partyRole === 'bartender' && isParty;

                        return (
                            <div 
                                key={p.id}
                                className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: isImp ? '#ef4444' : PLAYER_COLORS[idx % PLAYER_COLORS.length] }} 
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm" style={{ color: theme.text }}>{p.name}</span>
                                            
                                            {/* Role Badges */}
                                            {isImp && <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-1.5 rounded">IMP</span>}
                                            {isArchitect && <span className="text-[9px] font-black text-yellow-400 bg-yellow-500/10 px-1.5 rounded flex items-center gap-1"><Crown size={8}/> ARQ</span>}
                                            {isOracle && <span className="text-[9px] font-black text-violet-400 bg-violet-500/10 px-1.5 rounded flex items-center gap-1"><Eye size={8}/> ORC</span>}
                                            {isBartender && <span className="text-[9px] font-black text-pink-400 bg-pink-500/10 px-1.5 rounded flex items-center gap-1"><Beer size={8}/> BAR</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <Clock size={10} style={{ color: theme.sub }} />
                                        <span className="text-xs font-mono tabular-nums" style={{ color: theme.sub }}>
                                            {(p.viewTime / 1000).toFixed(1)}s
                                        </span>
                                    </div>
                                    
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedPlayerId(expandedPlayerId === p.id ? null : p.id);
                                        }}
                                        className="cursor-pointer relative p-2 -m-2"
                                    >
                                        <div 
                                            className={`w-2 h-2 rounded-full ${suspicion.dotColor}`} 
                                        />
                                        
                                        {expandedPlayerId === p.id && (
                                            <div 
                                                className="absolute right-0 top-full mt-2 p-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 w-48 z-50"
                                                style={{
                                                    backgroundColor: theme.cardBg,
                                                    borderColor: theme.border,
                                                    backdropFilter: 'blur(20px)',
                                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                                                }}
                                            >
                                                <p className="text-xs font-bold mb-2 pb-1 border-b border-white/5" style={{ color: theme.text }}>
                                                    Análisis
                                                </p>
                                                <div className="space-y-1.5 text-[10px]" style={{ color: theme.sub }}>
                                                    <div className="flex justify-between">
                                                        <span>Tiempo:</span>
                                                        <span className="font-mono font-bold" style={{ color: theme.text }}>{(p.viewTime / 1000).toFixed(1)}s</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Promedio:</span>
                                                        <span className="font-mono font-bold" style={{ color: theme.text }}>{(avgViewTime / 1000).toFixed(1)}s</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Estado:</span>
                                                        <span style={{ color: suspicion.color }} className="font-bold">{suspicion.label}</span>
                                                    </div>
                                                    <p className="pt-2 mt-1 text-[9px] opacity-80 leading-relaxed" style={{ color: theme.text, borderTop: `1px solid ${theme.border}` }}>
                                                        {suspicion.label === 'Lento' && '🐢 Demasiado tiempo. ¿Dudaba al ver su rol?'}
                                                        {suspicion.label === 'Rápido' && '⚡ Muy rápido. ¿Sabía qué hacer o estaba nervioso?'}
                                                        {suspicion.label === 'Normal' && '✅ Comportamiento estándar dentro de la media.'}
                                                        {suspicion.label === '-' && '❓ Sin datos suficientes.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. ACTIONS */}
            <div className="w-full max-w-sm mt-12 grid grid-cols-2 gap-4">
                <button 
                    onClick={handleMenuClick}
                    style={{ 
                        borderColor: showMenuConfirm ? '#ef4444' : theme.border, 
                        color: showMenuConfirm ? '#ef4444' : theme.sub,
                        backgroundColor: showMenuConfirm ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.2)'
                    }}
                    className="py-4 rounded-2xl border font-bold uppercase tracking-widest text-xs hover:bg-white/5 active:scale-95 transition-all backdrop-blur-sm touch-manipulation flex items-center justify-center gap-2"
                >
                    {showMenuConfirm ? (
                        <span className="animate-pulse">¿SEGURO?</span>
                    ) : (
                        <>
                            <Menu size={14} /> MENÚ
                        </>
                    )}
                </button>
                <button 
                    onClick={(e) => { e.preventDefault(); onReplay(); }}
                    style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                    className="py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110 touch-manipulation"
                >
                    <RotateCcw size={14} strokeWidth={3} /> REJUGAR
                </button>
            </div>

            {/* RENUNCIA v2.0 Debug Panel */}
            {gameState.debugState.isEnabled && gameState.history.matchLogs.length > 0 && gameState.history.matchLogs[0].renunciaTelemetry && (
                <div className="mt-6 p-4 rounded-xl border-2 backdrop-blur-xl"
                    style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderColor: 'rgba(139, 92, 246, 0.3)'
                    }}>
                    <p className="text-[10px] font-mono text-purple-300 mb-3 font-bold">
                        &gt;&gt; RENUNCIA v2.0 TELEMETRY
                    </p>
                    {(() => {
                        const t = gameState.history.matchLogs[0].renunciaTelemetry!;
                        return (
                            <>
                                <p className="text-[9px] font-mono text-purple-300">
                                    &gt;&gt; CANDIDATE_STREAK: {t.candidateStreak}
                                </p>
                                <p className="text-[9px] font-mono text-purple-300">
                                    &gt;&gt; KARMA_VECTOR: {(t.karmaBonus * 100).toFixed(0)}%
                                </p>
                                <p className="text-[9px] font-mono text-purple-300">
                                    &gt;&gt; SESSION_VECTOR: {(t.sessionBonus * 100).toFixed(0)}%
                                </p>
                                <p className="text-[9px] font-mono text-purple-300">
                                    &gt;&gt; FAILURE_VECTOR: {(t.failureBonus * 100).toFixed(0)}%
                                </p>
                                <p className="text-[9px] font-mono text-green-400 mt-2 font-bold">
                                    &gt;&gt; FINAL_PROBABILITY: {(t.finalProbability * 100).toFixed(1)}%
                                </p>
                                <p className="text-[9px] font-mono text-purple-300 mt-1">
                                    &gt;&gt; STATUS: {gameState.history.matchLogs[0].renunciaTriggered ? 'ACTIVE ✓' : 'STANDBY'}
                                </p>
                            </>
                        );
                    })()}
                </div>
            )}
            
             <style>{`
                .glitch-text-anim {
                    position: relative;
                }
                .glitch-text-anim::before, .glitch-text-anim::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .glitch-text-anim::before {
                    left: 2px; text-shadow: -1px 0 #00ffff; clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim-1 5s infinite linear alternate-reverse;
                }
                .glitch-text-anim::after {
                    left: -2px; text-shadow: -1px 0 #ff00ff; clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim-2 5s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim-1 {
                    0% { clip: rect(10px, 9999px, 30px, 0); }
                    20% { clip: rect(50px, 9999px, 90px, 0); }
                    100% { clip: rect(80px, 9999px, 100px, 0); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip: rect(60px, 9999px, 70px, 0); }
                    20% { clip: rect(10px, 9999px, 20px, 0); }
                    100% { clip: rect(30px, 9999px, 50px, 0); }
                }
            `}</style>
        </div>
    );
};