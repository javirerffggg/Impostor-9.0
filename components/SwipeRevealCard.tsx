
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

    // Refs para performance (RAF) y tracking
    const startY = useRef(0);
    const currentY = useRef(0);
    const rafId = useRef<number | null>(null);
    const lastHapticAt = useRef({ threshold30: false, threshold70: false });
    
    const viewStartTime = useRef<number>(0);
    const totalViewTime = useRef<number>(0);
    const threshold = SWIPE_THRESHOLDS[settings.swipeSensitivity];

    // --- PROTOCOLO SCROLL-LOCK (iOS/Android) ---
    useEffect(() => {
        if (!isDragging) return;

        const preventDefault = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault();
        };

        // Bloqueo agresivo de scroll en el body
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        
        // Listener pasivo en false para permitir preventDefault
        document.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.touchAction = '';
            document.removeEventListener('touchmove', preventDefault);
        };
    }, [isDragging]);

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
            const pair = catDataList.find(c => c.civ === player.realWord);
            if (pair) setOracleOptions(pair.hints || [player.category, "Sin Pista", "Ruido"]);
        }

        return () => {
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, [player.id]);

    // --- MOTOR DE ACTUALIZACIÓN 60FPS (RAF) ---
    const updateDragState = () => {
        if (!isDragging || isRevealed) {
            rafId.current = null;
            return;
        }

        const deltaY = currentY.current - startY.current;
        // Solo permitir arrastre hacia arriba (negativo)
        const clampedY = Math.min(0, deltaY);
        const newProgress = Math.min(100, (Math.abs(clampedY) / threshold) * 100);
        
        setDragY(clampedY);
        setProgress(newProgress);

        // Feedback Háptico Optimizado
        if (settings.hapticFeedback && navigator.vibrate) {
            if (newProgress >= 30 && !lastHapticAt.current.threshold30) {
                navigator.vibrate(5);
                lastHapticAt.current.threshold30 = true;
            }
            if (newProgress >= 70 && !lastHapticAt.current.threshold70) {
                navigator.vibrate(15);
                lastHapticAt.current.threshold70 = true;
            }
            // Reset haptic markers if user drags back down
            if (newProgress < 25) lastHapticAt.current.threshold30 = false;
            if (newProgress < 65) lastHapticAt.current.threshold70 = false;
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
            // Snap back
            setDragY(0);
            setProgress(0);
            if (navigator.vibrate) navigator.vibrate([10, 5]);
        }
    };

    const handleComplete = () => {
        setIsRevealed(true);
        if (navigator.vibrate) navigator.vibrate([50, 20, 100]);
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
    const rotation = (dragY / 100) * 2;

    return (
        <div className="relative w-full max-w-[340px] aspect-[3/4] mx-auto perspective-[1200px] touch-none select-none">
            
            {/* CAPA 1: Glow Halo Exterior Progresivo */}
            <div 
                className="absolute -inset-4 rounded-[3.5rem] transition-all duration-300 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)`,
                    filter: `blur(${20 + (progress * 0.4)}px)`,
                    opacity: isRevealed ? 0.9 : progress / 150,
                    transform: `scale(${0.9 + (progress * 0.001)})`,
                    zIndex: 0
                }}
            />

            {/* CAPA 2: Indicadores de Esquina (Tutorial implícito) */}
            {!isRevealed && !isDragging && progress === 0 && (
                <div className="absolute -inset-[8px] rounded-[3.2rem] pointer-events-none animate-pulse-slow border border-dashed opacity-30 z-10" style={{ borderColor: `${color}60` }}>
                    {[
                        { top: '-4px', left: '-4px' },
                        { top: '-4px', right: '-4px' },
                        { bottom: '-4px', left: '-4px' },
                        { bottom: '-4px', right: '-4px' }
                    ].map((pos, i) => (
                        <div key={i} className="absolute w-3 h-3 rounded-full" style={{ ...pos, backgroundColor: color, boxShadow: `0 0 12px ${color}` }} />
                    ))}
                </div>
            )}

            {/* CAPA 3: CARTA INFERIOR (Contenido - Borde Expuesto 6px) */}
            <div 
                className="absolute rounded-[2.5rem] border-[3px] overflow-hidden transition-all duration-300"
                style={{
                    left: '-6px',
                    top: '-6px',
                    right: '-6px',
                    bottom: '-6px',
                    width: 'calc(100% + 12px)',
                    height: 'calc(100% + 12px)',
                    backgroundColor: theme.cardBg,
                    borderColor: isRevealed ? color : `${theme.border}80`,
                    boxShadow: isRevealed 
                        ? `0 0 60px ${color}40, inset 0 0 40px ${color}10` 
                        : `0 0 ${15 + progress * 0.4}px ${color}20, 0 4px 20px rgba(0,0,0,0.2)`,
                    transform: `translateY(${dragY * 0.08}px) scale(${0.96 + (progress * 0.0004)})`,
                    zIndex: 5,
                    backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)',
                    WebkitBackdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)'
                }}
            >
                {/* Shimmer en el borde cuando hay progreso */}
                <div 
                    className="absolute inset-0 rounded-[2.4rem] pointer-events-none transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(${45 + progress}deg, transparent 30%, ${color}20 50%, transparent 70%)`,
                        opacity: progress > 10 ? 0.5 : 0,
                        mixBlendMode: 'overlay'
                    }}
                />

                {isRevealed ? (
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
                        
                        {(!player.isOracle || oracleSelectionMade) && (
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
                ) : (
                    <div className="h-full w-full flex items-center justify-center opacity-10 grayscale">
                         <RoleContent player={player} theme={theme} color={color} />
                    </div>
                )}
            </div>

            {/* CAPA 4: CARTA SUPERIOR (Reverso - Draggable) */}
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
                        boxShadow: `0 ${20 - (progress / 10)}px ${60 - (progress / 2)}px rgba(0,0,0,${0.4 - (progress / 400)})`,
                        transform: `translateY(${dragY}px) rotate(${rotation}deg) scale(${1 - (progress * 0.0002)})`,
                        zIndex: 10,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        background: `
                            linear-gradient(135deg, ${theme.accent}15, ${theme.cardBg}),
                            repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme.accent}05 10px, ${theme.accent}05 20px)
                        `,
                        backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(30px)',
                        WebkitBackdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(30px)'
                    }}
                >
                    <div className="h-full w-full flex flex-col items-center justify-between py-12 px-6">
                        <div className="text-center space-y-2 opacity-60">
                            <p style={{ color: theme.sub }} className="text-[10px] font-black uppercase tracking-[0.4em]">Protocolo Revelación</p>
                            <div className="h-0.5 w-12 mx-auto bg-white/20 rounded-full" />
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse" />
                            <div 
                                className="text-6xl md:text-8xl transition-transform duration-200"
                                style={{ transform: `scale(${1 - (progress * 0.003)})`, filter: `blur(${progress * 0.05}px)` }}
                            >
                                🎭
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 transition-opacity duration-300" style={{ opacity: Math.max(0, 1 - (progress / 50)) }}>
                             <div className="flex flex-col items-center -space-y-3">
                                <ChevronUp size={32} style={{ color: theme.accent }} className="animate-bounce opacity-40" />
                                <ChevronUp size={32} style={{ color: theme.accent, animationDelay: '0.1s' }} className="animate-bounce opacity-70" />
                                <ChevronUp size={32} style={{ color: theme.accent, animationDelay: '0.2s' }} className="animate-bounce" />
                             </div>
                             <p className="text-xs font-black uppercase tracking-widest text-center" style={{ color: theme.text }}>
                                Arrastra para revelar
                             </p>
                        </div>

                        {/* Progress Bar Bottom */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-auto">
                            <div 
                                className="h-full transition-all duration-100"
                                style={{ 
                                    width: `${progress}%`, 
                                    backgroundColor: theme.accent,
                                    boxShadow: `0 0 10px ${theme.accent}`
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.02); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
