

import { Player, InfinityVault, GameState } from '../../types';
import { getVault } from './vault';

/**
 * 🆕 Calcula boost basado en la rareza de la categoría seleccionada (Sinergia Categoría-Impostor)
 */
export const calculateCategoryAffinityFactor = (
    vault: InfinityVault,
    categoryName: string,
    categoryStats: GameState['history']['categoryUsageStats']
): number => {
    const catStats = categoryStats?.[categoryName];
    
    // ¿Es una categoría "rara" (poco usada)?
    // Consideramos rara si se ha jugado menos de 3 veces
    const timesUsed = catStats?.totalTimesSelected || 0;
    const isRare = timesUsed < 3;
    
    // ¿El jugador tiene experiencia como impostor en esta categoría?
    const playerCatDNA = vault.categoryDNA[categoryName];
    const playerHasExperience = playerCatDNA && playerCatDNA.timesAsImpostor > 0;
    
    // CASO 1: Categoría rara + Jugador con experiencia
    // Lógica: Ya conoce bien esta categoría rara, démosle chance a otros
    if (isRare && playerHasExperience) {
        return 0.7; // -30% de peso
    }
    
    // CASO 2: Categoría rara + Jugador SIN experiencia
    // Lógica: Priorizar que experimente esta categoría como impostor por primera vez
    if (isRare && !playerHasExperience) {
        return 1.3; // +30% de peso
    }
    
    // CASO 3: Categoría común -> No ajustar significativamente
    return 1.0;
};

export const calculateInfinitumWeight = (
    player: Player, 
    vault: InfinityVault, 
    category: string, 
    currentRound: number,
    coolingDownFactor: number = 1.0, 
    averageWeightEstimate: number = 100,
    entropyLevel: number = 0,
    categoryUsageStats?: GameState['history']['categoryUsageStats'] // NEW PARAM
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

    // C. Motor de Afinidad de Categoría (V_ac) - Lógica Clásica
    let v_ac = 1.0;
    const catDNA = vault.categoryDNA[category];
    if (catDNA && catDNA.timesAsImpostor > 0) {
        v_ac *= 0.8; 
    }

    // D. NEW: Sinergia Avanzada de Categoría
    let v_synergy = 1.0;
    if (categoryUsageStats) {
        v_synergy = calculateCategoryAffinityFactor(vault, category, categoryUsageStats);
    }

    // E. Cálculo Ponderado Estándar
    const calculatedWeight = (v_fk * v_rs * v_ac * v_synergy);

    // F. Ruido Cuántico
    const noise = Math.random() * (averageWeightEstimate * 0.3);

    // G. LETEO Integration
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