
import { CategoryData } from './types';
import { CUSTOM_CATEGORIES_PART_1 } from './customCategoriesPart1';
import { CUSTOM_CATEGORIES_PART_2 } from './customCategoriesPart2';
import { CUSTOM_CATEGORIES_PART_3 } from './customCategoriesPart3';
import { CUSTOM_CATEGORIES_PART_4 } from './customCategoriesPart4';
import { CUSTOM_CATEGORIES_PART_5 } from './customCategoriesPart5';
import { CUSTOM_CATEGORIES_PART_6 } from './customCategoriesPart6';
import { CUSTOM_CATEGORIES_PART_7 } from './customCategoriesPart7';

/**
 * ARCHIVO DE EXTENSIÓN DE CATEGORÍAS
 * -----------------------------------
 * Integra todas las partes de categorías personalizadas.
 */

export const CUSTOM_CATEGORIES: Record<string, CategoryData[]> = {
    ...CUSTOM_CATEGORIES_PART_1,
    ...CUSTOM_CATEGORIES_PART_2,
    ...CUSTOM_CATEGORIES_PART_3,
    ...CUSTOM_CATEGORIES_PART_4,
    ...CUSTOM_CATEGORIES_PART_5,
    ...CUSTOM_CATEGORIES_PART_6,
    ...CUSTOM_CATEGORIES_PART_7
};
