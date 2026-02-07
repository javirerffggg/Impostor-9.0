
import { Player, GameState } from '../../types';

export const runVocalisProtocol = (
    players: Player[],
    history: GameState['history'],
    isParty: boolean,
    architectId?: string
): Player => {
    if (isParty) {
        const sortedByLength = [...players].sort((a, b) => b.name.length - a.name.length);
        const maxLength = sortedByLength[0].name.length;
        const candidates = sortedByLength.filter(p => p.name.length === maxLength);
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    let candidates = players;
    if (architectId && players.length > 2) {
        if (Math.random() < 0.9) {
            candidates = players.filter(p => p.id !== architectId);
        }
    }

    const weightedCandidates = candidates.map(p => {
        let weight = 100;
        const lastStartRound = history.lastStartingPlayers.indexOf(p.id); 
        
        if (lastStartRound === 0) weight *= 0.001; 
        else if (lastStartRound === 1) weight *= 0.05; 
        else if (lastStartRound === 2) weight *= 0.25;
        else if (lastStartRound === -1) weight *= 3.0; 

        const nameEntropy = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        weight += (nameEntropy % 20); 
        weight *= (0.8 + Math.random() * 0.4); 

        return { player: p, weight };
    });

    const totalWeight = weightedCandidates.reduce((sum, item) => sum + item.weight, 0);
    let ticket = Math.random() * totalWeight;
    
    for (const item of weightedCandidates) {
        ticket -= item.weight;
        if (ticket <= 0) return item.player;
    }
    
    return weightedCandidates[weightedCandidates.length - 1].player;
};
