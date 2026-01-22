
import React, { useState } from 'react';
import { GameState, ThemeConfig } from '../../types';
import { IdentityCard } from '../IdentityCard';
import { PartyNotification } from '../PartyNotification';
import { PLAYER_COLORS } from '../../constants';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    currentPlayerColor: string;
    onNextPlayer: (viewTime: number) => void;
    onOracleConfirm: (hint: string) => void;
    isExiting: boolean;
}

export const RevealingView: React.FC<Props> = ({ gameState, theme, currentPlayerColor, onNextPlayer, onOracleConfirm, isExiting }) => {
    const [hasSeenCurrentCard, setHasSeenCurrentCard] = useState(false);
    const isParty = gameState.settings.partyMode;
    const currentPlayer = gameState.gameData[gameState.currentPlayerIndex];
    const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;

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
                key={gameState.currentPlayerIndex} 
                className={`w-full max-w-sm flex flex-col items-center ${isExiting ? 'card-exit' : 'card-enter'}`}
            >
                <IdentityCard 
                    player={currentPlayer}
                    theme={theme}
                    color={currentPlayerColor}
                    onRevealStart={() => {}}
                    onRevealEnd={() => {
                        if (!currentPlayer.isOracle) setHasSeenCurrentCard(true);
                    }}
                    nextAction={(time) => {
                        setHasSeenCurrentCard(false); // Reset for next
                        onNextPlayer(time);
                    }}
                    readyForNext={hasSeenCurrentCard}
                    isLastPlayer={isLastPlayer}
                    isParty={gameState.settings.partyMode}
                    partyIntensity={gameState.partyState.intensity} 
                    debugMode={gameState.debugState.isEnabled}
                    onOracleConfirm={(hint) => {
                        setHasSeenCurrentCard(true);
                        onOracleConfirm(hint);
                    }}
                />
            </div>
            
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
            `}</style>
        </div>
    );
};
