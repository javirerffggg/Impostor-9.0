// Fix 11: colores de iconos del manual con mayor contraste
// Usamos colores saturados que funcionan tanto en temas oscuros como claros.
// En luminous (fondo claro) estos colores tienen suficiente contraste por ser saturados.
// Si en el futuro se necesita adaptación dinámica, pasar ThemeConfig aquí.
export const manualTheme = {
  icon: {
    intro:        '#6366f1', // indigo
    rules:        '#f59e0b', // amber
    examples:     '#10b981', // emerald
    roles:        '#3b82f6', // blue
    infinitum:    '#8b5cf6', // violet
    modes:        '#ec4899', // pink
    achievements: '#f97316', // orange
    categories:   '#14b8a6', // teal
    config:       '#64748b', // slate
    strategies:   '#eab308', // yellow
    troubleshoot: '#ef4444', // red
    faq:          '#06b6d4', // cyan
    changelog:    '#a78bfa', // purple
    dev:          '#84cc16', // lime
    secrets:      '#f43f5e', // rose
    glossary:     '#0ea5e9', // sky
  }
};
