


import React, { useState, useRef, useEffect } from 'react';
import { GamePlayer, ThemeConfig, PartyIntensity, GameState } from '../types';
import { ChevronUp } from 'lucide-react';
import { RoleContent } from './RoleContent';
import { CATEGORIES_DATA } from '../categories';

interface SwipeRevealCardProps {
    player: GamePlayer;
    theme: ThemeConfig;
    color: string;
    onRevealComplete: (viewTime: number) => void;
    settings: GameState['settings'];
    isParty?: boolean;
    partyIntensity?: PartyIntensity;
    isRenunciaPending?: boolean;
}

const SWIPE_THRESHOLDS = {
    low: 400,
    medium: 300,
    high: 200
};

export const SwipeRevealCard: React.FC<SwipeRevealCardProps> = ({
    player,
    theme,
    color,
    onRevealComplete,
    settings,
    isParty,
    partyIntensity,
    isRenunciaPending
}) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');
    const [isBouncing, setIsBouncing] = useState(false); // New State for Bounce

    const [oracleSelectionMade, setOracleSelectionMade] = useState(false);
    const [oracleOptions, setOracleOptions] = useState<string[]>([]);
    const [isTransmitting, setIsTransmitting] = useState(false);

    const startY = useRef(0);
    const currentY = useRef(0);
    const rafId = useRef<number | null>(null);
    const lastHapticAt = useRef({ threshold30: false, threshold70: false });
    const viewStartTime = useRef<number>(0);
    const totalViewTime = useRef<number>(0);
    
    const threshold = SWIPE_THRESHOLDS[settings.swipeSensitivity];

    // Detectar capacidades del dispositivo para optimizar efectos
    useEffect(() => {
        const cores = navigator.hardwareConcurrency || 4;
        const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const isProMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
        
        if (cores <= 4 || !isIOSSafari) {
            setPerformanceMode('medium');
        } else if (cores >= 6 && isProMotion) {
            setPerformanceMode('high');
        }
    }, []);

    useEffect(() => {
        setIsRevealed(false);
        setIsDragging(false);
        setDragY(0);
        setProgress(0);
        setIsExiting(false);
        setOracleSelectionMade(false);
        setIsTransmitting(false);
        totalViewTime.current = 0;
        
        if (player.isOracle && !player.isImp) {
            const catDataList = CATEGORIES_DATA[player.category];
            const pair = catDataList?.find(c => c.civ === player.realWord);
            if (pair) setOracleOptions(pair.hints || [player.category, "Sin Pista", "Ruido"]);
        }

        return () => {
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
        };
    }, [player.id]);

    // Bloquear scroll durante drag con optimizaciones específicas para iOS
    useEffect(() => {
        if (!isDragging) return;
        
        const preventScroll = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault();
        };
        
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        // @ts-ignore
        document.body.style.WebkitOverflowScrolling = 'auto';
        document.addEventListener('touchmove', preventScroll, { passive: false });
        
        return () => {
            document.documentElement.style.scrollBehavior = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            // @ts-ignore
            document.body.style.WebkitOverflowScrolling = '';
            document.removeEventListener('touchmove', preventScroll);
        };
    }, [isDragging]);

    const updateDragState = () => {
        if (!isDragging || isRevealed) {
            rafId.current = null;
            return;
        }

        const deltaY = currentY.current - startY.current;
        const clampedY = Math.min(0, deltaY);
        const newProgress = Math.min(100, (Math.abs(clampedY) / threshold) * 100);
        
        // 🚀 Batch state updates para evitar múltiples re-renders
        React.startTransition(() => {
            setDragY(clampedY);
            setProgress(newProgress);
        });

        if (settings.hapticFeedback && navigator.vibrate) {
            if (newProgress >= 30 && !lastHapticAt.current.threshold30) {
                navigator.vibrate(5);
                lastHapticAt.current.threshold30 = true;
            }
            if (newProgress >= 70 && !lastHapticAt.current.threshold70) {
                navigator.vibrate(15);
                lastHapticAt.current.threshold70 = true;
            }
            if (newProgress < 30) lastHapticAt.current.threshold30 = false;
            if (newProgress < 70) lastHapticAt.current.threshold70 = false;
        }

        rafId.current = requestAnimationFrame(updateDragState);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isRevealed || isExiting) return;
        
        startY.current = e.clientY;
        currentY.current = e.clientY;
        setIsDragging(true);
        setIsBouncing(false); // Reset bounce
        
        lastHapticAt.current = { threshold30: false, threshold70: false };
        
        if (viewStartTime.current === 0) viewStartTime.current = Date.now();
        
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || isRevealed) return;
        currentY.current = e.clientY;
        if (rafId.current === null) {
            rafId.current = requestAnimationFrame(updateDragState);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        
        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        
        setIsDragging(false);
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}

        if (progress >= 100) {
            handleComplete();
        } else {
            // Trigger feedback for incomplete swipe
            setIsBouncing(true);
            setDragY(0);
            setProgress(0);
            if (settings.hapticFeedback && navigator.vibrate) {
                navigator.vibrate([10, 5, 10]);
            }
            setTimeout(() => setIsBouncing(false), 500); // Reset after animation
        }
    };

    const handleComplete = () => {
        setIsRevealed(true);
        if (settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate([50, 20, 100]);
        }
        if (viewStartTime.current > 0) {
            totalViewTime.current += Date.now() - viewStartTime.current;
        }
    };

    const handleOracleOptionSelect = (hint: string) => {
        if (oracleSelectionMade || isTransmitting) return;
        setIsTransmitting(true);
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
        setTimeout(() => {
            setIsTransmitting(false);
            setOracleSelectionMade(true);
            setIsExiting(true);
            setTimeout(() => onRevealComplete(totalViewTime.current), 600);
        }, 1200);
    };

    const handleProceed = () => {
        setIsExiting(true);
        setTimeout(() => onRevealComplete(totalViewTime.current), 600);
    };

    const isHighIntensity = partyIntensity === 'after_hours' || partyIntensity === 'resaca';

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center px-4 relative swipe-card-container"
            style={{
                touchAction: 'none',
                WebkitOverflowScrolling: 'auto',
                overscrollBehavior: 'contain',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
            }}
        >
            <div 
                className="mb-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top duration-700"
                style={{
                    opacity: isExiting ? 0 : 1,
                    transform: isExiting ? 'translate3d(0, -20px, 0)' : 'translate3d(0, 0, 0)',
                    transition: 'all 0.4s ease'
                }}
            >
                <div 
                    className="w-20 h-20 rounded-full border-4 flex items-center justify-center relative overflow-hidden"
                    style={{
                        borderColor: color,
                        backgroundColor: `${color}15`,
                        boxShadow: `0 0 30px ${color}30`
                    }}
                >
                    <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: color }}
                    />
                    <span className="text-3xl font-black relative z-10" style={{ color }}>
                        {player.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black uppercase tracking-wider mb-1" style={{ color: theme.text }}>
                        {player.name}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60" style={{ color: theme.sub }}>
                        {isRevealed ? 'Identidad Revelada' : 'Tu Turno'}
                    </p>
                </div>
            </div>

            <div className="relative w-full max-w-[340px] aspect-[3/4] mx-auto" style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                <div 
                    className="absolute overflow-hidden"
                    style={{
                        top: '-6px',
                        left: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        borderRadius: '2.5rem',
                        zIndex: 1,
                        transform: 'translateZ(0)'
                    }}
                >
                    <div 
                        className="absolute rounded-[2.5rem] border-[3px] overflow-hidden transition-all"
                        style={{
                            inset: 0,
                            backgroundColor: theme.cardBg,
                            borderColor: isRevealed ? color : `${theme.border}80`,
                            boxShadow: isDragging 
                                ? (isRevealed ? `0 0 40px ${color}30` : `0 0 20px ${color}15`)
                                : (isRevealed ? `0 0 60px ${color}40` : `0 0 ${20 + progress * 0.4}px ${color}${Math.floor(15 + progress * 0.35).toString(16).padStart(2, '0')}`),
                            transform: `translate3d(0, ${Math.max(dragY * 0.08, -10)}px, 0) scale3d(${0.96 + (progress * 0.0004)}, ${0.96 + (progress * 0.0004)}, 1)`,
                            transitionDuration: isDragging ? '0ms' : '300ms',
                            transitionProperty: isDragging ? 'none' : 'all',
                            zIndex: 5,
                            backdropFilter: isDragging ? 'blur(10px)' : (theme.blur ? `blur(${theme.blur})` : 'blur(20px)'),
                            contain: 'layout style paint',
                            willChange: isDragging ? 'transform, box-shadow' : 'auto'
                        }}
                    >
                        <div className="h-full w-full py-8 px-6">
                            <RoleContent 
                                player={player}
                                theme={theme}
                                color={color}
                                isParty={isParty}
                                isHighIntensity={isHighIntensity}
                                isOracleSelectionMade={oracleSelectionMade}
                                oracleOptions={oracleOptions}
                                isTransmitting={isTransmitting}
                                onOracleOptionSelect={handleOracleOptionSelect}
                            />
                        </div>

                        {!isRevealed && (
                            <div 
                                className="absolute pointer-events-none transition-opacity"
                                style={{
                                    inset: '3px',
                                    borderRadius: 'calc(2.5rem - 3px)',
                                    backgroundColor: theme.cardBg,
                                    opacity: progress < 95 ? 1 : 0,
                                    backdropFilter: isDragging ? 'blur(20px)' : 'blur(40px)',
                                    zIndex: 50,
                                    transitionDuration: isDragging ? '0ms' : '500ms'
                                }}
                            >
                                <div 
                                    className="absolute inset-0 opacity-5"
                                    style={{
                                        borderRadius: 'inherit',
                                        backgroundImage: `repeating-linear-gradient(
                                            45deg,
                                            ${theme.accent}20,
                                            ${theme.accent}20 10px,
                                            transparent 10px,
                                            transparent 20px
                                        )`
                                    }}
                                />
                            </div>
                        )}

                        {isRevealed && isRenunciaPending && (
                            <div className="absolute top-4 right-4 z-50 animate-in fade-in zoom-in duration-300">
                                <div className="px-3 py-1.5 rounded-full backdrop-blur-xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-300 animate-pulse">
                                        DECISIÓN PENDIENTE
                                    </p>
                                </div>
                            </div>
                        )}

                        {isRevealed && (!player.isOracle || oracleSelectionMade) && (
                            <div className="absolute bottom-8 left-0 w-full flex justify-center animate-in fade-in slide-in-from-bottom duration-500 px-6">
                                <button 
                                    onClick={handleProceed}
                                    style={{ backgroundColor: color }}
                                    className="px-8 py-3 rounded-full text-white font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                                >
                                    {isRenunciaPending ? 'CONTINUAR' : 'SIGUIENTE'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {!isExiting && (
                    <div 
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={`absolute inset-0 rounded-[2.5rem] border-2 touch-none select-none overflow-hidden transition-all ${isDragging ? 'duration-0' : 'duration-500'} ${isRevealed ? 'pointer-events-none opacity-0' : ''} ${isBouncing ? 'animate-bounce-short' : ''}`}
                        style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accent,
                            boxShadow: isDragging
                                ? `0 ${Math.max(10, 20 - (progress / 10))}px ${Math.max(30, 60 - (progress / 2))}px rgba(0,0,0,0.3)`
                                : `0 ${20 - (progress / 10)}px ${60 - (progress / 2)}px rgba(0,0,0,${0.4 - (progress / 400)})`,
                            transform: isRevealed 
                                ? 'translate3d(0, -150%, 0) rotate(12deg) scale3d(0.9, 0.9, 1)'
                                : `translate3d(0, ${dragY}px, 0) rotate(${(dragY / 100) * 2}deg) scale3d(${1 - (progress * 0.0002)}, ${1 - (progress * 0.0002)}, 1)`,
                            transitionDuration: isDragging ? '0ms' : '500ms',
                            transitionProperty: isDragging ? 'none' : 'all',
                            zIndex: 20,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            background: `
                                linear-gradient(135deg, ${theme.accent}15 0%, ${theme.cardBg} 50%, ${theme.accent}10 100%),
                                repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme.accent}03 10px, ${theme.accent}03 20px)
                            `,
                            backdropFilter: isDragging 
                                ? (performanceMode === 'high' ? 'blur(15px)' : 'blur(8px)')
                                : (theme.blur ? `blur(${theme.blur})` : 'blur(30px)'),
                            willChange: isDragging ? 'transform, box-shadow' : 'auto'
                        }}
                    >
                        {!isDragging && performanceMode === 'high' && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 rounded-full animate-float"
                                        style={{
                                            left: `${(i * 12.5)}%`,
                                            top: `${Math.random() * 100}%`,
                                            backgroundColor: theme.accent,
                                            animationDelay: `${i * 0.4}s`,
                                            animationDuration: `${3 + Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {isDragging && performanceMode !== 'low' && (
                            <div 
                                className="absolute left-0 right-0 h-[2px] pointer-events-none"
                                style={{
                                    top: `${progress}%`,
                                    background: `linear-gradient(90deg, transparent, ${color}60 50%, transparent)`,
                                    boxShadow: `0 0 10px ${color}`,
                                    transition: 'top 0.05s linear'
                                }}
                            />
                        )}

                        <div 
                            className="absolute inset-0 pointer-events-none transition-opacity"
                            style={{
                                background: `radial-gradient(circle at 50% ${50 + progress * 0.5}%, ${color}${isDragging ? '10' : '15'}, transparent 60%)`,
                                opacity: progress > 30 ? (isDragging ? 0.3 : 0.6) : 0,
                                transitionDuration: isDragging ? '100ms' : '500ms'
                            }}
                        />

                        <div className="relative h-full w-full flex flex-col items-center justify-between py-10 px-6 z-10">
                            <div className="text-center space-y-3 opacity-70">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30" />
                                    <p style={{ color: theme.sub }} className="text-[9px] font-black uppercase tracking-[0.4em]">
                                        Protocolo Revelación
                                    </p>
                                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30" />
                                </div>
                            </div>

                            <div className="relative flex items-center justify-center">
                                {performanceMode !== 'low' && (
                                    <div 
                                        className={`absolute inset-0 rounded-full scale-150 ${!isDragging ? 'animate-pulse' : ''}`}
                                        style={{ 
                                            backgroundColor: `${color}20`,
                                            opacity: isDragging ? 0.3 : (0.6 - (progress * 0.004)),
                                            filter: isDragging ? 'blur(20px)' : 'blur(40px)'
                                        }} 
                                    />
                                )}
                                
                                {!isDragging && performanceMode === 'high' && (
                                    <div 
                                        className="absolute w-32 h-32 rounded-full border-2 border-dashed animate-spin-slow opacity-20"
                                        style={{ borderColor: theme.accent }}
                                    />
                                )}
                                
                                <div 
                                    className="relative text-7xl transition-transform"
                                    style={{ 
                                        transform: `scale3d(${1 - (progress * 0.003)}, ${1 - (progress * 0.003)}, 1) ${isDragging ? '' : `rotateY(${progress * 1.8}deg)`}`,
                                        filter: `blur(${progress * 0.06}px)`,
                                        transitionDuration: isDragging ? '0ms' : '200ms'
                                    }}
                                >
                                    🎭
                                </div>
                            </div>

                            <div 
                                className="flex flex-col items-center gap-4 transition-all"
                                style={{ 
                                    opacity: Math.max(0, 1 - (progress / 40)),
                                    transform: `translate3d(0, ${progress * 0.2}px, 0)`,
                                    transitionDuration: isDragging ? '0ms' : '300ms'
                                }}
                            >
                                <div className="flex flex-col items-center -space-y-4">
                                    {[0, 1, 2].map(i => (
                                        <ChevronUp 
                                            key={i}
                                            size={32} 
                                            style={{ 
                                                color: theme.accent,
                                                filter: `drop-shadow(0 0 4px ${theme.accent})`
                                            }}
                                            className={isDragging ? '' : 'animate-bounce'}
                                            {...(!isDragging && { style: { animationDelay: `${i * 0.15}s` }})}
                                        />
                                    ))}
                                </div>
                                <p 
                                    className="text-sm font-black uppercase tracking-[0.2em] text-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.text}, ${theme.accent})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {progress > 70 ? '¡Casi Ahí!' : progress > 30 ? 'Sigue' : 'Arrastra'}
                                </p>
                            </div>

                            <div className="w-full space-y-2">
                                {isDragging && (
                                    <div className="text-center">
                                        <span 
                                            className="text-2xl font-black tabular-nums"
                                            style={{ 
                                                color: progress > 70 ? color : theme.text,
                                                textShadow: progress > 70 ? `0 0 15px ${color}` : 'none',
                                                transition: 'color 0.2s ease'
                                            }}
                                        >
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                )}
                                <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div 
                                        className="absolute inset-y-0 left-0 rounded-full"
                                        style={{ 
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${theme.accent}, ${color})`,
                                            boxShadow: `0 0 ${isDragging ? 10 : 15}px ${progress > 50 ? color : theme.accent}80`,
                                            transition: isDragging ? 'none' : 'width 0.1s linear'
                                        }}
                                    >
                                        {!isDragging && performanceMode === 'high' && (
                                            <div 
                                                className="absolute inset-0 animate-shimmer"
                                                style={{
                                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                    backgroundSize: '200% 100%'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <style>{`
                            @keyframes bounce-short {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-10px); }
                            }
                            .animate-bounce-short {
                                animation: bounce-short 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                            }
                            @keyframes float {
                                0%, 100% { transform: translate3d(0, 0, 0); }
                                50% { transform: translate3d(5px, -20px, 0); }
                            }
                            @keyframes shimmer {
                                0% { background-position: -200% 0; }
                                100% { background-position: 200% 0; }
                            }
                            @keyframes spin-slow {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            .animate-float {
                                animation: float linear infinite;
                            }
                            .animate-shimmer {
                                animation: shimmer 2s linear infinite;
                            }
                            .animate-spin-slow {
                                animation: spin-slow 15s linear infinite;
                            }
                            .swipe-card-container {
                                -webkit-transform: translateZ(0);
                                -webkit-backface-visibility: hidden;
                                -webkit-perspective: 1000;
                                transform: translateZ(0);
                                backface-visibility: hidden;
                                perspective: 1000px;
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
};