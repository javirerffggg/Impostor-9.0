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
    
    // Especificación v2.0 - Ecuación: Probabilidad Base (10%)
    const BASE_PROB = 0.10; 
    
    const candidateKey = candidatePlayer.name.trim().toLowerCase();
    const candidateVault = getVault(candidateKey, stats);
    const candidateStreak = candidateVault.metrics.civilStreak;
    
    // VECTOR B: Intensidad de Karma (Ik)
    let vectorKarma = 0;
    if (candidateStreak <= 1) {
        vectorKarma = 0.40; // Especificación 2.B: sube un 40% para "Impostor Reincidente"
    } else if (candidateStreak >= 8) {
        vectorKarma = -0.15; // Especificación 2.B: "Justicia del Civil", baja al mínimo
    } else {
        vectorKarma = 0.05; // Valor neutro base
    }
    
    // VECTOR A: Longevidad de Sesión (Ls)
    // Especificación 3: Bonus de Sesión: +2% por cada ronda total jugada
    const vectorSession = currentRound * 0.02; 
    
    // VECTOR C: Fatiga Acumulada (Adaptación del "Fracaso Acumulado")
    // Como la app no registra victorias/derrotas, evaluamos si el jugador 
    // ya ha tenido que ser impostor 3 o más veces en el histórico general.
    let vectorFailure = 0;
    const totalImpostorTimes = candidateVault.metrics.totalImpostor || 0;
    
    if (totalImpostorTimes >= 3) {
        vectorFailure = 0.15; // Válvula de escape activada por fatiga de rol
    }
    
    // Cálculo final: Probabilidad Base + Bonus de Racha + Bonus de Sesión + Fracaso/Fatiga
    // Ampliamos un poco el techo de probabilidad a 0.85 para permitir el pico del 40% de racha + sesión.
    const finalProb = Math.max(0.05, Math.min(0.85, 
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
            impostorLosses: totalImpostorTimes // Reutilizamos la variable de telemetría para debug técnico
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
            
            // ✅ Validar que el candidato existe para evitar índices -1
            if (candidateIndex === -1) {
                console.error('Renuncia Transfer: Candidate not found in gameData');
                // Fallback de seguridad: tratar como rechazo para no romper el juego
                return applyRenunciaDecision('reject', gameData, renunciaData, wordPair, stats, useHintMode, candidateRevealIndex, architectId, oracleId);
            }
            
            // FIX: Se elimina la restricción `index > candidateIndex`.
            // El receptor puede ser cualquier civil sin rol especial,
            // independientemente de su posición en el orden de revelación.
            const eligiblePlayers = gameData.filter(p => 
                !p.isImp && 
                p.id !== renunciaData.candidatePlayerId &&
                p.id !== architectId &&
                p.id !== oracleId
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
