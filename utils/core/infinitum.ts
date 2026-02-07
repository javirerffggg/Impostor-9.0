
import { Player, InfinityVault } from '../../types';
import { getVault } from './vault';

export const calculateInfinitumWeight = (
    player: Player, 
    vault: InfinityVault, 
    category: string, 
    currentRound: number,
    coolingDownFactor: number = 1.0, 
    averageWeightEstimate: number = 100,
    entropyLevel: number = 0
): number => {
    
    if (vault.metrics.quarantineRounds > 0) {
        return 0.01; 
    }

    // A. Motor de Frecuencia y Karma (V_fk)
    const base = 100;
    const ratio = Math.max(vault.metrics.impostorRatio, 0.01); 
    const effectiveStreak = vault.metrics.civilStreak * coolingDownFactor; 
    const v_fk = base * Math.log(effectiveStreak + 2) * (1 / ratio);

    // B. Motor de Recencia y Secuencia (V_rs)
    let v_rs = 1.0;
    const history = vault.sequenceAnalytics.roleSequence; 
    
    if (history[0]) v_rs *= 0.05;      
    else if (history[1]) v_rs *= 0.30; 
    else if (history[2]) v_rs *= 0.60; 
    else if (history[3]) v_rs *= 1.0;  

    // C. Motor de Afinidad de Categoría (V_ac)
    let v_ac = 1.0;
    const catDNA = vault.categoryDNA[category];
    if (catDNA && catDNA.timesAsImpostor > 0) {
        v_ac *= 0.8; 
    }

    // D. Cálculo Ponderado Estándar
    const calculatedWeight = (v_fk * v_rs * v_ac);

    // E. Ruido Cuántico
    const noise = Math.random() * (averageWeightEstimate * 0.3);

    // F. LETEO Integration
    const finalWeight = (calculatedWeight * (1 - entropyLevel)) + (100 * entropyLevel);

    return finalWeight + noise;
};

export const applySynergyFactor = (
    candidateWeight: number, 
    candidateVault: InfinityVault, 
    alreadySelectedIds: string[],
    groupSize: number
): number => {
    let synergyFactor = 1.0;
    const lastPartners = candidateVault.sequenceAnalytics.lastImpostorPartners;
    const hasConflict = alreadySelectedIds.some(id => lastPartners.includes(id));
    
    if (hasConflict) {
        const penalty = Math.max(0.1, 1 - (groupSize / 10));
        synergyFactor = penalty;
    }
    return candidateWeight * synergyFactor;
};

export const getDebugPlayerStats = (
    players: Player[], 
    stats: Record<string, InfinityVault>, 
    round: number
): { name: string, weight: number, prob: number, streak: number }[] => {
    const weights: number[] = [];
    const dummyCat = "General"; 
    
    const playerWeights = players.map(p => {
        const key = p.name.trim().toLowerCase();
        const vault = getVault(key, stats);
        const w = calculateInfinitumWeight(p, vault, dummyCat, round, 1.0, 100, 0);
        weights.push(w);
        return { p, w, v: vault };
    });

    const totalW = weights.reduce((a, b) => a + b, 0);

    return playerWeights.map(item => ({
        name: item.p.name,
        weight: Math.round(item.w),
        prob: totalW > 0 ? (item.w / totalW) * 100 : 0,
        streak: item.v.metrics.civilStreak
    })).sort((a, b) => b.weight - a.weight);
};
