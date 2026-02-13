

import { CATEGORIES_DATA } from '../../categories';
import { CategoryData, GameState } from '../../types';
import { shuffleArray } from '../utils/helpers';
import { CATEGORY_AFFINITY_GROUPS } from '../../constants';

interface LexiconSelection {
    categoryName: string;
    wordPair: CategoryData;
}

interface CategoryWeight {
    name: string;
    weight: number;
    timesUsed: number;
}

export interface CategorySelectionTelemetry {
    candidateCategories: string[];
    weights: Record<string, number>;
    finalProbabilities: Record<string, number>;
    selectionReason: string;
}

export const generateArchitectOptions = (selectedCats: string[]): [LexiconSelection, LexiconSelection] => {
    const allCategories = Object.keys(CATEGORIES_DATA);
    let pool = selectedCats.length > 0 ? selectedCats : allCategories;
    if (pool.length === 0) pool = allCategories;

    const getOption = (): LexiconSelection => {
        const categoryName = pool[Math.floor(Math.random() * pool.length)];
        const catWords = CATEGORIES_DATA[categoryName];
        const wordPair = catWords[Math.floor(Math.random() * catWords.length)];
        return { categoryName, wordPair };
    };

    const option1 = getOption();
    let option2 = getOption();

    let attempts = 0;
    while (option1.wordPair.civ === option2.wordPair.civ && attempts < 10) {
        option2 = getOption();
        attempts++;
    }

    return [option1, option2];
};

/**
 * Inicializa el tracking de exhaustión para una categoría si no existe
 */
const initializeCategoryExhaustion = (
    categoryName: string,
    history: GameState['history']
): GameState['history']['categoryExhaustion'][string] => {
    const totalWords = CATEGORIES_DATA[categoryName]?.length || 0;
    
    return {
        usedWords: [],
        totalWords: totalWords,
        lastReset: Date.now(),
        cycleCount: 0
    };
};

/**
 * Verifica si una categoría necesita resetear su pool
 */
const shouldResetCategory = (
    categoryName: string,
    history: GameState['history']
): boolean => {
    const exhaustion = history.categoryExhaustion?.[categoryName];
    
    if (!exhaustion) return false;
    
    const categoryWords = CATEGORIES_DATA[categoryName] || [];
    const totalAvailable = categoryWords.length;
    
    // Si todas las palabras han sido usadas, resetear
    // También resetear si > 95% usadas para evitar repetir las mismas pocas palabras al final
    return exhaustion.usedWords.length >= totalAvailable || (exhaustion.usedWords.length / totalAvailable) > 0.95;
};

/**
 * Resetea el pool de palabras usadas de una categoría
 */
const resetCategoryPool = (
    categoryName: string,
    history: GameState['history']
): GameState['history']['categoryExhaustion'][string] => {
    const existing = history.categoryExhaustion?.[categoryName];
    console.log(`Resetting exhaustion for category: ${categoryName}`);
    
    return {
        usedWords: [],
        totalWords: CATEGORIES_DATA[categoryName]?.length || 0,
        lastReset: Date.now(),
        cycleCount: (existing?.cycleCount || 0) + 1
    };
};

/**
 * 🆕 FUNCIÓN DE VALIDACIÓN Y SINCRONIZACIÓN
 * Detecta y corrige cambios en el número de palabras de una categoría
 */
const validateAndSyncCategoryExhaustion = (
    categoryName: string,
    history: GameState['history']
): GameState['history']['categoryExhaustion'][string] => {
    const exhaustion = history.categoryExhaustion?.[categoryName];
    const currentTotalWords = CATEGORIES_DATA[categoryName]?.length || 0;
    
    // Caso 1: No existe exhaustion → Inicializar
    if (!exhaustion) {
        return initializeCategoryExhaustion(categoryName, history);
    }
    
    // Caso 2: El número de palabras NO ha cambiado → Retornar tal cual
    if (exhaustion.totalWords === currentTotalWords) {
        return exhaustion;
    }
    
    // Caso 3: El número de palabras CAMBIÓ → Sincronizar
    console.warn(
        `⚠️ Category "${categoryName}" word count changed: ${exhaustion.totalWords} → ${currentTotalWords}`
    );
    
    // Obtener todas las palabras actuales de la categoría
    const currentWords = CATEGORIES_DATA[categoryName] || [];
    const currentWordCivs = currentWords.map(w => w.civ);
    
    // Filtrar palabras usadas que aún existen en la categoría
    const validUsedWords = exhaustion.usedWords.filter(word => 
        currentWordCivs.includes(word)
    );
    
    return {
        usedWords: validUsedWords,           // ✅ Solo palabras válidas
        totalWords: currentTotalWords,        // ✅ Sincronizado
        lastReset: exhaustion.lastReset,      // ✅ Mantener fecha original
        cycleCount: exhaustion.cycleCount     // ✅ Mantener ciclo
    };
};

// --- NEW SMART SELECTION LOGIC ---

/**
 * 🆕 Calcula pesos basados en uso histórico de categorías
 */
const calculateCategoryWeights = (
    availableCategories: string[],
    history: GameState['history']
): CategoryWeight[] => {
    const stats = history.categoryUsageStats || {};
    
    return availableCategories.map(catName => {
        const catStats = stats[catName];
        const timesUsed = catStats?.totalTimesSelected || 0;
        
        // Penalizar categorías exhaustas (>80% palabras usadas)
        const exhaustionRate = catStats?.exhaustionRate || 0;
        const exhaustionPenalty = exhaustionRate > 0.8 ? 0.3 : 1.0;
        
        // Fórmula: Peso inversamente proporcional al uso
        // Categorías nunca usadas tienen peso máximo
        const baseWeight = timesUsed === 0 ? 100 : (1 / (timesUsed + 1)) * 100;
        const finalWeight = baseWeight * exhaustionPenalty;
        
        return {
            name: catName,
            weight: finalWeight,
            timesUsed: timesUsed
        };
    });
};

/**
 * 🆕 Selección ponderada de categoría
 */
const selectWeightedCategory = (weights: CategoryWeight[]): string => {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    
    if (totalWeight <= 0) return weights[0].name;

    let randomTicket = Math.random() * totalWeight;
    
    for (const item of weights) {
        randomTicket -= item.weight;
        if (randomTicket <= 0) {
            return item.name;
        }
    }
    
    // Fallback (no debería ocurrir)
    return weights[0].name;
};

/**
 * 🆕 Filtra categorías con anti-repetición adaptativa
 */
const applyAntiRepetitionFilter = (
    categories: string[],
    history: GameState['history'],
    aggressiveness: 'none' | 'soft' | 'medium' | 'hard'
): string[] => {
    if (aggressiveness === 'none' || categories.length <= 1) {
        return categories;
    }
    
    const lastCategories = history.lastCategories || [];
    let filtered = categories;
    
    switch (aggressiveness) {
        case 'soft':
            // Solo evitar LA ÚLTIMA categoría
            filtered = categories.filter(cat => cat !== lastCategories[0]);
            break;
            
        case 'medium':
            // Evitar últimas 2 categorías
            filtered = categories.filter(cat => 
                !lastCategories.slice(0, 2).includes(cat)
            );
            break;
            
        case 'hard':
            // Evitar últimas 3 categorías
            filtered = categories.filter(cat => 
                !lastCategories.slice(0, 3).includes(cat)
            );
            break;
    }
    
    // Fallback: Si filtrado elimina TODO, usar pool completo
    return filtered.length > 0 ? filtered : categories;
};

/**
 * 🆕 Detecta el grupo de afinidad de una categoría
 */
const getCategoryGroup = (categoryName: string): string | null => {
    for (const [group, categories] of Object.entries(CATEGORY_AFFINITY_GROUPS)) {
        if (categories.includes(categoryName)) {
            return group;
        }
    }
    return null;
};

/**
 * 🆕 Aplica bonus de diversidad temática
 */
const applyAffinityDiversityBonus = (
    weights: CategoryWeight[],
    history: GameState['history']
): CategoryWeight[] => {
    const lastCategories = history.lastCategories || [];
    // Tomar últimos 3 grupos usados
    const recentGroups = lastCategories
        .slice(0, 3)
        .map(cat => getCategoryGroup(cat))
        .filter(g => g !== null);
    
    return weights.map(w => {
        const group = getCategoryGroup(w.name);
        
        // ✅ Si la categoría es de un grupo NO usado recientemente → Bonus
        if (group && !recentGroups.includes(group)) {
            return {
                ...w,
                weight: w.weight * 1.5 // +50% de probabilidad
            };
        }
        
        return w;
    });
};

/**
 * 🆕 Detecta y prioriza categorías "raras" (poco usadas)
 */
const applyRareCategoryBoost = (
    weights: CategoryWeight[],
    threshold: number = 3 // Categorías con <3 usos se consideran "raras"
): CategoryWeight[] => {
    return weights.map(w => {
        if (w.timesUsed < threshold) {
            return {
                ...w,
                weight: w.weight * 3 // 3x de probabilidad
            };
        }
        return w;
    });
};

/**
 * ✨ NUEVO: Aplica boost a Favoritos (2x peso)
 */
const applyFavoritesBoost = (
    weights: CategoryWeight[],
    favorites: string[]
): CategoryWeight[] => {
    if (!favorites || favorites.length === 0) return weights;
    
    return weights.map(w => {
        if (favorites.includes(w.name)) {
            return {
                ...w,
                weight: w.weight * 2 // 2x Probabilidad para favoritos
            };
        }
        return w;
    });
};

/**
 * 🆕 Calcula cooldown óptimo según tamaño del pool (para modo omnisciente principalmente)
 */
const calculateOptimalCooldown = (poolSize: number): number => {
    if (poolSize <= 3) return 0;      // Sin cooldown, muy pocas opciones
    if (poolSize <= 5) return 1;      // Evitar 1 (20% del pool)
    if (poolSize <= 10) return 2;     // Evitar 2 (20% del pool)
    if (poolSize <= 20) return 3;     // Evitar 3 (15% del pool)
    return Math.min(5, Math.floor(poolSize * 0.15)); // 15% del pool, max 5
};

/**
 * 🆕 Aplica cooldown dinámico
 */
const applyDynamicCooldown = (
    categories: string[],
    history: GameState['history']
): string[] => {
    const cooldownCount = calculateOptimalCooldown(categories.length);
    
    if (cooldownCount === 0) return categories;
    
    const lastCategories = history.lastCategories?.slice(0, cooldownCount) || [];
    const filtered = categories.filter(cat => !lastCategories.includes(cat));
    
    return filtered.length > 0 ? filtered : categories;
};

/**
 * 🆕 Función para actualizar stats de uso de categoría
 */
const updateCategoryStats = (
    categoryName: string,
    currentRound: number,
    history: GameState['history']
): GameState['history']['categoryUsageStats'] => {
    const stats = history.categoryUsageStats || {};
    const current = stats[categoryName] || {
        totalTimesSelected: 0,
        lastSelectedRound: 0,
        averageWordsPerSelection: 0,
        exhaustionRate: 0
    };
    
    const exhaustion = history.categoryExhaustion?.[categoryName];
    const exhaustionRate = exhaustion && exhaustion.totalWords > 0
        ? exhaustion.usedWords.length / exhaustion.totalWords 
        : 0;
    
    return {
        ...stats,
        [categoryName]: {
            totalTimesSelected: current.totalTimesSelected + 1,
            lastSelectedRound: currentRound,
            averageWordsPerSelection: 0, // Placeholder
            exhaustionRate: exhaustionRate
        }
    };
};

/**
 * 🆕 NUEVA FUNCIÓN: Selección exhaustiva e inteligente de palabras
 */
export const selectLexiconWord = (
    selectedCats: string[], 
    history: GameState['history'],
    settings?: {
        repetitionAvoidance?: 'none' | 'soft' | 'medium' | 'hard';
        rareBoost?: boolean;
        rotationMode?: boolean; // v12.3 New
        favorites?: string[]; // v12.4 New
        explorerMode?: boolean; // v12.4 New
    }
): LexiconSelection & { updatedHistory: GameState['history'], telemetry: CategorySelectionTelemetry } => {
    const allCategories = Object.keys(CATEGORIES_DATA);
    let activePoolCategories: string[] = [];
    let updatedHistory = { ...history };
    let chosenCategoryName = "";
    let selectionReason = "standard_weighted";

    // Determinar pool de categorías activas inicial (antes de filtros)
    const isSingleMode = selectedCats.length === 1;
    const isOmniscientMode = selectedCats.length === 0 || selectedCats.length === allCategories.length;
    const initialPool = (selectedCats.length > 0 ? selectedCats : allCategories);

    // ✨ NUEVO: Filtro Blacklist Temporal
    // Eliminar categorías que tienen rondas pendientes en el blacklist
    const blacklist = history.temporaryBlacklist || {};
    const filteredByBlacklist = initialPool.filter(cat => {
        return !blacklist[cat] || blacklist[cat] <= 0;
    });
    
    // Si la blacklist elimina todo, ignorarla
    const workingPool = filteredByBlacklist.length > 0 ? filteredByBlacklist : initialPool;

    // --- 0. ROTATION MODE OVERRIDE ---
    if (settings?.rotationMode && selectedCats.length > 0) {
        // En modo rotación, ignoramos el filtrado inteligente y usamos el orden estricto
        const index = history.rotationIndex || 0;
        // Solo rotamos sobre el pool válido (filtrado por blacklist si aplica)
        chosenCategoryName = workingPool[index % workingPool.length];
        
        // Update Rotation Index for next time
        updatedHistory.rotationIndex = index + 1;
        selectionReason = "rotation_mode";
        
        // Mock weights for telemetry
        activePoolCategories = workingPool;
    } else if (settings?.explorerMode) {
        // --- 0.5. EXPLORER MODE OVERRIDE (Baraja de Cartas) ---
        // Garantiza que todo salga una vez antes de repetir
        
        const deck = history.explorerDeck || [];
        
        // Candidatos = Pool actual MENOS los ya jugados
        let candidates = workingPool.filter(cat => !deck.includes(cat));
        
        // Si no quedan candidatos (se completó el ciclo), reiniciar deck
        if (candidates.length === 0) {
            candidates = workingPool;
            updatedHistory.explorerDeck = []; // Reset deck
            selectionReason = "explorer_mode_reset";
        } else {
            selectionReason = "explorer_mode";
        }
        
        activePoolCategories = candidates;
        
        // En Explorer Mode, la selección suele ser uniforme entre los restantes para máxima variedad,
        // pero podemos aplicar un peso ligero por favoritos si se desea.
        // Por simplicidad, usaremos la lógica de pesos estándar pero restringida a este pool reducido.
        
    } else {
        // --- 1. FILTRADO ESTÁNDAR (Pool Definition) ---
        if (isSingleMode) {
            activePoolCategories = workingPool;
            selectionReason = "single_selection";
        } else if (isOmniscientMode) {
            // En modo Omnisciente, usamos cooldown dinámico basado en tamaño total
            activePoolCategories = applyDynamicCooldown(workingPool, history);
        } else {
            // En modo Selección Manual, usamos el filtro configurado o dinámico
            const avoidance = settings?.repetitionAvoidance || 'medium';
            activePoolCategories = applyAntiRepetitionFilter(
                workingPool,
                history,
                avoidance
            );
            // Fallback: Si el filtro es muy agresivo para el pool pequeño, usar dinámico
            if (activePoolCategories.length === 0) {
                 activePoolCategories = applyDynamicCooldown(workingPool, history);
                 selectionReason = "fallback_dynamic";
            }
        }
    }

    // --- 2. CÁLCULO DE PESOS (Smart Weighing) ---
    // Only calculate if not already chosen by Rotation Mode
    let weights: CategoryWeight[] = [];
    
    if (!chosenCategoryName) {
        weights = calculateCategoryWeights(activePoolCategories, history);

        // --- 3. BONUS POR DIVERSIDAD TEMÁTICA ---
        weights = applyAffinityDiversityBonus(weights, history);

        // --- 4. BONUS POR RAREZA (Opcional) ---
        if (settings?.rareBoost) {
            weights = applyRareCategoryBoost(weights);
        }
        
        // ✨ NUEVO: 5. BONUS POR FAVORITOS (2x) ---
        if (settings?.favorites && settings.favorites.length > 0) {
            weights = applyFavoritesBoost(weights, settings.favorites);
        }

        // --- 6. SELECCIÓN FINAL DE CATEGORÍA ---
        chosenCategoryName = selectWeightedCategory(weights);
    } else {
        // If rotation mode selected it, just create dummy weights for telemetry
        weights = [{ name: chosenCategoryName, weight: 100, timesUsed: 0 }];
    }
    
    // ✨ NUEVO: Actualizar Explorer Deck
    if (settings?.explorerMode) {
        updatedHistory.explorerDeck = [...(updatedHistory.explorerDeck || []), chosenCategoryName];
    }
    
    // --- TELEMETRY GENERATION ---
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    const telemetry: CategorySelectionTelemetry = {
        candidateCategories: activePoolCategories,
        weights: Object.fromEntries(weights.map(w => [w.name, w.weight])),
        finalProbabilities: Object.fromEntries(
            weights.map(w => [w.name, totalWeight > 0 ? (w.weight / totalWeight) * 100 : 0])
        ),
        selectionReason: selectionReason
    };
    
    // --- LÓGICA DE PALABRAS (WORD EXHAUSTION) ---
    const categoryWords = CATEGORIES_DATA[chosenCategoryName] || [];
    
    // 🆕 Inicializar tracking si no existe
    if (!updatedHistory.categoryExhaustion) {
        updatedHistory.categoryExhaustion = {};
    }
    
    // ✅ Validar y sincronizar
    updatedHistory.categoryExhaustion[chosenCategoryName] = 
        validateAndSyncCategoryExhaustion(chosenCategoryName, updatedHistory);

    // 🆕 Verificar si necesita reset (100% or >95% exhausted)
    if (shouldResetCategory(chosenCategoryName, updatedHistory)) {
        updatedHistory.categoryExhaustion[chosenCategoryName] = 
            resetCategoryPool(chosenCategoryName, updatedHistory);
    }

    const exhaustion = updatedHistory.categoryExhaustion[chosenCategoryName];
    
    // 🆕 LÓGICA EXHAUSTIVA: Solo palabras NO usadas
    const availableWords = categoryWords.filter(w => 
        !exhaustion.usedWords.includes(w.civ)
    );

    // Fallback: Si no hay palabras disponibles (error de lógica), resetear
    if (availableWords.length === 0) {
        updatedHistory.categoryExhaustion[chosenCategoryName] = 
            resetCategoryPool(chosenCategoryName, updatedHistory);
        
        // Reintentar recursivamente con pool limpio (ojo con stack overflow si bug grave)
        // Simplificación: Elegir aleatoria del pool completo
        const randomFallback = categoryWords[Math.floor(Math.random() * categoryWords.length)];
        
        // Update stats anyway
        updatedHistory.categoryUsageStats = updateCategoryStats(
            chosenCategoryName,
            updatedHistory.roundCounter + 1,
            updatedHistory
        );

        return { 
            categoryName: chosenCategoryName, 
            wordPair: randomFallback,
            updatedHistory: updatedHistory,
            telemetry: telemetry
        };
    }

    // 🆕 Aplicar peso SECUNDARIO basado en globalWordUsage (entre palabras no usadas)
    const weightedPool = availableWords.map(w => {
        const globalUsage = updatedHistory.globalWordUsage[w.civ] || 0;
        // Palabras menos usadas históricamente tienen más peso
        const weight = 1 / (globalUsage + 1);
        return { word: w, weight };
    });

    // Selección ponderada de palabra
    const totalWordWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
    let randomTicket = Math.random() * totalWordWeight;
    let selectedPair: CategoryData = weightedPool[0].word;

    for (const item of weightedPool) {
        randomTicket -= item.weight;
        if (randomTicket <= 0) {
            selectedPair = item.word;
            break;
        }
    }

    // 🆕 Marcar palabra como usada
    updatedHistory.categoryExhaustion[chosenCategoryName].usedWords.push(selectedPair.civ);

    // 🆕 Actualizar estadísticas de uso de categoría
    updatedHistory.categoryUsageStats = updateCategoryStats(
        chosenCategoryName,
        updatedHistory.roundCounter + 1,
        updatedHistory
    );

    return { 
        categoryName: chosenCategoryName, 
        wordPair: selectedPair,
        updatedHistory: updatedHistory,
        telemetry: telemetry
    };
};

export const generateSmartHint = (pair: CategoryData): string => {
    if (pair.hints && pair.hints.length > 0) {
        const randomIndex = Math.floor(Math.random() * pair.hints.length);
        return pair.hints[randomIndex];
    }
    return pair.hint || "Sin Pista";
};

export const generateVanguardHints = (pair: CategoryData): string => {
    let hintsToUse = pair.hints || [];
    if (hintsToUse.length < 2) {
        hintsToUse = [...hintsToUse, pair.hint || "Sin Pista", "RUIDO"];
    }
    
    const shuffled = shuffleArray(hintsToUse);
    const selected = shuffled.slice(0, 2);
    
    return `PISTAS: ${selected[0]} | ${selected[1]}`;
};