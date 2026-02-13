






import React, { useState } from 'react';
import { GameState, ThemeConfig, RenunciaDecision } from '../../types';
import { IdentityCard } from '../IdentityCard';
import { SwipeRevealCard } from '../SwipeRevealCard';
import { MemoryRevealCard } from '../MemoryRevealCard';
import { PartyNotification } from '../PartyNotification';
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
    isExiting: boolean;
    transitionName?: string | null;
}

export const RevealingView: React.FC<Props> = React.memo(({ 
    gameState, 
    theme, 
    currentPlayerColor, 
    onNextPlayer, 
    onOracleConfirm, 
    onRenunciaDecision,
    onRenunciaRoleSeen,
    isExiting, 
    transitionName 
}) => {
    const [hasSeenCurrentCard, setHasSeenCurrentCard] = useState(false);
    const isParty = gameState.settings.partyMode;
    const isMemoryMode = gameState.settings.memoryModeConfig?.enabled;
    const currentPlayer = gameState.gameData[gameState.currentPlayerIndex];
    const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;

    // RENUNCIA LOGIC
    // Phase 1: Candidate has not seen initial role yet (Show standard card)
    const isRenunciaPhase1 = gameState.renunciaData && 
        currentPlayer.id === gameState.renunciaData.candidatePlayerId &&
        gameState.renunciaData.decision === 'pending' &&
        !gameState.renunciaData.hasSeenInitialRole;

    // Phase 2: Candidate has seen initial role, needs to decide (Show RenunciaDecisionView)
    const isRenunciaPhase2 = gameState.renunciaData && 
        currentPlayer.id === gameState.renunciaData.candidatePlayerId &&
        gameState.renunciaData.decision === 'pending' &&
        gameState.renunciaData.hasSeenInitialRole;

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
                style={{
                    backgroundColor: currentPlayerColor,
                    animation: 'aura-expand 0.6s ease-out forwards',
                }}
                className="w-64 h-64 rounded-full blur-3xl opacity-80"
            />
        </div>
    );

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
                ) : isRenunciaPhase2 ? (
                    // PROTOCOLO RENUNCIA: Show decision screen for candidate
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
                        onDecision={(decision) => {
                            // Process decision. Component updates and shows card in next render cycle.
                            onRenunciaDecision(decision);
                        }}
                    />
                ) : (
                    // CHECK FOR MEMORY MODE
                    isMemoryMode ? (
                        <MemoryRevealCard 
                            player={currentPlayer}
                            memoryConfig={gameState.settings.memoryModeConfig}
                            theme={theme}
                            onMemorized={(time) => handleNext(time)}
                        />
                    ) : (
                        gameState.settings.revealMethod === 'swipe' ? (
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
                                impostorEffectsEnabled={gameState.settings.impostorEffects} // Prop pasada
                            />
                        )
                    )
                )}
            </div>
            
            {!transitionName && !isRenunciaPhase2 && (
                <div className="mt-auto mb-4 text-center opacity-50 space-y-2 shrink-0">
                    <p style={{ color: theme.sub }} className="text-[10px] uppercase tracking-widest">
                        Jugador {gameState.currentPlayerIndex + 1} de {gameState.players.length}
                    </p>
                    <div className="flex gap-2 justify-center items-center h-4">
                        {gameState.players.map((_, i) => {
                            const isActive = i === gameState.currentPlayerIndex;
                            const isPast = i < gameState.currentPlayerIndex;
                            return (
                                <div 
                                    key={i} 
                                    style={{ 
                                        backgroundColor: isActive || isPast
                                            ? PLAYER_COLORS[i % PLAYER_COLORS.length] 
                                            : 'rgba(255,255,255,0.2)',
                                        animation: isActive ? 'echo-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
                                        boxShadow: isActive ? `0 0 10px ${PLAYER_COLORS[i % PLAYER_COLORS.length]}` : 'none'
                                    }}
                                    className={`rounded-full transition-all duration-500 ${isActive ? 'w-3 h-3' : 'w-1.5 h-1.5'}`}
                                />
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
                .animate-pass-arrow {
                    animation: pass-arrow 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for React.memo
    // Only re-render if key state changes, ignore object reference changes for functions
    return (
        prevProps.gameState.currentPlayerIndex === nextProps.gameState.currentPlayerIndex &&
        prevProps.gameState.phase === nextProps.gameState.phase &&
        prevProps.isExiting === nextProps.isExiting &&
        prevProps.transitionName === nextProps.transitionName &&
        prevProps.gameState.renunciaData === nextProps.gameState.renunciaData &&
        prevProps.gameState.currentDrinkingPrompt === nextProps.gameState.currentDrinkingPrompt &&
        prevProps.theme.name === nextProps.theme.name &&
        prevProps.gameState.settings.impostorEffects === nextProps.gameState.settings.impostorEffects // Check settings too
    );
});