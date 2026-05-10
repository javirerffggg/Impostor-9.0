import React, { useState, useEffect, useRef } from 'react';
import { GameState, ThemeConfig, RenunciaDecision, CategoryData } from '../../types';
import { IdentityCard } from '../IdentityCard';
import { SwipeRevealCard } from '../SwipeRevealCard';
import { MemoryRevealCard } from '../MemoryRevealCard';
import { PartyNotification } from '../PartyNotification';
import { ArchitectCuration } from '../ArchitectCuration';
import { PLAYER_COLORS } from '../../constants';
import { Smartphone, ArrowRight } from 'lucide-react';
import { RenunciaDecisionView } from '../RenunciaDecisionView';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    currentPlayerColor: string;
    onNextPlayer: (viewTime: number) => void;
    onOracleConfirm: (hint: string) => void;
    onRenunciaDecision: (decision: RenunciaDecision) => void;
    onRenunciaRoleSeen: () => void;
    onArchitectConfirm: (selection: { categoryName: string, wordPair: CategoryData }) => void;
    onArchitectRegenerate: () => void;
    architectOptions: [{ categoryName: string, wordPair: CategoryData }, { categoryName: string, wordPair: CategoryData }] | null;
    architectRegenCount: number;
    isExiting: boolean;
    transitionName?: string | null;
}

// ---------------------------------------------------------------------------
// RENUNCIA FLIP GATE
// Front: normal card (no hints). Hold 1.2s → 3D flip → decision screen.
// ---------------------------------------------------------------------------
const RenunciaFlipGate: React.FC<{
    front: React.ReactNode;
    back: React.ReactNode;
    theme: ThemeConfig;
}> = ({ front, back, theme }) => {
    const HOLD_DURATION = 1200;
    const [flipped, setFlipped] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const holdStart = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const startHold = (e: React.PointerEvent) => {
        if (flipped) return;
        e.preventDefault();
        holdStart.current = performance.now();
        setIsHolding(true);
        const tick = () => {
            if (!holdStart.current) return;
            const elapsed = performance.now() - holdStart.current;
            const progress = Math.min(elapsed / HOLD_DURATION, 1);
            setHoldProgress(progress);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                if (navigator.vibrate) navigator.vibrate([30, 60, 100]);
                setFlipped(true);
                setIsHolding(false);
                setHoldProgress(0);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const cancelHold = () => {
        if (flipped) return;
        holdStart.current = null;
        setIsHolding(false);
        setHoldProgress(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const RADIUS = 28;
    const CIRCUM = 2 * Math.PI * RADIUS;

    return (
        <div className="relative w-full" style={{ perspective: '1200px' }}>
            <div
                className="relative w-full"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: flipped ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                }}
            >
                {/* FRONT */}
                <div
                    className="w-full touch-none select-none"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    onPointerDown={startHold}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    onPointerCancel={cancelHold}
                    onContextMenu={e => e.preventDefault()}
                >
                    {front}
                    {isHolding && holdProgress > 0 && (
                        <div className="absolute bottom-3 right-3 z-50 pointer-events-none" style={{ opacity: Math.min(holdProgress * 4, 1) }}>
                            <svg width={RADIUS * 2 + 8} height={RADIUS * 2 + 8} style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx={RADIUS + 4} cy={RADIUS + 4} r={RADIUS} fill="none" stroke={`${theme.accent}30`} strokeWidth={3} />
                                <circle cx={RADIUS + 4} cy={RADIUS + 4} r={RADIUS} fill="none" stroke={theme.accent} strokeWidth={3} strokeLinecap="round"
                                    strokeDasharray={CIRCUM} strokeDashoffset={CIRCUM * (1 - holdProgress)}
                                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                                />
                            </svg>
                        </div>
                    )}
                </div>
                {/* BACK */}
                <div
                    className="absolute inset-0 w-full"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {back}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// ARCHITECT BLOOM GATE
// Front: normal card (no hints). Hold 1.2s → scale bloom expand → selection screen.
// ---------------------------------------------------------------------------
const ArchitectBloomGate: React.FC<{
    front: React.ReactNode;
    selection: React.ReactNode;
    theme: ThemeConfig;
}> = ({ front, selection, theme }) => {
    const HOLD_DURATION = 1200;
    const [bloomed, setBloomed] = useState(false);
    const [blooming, setBlooming] = useState(false); // animation in-progress
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const holdStart = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const startHold = (e: React.PointerEvent) => {
        if (bloomed || blooming) return;
        e.preventDefault();
        holdStart.current = performance.now();
        setIsHolding(true);
        const tick = () => {
            if (!holdStart.current) return;
            const elapsed = performance.now() - holdStart.current;
            const progress = Math.min(elapsed / HOLD_DURATION, 1);
            setHoldProgress(progress);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                if (navigator.vibrate) navigator.vibrate([20, 40, 80, 40, 120]);
                setIsHolding(false);
                setHoldProgress(0);
                setBlooming(true);
                // Let the bloom animation play, then reveal selection
                setTimeout(() => {
                    setBlooming(false);
                    setBloomed(true);
                }, 500);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const cancelHold = () => {
        if (bloomed || blooming) return;
        holdStart.current = null;
        setIsHolding(false);
        setHoldProgress(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const RADIUS = 28;
    const CIRCUM = 2 * Math.PI * RADIUS;

    if (bloomed) {
        return (
            <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-400">
                {selection}
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Card wrapper with bloom animation */}
            <div
                className="relative w-full touch-none select-none"
                style={{
                    transform: blooming ? 'scale(1.12)' : isHolding ? `scale(${1 + holdProgress * 0.04})` : 'scale(1)',
                    transition: blooming
                        ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out, filter 0.3s ease-out'
                        : 'transform 0.15s ease-out',
                    opacity: blooming ? 0 : 1,
                    filter: blooming
                        ? `blur(8px) brightness(2)`
                        : isHolding
                            ? `brightness(${1 + holdProgress * 0.25}) drop-shadow(0 0 ${holdProgress * 24}px ${theme.accent})`
                            : 'none',
                }}
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onContextMenu={e => e.preventDefault()}
            >
                {front}

                {/* Glow pulse ring while holding */}
                {isHolding && holdProgress > 0 && (
                    <div
                        className="absolute inset-0 rounded-[3rem] pointer-events-none"
                        style={{
                            boxShadow: `0 0 ${holdProgress * 60}px ${holdProgress * 30}px ${theme.accent}${Math.round(holdProgress * 80).toString(16).padStart(2, '0')}`,
                            opacity: holdProgress,
                            transition: 'box-shadow 0.05s linear, opacity 0.05s linear',
                        }}
                    />
                )}

                {/* Progress ring bottom-right */}
                {isHolding && holdProgress > 0 && (
                    <div className="absolute bottom-3 right-3 z-50 pointer-events-none" style={{ opacity: Math.min(holdProgress * 4, 1) }}>
                        <svg width={RADIUS * 2 + 8} height={RADIUS * 2 + 8} style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={RADIUS + 4} cy={RADIUS + 4} r={RADIUS} fill="none" stroke={`${theme.accent}30`} strokeWidth={3} />
                            <circle cx={RADIUS + 4} cy={RADIUS + 4} r={RADIUS} fill="none" stroke={theme.accent} strokeWidth={3} strokeLinecap="round"
                                strokeDasharray={CIRCUM} strokeDashoffset={CIRCUM * (1 - holdProgress)}
                                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export const RevealingView: React.FC<Props> = React.memo(({
    gameState,
    theme,
    currentPlayerColor,
    onNextPlayer,
    onOracleConfirm,
    onRenunciaDecision,
    onRenunciaRoleSeen,
    onArchitectConfirm,
    onArchitectRegenerate,
    architectOptions,
    architectRegenCount,
    isExiting,
    transitionName
}) => {
    const [hasSeenCurrentCard, setHasSeenCurrentCard] = useState(false);
    const isParty = gameState.settings.partyMode;
    const isMemoryMode = gameState.settings.memoryModeConfig?.enabled;
    const currentPlayer = gameState.gameData[gameState.currentPlayerIndex];
    const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;

    // RENUNCIA LOGIC
    const isRenunciaPhase1 = gameState.renunciaData &&
        currentPlayer.id === gameState.renunciaData.candidatePlayerId &&
        gameState.renunciaData.decision === 'pending' &&
        !gameState.renunciaData.hasSeenInitialRole;

    const isRenunciaPhase2 = gameState.renunciaData &&
        currentPlayer.id === gameState.renunciaData.candidatePlayerId &&
        gameState.renunciaData.decision === 'pending' &&
        gameState.renunciaData.hasSeenInitialRole;

    // ARCHITECT LOGIC
    // Only intercept the Architect's own card (isArchitect flag + options available).
    const isArchitectCard = gameState.isArchitectRound &&
        currentPlayer.isArchitect &&
        !!architectOptions;

    const handleNext = (viewTime: number) => {
        if (isRenunciaPhase1) {
            onRenunciaRoleSeen();
        } else {
            onNextPlayer(viewTime);
        }
    };

    const auraExplosion = isExiting && (
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div
                style={{ backgroundColor: currentPlayerColor, animation: 'aura-expand 0.6s ease-out forwards' }}
                className="w-64 h-64 rounded-full blur-3xl opacity-80"
            />
        </div>
    );

    // Standard card (shared by all gate front-faces)
    const standardCard = isMemoryMode ? (
        <MemoryRevealCard
            player={currentPlayer}
            memoryConfig={gameState.settings.memoryModeConfig}
            theme={theme}
            onMemorized={(time) => handleNext(time)}
        />
    ) : gameState.settings.revealMethod === 'swipe' ? (
        <SwipeRevealCard
            player={currentPlayer}
            theme={theme}
            color={currentPlayerColor}
            onRevealComplete={(time) => handleNext(time)}
            settings={gameState.settings}
            isParty={isParty}
            partyIntensity={gameState.partyState.intensity}
            isRenunciaPending={isRenunciaPhase1}
        />
    ) : (
        <IdentityCard
            player={currentPlayer}
            theme={theme}
            color={currentPlayerColor}
            onRevealStart={() => {}}
            onRevealEnd={() => { if (!currentPlayer.isOracle) setHasSeenCurrentCard(true); }}
            nextAction={(time) => { setHasSeenCurrentCard(false); handleNext(time); }}
            readyForNext={hasSeenCurrentCard}
            isLastPlayer={isLastPlayer}
            isParty={gameState.settings.partyMode}
            partyIntensity={gameState.partyState.intensity}
            debugMode={gameState.debugState.isEnabled}
            onOracleConfirm={(hint) => { setHasSeenCurrentCard(true); onOracleConfirm(hint); }}
            impostorEffectsEnabled={gameState.settings.impostorEffects}
            revealSpeed={gameState.settings.holdRevealSpeed}
        />
    );

    const renunciaBack = (
        <RenunciaDecisionView
            candidatePlayer={currentPlayer}
            otherPlayers={gameState.gameData.filter(p => p.id !== currentPlayer.id)}
            theme={theme}
            canTransfer={
                gameState.gameData.filter((p, index) =>
                    !p.isImp &&
                    p.id !== currentPlayer.id &&
                    p.id !== gameState.gameData.find(pl => pl.isArchitect)?.id &&
                    p.id !== gameState.oracleSetup?.oraclePlayerId &&
                    index > gameState.currentPlayerIndex
                ).length > 0
            }
            onDecision={(decision) => onRenunciaDecision(decision)}
        />
    );

    const architectSelection = architectOptions ? (
        <ArchitectCuration
            architect={currentPlayer}
            currentOptions={architectOptions}
            onRegenerate={onArchitectRegenerate}
            onConfirm={onArchitectConfirm}
            regenCount={architectRegenCount}
            theme={theme}
        />
    ) : null;

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] relative z-10">
            {auraExplosion}

            {isParty && gameState.currentDrinkingPrompt && (
                <div className="absolute top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                    <PartyNotification
                        key={gameState.currentDrinkingPrompt}
                        prompt={gameState.currentDrinkingPrompt}
                        theme={theme}
                    />
                </div>
            )}

            <div
                key={gameState.currentPlayerIndex + (transitionName || '')}
                className={`w-full max-w-sm flex flex-col items-center ${isExiting ? 'card-exit' : 'card-enter'}`}
            >
                {transitionName ? (
                    <div className="w-full aspect-[3/4] flex flex-col items-center justify-center relative animate-in zoom-in-95 duration-500">
                        <div
                            className="absolute inset-0 rounded-[3rem] border border-white/10 backdrop-blur-xl"
                            style={{
                                boxShadow: `0 20px 50px -10px ${theme.accent}20`,
                                background: `linear-gradient(135deg, ${theme.cardBg} 0%, rgba(0,0,0,0) 100%)`
                            }}
                        />
                        <div className="relative z-10 flex flex-col items-center gap-10 w-full px-8">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full" />
                                <div className="relative z-10">
                                    <Smartphone
                                        size={100}
                                        strokeWidth={1}
                                        style={{ color: theme.accent, filter: `drop-shadow(0 0 15px ${theme.accent}40)` }}
                                        className="transform -rotate-6 transition-transform duration-700"
                                    />
                                </div>
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-20 animate-pass-arrow">
                                    <div
                                        className="p-3 rounded-full border border-white/20 shadow-lg backdrop-blur-md"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    >
                                        <ArrowRight size={24} className="text-white" strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center w-full space-y-4">
                                <div className="space-y-2">
                                    <p style={{ color: theme.text }} className="text-xs font-bold uppercase tracking-widest opacity-60">
                                        PASA EL TELÉFONO A
                                    </p>
                                    <h2
                                        className="text-4xl font-black uppercase tracking-tight leading-none break-words"
                                        style={{ color: theme.text, fontFamily: theme.font, textShadow: `0 0 40px ${theme.accent}30` }}
                                    >
                                        {transitionName}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isArchitectCard && architectSelection ? (
                    // PROTOCOLO ARQUITECTO: carta normal → mantén → bloom → selección
                    <ArchitectBloomGate
                        theme={theme}
                        front={standardCard}
                        selection={architectSelection}
                    />
                ) : isRenunciaPhase2 ? (
                    // PROTOCOLO RENUNCIA FASE 2: carta normal → mantén → flip 3D → decisión
                    <RenunciaFlipGate
                        theme={theme}
                        front={standardCard}
                        back={renunciaBack}
                    />
                ) : (
                    standardCard
                )}
            </div>

            {!transitionName && !isRenunciaPhase2 && !isArchitectCard && (
                <div className="mt-auto mb-6 flex flex-col items-center gap-2.5 shrink-0">
                    <span
                        className="text-[9px] font-mono tracking-[0.3em] uppercase opacity-30"
                        style={{ color: theme.sub }}
                    >
                        {gameState.currentPlayerIndex + 1}/{gameState.players.length}
                    </span>
                    <div className="flex items-center gap-2">
                        {gameState.players.map((_, i) => {
                            const isActive = i === gameState.currentPlayerIndex;
                            const isPast = i < gameState.currentPlayerIndex;
                            const playerColor = PLAYER_COLORS[i % PLAYER_COLORS.length];
                            return (
                                <div key={i} className="relative flex items-center justify-center">
                                    {isActive && (
                                        <>
                                            <div className="absolute w-8 h-8 rounded-full blur-md opacity-40"
                                                style={{ backgroundColor: playerColor, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                            <div className="absolute w-6 h-6 rounded-full blur-sm opacity-60 animate-pulse"
                                                style={{ backgroundColor: playerColor }} />
                                            <div className="absolute w-5 h-5 rounded-full opacity-20 animate-pulse"
                                                style={{ backgroundColor: playerColor, animationDelay: '0.5s' }} />
                                        </>
                                    )}
                                    <div
                                        className={`relative rounded-full transition-all duration-700 ease-out ${isActive ? 'w-3.5 h-3.5 scale-100' : 'w-2 h-2'}`}
                                        style={{
                                            backgroundColor: isActive || isPast ? playerColor : 'rgba(255, 255, 255, 0.1)',
                                            boxShadow: isActive
                                                ? `0 0 20px ${playerColor}, 0 0 10px ${playerColor}, 0 0 5px ${playerColor}, inset 0 0 5px rgba(255, 255, 255, 0.5)`
                                                : isPast ? `0 0 8px ${playerColor}50` : 'none',
                                            opacity: isActive || isPast ? 1 : 0.25
                                        }}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-full"
                                                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)', animation: 'pulse 2s ease-in-out infinite' }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                .card-enter { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .card-exit { animation: slideOutLeft 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px) scale(0.95) rotate(2deg); filter: blur(4px); }
                    to { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); filter: blur(0); }
                }
                @keyframes slideOutLeft {
                    from { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); filter: blur(0); }
                    to { opacity: 0; transform: translateX(-100px) scale(0.95) rotate(-2deg); filter: blur(4px); }
                }
                @keyframes aura-expand {
                    0% { transform: scale(0.5); opacity: 0; }
                    30% { opacity: 0.6; }
                    100% { transform: scale(20); opacity: 0; }
                }
                @keyframes pass-arrow {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(10px, -50%); }
                }
                .animate-pass-arrow { animation: pass-arrow 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
});
