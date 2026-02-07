
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

export const selectLexiconWord = (
    selectedCats: string[], 
    history: GameState['history']
): LexiconSelection => {
    const allCategories = Object.keys(CATEGORIES_DATA);
    let activePoolCategories: string[] = [];

    const isSingleMode = selectedCats.length === 1;
    const isOmniscientMode = selectedCats.length === 0 || selectedCats.length === allCategories.length;

    if (isSingleMode) {
        activePoolCategories = selectedCats;
    } else if (isOmniscientMode) {
        activePoolCategories = allCategories.filter(cat => !history.lastCategories.includes(cat));
        if (activePoolCategories.length === 0) activePoolCategories = allCategories;
    } else {
        activePoolCategories = selectedCats;
    }

    const chosenCategoryName = activePoolCategories[Math.floor(Math.random() * activePoolCategories.length)];
    const categoryWords = CATEGORIES_DATA[chosenCategoryName];

    const validWords = categoryWords.filter(w => !history.lastWords.includes(w.civ));
    const poolToWeight = validWords.length > 0 ? validWords : categoryWords;

    const weightedPool = poolToWeight.map(w => {
        const usage = history.globalWordUsage[w.civ] || 0;
        const weight = 1 / (usage + 1);
        return { word: w, weight };
    });

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

    return { categoryName: chosenCategoryName, wordPair: selectedPair };
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
