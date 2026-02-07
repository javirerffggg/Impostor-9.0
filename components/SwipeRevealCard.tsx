import React, { useState, useRef, useEffect } from 'react';
import { GamePlayer, ThemeConfig, PartyIntensity, GameState } from '../types';
import { ChevronUp, MousePointerClick } from 'lucide-react';
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
    partyIntensity
}) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

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

    // Bloquear scroll durante drag
    useEffect(() => {
        if (!isDragging) return;
        
        const preventScroll = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault();
        };
        
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.addEventListener('touchmove', preventScroll, { passive: false });
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
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
        const normalizedY = Math.min(Math.abs(clampedY), threshold * 1.5);
        const newProgress = Math.min(100, (Math.abs(clampedY) / threshold) * 100);
        
        setDragY(clampedY);
        setProgress(newProgress);

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
            setDragY(0);
            setProgress(0);
            if (settings.hapticFeedback && navigator.vibrate) {
                navigator.vibrate([10, 5, 10]);
            }
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
            className="w-full h-full flex flex-col items-center justify-center px-4 relative"
            style={{
                touchAction: 'none',
                WebkitOverflowScrolling: 'auto',
                overscrollBehavior: 'contain',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
            }}
        >
            
            {/* 🎯 HEADER CON NOMBRE DEL JUGADOR */}
            <div 
                className="mb-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top duration-700"
                style={{
                    opacity: isExiting ? 0 : 1,
                    transform: isExiting ? 'translateY(-20px)' : 'translateY(0)',
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
                    <span 
                        className="text-3xl font-black relative z-10"
                        style={{ color }}
                    >
                        {player.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                <div className="text-center">
                    <h2 
                        className="text-2xl font-black uppercase tracking-wider mb-1"
                        style={{ color: theme.text }}
                    >
                        {player.name}
                    </h2>
                    <p 
                        className="text-xs font-bold uppercase tracking-[0.3em] opacity-60"
                        style={{ color: theme.sub }}
                    >
                        {isRevealed ? 'Identidad Revelada' : 'Tu Turno'}
                    </p>
                </div>
            </div>

            {/* SISTEMA DE CARTAS */}
            <div 
                className="relative w-full max-w-[340px] aspect-[3/4] mx-auto"
                style={{ isolation: 'isolate' }}
            >
                {/* 🔧 CONTENEDOR CON OVERFLOW CONTROLADO PARA CARTA INFERIOR */}
                <div 
                    className="absolute overflow-hidden"
                    style={{
                        top: '-6px',
                        left: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        borderRadius: '2.5rem',
                        zIndex: 1
                    }}
                >
                    {/* CARTA INFERIOR */}
                    <div 
                        className="absolute rounded-[2.5rem] border-[3px] overflow-hidden transition-all duration-300"
                        style={{
                            inset: 0,
                            backgroundColor: theme.cardBg,
                            borderColor: isRevealed ? color : `${theme.border}80`,
                            boxShadow: isRevealed 
                                ? `0 0 60px ${color}40, 0 8px 32px rgba(0,0,0,0.3)` 
                                : `0 0 ${20 + progress * 0.4}px ${color}${Math.floor(15 + progress * 0.35).toString(16).padStart(2, '0')}`,
                            transform: `translateY(${Math.max(dragY * 0.08, -10)}px) scale(${0.96 + (progress * 0.0004)})`,
                            zIndex: 5,
                            backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(20px)'
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

                        {/* 🔥 OVERLAY BLOQUEADOR - Oculta todo hasta revelar */}
                        {!isRevealed && (
                            <div 
                                className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-500"
                                style={{
                                    backgroundColor: theme.cardBg,
                                    opacity: progress < 95 ? 1 : 0,
                                    backdropFilter: 'blur(40px)'
                                }}
                            >
                                <div 
                                    className="absolute inset-0 opacity-5"
                                    style={{
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

                        {/* Botón siguiente solo cuando está revelado */}
                        {isRevealed && (!player.isOracle || oracleSelectionMade) && (
                            <div className="absolute bottom-8 left-0 w-full flex justify-center animate-in fade-in slide-in-from-bottom duration-500">
                                <button 
                                    onClick={handleProceed}
                                    style={{ backgroundColor: color }}
                                    className="px-8 py-3 rounded-full text-white font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARTA SUPERIOR - DISEÑO PREMIUM MEJORADO */}
                {!isExiting && (
                    <div 
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={`absolute inset-0 rounded-[2.5rem] border-2 touch-none select-none overflow-hidden transition-all ${isDragging ? 'duration-0' : 'duration-500'} ${isRevealed ? 'pointer-events-none opacity-0 -translate-y-[150%] rotate-12 scale-90' : ''}`}
                        style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accent,
                            boxShadow: `
                                0 ${20 - (progress / 10)}px ${60 - (progress / 2)}px rgba(0,0,0,${0.4 - (progress / 400)}),
                                0 ${8 - (progress / 20)}px ${24 - (progress / 10)}px rgba(0,0,0,${0.2 - (progress / 500)})
                            `,
                            transform: `translateY(${dragY}px) rotate(${(dragY / 100) * 2}deg) scale(${1 - (progress * 0.0002)})`,
                            zIndex: 20,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            background: `
                                linear-gradient(135deg, ${theme.accent}15 0%, ${theme.cardBg} 50%, ${theme.accentSecondary || theme.accent}10 100%),
                                repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme.accent}03 10px, ${theme.accent}03 20px)
                            `,
                            backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(30px)'
                        }}
                    >
                        {/* 🌟 EFECTOS DE FONDO ANIMADOS */}
                        
                        {/* Partículas flotantes */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full animate-float"
                                    style={{
                                        left: `${(i * 8.33)}%`,
                                        top: `${Math.random() * 100}%`,
                                        backgroundColor: theme.accent,
                                        animationDelay: `${i * 0.3}s`,
                                        animationDuration: `${3 + Math.random() * 2}s`,
                                        opacity: 0.4 - (progress * 0.003)
                                    }}
                                />
                            ))}
                        </div>

                        {/* Scan line con efecto de progreso */}
                        <div 
                            className="absolute left-0 right-0 h-[2px] pointer-events-none transition-all duration-200"
                            style={{
                                top: isDragging ? `${progress}%` : '-10%',
                                background: `linear-gradient(90deg, transparent, ${color}80 50%, transparent)`,
                                boxShadow: `0 0 20px ${color}, 0 0 40px ${color}40`,
                                opacity: isDragging ? 0.8 : 0
                            }}
                        />

                        {/* Gradiente radial dinámico */}
                        <div 
                            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                            style={{
                                background: `radial-gradient(circle at 50% ${50 + progress * 0.5}%, ${color}15, transparent 60%)`,
                                opacity: progress > 30 ? 0.6 : 0
                            }}
                        />

                        {/* 🎨 CONTENIDO PRINCIPAL */}
                        <div className="relative h-full w-full flex flex-col items-center justify-between py-10 px-6 z-10">
                            
                            {/* Header decorativo */}
                            <div className="text-center space-y-3 opacity-70">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30" />
                                    <p style={{ color: theme.sub }} className="text-[9px] font-black uppercase tracking-[0.4em]">
                                        Protocolo Revelación
                                    </p>
                                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30" />
                                </div>
                            </div>

                            {/* Icono central con múltiples capas */}
                            <div className="relative flex items-center justify-center">
                                {/* Glow exterior pulsante */}
                                <div 
                                    className="absolute inset-0 blur-3xl rounded-full scale-150 animate-pulse"
                                    style={{ 
                                        backgroundColor: `${color}20`,
                                        opacity: 0.6 - (progress * 0.004)
                                    }} 
                                />
                                
                                {/* Anillo orbital */}
                                <div 
                                    className="absolute w-32 h-32 rounded-full border-2 border-dashed animate-spin-slow opacity-20"
                                    style={{ borderColor: theme.accent }}
                                />
                                
                                {/* Icono principal */}
                                <div 
                                    className="relative text-7xl transition-all duration-200"
                                    style={{ 
                                        transform: `scale(${1 - (progress * 0.003)}) rotateY(${progress * 1.8}deg)`,
                                        filter: `blur(${progress * 0.06}px) brightness(${1 + progress * 0.01})`
                                    }}
                                >
                                    🎭
                                </div>

                                {/* Hexágono decorativo */}
                                <svg 
                                    className="absolute w-40 h-40 opacity-10 animate-spin-reverse"
                                    viewBox="0 0 100 100"
                                    style={{ animationDuration: '20s' }}
                                >
                                    <polygon 
                                        points="50,5 90,25 90,75 50,95 10,75 10,25" 
                                        fill="none" 
                                        stroke={theme.accent} 
                                        strokeWidth="0.5"
                                    />
                                </svg>
                            </div>

                            {/* Indicadores de arrastre mejorados */}
                            <div 
                                className="flex flex-col items-center gap-4 transition-all duration-300"
                                style={{ 
                                    opacity: Math.max(0, 1 - (progress / 40)),
                                    transform: `translateY(${progress * 0.2}px)`
                                }}
                            >
                                {/* Chevrones con efecto de onda */}
                                <div className="relative flex flex-col items-center -space-y-4">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="relative">
                                            {/* Glow por detrás */}
                                            <div 
                                                className="absolute inset-0 blur-md animate-bounce"
                                                style={{
                                                    color: theme.accent,
                                                    animationDelay: `${i * 0.15}s`,
                                                    opacity: 0.3
                                                }}
                                            >
                                                <ChevronUp size={32} />
                                            </div>
                                            
                                            {/* Chevron principal */}
                                            <ChevronUp 
                                                size={32} 
                                                style={{ 
                                                    color: theme.accent,
                                                    filter: `drop-shadow(0 0 4px ${theme.accent})`,
                                                    animationDelay: `${i * 0.15}s`,
                                                    opacity: 0.5 + (i * 0.25)
                                                }}
                                                className="animate-bounce relative z-10"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Texto con gradiente */}
                                <div className="relative">
                                    <p 
                                        className="text-sm font-black uppercase tracking-[0.2em] text-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.text}, ${theme.accent})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {progress > 70 ? '¡Casi Ahí!' : progress > 30 ? 'Sigue Arrastrando' : 'Arrastra para Revelar'}
                                    </p>
                                    
                                    {/* Underline animado */}
                                    <div 
                                        className="absolute -bottom-1 left-0 h-[2px] rounded-full transition-all duration-200"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: theme.accent,
                                            boxShadow: `0 0 8px ${theme.accent}`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Barra de progreso inferior mejorada */}
                            <div className="w-full space-y-2">
                                {/* Porcentaje numérico */}
                                {isDragging && (
                                    <div className="text-center animate-in fade-in">
                                        <span 
                                            className="text-2xl font-black tabular-nums"
                                            style={{ 
                                                color: progress > 70 ? color : theme.text,
                                                textShadow: progress > 70 ? `0 0 20px ${color}` : 'none'
                                            }}
                                        >
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                )}

                                {/* Barra de progreso */}
                                <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                                    {/* Fondo con patrón */}
                                    <div 
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(90deg, ${theme.accent}40, ${theme.accent}40 2px, transparent 2px, transparent 8px)`
                                        }}
                                    />
                                    
                                    {/* Barra de progreso con gradiente */}
                                    <div 
                                        className="absolute inset-y-0 left-0 transition-all duration-100 rounded-full"
                                        style={{ 
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${theme.accent}, ${color})`,
                                            boxShadow: `0 0 15px ${progress > 50 ? color : theme.accent}80`,
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        <div 
                                            className="absolute inset-0 animate-shimmer"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                backgroundSize: '200% 100%'
                                            }}
                                        />
                                    </div>

                                    {/* Threshold markers */}
                                    <div className="absolute inset-0 flex justify-between px-1">
                                        {[25, 50, 75].map(threshold => (
                                            <div
                                                key={threshold}
                                                className="w-[2px] h-full rounded-full bg-white/20"
                                                style={{
                                                    opacity: progress > threshold ? 0 : 0.5
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Leyenda de umbral */}
                                {progress > 0 && progress < 100 && (
                                    <div className="flex justify-between text-[8px] uppercase tracking-widest font-bold opacity-40" style={{ color: theme.sub }}>
                                        <span>Inicio</span>
                                        <span>{progress > 90 ? '¡Ya casi!' : 'Continúa'}</span>
                                        <span>Revelar</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <style>{`
                            @keyframes float {
                                0%, 100% { transform: translateY(0) translateX(0); }
                                50% { transform: translateY(-20px) translateX(5px); }
                            }
                            @keyframes shimmer {
                                0% { background-position: -200% 0; }
                                100% { background-position: 200% 0; }
                            }
                            @keyframes spin-slow {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            @keyframes spin-reverse {
                                from { transform: rotate(360deg); }
                                to { transform: rotate(0deg); }
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
                            .animate-spin-reverse {
                                animation: spin-reverse 20s linear infinite;
                            }
                        `}</style>
                    </div>
                )}
            </div>
            
            {/* INDICADOR DE PROGRESO INFERIOR (opcional) */}
            {!isRevealed && isDragging && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full animate-in fade-in slide-in-from-bottom">
                    <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                            className="h-full transition-all duration-100"
                            style={{ 
                                width: `${progress}%`,
                                backgroundColor: color,
                                boxShadow: `0 0 8px ${color}`
                            }}
                        />
                    </div>
                    <span className="text-white text-xs font-bold">
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
        </div>
    );
};
