
import { CATEGORIES_DATA } from '../../categories';
import { CategoryData, GameState } from '../../types';
import { shuffleArray } from '../utils/helpers';

interface LexiconSelection {
    categoryName: string;
    wordPair: CategoryData;
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
    return exhaustion.usedWords.length >= totalAvailable;
};

/**
 * Resetea el pool de palabras usadas de una categoría
 */
const resetCategoryPool = (
    categoryName: string,
    history: GameState['history']
): GameState['history']['categoryExhaustion'][string] => {
    const existing = history.categoryExhaustion?.[categoryName];
    
    return {
        usedWords: [],
        totalWords: CATEGORIES_DATA[categoryName]?.length || 0,
        lastReset: Date.now(),
        cycleCount: (existing?.cycleCount || 0) + 1
    };
};

/**
 * 🆕 NUEVA FUNCIÓN: Selección exhaustiva de palabras
 * Solo repite palabras cuando se han jugado TODAS las de la categoría
 */
export const selectLexiconWord = (
    selectedCats: string[], 
    history: GameState['history']
): LexiconSelection & { updatedHistory: GameState['history'] } => {
    const allCategories = Object.keys(CATEGORIES_DATA);
    let activePoolCategories: string[] = [];

    // Determinar pool de categorías activas
    const isSingleMode = selectedCats.length === 1;
    const isOmniscientMode = selectedCats.length === 0 || selectedCats.length === allCategories.length;

    if (isSingleMode) {
        activePoolCategories = selectedCats;
    } else if (isOmniscientMode) {
        // Evitar categorías recientes, pero siempre tener al menos una opción
        activePoolCategories = allCategories.filter(cat => !history.lastCategories.includes(cat));
        if (activePoolCategories.length === 0) activePoolCategories = allCategories;
    } else {
        activePoolCategories = selectedCats;
    }

    // Seleccionar categoría aleatoria
    const chosenCategoryName = activePoolCategories[Math.floor(Math.random() * activePoolCategories.length)];
    const categoryWords = CATEGORIES_DATA[chosenCategoryName] || [];
    
    // 🆕 Inicializar tracking si no existe
    let updatedHistory = { ...history };
    if (!updatedHistory.categoryExhaustion) {
        updatedHistory.categoryExhaustion = {};
    }
    
    if (!updatedHistory.categoryExhaustion[chosenCategoryName]) {
        updatedHistory.categoryExhaustion[chosenCategoryName] = 
            initializeCategoryExhaustion(chosenCategoryName, updatedHistory);
    }

    // 🆕 Verificar si necesita reset
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
        
        // Reintentar con pool limpio
        return selectLexiconWord(selectedCats, updatedHistory);
    }

    // 🆕 Aplicar peso SECUNDARIO basado en globalWordUsage (entre palabras no usadas)
    const weightedPool = availableWords.map(w => {
        const globalUsage = updatedHistory.globalWordUsage[w.civ] || 0;
        // Palabras menos usadas históricamente tienen más peso
        const weight = 1 / (globalUsage + 1);
        return { word: w, weight };
    });

    // Selección ponderada
    const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
    let randomTicket = Math.random() * totalWeight;
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

    return { 
        categoryName: chosenCategoryName, 
        wordPair: selectedPair,
        updatedHistory: updatedHistory
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