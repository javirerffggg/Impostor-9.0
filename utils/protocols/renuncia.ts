
import { Player, InfinityVault, RenunciaData, RenunciaDecision, GamePlayer, CategoryData, GameState } from '../../types';
import { getVault } from '../core/vault';
import { generateSmartHint } from '../lexicon/wordSelection';

interface RenunciaTelemetry {
    baseProb: number;
    vectorKarma: number;
    vectorSession: number;
    vectorFailure: number;
    finalProb: number;
    candidateStreak: number;
    impostorLosses: number;
}

export const calculateRenunciaProbability = (
    candidatePlayer: Player,
    currentRound: number,
    stats: Record<string, InfinityVault>,
    history: GameState['history']
): { probability: number; telemetry: RenunciaTelemetry } => {
    
    const BASE_PROB = 0.15;
    
    const candidateKey = candidatePlayer.name.trim().toLowerCase();
    const candidateVault = getVault(candidateKey, stats);
    const candidateStreak = candidateVault.metrics.civilStreak;
    
    let vectorKarma = 0;
    if (candidateStreak <= 1) vectorKarma = 0.20;
    else if (candidateStreak >= 8) vectorKarma = -0.15;
    else vectorKarma = 0.05;
    
    const vectorSession = Math.floor(currentRound / 3) * 0.05;
    
    let vectorFailure = 0;
    let impostorLosses = 0;
    
    if (history.matchLogs && history.matchLogs.length >= 3) {
        const lastThreeRounds = history.matchLogs.slice(0, 3);
        impostorLosses = lastThreeRounds.filter(log => !log.isTroll).length;
        if (impostorLosses >= 3) vectorFailure = 0.15;
    }
    
    const finalProb = Math.max(0.05, Math.min(0.70, 
        BASE_PROB + vectorKarma + vectorSession + vectorFailure
    ));
    
    return {
        probability: finalProb,
        telemetry: {
            baseProb: BASE_PROB,
            vectorKarma,
            vectorSession,
            vectorFailure,
            finalProb,
            candidateStreak,
            impostorLosses
        }
    };
};

export const applyRenunciaDecision = (
    decision: RenunciaDecision,
    gameData: GamePlayer[],
    renunciaData: RenunciaData,
    wordPair: CategoryData,
    stats: Record<string, InfinityVault>,
    useHintMode: boolean,
    candidateRevealIndex: number,
    architectId?: string,
    oracleId?: string
): { 
    updatedGameData: GamePlayer[]; 
    updatedRenunciaData: RenunciaData;
    actualImpostorCount: number;
} => {
    
    const candidateId = renunciaData.candidatePlayerId;
    
    switch (decision) {
        case 'accept': {
            return {
                updatedGameData: gameData,
                updatedRenunciaData: {
                    ...renunciaData,
                    decision: 'accept',
                    timestamp: Date.now()
                },
                actualImpostorCount: gameData.filter(p => p.isImp).length
            };
        }
        
        case 'reject': {
            const updatedGameData = gameData.map(p => {
                if (p.id === candidateId) {
                    return {
                        ...p,
                        isImp: false,
                        role: 'Civil' as const,
                        word: p.realWord,
                        hasRejectedImpRole: true
                    };
                }
                return p;
            });
            
            const newImpostorCount = updatedGameData.filter(p => p.isImp).length;
            if (newImpostorCount === 0) {
                const forcedImpostorIndex = updatedGameData.findIndex(p => 
                    p.id !== candidateId && 
                    p.id !== architectId && 
                    p.id !== oracleId
                );
                
                if (forcedImpostorIndex !== -1) {
                    const hint = generateSmartHint(wordPair);
                    updatedGameData[forcedImpostorIndex] = {
                        ...updatedGameData[forcedImpostorIndex],
                        isImp: true,
                        role: 'Impostor',
                        word: useHintMode ? `PISTA: ${hint}` : "ERES EL IMPOSTOR"
                    };
                }
            }
            
            return {
                updatedGameData,
                updatedRenunciaData: {
                    ...renunciaData,
                    decision: 'reject',
                    timestamp: Date.now()
                },
                actualImpostorCount: updatedGameData.filter(p => p.isImp).length
            };
        }
        
        case 'transfer': {
            const candidateIndex = gameData.findIndex(p => p.id === renunciaData.candidatePlayerId);
            
            const eligiblePlayers = gameData.filter((p, index) => 
                !p.isImp && 
                p.id !== renunciaData.candidatePlayerId &&
                p.id !== architectId &&
                p.id !== oracleId &&
                index > candidateIndex
            );
            
            if (eligiblePlayers.length === 0) {
                return applyRenunciaDecision('reject', gameData, renunciaData, wordPair, stats, useHintMode, candidateRevealIndex, architectId, oracleId);
            }
            
            const sortedByKarma = [...eligiblePlayers].sort((a, b) => {
                const vaultA = getVault(a.name.trim().toLowerCase(), stats);
                const vaultB = getVault(b.name.trim().toLowerCase(), stats);
                return (vaultB?.metrics.civilStreak || 0) - (vaultA?.metrics.civilStreak || 0);
            });
            
            const newImpostor = sortedByKarma[0];
            
            const updatedGameData = gameData.map(p => {
                if (p.id === candidateId) {
                    return {
                        ...p,
                        isImp: false,
                        role: 'Civil' as const,
                        word: p.realWord,
                        isWitness: true
                    };
                }
                
                if (p.id === newImpostor.id) {
                    const hint = generateSmartHint(wordPair);
                    return {
                        ...p,
                        isImp: true,
                        role: 'Impostor' as const,
                        word: useHintMode ? `PISTA: ${hint}` : "ERES EL IMPOSTOR",
                        wasTransferred: true
                    };
                }
                
                return p;
            });
            
            return {
                updatedGameData,
                updatedRenunciaData: {
                    ...renunciaData,
                    decision: 'transfer',
                    witnessPlayerId: candidateId,
                    transferredToId: newImpostor.id,
                    timestamp: Date.now()
                },
                actualImpostorCount: updatedGameData.filter(p => p.isImp).length
            };
        }
        
        default:
            return {
                updatedGameData: gameData,
                updatedRenunciaData: renunciaData,
                actualImpostorCount: gameData.filter(p => p.isImp).length
            };
    }
};
