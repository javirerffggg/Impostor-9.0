
import React, { useRef, useState, useEffect } from 'react';
import { GamePlayer, ThemeConfig, PartyIntensity } from '../types';
import { Fingerprint, Lock, Play, ArrowRight, Eye, Beer, MousePointerClick } from 'lucide-react';
import { CATEGORIES_DATA } from '../categories';
import { RoleContent } from './RoleContent';

interface Props {
    player: GamePlayer;
    theme: ThemeConfig;
    color: string;
    onRevealStart: () => void;
    onRevealEnd: () => void;
    nextAction: (viewTime: number) => void;
    readyForNext: boolean;
    isLastPlayer: boolean;
    isParty?: boolean;
    partyIntensity?: PartyIntensity; 
    debugMode?: boolean; 
    onOracleConfirm?: (hint: string) => void;
}

export const IdentityCard: React.FC<Props> = ({ player, theme, color, onRevealStart, onRevealEnd, nextAction, readyForNext, isLastPlayer, isParty, partyIntensity, debugMode, onOracleConfirm }) => {
    const [isHolding, setIsHolding] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    const viewStartTime = useRef<number>(0);
    const totalViewTime = useRef<number>(0);

    const [oracleSelectionMade, setOracleSelectionMade] = useState(false);
    const [oracleOptions, setOracleOptions] = useState<string[]>([]);
    const [isTransmitting, setIsTransmitting] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const isPointerDown = useRef(false);

    const isHighIntensity = partyIntensity === 'after_hours' || partyIntensity === 'resaca';
    const isPremium = theme.particleType === 'aura' || ['silk', 'stardust', 'foliage', 'aurora', 'goldleaf', 'plankton', 'ember'].includes(theme.particleType);

    useEffect(() => {
        setHasInteracted(false);
        setIsHolding(false);
        setDragPosition({ x: 0, y: 0 });
        totalViewTime.current = 0;
        isPointerDown.current = false;
        setOracleSelectionMade(false);
        setIsTransmitting(false);
        if (player.isOracle && !player.isImp) {
            const catDataList = CATEGORIES_DATA[player.category];
            const pair = catDataList.find(c => c.civ === player.realWord);
            if (pair) setOracleOptions(pair.hints || [player.category, "Sin Pista", "Ruido"]);
        }
    }, [player.id]);

    useEffect(() => {
        const handleGlobalRelease = () => {
            if (isPointerDown.current) {
                isPointerDown.current = false;
                setIsDragging(false);
                setDragPosition({ x: 0, y: 0 });
                if (viewStartTime.current > 0) {
                    totalViewTime.current += Date.now() - viewStartTime.current;
                    viewStartTime.current = 0;
                }
                if (player.isOracle && !oracleSelectionMade && isHolding) return;
                setIsHolding(false);
                onRevealEnd();
            }
        };
        window.addEventListener('pointerup', handleGlobalRelease);
        window.addEventListener('touchend', handleGlobalRelease);
        window.addEventListener('pointercancel', handleGlobalRelease);
        window.addEventListener('blur', handleGlobalRelease);
        return () => {
            window.removeEventListener('pointerup', handleGlobalRelease);
            window.removeEventListener('touchend', handleGlobalRelease);
            window.removeEventListener('pointercancel', handleGlobalRelease);
            window.removeEventListener('blur', handleGlobalRelease);
        };
    }, [onRevealEnd, player.isOracle, oracleSelectionMade, isHolding]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (oracleSelectionMade && player.isOracle) return;
        e.preventDefault(); 
        try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch (err) { }
        isPointerDown.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        viewStartTime.current = Date.now();
        setIsHolding(true);
        setHasInteracted(true);
        onRevealStart();
        if (navigator.vibrate) navigator.vibrate(player.isImp ? [50, 50, 50, 50, 100] : (player.isOracle ? [20, 50, 20] : [40]));
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPointerDown.current) return;
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;
        if (!isDragging && Math.hypot(deltaX, deltaY) > 5) setIsDragging(true);
        setDragPosition({ x: deltaX * 0.4, y: deltaY * 0.4 });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch (e) {}
    };

    const handleOracleOptionSelect = (hint: string) => {
        if (oracleSelectionMade || isTransmitting) return;
        setIsTransmitting(true);
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
        setTimeout(() => {
            setIsTransmitting(false);
            setOracleSelectionMade(true);
            setIsHolding(false);
            onRevealEnd();
            if (onOracleConfirm) onOracleConfirm(hint);
        }, 1200);
    };

    const isButtonVisible = (readyForNext && !isHolding && !isDragging && dragPosition.y === 0) && (!player.isOracle || oracleSelectionMade);
    const rotationOverride = isHolding && isParty && isHighIntensity ? Math.sin(Date.now() / 200) * 3 : 0;
    const isOracleLockedOpen = player.isOracle && !oracleSelectionMade && isHolding;

    const shadowStyle = theme.shadow || (isHolding 
            ? `0 0 50px ${color}40, inset 0 0 40px ${color}10` 
            : `0 15px 40px -10px rgba(0,0,0,0.5), 0 0 20px -10px ${color}20`);

    const premiumStyle: React.CSSProperties = isPremium ? {
        background: `linear-gradient(135deg, ${theme.cardBg}, ${color}10) padding-box, linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05) 40%, transparent) border-box`,
        border: theme.border.includes('px') ? theme.border : '1.5px solid transparent',
        backgroundClip: 'padding-box, border-box',
        WebkitBackgroundClip: 'padding-box, border-box',
        boxShadow: shadowStyle,
    } : {
        background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${color}20 100%)`,
        borderWidth: isHolding ? '1px' : '0px',
        borderColor: color,
        boxShadow: isHolding ? `0 0 50px ${color}50` : '0 10px 40px rgba(0,0,0,0.4)',
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm z-10 relative">
            <div className={`text-center space-y-1 transition-all duration-300 ease-out origin-center ${isHolding ? 'scale-90 opacity-80 -translate-y-2' : 'scale-100 opacity-100 translate-y-0'}`}>
                <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-[0.3em]">Identidad</p>
                <h2 style={{ color: color, fontFamily: theme.font }} className="text-4xl font-bold">{player.name}</h2>
            </div>

            <div className="w-full aspect-[3/4] relative" style={{ animation: (!isHolding && !hasInteracted && !isDragging) ? 'breathe 4s ease-in-out infinite' : 'none', transition: 'transform 0.3s ease-out' }}>
                <div className="absolute rounded-full pointer-events-none" style={{ width: '140%', height: '140%', top: '-20%', left: '-20%', filter: 'blur(60px)', background: `radial-gradient(circle, ${color}50 0%, transparent 60%)`, zIndex: -1, transform: `translate3d(${dragPosition.x}px, ${dragPosition.y + (isHolding ? -40 : 0)}px, 0) rotate(${dragPosition.x * 0.05}deg)`, transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)', opacity: 0.6, willChange: 'transform' }} />
                <div ref={cardRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onContextMenu={(e) => e.preventDefault()} style={{ ...premiumStyle, borderRadius: theme.radius, backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)', WebkitBackdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)', transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-width 0.1s ease', transform: `translate3d(${dragPosition.x}px, ${dragPosition.y + (isHolding ? -40 : 0)}px, 0) rotate(${dragPosition.x * 0.03 + rotationOverride}deg)`, animation: (isHolding && !player.isImp) ? 'reveal-pulse 2s infinite' : 'none', touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab', willChange: 'transform, box-shadow' } as React.CSSProperties} className={`w-full h-full relative overflow-hidden select-none touch-none group premium-border ${isHolding && player.isImp ? 'animate-impostor-shake' : ''}`}>
                    {isHolding && player.isImp && (
                        <>
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-repeat animate-static-noise" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                            <div className="absolute top-1/4 left-0 w-full h-2 bg-red-500/50 z-20 mix-blend-color-dodge animate-glitch-bar-1 pointer-events-none" />
                            <div className="absolute inset-0 bg-red-500/10 z-0 mix-blend-overlay animate-flash pointer-events-none" />
                        </>
                    )}
                    <div className={`absolute inset-0 z-10 flex flex-col ${isHolding ? 'justify-start pt-6 pb-24' : 'justify-between py-8'} px-6 transition-none`}>
                        {!isHolding ? (
                            <>
                                <div className="w-full text-center animate-sync">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ backgroundImage: `linear-gradient(to right, ${theme.sub}, ${theme.text}, ${theme.sub})`, backgroundSize: '100% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: theme.sub }}>IDENTIDAD CLASIFICADA</h3>
                                </div>
                                <div className="flex-1 flex items-center justify-center animate-sync">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full transform scale-150" />
                                        {player.isOracle && readyForNext ? (
                                             <div className="relative">
                                                <div className="absolute inset-0 bg-violet-500/50 blur-xl animate-pulse" />
                                                <Eye size={48} className="text-violet-400 relative z-10" />
                                             </div>
                                        ) : <Lock size={48} strokeWidth={1.5} style={{ color: theme.text }} />}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-end gap-4 animate-sync">
                                    <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors duration-300 backdrop-blur-sm bg-black/10" style={{ borderColor: `${color}60` }}>
                                        <Fingerprint size={40} color={color} className="opacity-80" />
                                    </div>
                                    <p style={{ color: theme.sub }} className="text-[9px] font-black tracking-widest uppercase opacity-70">Mantener pulsado</p>
                                </div>
                            </>
                        ) : (
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
                        )}
                    </div>
                    {isHolding && !oracleSelectionMade && (
                        <div className="absolute bottom-8 left-0 w-full flex justify-center opacity-30">
                            <p style={{ color: isOracleLockedOpen ? '#a78bfa' : theme.sub }} className="text-[9px] uppercase tracking-widest text-center flex flex-col items-center gap-1">
                                {isOracleLockedOpen ? <><MousePointerClick size={12} className="animate-bounce" /> Selecciona una opción</> : "Soltar"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-16 w-full flex items-center justify-center relative mt-4">
                <button
                    onPointerDown={(e) => { if (isButtonVisible) { e.preventDefault(); if (navigator.vibrate) navigator.vibrate(20); nextAction(totalViewTime.current); } }}
                    disabled={!isButtonVisible}
                    style={{ backgroundColor: color, opacity: isButtonVisible ? 1 : 0, transform: isButtonVisible ? 'scale(1)' : 'scale(0.95)', pointerEvents: isButtonVisible ? 'auto' : 'none', touchAction: 'manipulation', boxShadow: isLastPlayer && isButtonVisible ? `0 0 20px ${color}` : undefined, animation: isButtonVisible ? (isLastPlayer ? 'none' : 'shadow-pulse 2s infinite ease-in-out') : 'none' }}
                    className={`relative z-20 w-full max-w-xs py-3 px-6 font-bold text-white transition-all duration-100 flex items-center justify-center gap-2 rounded-full overflow-hidden transform-gpu ${isLastPlayer ? 'active:scale-90' : 'active:scale-95'}`}
                >
                        {isLastPlayer && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-full">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                        </div>
                        )}
                        <div className="absolute inset-[2px] rounded-full z-0" style={{ backgroundColor: color }} />
                    <span className="relative z-10 tracking-widest">{isLastPlayer ? (isParty ? 'EMPEZAR EL BOTELLÓN' : 'EMPEZAR PARTIDA') : (isParty ? 'SIGUIENTE BORRACHO' : 'SIGUIENTE JUGADOR')}</span>
                    {isLastPlayer ? <Play size={20} fill="currentColor" className="relative z-10"/> : <ArrowRight size={20} className="relative z-10"/>}
                </button>
            </div>
        </div>
    );
};
