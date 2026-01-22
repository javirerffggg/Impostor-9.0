

import React, { useRef, useState, useEffect } from 'react';
import { GamePlayer, ThemeConfig, PartyIntensity } from '../types';
import { Fingerprint, Shield, Skull, Eye, Play, ArrowRight, Lock, Beer, Unlock, AlertCircle, Check, Radio, Network, MousePointerClick, Zap } from 'lucide-react';
import { CATEGORIES_DATA } from '../categories';

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
    partyIntensity?: PartyIntensity; // New prop for visual effects
    debugMode?: boolean; 
    onOracleConfirm?: (hint: string) => void; // v7.0 Callback
}

export const IdentityCard: React.FC<Props> = ({ player, theme, color, onRevealStart, onRevealEnd, nextAction, readyForNext, isLastPlayer, isParty, partyIntensity, debugMode, onOracleConfirm }) => {
    // Reveal States
    const [isHolding, setIsHolding] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    
    // Physics States
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    // Time Tracking (Cronometría de la Verdad)
    const viewStartTime = useRef<number>(0);
    const totalViewTime = useRef<number>(0);

    // Oracle State
    const [oracleSelectionMade, setOracleSelectionMade] = useState(false);
    const [oracleOptions, setOracleOptions] = useState<string[]>([]);
    const [isTransmitting, setIsTransmitting] = useState(false);

    // Refs
    const cardRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const isPointerDown = useRef(false);

    // Visual Effects flags
    const isHighIntensity = partyIntensity === 'after_hours' || partyIntensity === 'resaca';
    const isBartender = player.partyRole === 'bartender';
    
    // Extended premium check for new themes
    const isPremium = theme.particleType === 'aura' || ['silk', 'stardust', 'foliage', 'aurora', 'goldleaf', 'plankton', 'ember'].includes(theme.particleType);

    // Reset state when player changes
    useEffect(() => {
        setHasInteracted(false);
        setIsHolding(false);
        setDragPosition({ x: 0, y: 0 });
        totalViewTime.current = 0; // Reset time accumulator
        isPointerDown.current = false; // Ensure pointer state resets
        
        // Oracle Reset
        setOracleSelectionMade(false);
        setIsTransmitting(false);
        if (player.isOracle && !player.isImp) {
            // Pre-calculate options based on realWord
            const catDataList = CATEGORIES_DATA[player.category];
            const pair = catDataList.find(c => c.civ === player.realWord);
            if (pair) {
                // If hints exist use them, else generate dummies (fallback)
                setOracleOptions(pair.hints || [player.category, "Sin Pista", "Ruido"]);
            }
        }

    }, [player.id]);

    // --- GLOBAL SAFETY NET: Ensure card drops if pointer event is lost ---
    useEffect(() => {
        const handleGlobalRelease = () => {
            // If the code thinks the pointer is down, but a global release happened: FORCE RESET
            if (isPointerDown.current) {
                isPointerDown.current = false;
                setIsDragging(false);
                setDragPosition({ x: 0, y: 0 });

                // Accumulate time before stopping
                if (viewStartTime.current > 0) {
                    const duration = Date.now() - viewStartTime.current;
                    totalViewTime.current += duration;
                    viewStartTime.current = 0;
                }

                // ORACLE LOCK LOGIC: 
                // If player is Oracle and hasn't selected yet, we KEEP the card open (isHolding stays true)
                // This allows them to lift their finger and tap the options.
                if (player.isOracle && !oracleSelectionMade && isHolding) {
                    // Do not close.
                    return;
                }

                setIsHolding(false);
                
                // For Oracle: If selection NOT made, we don't trigger reveal end yet (keeps card hidden)
                // Unless they released, in which case reveal ends but they can't proceed until selected?
                // Logic update: Oracle sees interface WHILE holding. 
                onRevealEnd();
            }
        };

        // Listen to window to catch lifts outside the element or system interruptions
        window.addEventListener('pointerup', handleGlobalRelease);
        window.addEventListener('touchend', handleGlobalRelease);
        window.addEventListener('pointercancel', handleGlobalRelease);
        window.addEventListener('blur', handleGlobalRelease); // If user switches apps

        return () => {
            window.removeEventListener('pointerup', handleGlobalRelease);
            window.removeEventListener('touchend', handleGlobalRelease);
            window.removeEventListener('pointercancel', handleGlobalRelease);
            window.removeEventListener('blur', handleGlobalRelease);
        };
    }, [onRevealEnd, player.isOracle, oracleSelectionMade, isHolding]); // Dependencies updated for Lock Logic

    // Haptics
    const vibrate = (pattern: number[]) => {
        if (navigator.vibrate) navigator.vibrate(pattern);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (oracleSelectionMade && player.isOracle) return; // Lock interaction after selection if dragging not needed

        e.preventDefault(); 
        e.stopPropagation();

        // Try to capture, but rely on global listener if this fails
        try {
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
        } catch (err) { }

        isPointerDown.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        
        // Start Timer
        viewStartTime.current = Date.now();

        // INSTANT REVEAL LOGIC
        setIsHolding(true);
        setHasInteracted(true);
        onRevealStart();
        
        // Immediate Haptics
        if (player.isImp) {
            vibrate([50, 50, 50, 50, 100]); 
        } else if (player.isOracle) {
            vibrate([20, 50, 20]); // Distinct vibration
        } else {
            vibrate([40]); 
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPointerDown.current) return;
        
        e.preventDefault();

        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;

        // Threshold to switch to direct 1:1 dragging
        if (!isDragging && Math.hypot(deltaX, deltaY) > 5) {
            setIsDragging(true);
        }

        // ERGONOMICS v2.0: Higher resistance for stability (Was 0.6)
        const resistance = 0.4; 
        setDragPosition({
            x: deltaX * resistance,
            y: deltaY * resistance
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        e.preventDefault();
        try {
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        } catch (e) { /* ignore */ }

        // Logic handled by Global Listener, but we execute here for immediate responsiveness
        // The Global Listener checks isPointerDown.current, so we set it false here to avoid double execution
        if (isPointerDown.current) {
            isPointerDown.current = false;
            setIsDragging(false); 
            setDragPosition({ x: 0, y: 0 });

            if (viewStartTime.current > 0) {
                const duration = Date.now() - viewStartTime.current;
                totalViewTime.current += duration;
                viewStartTime.current = 0;
            }

            if (isHolding) {
                // ORACLE LOCK LOGIC (Local Handler)
                if (player.isOracle && !oracleSelectionMade) {
                    // Keep open.
                    return;
                }

                setIsHolding(false);
                onRevealEnd();
            }
        }
    };

    const handleOracleOptionSelect = (hint: string) => {
        if (oracleSelectionMade || isTransmitting) return;
        
        setIsTransmitting(true);
        vibrate([50, 100, 50]);
        
        setTimeout(() => {
            setIsTransmitting(false);
            setOracleSelectionMade(true);

            // FIX: Automatically close card (release lock) so the user can proceed
            setIsHolding(false);
            onRevealEnd();

            if (onOracleConfirm) onOracleConfirm(hint);
        }, 1500); // Fake processing delay
    };

    const getFontSize = (text: string) => {
        const len = text.length;
        // Even more conservative scaling to prevent clipping
        if (len > 35) return '0.9rem'; 
        if (len > 25) return '1.1rem'; 
        if (len > 18) return '1.3rem';
        if (len > 12) return '1.5rem';
        if (len > 8)  return '1.9rem'; 
        if (len > 5)  return '2.4rem'; 
        return '3.0rem';               
    };

    // Button visibility logic
    const isButtonVisible = (readyForNext && !isHolding && !isDragging && dragPosition.y === 0) && (!player.isOracle || oracleSelectionMade);

    // Apply "Vertigo" rotation if intense party mode
    const rotationOverride = isHolding && isParty && isHighIntensity 
        ? Math.sin(Date.now() / 200) * 3 
        : 0;

    // Derived state for the Oracle "Lock" visual feedback
    const isOracleLockedOpen = player.isOracle && !oracleSelectionMade && isHolding;

    // --- PREMIUM STYLE LOGIC ---
    // Standard themes use simple borders/backgrounds.
    // Premium themes use the double-gradient trick with background-clip to create a glass border.
    // Override with specific shadow if provided by theme config
    const shadowStyle = theme.shadow || (isHolding 
            ? `0 0 50px ${color}40, inset 0 0 40px ${color}10` 
            : `0 15px 40px -10px rgba(0,0,0,0.5), 0 0 20px -10px ${color}20`);

    const premiumStyle: React.CSSProperties = isPremium ? {
        // Layer 1 (Top): Content Background (clipped to padding-box)
        // Layer 2 (Bottom): Border Gradient (clipped to border-box)
        background: `
            linear-gradient(135deg, ${theme.cardBg}, ${color}10) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05) 40%, transparent) border-box
        `,
        border: theme.border.includes('px') ? theme.border : '1.5px solid transparent', // Use theme border if specific size given
        backgroundClip: 'padding-box, border-box',
        WebkitBackgroundClip: 'padding-box, border-box',
        boxShadow: shadowStyle,
    } : {
        // Standard Theme Logic
        background: `linear-gradient(135deg, ${theme.cardBg} 0%, ${color}20 100%)`,
        // Fix: Explicitly remove border width when idle for standard themes if desired, 
        // but for premium we always keep the transparent border to show the gradient.
        borderWidth: isHolding ? '1px' : '0px',
        borderColor: color,
        boxShadow: isHolding ? `0 0 50px ${color}50` : '0 10px 40px rgba(0,0,0,0.4)',
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm z-10 relative">
            {/* Header: Compacts when holding to avoid overlap */}
            <div 
                className={`text-center space-y-1 transition-all duration-300 ease-out origin-center ${isHolding ? 'scale-90 opacity-80 -translate-y-2' : 'scale-100 opacity-100 translate-y-0'}`}
            >
                <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-[0.3em]">Identidad</p>
                <h2 style={{ color: color, fontFamily: theme.font }} className="text-4xl font-bold">{player.name}</h2>
            </div>

            {/* WRAPPER FOR IDLE ANIMATION */}
            <div 
                className="w-full aspect-[3/4] relative"
                style={{
                    animation: (!isHolding && !hasInteracted && !isDragging) ? 'breathe 4s ease-in-out infinite' : 'none',
                    transition: 'transform 0.3s ease-out',
                    transformStyle: 'preserve-3d' // Helps with clipping artifacts
                }}
            >
                {/* DYNAMIC MOVING AURA (Replaces fixed background) */}
                <div 
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: '100%',
                        height: '100%',
                        top: '0%',
                        left: '0%',
                        filter: 'blur(60px)', // Reduced blur slightly to prevent artifacts
                        background: `radial-gradient(circle, ${color}50 0%, transparent 70%)`,
                        // Updated translation to -40px
                        transform: `translate3d(${dragPosition.x}px, ${dragPosition.y + (isHolding ? -40 : 0)}px, -1px) rotate(${dragPosition.x * 0.05}deg)`,
                        transition: isDragging 
                            ? 'none' 
                            : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        opacity: 0.6,
                        willChange: 'transform'
                    }}
                />

                <div 
                    ref={cardRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onContextMenu={(e) => e.preventDefault()} // Prevent context menu
                    style={{ 
                        '--card-color': color,
                        '--card-shadow-weak': `${color}40`,
                        '--card-shadow-strong': `${color}80`,
                        
                        borderRadius: theme.radius,
                        
                        // Glassmorphism Fixes
                        backdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)',
                        WebkitBackdropFilter: theme.blur ? `blur(${theme.blur})` : 'blur(24px)', // Safari support
                        
                        transition: isDragging 
                            ? 'none' 
                            : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-width 0.1s ease',
                        
                        // ERGONOMICS v2.0: Reduced rotation for better reading stability
                        // BACCHUS: Add vertigo rotation
                        // Updated translation to -40px
                        transform: `translate3d(${dragPosition.x}px, ${dragPosition.y + (isHolding ? -40 : 0)}px, 0) rotate(${dragPosition.x * 0.03 + rotationOverride}deg)`,
                        
                        animation: (isHolding && !player.isImp) ? 'reveal-pulse 2s infinite' : 'none',
                        touchAction: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        willChange: 'transform, box-shadow',
                        
                        // Apply Premium or Standard Styles
                        ...premiumStyle
                    } as React.CSSProperties}
                    className={`w-full h-full relative overflow-hidden select-none touch-none group premium-border ${isHolding && player.isImp ? 'animate-impostor-shake' : ''}`}
                >
                    {/* IMPOSTOR GLITCH LAYERS (Only visible when Impostor + Holding) */}
                    {isHolding && player.isImp && (
                        <>
                            {/* Digital Noise Overlay */}
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-repeat animate-static-noise" 
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
                            />
                            {/* Micro-cuts / Glitch Bars - CLEANED UP LOWER ARTIFACTS */}
                            <div className="absolute top-1/4 left-0 w-full h-2 bg-red-500/50 z-20 mix-blend-color-dodge animate-glitch-bar-1 pointer-events-none" />
                            {/* Chromatic Abberation Background Flash */}
                            <div className="absolute inset-0 bg-red-500/10 z-0 mix-blend-overlay animate-flash pointer-events-none" />
                        </>
                    )}


                    {theme.name === "007 Protocol" && (
                        <div 
                            className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-overlay"
                            style={{
                                background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 45%, transparent 60%)',
                                backgroundSize: '200% 100%',
                                animation: 'metallic-shine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                            }}
                        />
                    )}

                    {/* MAIN CONTENT CONTAINER - ERGONOMICS v2.0: Dynamic Layout Strategy */}
                    {/* If Idle: Content spreads (justify-between) for Top Text, Middle Lock, Bottom Finger. */}
                    {/* If Holding: Content pushes to top (justify-start) with massive bottom padding to reserve finger space. */}
                    <div className={`absolute inset-0 z-10 flex flex-col ${isHolding ? 'justify-start pt-6 pb-24' : 'justify-between py-8'} px-6 transition-none`}>
                        
                        {!isHolding ? (
                            <>
                                {/* TOP: CLASSIFIED HEADER - Symmetrical & Synchronized */}
                                <div className="w-full text-center animate-sync">
                                    <h3 
                                        className="text-[10px] font-black uppercase tracking-[0.3em]"
                                        style={{ 
                                            // Adjusted for better visibility on both dark and light themes
                                            backgroundImage: `linear-gradient(to right, ${theme.sub}, ${theme.text}, ${theme.sub})`,
                                            backgroundSize: '100% auto',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            color: theme.sub // Fallback
                                        }}
                                    >
                                        IDENTIDAD CLASIFICADA
                                    </h3>
                                </div>

                                {/* MIDDLE: LOCK ICON - Symmetrical & Synchronized */}
                                <div className="flex-1 flex items-center justify-center animate-sync">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full transform scale-150" />
                                        {/* ORACLE: Special Icon if Oracle */}
                                        {player.isOracle && readyForNext ? (
                                             <div className="relative">
                                                <div className="absolute inset-0 bg-violet-500/50 blur-xl animate-pulse" />
                                                <Eye size={48} className="text-violet-400 relative z-10" />
                                             </div>
                                        ) : (
                                            <Lock 
                                                size={48} 
                                                strokeWidth={1.5}
                                                style={{ color: theme.text }} 
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* BOTTOM: FINGERPRINT - Symmetrical & Synchronized */}
                                <div className="flex flex-col items-center gap-4 animate-sync">
                                    <div 
                                        className="w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors duration-300 backdrop-blur-sm bg-black/10"
                                        style={{ borderColor: `${color}60` }}
                                    >
                                        <Fingerprint size={40} color={color} className="opacity-80" />
                                    </div>
                                    <p style={{ color: theme.sub }} className="text-[9px] font-black tracking-widest uppercase opacity-70">
                                        Mantener pulsado
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center h-full animate-in fade-in duration-200">
                                
                                {/* TOP SECTION: Role & Icon (Fixed Height / No Shrink) */}
                                <div className="flex-none flex flex-col items-center justify-center gap-2 w-full pt-1">
                                    {player.isImp ? (
                                        <div className="relative flex items-center justify-center mb-1">
                                            {/* Aura Effects Impostor - Glitched */}
                                            <div className="absolute w-28 h-28 bg-red-600/30 rounded-full blur-xl animate-pulse" />
                                            {/* Rotating dashed circle glitching out */}
                                            <div 
                                                className="absolute w-24 h-24 rounded-full border border-red-500/30 border-dashed opacity-60 animate-spin-glitch"
                                            />
                                            <div 
                                                className="absolute w-16 h-16 bg-red-500/20 rounded-full blur-md mix-blend-screen"
                                                style={{ animation: 'imp-aura-pulse 0.2s ease-in-out infinite' }} // Fast pulse
                                            />
                                            <Skull 
                                                size={48} 
                                                className="text-red-500 relative z-10 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-impostor-shake" 
                                            />
                                        </div>
                                    ) : player.isOracle ? (
                                        <div className="relative flex items-center justify-center mb-1">
                                            {/* ORACLE AURA */}
                                            <div className="absolute w-28 h-28 bg-violet-600/30 rounded-full blur-xl animate-pulse" />
                                            <div className="absolute w-24 h-24 rounded-full border border-violet-500/30 border-dashed opacity-60 animate-[spin_10s_linear_infinite]" />
                                            <Eye 
                                                size={48} 
                                                className="text-violet-400 relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-center mb-1">
                                            {/* Aura Effects Civil (Clean) */}
                                            <div className="absolute w-28 h-28 bg-green-600/30 rounded-full blur-xl animate-pulse" />
                                            <div 
                                                className="absolute w-24 h-24 rounded-full border border-green-500/30 border-dashed opacity-60"
                                                style={{ animation: 'imp-aura-spin 12s linear infinite reverse' }}
                                            />
                                            <div 
                                                className="absolute w-16 h-16 bg-green-500/20 rounded-full blur-md mix-blend-screen"
                                                style={{ animation: 'imp-aura-pulse 3s ease-in-out infinite' }}
                                            />
                                            <Shield 
                                                size={48} 
                                                className="text-green-500 relative z-10 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" 
                                            />
                                        </div>
                                    )}

                                    <h3 
                                        className={`text-xl font-black uppercase tracking-widest 
                                            ${player.isImp ? 'text-red-500 glitch-text-anim' : (player.isOracle ? 'text-violet-400' : 'text-green-500')}`}
                                        data-text={player.isOracle ? 'ORÁCULO' : player.role} // For CSS content trick
                                    >
                                        {player.isOracle ? 'ORÁCULO' : player.role}
                                    </h3>

                                    {/* VANGUARDIA WARNING - REDESIGNED */}
                                    {player.isVanguardia && (
                                        <div className="mt-2 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                            <p className="text-xs text-white font-black uppercase tracking-wide text-center max-w-[240px] leading-tight drop-shadow-md bg-red-600/20 p-2 rounded border border-red-500/50">
                                                Te va a tocar comenzar a hablar en esta ronda, por lo que tienes una pista adicional
                                            </p>
                                        </div>
                                    )}

                                    {/* BACCHUS: PARTY ROLE DISPLAY */}
                                    {isParty && player.partyRole && player.partyRole !== 'civil' && (
                                        <div className="bg-pink-500/20 border border-pink-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse mb-1">
                                            <Beer size={10} className="text-pink-400" />
                                            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">
                                                ROL: {player.partyRole}
                                            </span>
                                        </div>
                                    )}

                                    {!player.isImp && (
                                        <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-[0.2em]">
                                            CATEGORÍA: {player.category}
                                        </p>
                                    )}

                                    <div className={`w-2/3 h-px my-2 ${player.isImp ? 'bg-red-500/50 animate-pulse' : (player.isOracle ? 'bg-violet-500/50' : 'bg-white/20')}`} />
                                </div>

                                {/* MIDDLE SECTION: Word (Flexible, centers in available space) */}
                                {/* Reduced bottom margin to 8 to give more space */}
                                <div className="flex-1 flex flex-col items-center justify-center w-full px-4 overflow-visible my-auto mb-8 relative">
                                    
                                    {/* ORACLE SELECTION MODE */}
                                    {player.isOracle && !oracleSelectionMade && !isTransmitting ? (
                                        <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-center text-violet-300 mb-1">
                                                Acceso a Bóveda: Elige la pista del Impostor
                                            </p>
                                            
                                            <div className="bg-black/20 p-2 rounded mb-2 border border-white/10">
                                                <p className="text-[10px] text-center text-white/50 mb-1">PALABRA CIVIL</p>
                                                <p className="text-xl font-black text-center text-white">{player.realWord}</p>
                                            </div>

                                            <div className="grid gap-2 relative z-50">
                                                {oracleOptions.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onPointerDown={(e) => { 
                                                            e.stopPropagation(); 
                                                            e.preventDefault(); 
                                                            handleOracleOptionSelect(opt); 
                                                        }}
                                                        className="bg-violet-500/20 border border-violet-500/50 py-3 rounded hover:bg-violet-500/40 active:scale-95 transition-all text-sm font-bold text-violet-100 uppercase tracking-wide cursor-pointer touch-manipulation"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <p className="text-[8px] text-center text-red-400 mt-2 font-bold animate-pulse">
                                                ADVERTENCIA: El impostor sabrá que has elegido esta pista.
                                            </p>
                                        </div>
                                    ) : isTransmitting ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs font-black text-violet-400 tracking-widest animate-pulse">TRANSMITIENDO...</p>
                                        </div>
                                    ) : (
                                        // STANDARD WORD DISPLAY (OR ORACLE AFTER SELECTION)
                                        <>
                                            <p 
                                                style={{ 
                                                    fontSize: getFontSize(player.word),
                                                    lineHeight: '1.15',
                                                    // Gradient Typography Effect
                                                    background: player.isImp 
                                                        ? 'linear-gradient(180deg, #ffffff 0%, #ff3333 40%, #500000 100%)' // Impostor: White -> Bright Red -> Blood Red
                                                        : (player.isOracle 
                                                            ? 'linear-gradient(180deg, #ffffff 0%, #a78bfa 100%)' 
                                                            : `linear-gradient(180deg, ${theme.text} 0%, ${color} 100%)`), // Civil: Theme Text -> Player Color
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    
                                                    maxHeight: '100%',
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 5, 
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'anywhere',
                                                    hyphens: 'auto'
                                                }}
                                                className={`font-black leading-tight text-center uppercase ${player.isImp || (isParty && isHighIntensity) ? 'glitch-text-anim' : ''}`}
                                                data-text={player.word}
                                            >
                                                {player.word}
                                            </p>

                                            {/* PROTOCOLO NEXUS DISPLAY (v6.5) - ENHANCED VISUALS */}
                                            {player.isImp && player.nexusPartners && player.nexusPartners.length > 0 && (
                                                <div className="mt-6 w-full bg-black/40 border border-red-500/50 rounded-xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                    <div className="flex items-center gap-2 mb-2 border-b border-red-500/20 pb-2">
                                                        <Network size={14} className="text-red-400 animate-pulse" />
                                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                                                            RED NEXUS ACTIVA
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-[10px] text-red-200 font-bold mb-2 uppercase tracking-wide opacity-80 text-center">
                                                        {player.nexusPartners.length === 1 ? "TU COMPAÑERO IMPOSTOR ES:" : "TUS COMPAÑEROS IMPOSTORES SON:"}
                                                    </p>
                                                    
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        {player.nexusPartners.map((partnerName, idx) => (
                                                            <span key={idx} className="text-sm font-black text-white bg-red-600/80 px-3 py-1 rounded shadow-sm uppercase tracking-wider">
                                                                {partnerName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* IMPOSTOR WARNING: ORACLE INTERFERENCE */}
                                            {player.isImp && player.oracleTriggered && (
                                                <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded animate-pulse">
                                                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                                    <p className="text-[9px] font-bold text-amber-500 leading-tight uppercase">
                                                        PISTA FILTRADA POR EL ORÁCULO
                                                    </p>
                                                </div>
                                            )}

                                            {/* ORACLE CONFIRMATION TEXT */}
                                            {player.isOracle && oracleSelectionMade && (
                                                <div className="mt-2 flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded">
                                                    <Check size={12} className="text-violet-500" />
                                                    <p className="text-[9px] font-bold text-violet-400 uppercase">
                                                        Destino Manipulado
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* BOTTOM SECTION: Visual hint for finger position (Optional, keep subtle) */}
                                {/* Since we add padding-bottom to container, this text sits above the finger zone */}
                                <div className="flex-none opacity-30">
                                     <p style={{ color: isOracleLockedOpen ? '#a78bfa' : theme.sub }} className="text-[9px] uppercase tracking-widest text-center flex flex-col items-center gap-1 transition-colors">
                                        {isOracleLockedOpen ? (
                                            <>
                                                <MousePointerClick size={12} className="animate-bounce" />
                                                Selecciona una opción
                                            </>
                                        ) : (
                                            "Soltar"
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* CENTINELA PROTOCOL: Debug Overlay */}
                    {debugMode && (
                        <div className="absolute top-1 left-1 z-50 p-1 pointer-events-none opacity-80 bg-black/50 backdrop-blur-sm rounded border border-amber-500/50">
                            <p className="text-[8px] font-mono text-amber-500 leading-tight">
                                ID: {player.role.slice(0,3).toUpperCase()}<br/>
                                W: {player.realWord.slice(0,6)}...<br/>
                                P: {Math.round(player.impostorProbability)}%
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-16 w-full flex items-center justify-center relative mt-4">
                <button
                    onPointerDown={(e) => {
                        if (isButtonVisible) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (navigator.vibrate) navigator.vibrate(20);
                            nextAction(totalViewTime.current);
                        }
                    }}
                    disabled={!isButtonVisible}
                    style={{ 
                        backgroundColor: color,
                        opacity: isButtonVisible ? 1 : 0,
                        transform: isButtonVisible ? 'scale(1)' : 'scale(0.95)',
                        pointerEvents: isButtonVisible ? 'auto' : 'none',
                        touchAction: 'manipulation',
                        boxShadow: isLastPlayer && isButtonVisible ? `0 0 20px ${color}` : undefined,
                        animation: isButtonVisible 
                            ? (isLastPlayer ? 'none' : 'shadow-pulse 2s infinite ease-in-out') 
                            : 'none'
                    }}
                    className={`relative z-20 w-full max-w-xs py-3 px-6 font-bold text-white transition-all duration-100 flex items-center justify-center gap-2 rounded-full overflow-hidden transform-gpu
                    ${isLastPlayer ? 'active:scale-90' : 'active:scale-95'}`}
                >
                        {/* Shimmer Effect for Last Player */}
                        {isLastPlayer && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-full">
                            <div 
                                className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                            />
                        </div>
                        )}

                        <div className="absolute inset-[2px] rounded-full z-0" style={{ backgroundColor: color }} />
                        
                    <span className="relative z-10 tracking-widest">
                        {isLastPlayer 
                            ? (isParty ? 'EMPEZAR EL BOTELLÓN' : 'EMPEZAR PARTIDA') 
                            : (isParty ? 'SIGUIENTE BORRACHO' : 'SIGUIENTE JUGADOR')
                        }
                    </span>
                    {isLastPlayer ? <Play size={20} fill="currentColor" className="relative z-10"/> : <ArrowRight size={20} className="relative z-10"/>}
                </button>
            </div>

            <style>{`
                /* SYNCHRONIZED PULSE FOR IDLE STATE */
                @keyframes sync-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.98); filter: brightness(0.9); }
                    50% { opacity: 1; transform: scale(1.02); filter: brightness(1.2); }
                }
                .animate-sync {
                    animation: sync-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                @keyframes breathe {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                @keyframes reveal-pulse {
                    0% { box-shadow: 0 0 30px var(--card-shadow-weak); }
                    50% { box-shadow: 0 0 60px var(--card-shadow-strong), 0 0 100px var(--card-shadow-weak); }
                    100% { box-shadow: 0 0 30px var(--card-shadow-weak); }
                }
                @keyframes metallic-shine {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes text-shimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                @keyframes imp-aura-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes imp-aura-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                @keyframes shadow-pulse {
                    0% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 12px 28px rgba(0,0,0,0.6); }
                    100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
                }

                /* --- GLITCH EFFECTS --- */
                .glitch-text-anim {
                    position: relative;
                    display: inline-block;
                }
                .glitch-text-anim::before,
                .glitch-text-anim::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.8;
                }
                .glitch-text-anim::before {
                    color: #ff00ff;
                    z-index: -1;
                    animation: glitch-shift-1 0.4s infinite linear alternate-reverse;
                }
                .glitch-text-anim::after {
                    color: #00ffff;
                    z-index: -2;
                    animation: glitch-shift-2 0.4s infinite linear alternate-reverse;
                }
                @keyframes glitch-shift-1 {
                    0% { transform: translate(1px, 1px); clip-path: inset(0 0 0 0); }
                    20% { transform: translate(-1px, -1px); clip-path: inset(10% 0 20% 0); }
                    40% { transform: translate(-1px, 1px); clip-path: inset(50% 0 10% 0); }
                    60% { transform: translate(1px, -1px); clip-path: inset(0 0 60% 0); }
                    80% { transform: translate(0px, 1px); clip-path: inset(30% 0 10% 0); }
                    100% { transform: translate(1px, 0px); clip-path: inset(0 0 0 0); }
                }
                @keyframes glitch-shift-2 {
                    0% { transform: translate(-1px, -1px); clip-path: inset(0 0 0 0); }
                    20% { transform: translate(1px, 1px); clip-path: inset(20% 0 50% 0); }
                    40% { transform: translate(1px, -1px); clip-path: inset(0 0 80% 0); }
                    60% { transform: translate(-1px, 1px); clip-path: inset(60% 0 0 0); }
                    80% { transform: translate(0px, -1px); clip-path: inset(10% 0 30% 0); }
                    100% { transform: translate(-1px, 0px); clip-path: inset(0 0 0 0); }
                }
                @keyframes animate-impostor-shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -1px) rotate(-1deg); }
                    20% { transform: translate(-1px, 0px) rotate(1deg); }
                    30% { transform: translate(1px, 1px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 1px) rotate(-1deg); }
                    60% { transform: translate(-1px, 1px) rotate(0deg); }
                    70% { transform: translate(1px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 1px) rotate(0deg); }
                    100% { transform: translate(1px, -1px) rotate(-1deg); }
                }
                .animate-impostor-shake {
                    animation: animate-impostor-shake 0.5s linear infinite;
                }
                @keyframes animate-static-noise {
                    0%, 100% { background-position: 0 0; }
                    10% { background-position: -5% -10%; }
                    20% { background-position: -15% 5%; }
                    30% { background-position: 7% -25%; }
                    40% { background-position: 20% 25%; }
                    50% { background-position: -25% 10%; }
                    60% { background-position: 15% 5%; }
                    70% { background-position: 0% 15%; }
                    80% { background-position: 25% 35%; }
                    90% { background-position: -10% 10%; }
                }
                .animate-static-noise {
                    animation: animate-static-noise 1s steps(5) infinite;
                }
                @keyframes glitch-bar-1 {
                    0% { opacity: 0; top: 10%; height: 2px; }
                    5% { opacity: 1; top: 15%; height: 4px; }
                    10% { opacity: 0; top: 15%; height: 2px; }
                    50% { opacity: 0; top: 60%; height: 2px; }
                    55% { opacity: 1; top: 65%; height: 8px; }
                    60% { opacity: 0; top: 70%; height: 2px; }
                    100% { opacity: 0; }
                }
                .animate-glitch-bar-1 {
                    animation: glitch-bar-1 2s infinite linear;
                }
                @keyframes glitch-bar-2 {
                    0% { opacity: 0; top: 80%; }
                    30% { opacity: 0; top: 80%; }
                    32% { opacity: 1; top: 82%; }
                    34% { opacity: 0; top: 84%; }
                    100% { opacity: 0; }
                }
                @keyframes flash {
                    0%, 90% { opacity: 0; }
                    92% { opacity: 0.3; }
                    94% { opacity: 0; }
                    96% { opacity: 0.1; }
                    100% { opacity: 0; }
                }
                .animate-flash {
                    animation: flash 1s infinite;
                }
                @keyframes spin-glitch {
                        0% { transform: rotate(0deg) scale(1); border-color: rgba(239, 68, 68, 0.3); }
                        50% { transform: rotate(180deg) scale(1.1); border-color: rgba(0, 255, 255, 0.3); }
                        55% { transform: rotate(185deg) scale(0.9) skew(10deg); }
                        100% { transform: rotate(360deg) scale(1); border-color: rgba(239, 68, 68, 0.3); }
                }
                .animate-spin-glitch {
                    animation: spin-glitch 2s infinite linear;
                }
            `}</style>
        </div>
    );
};