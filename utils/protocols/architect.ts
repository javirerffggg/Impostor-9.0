
import { GameState } from '../../types';

export const calculateArchitectTrigger = (
    history: GameState['history'], 
    firstCivilStreak: number
): boolean => {
    const currentRound = history.roundCounter + 1;
    const roundsSinceLast = currentRound - (history.lastArchitectRound || -999);
    
    if (roundsSinceLast <= 1) return false; 

    let baseProb = 0.15; 

    if (roundsSinceLast >= 2 && roundsSinceLast <= 5) {
        baseProb = 0.05; 
    } else if (roundsSinceLast > 10) {
        baseProb = 0.25; 
    }

    if (currentRound > 10) baseProb = Math.max(baseProb, 0.20); 
    if (firstCivilStreak > 8) baseProb += 0.10; 

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 3) baseProb *= 2; 

    return Math.random() < baseProb;
};
