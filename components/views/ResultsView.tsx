import React, { useState, useEffect, useRef } from 'react';
import { GameState, ThemeConfig, RenunciaDecision } from '../../types';
import { Fingerprint, Unlock, Lock, Eye, AlertTriangle, Ghost, Clock, Beer, RotateCcw, Crown, Zap, Network, Menu, BatteryWarning, X, ChevronLeft } from 'lucide-react';
import { PLAYER_COLORS } from '../../constants';
import { RenunciaDecisionView } from '../RenunciaDecisionView';
import { PartyNotification } from '../PartyNotification';
import { SwipeRevealCard } from '../SwipeRevealCard';
import { MemoryRevealCard } from '../MemoryRevealCard';
import { IdentityCard } from '../IdentityCard';
import { Smartphone, ArrowRight } from 'lucide-react';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onBack: () => void;
    onReplay: () => void;
    currentPlayerColor: string;
    onNextPlayer: (viewTime: number) => void;
    onOracleConfirm: (hint: string) => void;
    onRenunciaDecision: (decision: RenunciaDecision) => void;
    onRenunciaRoleSeen: () => void;
    isExiting: boolean;
    transitionName?: string | null;
}

// --- SUB-COMPONENT: DIGIT FLIP TIMER ---
const DigitFlip: React.FC<{ value: number; theme: ThemeConfig }> = ({ value, theme }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);
  
    useEffect(() => {
      if (value !== displayValue) {
        setIsFlipping(true);
        const timeout = setTimeout(() => {
          setDisplayValue(value);
          setIsFlipping(false);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }, [value, displayValue]);
  
    return (
      <div 
        className="relative overflow-hidden rounded-xl sm:rounded-2xl"
        style={{
          width: 'clamp(2.5rem, 10vw, 4.5rem)',
          height: 'clamp(3.5rem, 14vw, 6rem)',
          backgroundColor: `${theme.cardBg}`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.border}`,
          boxShadow: `0 10px 40px -10px ${theme.accent}20`
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/30 z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]" />
        
        <div 
          className={`
            flex items-center justify-center h-full text-3xl sm:text-6xl font-black
            transition-all duration-300
            ${isFlipping ? 'animate-flip-out' : 'animate-flip-in'}
          `}
          style={{ 
            color: theme.text,
            fontFamily: "'JetBrains Mono', monospace",
            textShadow: `0 0 20px ${theme.accent}30, 0 2px 4px rgba(0,0,0,0.5)`
          }}
        >
          {displayValue}
        </div>
      </div>
    );
};

// --- SUB-COMPONENT: RE-REVEAL MODAL ---
const ReRevealModal: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
    onClose: () => void;
}> = ({ gameState, theme, onClose }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const selectedPlayer = selectedPlayerId
        ? gameState.gameData.find(p => p.id === selectedPlayerId) ?? null
        : null;
    const selectedPlayerColor = selectedPlayer
        ? PLAYER_COLORS[gameState.gameData.findIndex(p => p.id === selectedPlayerId) % PLAYER_COLORS.length]
        : '#ffffff';

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
        >
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className="relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
            >
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: `${theme.border}50` }}
                >
                    {selectedPlayer ? (
                        <button
                            onClick={() => setSelectedPlayerId(null)}
                            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity active:scale-95"
                            style={{ color: theme.text }}
                            aria-label="Volver a la lista"
                        >
                            <ChevronLeft size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Volver</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Eye size={16} style={{ color: theme.accent }} />
                            <span className="text-sm font-black uppercase tracking-wider" style={{ color: theme.text }}>
                                Consulta de Rol
                            </span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
                        style={{ color: theme.sub }}
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {selectedPlayer ? (
                    <div className="p-4 flex flex-col items-center gap-4">
                        <IdentityCard
                            player={selectedPlayer}
                            theme={theme}
                            color={selectedPlayerColor}
                            onRevealStart={() => {}}
                            onRevealEnd={() => {}}
                            nextAction={() => {}}
                            readyForNext={false}
                            isLastPlayer={false}
                            isParty={false}
                            partyIntensity="aperitivo"
                            debugMode={false}
                            onOracleConfirm={() => {}}
                            impostorEffectsEnabled={gameState.settings.impostorEffects}
                            revealSpeed={gameState.settings.holdRevealSpeed}
                        />
                        <p
                            className="text-[10px] font-mono uppercase tracking-widest opacity-50 pb-2"
                            style={{ color: theme.sub }}
                        >
                            Solo lectura · No avanza turno
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                        <p
                            className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-3 px-1"
                            style={{ color: theme.sub }}
                        >
                            Elige tu nombre para ver tu carta
                        </p>
                        {gameState.gameData.map((player, idx) => {
                            const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                            return (
                                <button
                                    key={player.id}
                                    onClick={() => setSelectedPlayerId(player.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.98] hover:bg-white/5"
                                    style={{
                                        borderColor: `${theme.border}60`,
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                                    />
                                    <span className="text-sm font-bold text-left flex-1" style={{ color: theme.text }}>
                                        {player.name}
                                    </span>
                                    <Eye size={14} style={{ color: theme.sub }} className="opacity-40" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ResultsView: React.FC<Props> = ({ gameState, theme, onBack, onReplay, currentPlayerColor, onNextPlayer, onOracleConfirm, onRenunciaDecision, onRenunciaRoleSeen, isExiting, transitionName }) => {
    const impostors = gameState.gameData.filter(p => p.isImp);
    const civilWord = gameState.gameData.find(p => !p.isImp)?.realWord || "???";
    const isTroll = gameState.isTrollEvent;
    const trollScenario = gameState.trollScenario;
    const isParty = gameState.settings.partyMode;
    const lastLog = gameState.history.matchLogs[0];
    
    const allViewTimes = gameState.gameData.map(p => p.viewTime || 0);
    const avgViewTime = allViewTimes.reduce((a, b) => a + b, 0) / (allViewTimes.length || 1);

    const getSuspicionLevel = (time: number): { label: string, color: string, dotColor: string } => {
        if (time === 0) return { label: "-", color: theme.sub, dotColor: 'bg-gray-500' };
        if (time > avgViewTime * 1.5) return { label: "Lento", color: '#fbbf24', dotColor: 'bg-amber-400' };
        if (time < avgViewTime * 0.5) return { label: "Rápido", color: '#f87171', dotColor: 'bg-red-400' };
        return { label: "Normal", color: theme.sub, dotColor: 'bg-emerald-400' };
    };
    
    const [isDecrypted, setIsDecrypted] = useState(false);
    const [decryptProgress, setDecryptProgress] = useState(0);
    const [isHoldingDecrypt, setIsHoldingDecrypt] = useState(false);
    const [scannedName, setScannedName] = useState("CALCULANDO...");
    const [vocalisLocked, setVocalisLocked] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [showMenuConfirm, setShowMenuConfirm] = useState(false);
    const confirmTimeoutRef = useRef<number | null>(null);
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
    const [showReReveal, setShowReReveal] = useState(false);

    useEffect(() => {
        if (isDecrypted) return;
        const interval = setInterval(() => {
            setTimerSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isDecrypted]);

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

    useEffect(() => {
        if (decryptProgress >= 100 && !isDecrypted) {
            setIsDecrypted(true);
            if (navigator.vibrate) navigator.vibrate([50, 50, 200]);
        }
    }, [decryptProgress, isDecrypted]);

    const handleMenuClick = (e: React.MouseEvent | React.PointerEvent) => {
        e.preventDefault();
        if (showMenuConfirm) {
            if (navigator.vibrate) navigator.vibrate(50);
            onBack();
        } else {
            if (navigator.vibrate) navigator.vibrate(20);
            setShowMenuConfirm(true);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = window.setTimeout(() => {
                setShowMenuConfirm(false);
            }, 3000);
        }
    };

    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        };
    }, []);

    // --- RENDER: PRE-REVEAL (DEBATE PHASE) ---
    if (!isDecrypted) {
        return (
            <div className="flex flex-col h-full items-center justify-between relative z-10 animate-in fade-in duration-700 bg-black/20">

                {/* RE-REVEAL MODAL — available during debate phase */}
                {showReReveal && (
                    <ReRevealModal
                        gameState={gameState}
                        theme={theme}
                        onClose={() => setShowReReveal(false)}
                    />
                )}

                {/* FLOATING RE-REVEAL BUTTON — debate phase */}
                {gameState.settings.allowReReveal && (
                    <button
                        onClick={() => { setShowReReveal(true); if (navigator.vibrate) navigator.vibrate(20); }}
                        className="fixed bottom-6 right-4 z-[150] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-xl active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                        style={{
                            backgroundColor: `${theme.cardBg}E0`,
                            backdropFilter: 'blur(16px)',
                            borderColor: `${theme.accent}60`,
                            boxShadow: `0 8px 32px -8px ${theme.accent}40`
                        }}
                        aria-label="Consultar rol"
                    >
                        <Eye size={16} style={{ color: theme.accent }} />
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: theme.text }}>
                            Revisar Rol
                        </span>
                    </button>
                )}

                <header className="absolute top-0 left-0 right-0 z-30 pt-[calc(0.5rem+env(safe-area-inset-top))] px-4 sm:px-6">
                    <div 
                        className="flex items-center justify-between p-3 rounded-2xl backdrop-blur-2xl transition-all duration-500 animate-in slide-in-from-top"
                        style={{
                            backgroundColor: `${theme.cardBg}80`,
                            border: `1px solid ${theme.border}50`
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: theme.sub }}>
                                    Ronda #{gameState.history.roundCounter}
                                </span>
                                <span className="text-xs sm:text-sm font-bold" style={{ color: theme.text }}>
                                    {gameState.players.length} Jugadores
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <div className="relative">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-red-400">EN VIVO</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 sm:gap-10 pt-20 px-4">
                    <div className="relative flex items-center justify-center gap-1 sm:gap-2 scale-90 sm:scale-100 transition-transform">
                        <DigitFlip value={Math.floor(timerSeconds / 60 / 10)} theme={theme} />
                        <DigitFlip value={Math.floor(timerSeconds / 60) % 10} theme={theme} />
                        <div className="flex flex-col gap-1.5 sm:gap-2 px-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse delay-500" style={{ backgroundColor: theme.accent }} />
                        </div>
                        <DigitFlip value={Math.floor((timerSeconds % 60) / 10)} theme={theme} />
                        <DigitFlip value={(timerSeconds % 60) % 10} theme={theme} />
                    </div>

                    <div className="relative w-full max-w-sm sm:max-w-md flex items-center justify-center">
                        <div 
                            className={`absolute w-[150%] h-[150%] pointer-events-none transition-opacity duration-1000 ${vocalisLocked ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                background: `radial-gradient(circle at center, ${theme.accent}15 0%, ${theme.accent}05 30%, transparent 70%)`,
                                animation: vocalisLocked ? 'pulse 3s ease-in-out infinite' : 'none'
                            }}
                        />
                        <div className={`relative w-full transition-all duration-700 ease-out ${vocalisLocked ? 'scale-100 opacity-100' : 'scale-95 opacity-70 blur-sm'}`}>
                            <div
                                className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden backdrop-blur-3xl"
                                style={{
                                    backgroundColor: `${theme.cardBg}DD`,
                                    border: `1px solid ${vocalisLocked ? theme.accent : theme.border}`,
                                    boxShadow: vocalisLocked ? `0 20px 60px -15px ${theme.accent}20` : 'none'
                                }}
                            >
                                {vocalisLocked && (
                                    <div 
                                        className="absolute inset-0 opacity-10 pointer-events-none"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.accent}40 0%, transparent 50%, ${theme.accent}40 100%)`,
                                            backgroundSize: '200% 200%',
                                            animation: 'gradient-shift 3s ease-in-out infinite'
                                        }}
                                    />
                                )}
                                <div className="relative z-10 text-center space-y-4 sm:space-y-6">
                                    <div className="inline-flex items-center justify-center">
                                        <div 
                                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500 ${vocalisLocked ? 'bg-white/10' : 'bg-white/5'}`}
                                            style={{ boxShadow: vocalisLocked ? `0 0 30px ${theme.accent}30` : 'none' }}
                                        >
                                            {vocalisLocked && [...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute inset-0 rounded-full border-2"
                                                    style={{
                                                        borderColor: theme.accent,
                                                        animation: `soundwave 2s ease-out infinite ${i * 0.6}s`
                                                    }}
                                                />
                                            ))}
                                            <svg 
                                                width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                style={{ color: theme.accent }}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 ${vocalisLocked ? 'animate-pulse' : ''}`}
                                            >
                                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                                                <path d="M19 10v2a7 7 0 1 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                            <div className={`w-1.5 h-1.5 rounded-full ${vocalisLocked ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: theme.sub }}>
                                                {vocalisLocked ? "MICRÓFONO ACTIVO" : "CALCULANDO TURNO..."}
                                            </span>
                                        </div>
                                    </div>
                                    <h2 
                                        className="text-3xl sm:text-5xl font-black leading-none tracking-tight transition-all duration-500"
                                        style={{ color: theme.text, textShadow: vocalisLocked ? `0 0 30px ${theme.accent}30` : 'none' }}
                                    >
                                        {scannedName}
                                    </h2>
                                    {vocalisLocked && (
                                        <div className="pt-4 border-t animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ borderColor: `${theme.border}50` }}>
                                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.text }}>Tu turno para hablar</p>
                                            <p className="text-[10px] opacity-60 leading-relaxed mt-1" style={{ color: theme.sub }}>Describe la palabra sin mencionarla</p>
                                        </div>
                                    )}
                                    {isParty && vocalisLocked && (
                                        <div className="animate-in zoom-in duration-300">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10">
                                                <Beer size={14} className="text-pink-400" />
                                                <span className="text-xs font-black text-pink-400 uppercase tracking-wider">Shot al terminar</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-xs sm:max-w-sm pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                        <button
                            className="group relative w-full h-20 sm:h-24 rounded-[2rem] overflow-hidden touch-none select-none active:scale-[0.98] transition-transform"
                            onPointerDown={(e) => { e.preventDefault(); setIsHoldingDecrypt(true); if (navigator.vibrate) navigator.vibrate([10, 20, 30]); }}
                            onPointerUp={(e) => { e.preventDefault(); setIsHoldingDecrypt(false); }}
                            onPointerLeave={() => setIsHoldingDecrypt(false)}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <div 
                                className="absolute inset-0 transition-all duration-300"
                                style={{
                                    backgroundColor: isHoldingDecrypt ? `${theme.accent}10` : 'rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(20px)',
                                    border: `2px solid ${isHoldingDecrypt ? theme.accent : theme.border}`,
                                    borderRadius: '2rem',
                                    boxShadow: isHoldingDecrypt 
                                        ? `0 0 40px ${theme.accent}30, inset 0 2px 10px rgba(0,0,0,0.3)`
                                        : '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                                }}
                            />
                            <div 
                                className="absolute inset-0 transition-all duration-100 ease-linear"
                                style={{
                                    width: `${decryptProgress}%`,
                                    background: `linear-gradient(90deg, ${theme.accent}60 0%, ${theme.accent}90 50%, ${theme.accent}60 100%)`,
                                    backgroundSize: '200% 100%',
                                    animation: isHoldingDecrypt ? 'shimmer-progress 1.5s linear infinite' : 'none',
                                    borderRadius: '2rem'
                                }}
                            />
                            {!isHoldingDecrypt && (
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                                        animation: 'slide-shine 2s ease-in-out infinite'
                                    }}
                                />
                            )}
                            <div className="relative z-10 h-full flex items-center px-4 sm:px-6">
                                <div className={`relative flex items-center justify-center transition-all duration-300 ${isHoldingDecrypt ? 'scale-110' : 'scale-100'}`} style={{ width: '3.5rem', height: '3.5rem' }}>
                                    <div 
                                        className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${isHoldingDecrypt ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}
                                        style={{ borderColor: theme.accent, animation: isHoldingDecrypt ? 'ping 1s cubic-bezier(0,0,0.2,1) infinite' : 'none' }}
                                    />
                                    <div className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isHoldingDecrypt ? 'bg-white text-black shadow-xl' : 'bg-white/10 text-white'}`}>
                                        <Fingerprint size={24} className={isHoldingDecrypt ? 'text-black' : 'text-white'} />
                                    </div>
                                </div>
                                <div className="flex-1 ml-4 sm:ml-6 space-y-0.5 text-left">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`font-black uppercase tracking-[0.2em] transition-all duration-300 ${isHoldingDecrypt ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`} style={{ color: theme.text, textShadow: isHoldingDecrypt ? `0 0 20px ${theme.accent}60` : 'none' }}>
                                            {isHoldingDecrypt ? "ESCANEANDO" : "MANTENER"}
                                        </span>
                                        {isHoldingDecrypt && <span className="text-[10px] font-mono tabular-nums animate-pulse" style={{ color: theme.accent }}>{Math.floor(decryptProgress)}%</span>}
                                    </div>
                                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300" style={{ color: theme.sub, opacity: isHoldingDecrypt ? 0.9 : 0.6 }}>
                                        {isHoldingDecrypt ? "Verificando identidad..." : "Para revelar resultados"}
                                    </p>
                                </div>
                                <div className="ml-2">
                                    {isHoldingDecrypt ? (
                                        <div className="animate-spin w-5 h-5 rounded-full border-2 border-t-transparent" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} />
                                    ) : (
                                        <Lock size={18} style={{ color: theme.sub }} className="opacity-60" />
                                    )}
                                </div>
                            </div>
                        </button>
                        <div className={`mt-3 flex items-center justify-between px-4 transition-opacity duration-300 ${isHoldingDecrypt ? 'opacity-0' : 'opacity-50'}`}>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80]" />
                                <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: theme.sub }}>Sistema Seguro</span>
                            </div>
                            <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: theme.sub }}>AES-256 • v2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: RESULTS ---
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

            {/* CATEGORY EXHAUSTION WARNING */}
            {lastLog.exhaustionWarning && lastLog.exhaustionWarning !== 'none' && !isTroll && (
                <div className={`w-full max-w-sm mb-6 p-3 rounded-xl border flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top duration-500 ${
                    lastLog.exhaustionWarning === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                    <BatteryWarning size={18} className={lastLog.exhaustionWarning === 'critical' ? 'text-red-400 animate-pulse' : 'text-amber-400'} />
                    <div className="flex-1">
                        <p className={`text-[10px] font-black uppercase tracking-wide ${lastLog.exhaustionWarning === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                            {lastLog.exhaustionWarning === 'critical' ? 'CATEGORÍA AGOTADA' : 'RESERVAS BAJAS'}
                        </p>
                        <p className={`text-[9px] leading-tight opacity-80 ${lastLog.exhaustionWarning === 'critical' ? 'text-red-200' : 'text-amber-200'}`}>
                            Has usado el {Math.round((lastLog.categoryExhaustionRate || 0) * 100)}% de palabras en "{lastLog.category}". Añade más categorías para mantener la variedad.
                        </p>
                    </div>
                </div>
            )}

            {/* TROLL EVENT BANNER */}
            {isTroll && (
                <div 
                    className="relative overflow-hidden rounded-2xl border-2 p-5 animate-in fade-in slide-in-from-top duration-700 w-full max-w-sm mb-6"
                    style={{
                        borderColor: theme.accent,
                        background: `linear-gradient(135deg, ${theme.accent}15, ${theme.cardBg})`,
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <div 
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(45deg, ${theme.accent}40, ${theme.accent}40 10px, transparent 10px, transparent 20px)`
                        }}
                    />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl animate-pulse" style={{ filter: `drop-shadow(0 0 10px ${theme.accent})` }}>🎭</div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.accent, textShadow: `0 0 20px ${theme.accent}40` }}>
                                    Protocolo PANDORA
                                </h3>
                                <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest" style={{ color: theme.sub }}>Evento especial activado</p>
                            </div>
                        </div>
                        {trollScenario && (
                            <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                                {trollScenario}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* 2. IMPOSTORS REVEAL */}
            <div className="w-full max-w-sm mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Ghost size={16} style={{ color: theme.accent }} className="opacity-70" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: theme.sub }}>
                        {impostors.length === 1 ? 'El Impostor era' : 'Los Impostores eran'}
                    </span>
                    <div className="h-px flex-1 opacity-20" style={{ backgroundColor: theme.border }} />
                </div>
                <div className="space-y-3">
                    {impostors.map((imp, idx) => {
                        const color = PLAYER_COLORS[gameState.gameData.findIndex(p => p.id === imp.id) % PLAYER_COLORS.length];
                        return (
                            <div
                                key={imp.id}
                                className="flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md animate-in slide-in-from-left duration-500"
                                style={{
                                    animationDelay: `${idx * 100}ms`,
                                    backgroundColor: `${color}10`,
                                    borderColor: `${color}40`
                                }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                                    <Ghost size={18} style={{ color }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-black" style={{ color: theme.text }}>{imp.name}</p>
                                    <p className="text-[10px] font-mono opacity-60 uppercase" style={{ color: theme.sub }}>
                                        {imp.impostorWord ? `Palabra: ${imp.impostorWord}` : 'Impostor'}
                                    </p>
                                </div>
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. PLAYER STATS TABLE */}
            <div className="w-full max-w-sm mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Clock size={16} style={{ color: theme.accent }} className="opacity-70" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: theme.sub }}>Análisis de tiempos</span>
                    <div className="h-px flex-1 opacity-20" style={{ backgroundColor: theme.border }} />
                </div>
                <div
                    className="rounded-2xl border overflow-hidden backdrop-blur-md"
                    style={{ backgroundColor: `${theme.cardBg}80`, borderColor: theme.border }}
                >
                    {gameState.gameData.map((player, idx) => {
                        const suspicion = getSuspicionLevel(player.viewTime || 0);
                        const isImp = player.isImp;
                        const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                        const isExpanded = expandedPlayerId === player.id;
                        return (
                            <div key={player.id}>
                                <button
                                    onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
                                        idx < gameState.gameData.length - 1 ? 'border-b' : ''
                                    } ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                    style={{ borderColor: `${theme.border}50` }}
                                >
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-sm font-bold flex-1 text-left" style={{ color: isImp ? theme.accent : theme.text }}>
                                        {player.name}
                                        {isImp && <span className="ml-2 text-[9px] font-black opacity-70">(IMP)</span>}
                                    </span>
                                    <span className="text-[10px] font-mono tabular-nums" style={{ color: suspicion.color }}>
                                        {player.viewTime ? `${player.viewTime.toFixed(1)}s` : '-'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${suspicion.dotColor} bg-opacity-20`} style={{ color: suspicion.color }}>
                                        {suspicion.label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. ACTION BUTTONS */}
            <div className="w-full max-w-sm space-y-3 mb-4">
                <button
                    onClick={onReplay}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] border"
                    style={{
                        backgroundColor: `${theme.accent}20`,
                        borderColor: `${theme.accent}50`,
                        color: theme.accent,
                        boxShadow: `0 8px 24px -8px ${theme.accent}30`
                    }}
                >
                    <RotateCcw size={18} />
                    Nueva partida
                </button>

                <button
                    onClick={handleMenuClick}
                    onPointerDown={handleMenuClick}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] border"
                    style={{
                        backgroundColor: showMenuConfirm ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                        borderColor: showMenuConfirm ? 'rgba(239,68,68,0.5)' : theme.border,
                        color: showMenuConfirm ? '#f87171' : theme.sub
                    }}
                >
                    <Menu size={18} />
                    {showMenuConfirm ? '¿Salir? (confirmar)' : 'Menú principal'}
                </button>
            </div>
        </div>
    );
};
