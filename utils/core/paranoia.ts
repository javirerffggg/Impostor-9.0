
import { Player } from '../../types';

export const detectLinearPattern = (pastImpostorIds: string[], currentPlayers: Player[]): boolean => {
    if (pastImpostorIds.length < 4) return false;
    
    const idToIndex = new Map(currentPlayers.map((p, i) => [p.id, i]));
    const indices: number[] = [];
    
    for (let i = 0; i < 4; i++) {
        const idx = idToIndex.get(pastImpostorIds[i]);
        if (idx === undefined) return false; 
        indices.push(idx);
    }
    
    const N = currentPlayers.length;
    const jumps: number[] = [];
    
    for (let i = 0; i < 3; i++) {
        let jump = (indices[i] - indices[i+1]) % N;
        if (jump < 0) jump += N;
        jumps.push(jump);
    }
    
    return jumps[0] === jumps[1] && jumps[1] === jumps[2];
};

export const calculateParanoiaScore = (
    pastImpostorIds: string[], 
    currentPlayers: Player[],
    currentRound: number
): number => {
    if (pastImpostorIds.length < 4) return 0;

    const idToIndex = new Map(currentPlayers.map((p, i) => [p.id, i]));
    const lastN = pastImpostorIds.slice(0, 5);
    const indices = lastN.map(id => idToIndex.get(id)).filter(i => i !== undefined) as number[];

    if (indices.length < 3) return 0;

    let score = 0;
    let sequentialHits = 0;
    const groupSize = currentPlayers.length;
    const sequenceThreshold = groupSize <= 4 ? 3 : 2; 

    for (let i = 0; i < indices.length - 1; i++) {
        const diff = (indices[i] - indices[i+1]);
        if (Math.abs(diff) === 1 || Math.abs(diff) === currentPlayers.length - 1) {
            sequentialHits++;
        }
    }
    if (sequentialHits >= sequenceThreshold) score += 50; 
    if (sequentialHits > sequenceThreshold) score += 50; 

    const frequency: Record<string, number> = {};
    lastN.forEach(id => { frequency[id] = (frequency[id] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(frequency));
    
    const expectedFrequency = 5 / groupSize; 
    const normalizedFreq = maxFreq / expectedFrequency;

    if (normalizedFreq >= 2.5) score += 60; 
    else if (normalizedFreq >= 1.8) score += 20;

    if (currentRound > 8) score += (currentRound % 5) * 5;

    return Math.min(100, score);
};
