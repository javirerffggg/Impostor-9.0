
import React, { useState, useEffect } from 'react';
import { GameState, ThemeConfig } from '../../types';
import { Mic, Activity, Sparkles, Fingerprint, Unlock, Lock, FileText, ShieldAlert, Eye, AlertTriangle, Ghost, ScanEye, BarChart3, Timer, Beer, RotateCcw } from 'lucide-react';
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
    const architect = gameState.gameData.find(p => p.isArchitect);
    const oracle = gameState.gameData.find(p => p.isOracle);
    
    const allViewTimes = gameState.gameData.map(p => p.viewTime || 0);
    const avgViewTime = allViewTimes.reduce((a, b) => a + b, 0) / (allViewTimes.length || 1);

    const getSuspicionTag = (time: number): { label: string, color: string } => {
        if (time === 0) return { label: "N/A", color: theme.sub };
        if (time > avgViewTime * 1.5) return { label: "DUDOSO", color: '#fbbf24' }; // Amber
        if (time < avgViewTime * 0.5) return { label: "PRECIPITADO", color: '#f87171' }; // Red
        return { label: "NORMAL", color: '#4ade80' }; // Green
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

    // Vocalis Effect
    useEffect(() => {
        if (isDecrypted) return; 

        let interval: number;
        const targetName = gameState.startingPlayer || "Nadie";
        const allNames = gameState.players.map(p => p.name);
        
        const scanDuration = 2000;
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

    // Haptics & Progress Loop
    useEffect(() => {
        let interval: number;
        if (isHoldingDecrypt && !isDecrypted) {
            if (navigator.vibrate) navigator.vibrate(30); 
            interval = window.setInterval(() => {
                setDecryptProgress(prev => {
                    const next = prev + 2; 
                    return next >= 100 ? 100 : next;
                });
            }, 16);
        } else if (!isHoldingDecrypt && !isDecrypted) {
            setDecryptProgress(prev => Math.max(0, prev - 5)); 
        }
        return () => clearInterval(interval);
    }, [isHoldingDecrypt, isDecrypted]);

    // Trigger Unlock
    useEffect(() => {
        if (decryptProgress >= 100 && !isDecrypted) {
            setIsDecrypted(true);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        }
    }, [decryptProgress, isDecrypted]);

    if (!isDecrypted) {
        return (
            <div className="flex flex-col h-full items-center justify-between p-6 pb-12 relative z-10 animate-in fade-in duration-500 pt-[calc(2rem+env(safe-area-inset-top))]">
                <div className="w-full text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 opacity-70">
                        <Mic size={16} className="animate-pulse" style={{ color: theme.accent }} />
                        <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-[0.3em]">DEBATE EN CURSO</p>
                    </div>
                    <div className="relative">
                        <h1 
                            className="text-7xl font-black tracking-tighter tabular-nums"
                            style={{ 
                                color: theme.text,
                                textShadow: `0 0 30px ${theme.accent}40`,
                                fontFamily: "'JetBrains Mono', monospace" 
                            }}
                        >
                            {formatTime(timerSeconds)}
                        </h1>
                    </div>
                </div>

                <div className="w-full max-w-xs aspect-square relative z-20 flex flex-col items-center justify-center group">
                    {vocalisLocked && (
                         <div 
                            className="absolute inset-0 rounded-3xl z-0 pointer-events-none"
                            style={{ 
                                backgroundColor: theme.accent,
                                animation: 'aura-explosion 1.2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
                                opacity: 0.6
                            }}
                        />
                    )}

                    <div 
                        className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ease-out`}
                        style={{ 
                            background: vocalisLocked 
                                ? `linear-gradient(135deg, ${theme.accent}60, ${theme.accent}00)`
                                : `conic-gradient(from 0deg, transparent, ${theme.accent}40, transparent)`,
                            animation: vocalisLocked ? 'pulse 2s infinite' : 'spin-slow 4s linear infinite',
                            opacity: vocalisLocked ? 0.8 : 0.4
                        }}
                    />

                    <div 
                        className="relative w-full h-full rounded-3xl border flex flex-col items-center justify-between p-6 overflow-hidden shadow-2xl transition-all duration-500 backdrop-blur-xl premium-border"
                        style={{
                            background: vocalisLocked 
                                ? `linear-gradient(145deg, ${theme.cardBg}, ${theme.accent}20)` 
                                : `linear-gradient(145deg, ${theme.cardBg}, ${theme.bg}40)`,
                            borderColor: vocalisLocked ? theme.accent : 'rgba(255,255,255,0.1)',
                            boxShadow: vocalisLocked ? `0 0 50px ${theme.accent}50` : '0 10px 30px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{ backgroundImage: `radial-gradient(circle, ${theme.text} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} 
                        />

                        <div className="relative z-10 w-full flex items-center justify-between">
                            <div 
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500"
                                style={{ 
                                    backgroundColor: vocalisLocked ? theme.accent : `${theme.cardBg}80`,
                                    borderColor: vocalisLocked ? theme.accent : theme.border,
                                    color: vocalisLocked ? '#fff' : theme.sub
                                }}
                            >
                                {vocalisLocked ? <Sparkles size={12} className="animate-spin-slow text-white" /> : <Activity size={12} className="animate-pulse" />}
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                    {vocalisLocked ? "Voz Detectada" : "Escaneando"}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${vocalisLocked ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                <div className={`w-1.5 h-1.5 rounded-full ${vocalisLocked ? 'bg-green-500 delay-75' : 'bg-white/20'}`} />
                                <div className={`w-1.5 h-1.5 rounded-full ${vocalisLocked ? 'bg-green-500 delay-150' : 'bg-white/20'}`} />
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                            <p 
                                className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 transition-all duration-500"
                                style={{ 
                                    color: vocalisLocked ? theme.accent : theme.sub,
                                    opacity: vocalisLocked ? 1 : 0.6
                                }}
                            >
                                {vocalisLocked ? "INICIA EL DEBATE" : "ANALIZANDO BIOMETRÍA"}
                            </p>
                            
                            <h2 
                                className={`text-4xl font-black uppercase text-center leading-none tracking-tight break-words transition-all duration-300 transform-gpu
                                ${vocalisLocked ? 'scale-110 blur-0' : 'scale-100 blur-[1.5px]'}`}
                                style={{ 
                                    color: theme.text,
                                    textShadow: vocalisLocked ? `0 0 20px ${theme.accent}, 0 0 60px ${theme.accent}80` : 'none',
                                }}
                            >
                                {scannedName}
                            </h2>

                            {isParty && vocalisLocked && (
                                <div className="mt-4 bg-pink-500/20 border border-pink-500/50 rounded px-2 py-0.5 animate-bounce">
                                    <span className="text-[8px] font-black text-pink-300 uppercase tracking-widest">MODO FIESTA</span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 w-full flex items-end justify-center gap-[3px] h-10 px-4">
                            {[...Array(15)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="w-1 rounded-full transition-all duration-[50ms]"
                                    style={{ 
                                        height: vocalisLocked ? '15%' : `${20 + Math.random() * 80}%`, 
                                        backgroundColor: vocalisLocked 
                                            ? (i % 2 === 0 ? theme.accent : theme.sub)
                                            : `${theme.text}40`, 
                                        animation: vocalisLocked ? 'none' : `equalizer 0.4s infinite alternate -${i * 0.1}s` 
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative w-full max-w-sm flex flex-col items-center justify-center mb-8">
                    <div 
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-500 ease-out pointer-events-none
                        ${isHoldingDecrypt ? 'w-[120%] h-48 opacity-50' : 'w-[90%] h-24 opacity-20'}`} 
                        style={{ backgroundColor: theme.accent }}
                    />

                    <button
                        className="relative w-full h-24 rounded-full overflow-hidden touch-none select-none transition-all duration-200 active:scale-[0.98] group border premium-border"
                        style={{ 
                            background: `linear-gradient(to bottom, ${theme.cardBg}, ${theme.bg})`,
                            borderColor: theme.border,
                            boxShadow: isHoldingDecrypt 
                                ? `0 0 50px ${theme.accent}60, inset 0 0 20px ${theme.accent}20` 
                                : `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`
                        }}
                        onPointerDown={() => setIsHoldingDecrypt(true)}
                        onPointerUp={() => setIsHoldingDecrypt(false)}
                        onPointerLeave={() => setIsHoldingDecrypt(false)}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-75 ease-linear"
                            style={{ 
                                width: `${decryptProgress}%`,
                                background: `linear-gradient(90deg, ${theme.accent}40 0%, ${theme.accent} 100%)`,
                                boxShadow: `0 0 30px ${theme.accent}`,
                            }}
                        />

                        {!isHoldingDecrypt && (
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                 <div 
                                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                                    style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}40, transparent)` }} 
                                />
                            </div>
                        )}

                        <div className="relative z-10 flex items-center justify-between px-6 w-full h-full">
                            <div 
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${isHoldingDecrypt ? 'bg-white scale-110 rotate-12 border-transparent' : 'bg-black/10 border-white/10'}`}
                                style={{ color: isHoldingDecrypt ? theme.accent : theme.text }}
                            >
                                <Fingerprint size={28} className={isHoldingDecrypt ? 'animate-pulse' : ''} />
                            </div>

                            <div className="flex-1 flex flex-col items-start pl-4">
                                 <span 
                                    className="text-sm font-black uppercase tracking-[0.2em] transition-all duration-300"
                                    style={{ 
                                        color: theme.text,
                                        textShadow: isHoldingDecrypt ? `0 0 15px ${theme.accent}` : 'none'
                                    }}
                                >
                                    {isHoldingDecrypt ? (decryptProgress > 90 ? "ACCESO..." : "ANALIZANDO") : "MANTENER"}
                                </span>
                                <span 
                                    className="text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
                                    style={{ color: isHoldingDecrypt ? theme.text : theme.sub }}
                                >
                                    {isHoldingDecrypt ? `${decryptProgress}% COMPLETADO` : "PARA RESOLVER"}
                                </span>
                            </div>

                            <div 
                                className={`transition-all duration-500 transform ${isHoldingDecrypt ? 'opacity-100 translate-x-0 rotate-0' : 'opacity-30 translate-x-4 -rotate-12'}`}
                                style={{ color: theme.text }}
                            >
                                {decryptProgress > 90 ? <Unlock size={24} /> : <Lock size={24} />}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full items-center p-6 pb-24 animate-in slide-in-from-bottom duration-500 relative z-10 pt-[calc(1.5rem+env(safe-area-inset-top))] overflow-y-auto">
            
            <div className="w-full max-w-sm mb-8 text-center relative">
                <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-3xl rounded-full pointer-events-none opacity-20"
                    style={{ backgroundColor: theme.text }}
                />
                
                <p style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 flex items-center justify-center gap-2">
                    <FileText size={10} /> INFORME DE MISIÓN
                </p>
                
                <h1 
                    className="text-5xl font-black uppercase break-words leading-none tracking-tighter relative z-10"
                    style={{ 
                        color: isTroll ? '#ef4444' : theme.text,
                        textShadow: `0 0 40px ${theme.accent}20`
                    }}
                >
                    {isTroll ? "ERROR" : civilWord}
                </h1>

                {architect && !isTroll && (
                    <div 
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md"
                        style={{ 
                            borderColor: '#eab308', 
                            backgroundColor: 'rgba(234, 179, 8, 0.1)'
                        }}
                    >
                        <ShieldAlert size={10} className="text-yellow-500" />
                        <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">
                            Arq: {architect.name}
                        </span>
                    </div>
                )}
                 {oracle && !isTroll && (
                    <div 
                        className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md"
                        style={{ 
                            borderColor: '#8b5cf6', 
                            backgroundColor: 'rgba(139, 92, 246, 0.1)'
                        }}
                    >
                        <Eye size={10} className="text-violet-500" />
                        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-widest">
                            Oráculo: {oracle.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full max-w-sm mb-8">
                <div 
                    className="relative overflow-hidden rounded-xl border p-5 backdrop-blur-md premium-border"
                    style={{ 
                        backgroundColor: theme.cardBg,
                        borderColor: isTroll ? '#ef4444' : theme.accent,
                        boxShadow: `0 4px 20px ${isTroll ? '#ef4444' : theme.accent}20`
                    }}
                >
                    <div 
                        className="absolute top-0 left-0 w-1 h-full"
                        style={{ backgroundColor: isTroll ? '#ef4444' : theme.accent }} 
                    />

                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-70" style={{ color: theme.text }}>
                                {isTroll ? "PROTOCOLO PANDORA" : "AMENAZA IDENTIFICADA"}
                            </p>
                            <h3 className="font-black text-lg uppercase tracking-wide" style={{ color: theme.text }}>
                                {isTroll ? "FALLO DE SISTEMA" : "IMPOSTORES"}
                            </h3>
                        </div>
                        {isTroll ? <AlertTriangle className="text-red-500 animate-pulse" /> : <Ghost style={{ color: theme.text, opacity: 0.8 }} />}
                    </div>

                    <div className="space-y-2">
                        {isTroll ? (
                            <p className="text-xs text-red-500 font-mono font-bold">
                                {trollScenario === 'espejo_total' && ">> TODOS SON IMPOSTORES"}
                                {trollScenario === 'civil_solitario' && ">> SOLO 1 CIVIL"}
                                {trollScenario === 'falsa_alarma' && ">> 0 IMPOSTORES"}
                            </p>
                        ) : (
                            impostors.map(imp => (
                                <div 
                                    key={imp.id} 
                                    className="flex items-center gap-3 p-2 rounded-lg border"
                                    style={{ 
                                        backgroundColor: theme.bg,
                                        borderColor: theme.border
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                                        <ScanEye size={16} />
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-lg font-bold tracking-wide" style={{ color: theme.text }}>{imp.name}</span>
                                        <span className="text-xs font-mono font-bold opacity-60" style={{ color: theme.text }}>
                                            {Math.round(imp.impostorProbability)}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center gap-2 px-1 opacity-60" style={{ color: theme.text }}>
                    <BarChart3 size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">ANÁLISIS DE COMPORTAMIENTO</h4>
                </div>

                <div className="grid gap-2">
                    {gameState.gameData.map((p, idx) => {
                        const isImp = p.isImp && !isTroll;
                        const suspicion = getSuspicionTag(p.viewTime);
                        const isBartender = p.partyRole === 'bartender' && isParty;
                        
                        return (
                            <div 
                                key={p.id}
                                className="flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm"
                                style={{ 
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.border 
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-1 h-8 rounded-full" 
                                        style={{ backgroundColor: isImp ? '#ef4444' : PLAYER_COLORS[idx % PLAYER_COLORS.length] }} 
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm" style={{ color: theme.text }}>{p.name}</span>
                                            {isImp && (
                                                <>
                                                    <span className="text-[8px] px-1 rounded bg-red-500/20 text-red-500 font-black">IMP</span>
                                                    <span className="text-[8px] font-mono opacity-60" style={{ color: theme.sub }}>{Math.round(p.impostorProbability)}%</span>
                                                </>
                                            )}
                                            {p.isArchitect && <span className="text-[8px] px-1 rounded bg-yellow-500/20 text-yellow-600 font-black">ARQ</span>}
                                            {p.isOracle && <span className="text-[8px] px-1 rounded bg-violet-500/20 text-violet-500 font-black">ORA</span>}
                                            {isBartender && <Beer size={12} className="text-pink-500"/>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Timer size={10} style={{ color: theme.sub }} />
                                            <span className="text-[10px] font-mono" style={{ color: theme.sub }}>{(p.viewTime / 1000).toFixed(1)}s</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span 
                                        className="text-[9px] font-bold uppercase tracking-wide block"
                                        style={{ color: suspicion.color }}
                                    >
                                        {suspicion.label}
                                    </span>
                                    {/* Mini bar chart visual */}
                                    <div className="w-16 h-1 rounded-full mt-1 overflow-hidden ml-auto" style={{ backgroundColor: theme.border }}>
                                        <div 
                                            className="h-full rounded-full"
                                            style={{ 
                                                width: `${Math.min((p.viewTime / (avgViewTime * 2)) * 100, 100)}%`,
                                                backgroundColor: suspicion.color 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full max-w-sm mt-8 grid grid-cols-2 gap-3">
                <button 
                    onClick={onBack}
                    style={{ borderColor: theme.border, color: theme.text }}
                    className="py-4 rounded-xl border font-bold uppercase tracking-widest text-xs hover:opacity-70 transition-all"
                >
                    Menú Principal
                </button>
                <button 
                    onClick={onReplay}
                    style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                    className="py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={16} strokeWidth={3} /> Nueva Misión
                </button>
            </div>
        </div>
    );
};
