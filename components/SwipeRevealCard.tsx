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
            const pair = catDataList.find(c => c.civ === player.realWord);
            if (pair) setOracleOptions(pair.hints || [player.category, "Sin Pista", "Ruido"]);
        }
    }, [player.id]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isRevealed || isExiting) return;
        startY.current = e.clientY;
        setIsDragging(true);
        if (viewStartTime.current === 0) viewStartTime.current = Date.now();
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || isRevealed) return;
        const deltaY = e.clientY - startY.current;
        // Solo permitir arrastre hacia arriba (negativo)
        const clampedY = Math.min(0, deltaY);
        const normalizedY = Math.min(Math.abs(clampedY), threshold * 1.5);
        const newProgress = Math.min(100, (Math.abs(clampedY) / threshold) * 100);
        
        setDragY(clampedY);
        setProgress(newProgress);

        if (settings.hapticFeedback && navigator.vibrate) {
            if (newProgress >= 30 && newProgress < 32) navigator.vibrate(5);
            if (newProgress >= 70 && newProgress < 72) navigator.vibrate(15);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
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

        // Si es oráculo y no ha seleccionado, "revelar" significa mostrar las opciones
        if (player.isOracle && !oracleSelectionMade) {
            // Keep it open
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
        <div className="relative w-full max-w-[340px] aspect-[3/4] mx-auto perspective-[1200px]">
            {/* CARTA INFERIOR (Contenido) */}
            <div 
                className="absolute inset-0 rounded-[2.5rem] border-2 overflow-hidden transition-all duration-300"
                style={{
                    backgroundColor: theme.cardBg,
                    borderColor: isRevealed ? color : theme.border,
                    boxShadow: isRevealed ? `0 0 40px ${color}30` : '0 4px 20px rgba(0,0,0,0.2)',
                    transform: `translateY(${dragY * 0.1}px) scale(${0.96 + (progress * 0.0004)})`,
                    zIndex: 5,
                    backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(20px)'
                }}
            >
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

            {/* CARTA SUPERIOR (Reverso) */}
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
                            linear-gradient(135deg, ${theme.accent}10, ${theme.cardBg}),
                            repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme.accent}05 10px, ${theme.accent}05 20px)
                        `,
                        backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(30px)'
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
                                {/* Merged duplicate style attributes into a single object below */}
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
        </div>
    );
};