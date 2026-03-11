import { ThemeName } from '../../types';

export type ThemeCategory = 'exclusivo' | 'sensorial' | 'oscuro' | 'vibrante' | 'retro';

export const THEME_CATEGORIES: Record<ThemeCategory, ThemeName[]> = {
    exclusivo: ['luminous', 'aura'],
    sensorial: ['silk_soul', 'nebula_dream', 'crystal_garden', 'aurora_borealis', 'liquid_gold', 'luminescent_ocean', 'zen_sunset'],
    oscuro: ['midnight', 'obsidian', 'space', 'zenith', 'bond', 'noir', 'protocol', 'ethereal'],
    vibrante: ['cyber', 'nightclub', 'solar', 'illojuan', 'material'],
    retro: ['terminal84', 'turing', 'paper', 'soft']
};

export const PREMIUM_THEMES: ThemeName[] = ['aura', 'luminous'];

export const DIFFICULTY_LABELS: Record<string, string> = {
    easy: 'Fácil',
    normal: 'Normal',
    hard: 'Difícil',
    extreme: 'Extr.'
};

export const REPETITION_LABELS: Record<string, string> = {
    none: 'Off',
    soft: 'Bajo',
    medium: 'Med',
    hard: 'Alto'
};

export const SENSITIVITY_LABELS: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
};

export const getThemeCategory = (name: ThemeName): ThemeCategory => {
    for (const [cat, themes] of Object.entries(THEME_CATEGORIES)) {
        if ((themes as ThemeName[]).includes(name)) return cat as ThemeCategory;
    }
    return 'sensorial';
};
