import { CATEGORIES_DATA } from '../categories';
import { MemoryDifficulty } from '../types';

export interface MemoryWordSet {
    displayWords: string[];
    correctIndex: number; // -1 for impostors
}

const shuffleArray = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const generateMemoryWords = (
    category: string,
    realWord: string,
    isImpostor: boolean,
    difficulty: MemoryDifficulty,
    wordCount: number
): MemoryWordSet => {
    const categoryItems = CATEGORIES_DATA[category] || [];
    // Extract all civilian words from the category
    const allWords = categoryItems.map(item => item.civ);
    
    // Remove the real word from the pool of potential distractors
    const availableDistractors = allWords.filter(w => w !== realWord);
    
    // Ensure we have enough distractors
    // If not enough words in category, we might duplicate some or pull from related (simplification: duplicate)
    let pool = [...availableDistractors];
    while (pool.length < wordCount) {
        pool = [...pool, ...availableDistractors];
    }
    
    const shuffledPool = shuffleArray(pool);
    
    if (!isImpostor) {
        // CIVILIAN LOGIC: 1 Correct + (N-1) Distractors
        const distractors = shuffledPool.slice(0, wordCount - 1);
        const finalSet = [...distractors];
        
        // Insert real word at random position
        const correctIndex = Math.floor(Math.random() * wordCount);
        finalSet.splice(correctIndex, 0, realWord);
        
        return {
            displayWords: finalSet,
            correctIndex: correctIndex
        };
    } else {
        // IMPOSTOR LOGIC: N Distractors (None are correct)
        const distractors = shuffledPool.slice(0, wordCount);
        return {
            displayWords: distractors,
            correctIndex: -1
        };
    }
};

export const getMemoryConfigForDifficulty = (difficulty: MemoryDifficulty) => {
    switch (difficulty) {
        case 'easy':
            return { displayTime: 15, wordCount: 3, highlightIntensity: 0.9 };
        case 'normal':
            return { displayTime: 10, wordCount: 5, highlightIntensity: 0.5 };
        case 'hard':
            return { displayTime: 7, wordCount: 5, highlightIntensity: 0.2 };
        case 'extreme':
            return { displayTime: 5, wordCount: 7, highlightIntensity: 0 }; // 0 means no hint
        default:
            return { displayTime: 10, wordCount: 5, highlightIntensity: 0.5 };
    }
};