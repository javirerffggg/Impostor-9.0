export const PLAYER_AVATAR_COLORS = [
    { bg: '#3b82f6', text: '#ffffff' }, // Blue
    { bg: '#ef4444', text: '#ffffff' }, // Red
    { bg: '#10b981', text: '#ffffff' }, // Green
    { bg: '#f59e0b', text: '#ffffff' }, // Amber
    { bg: '#8b5cf6', text: '#ffffff' }, // Violet
    { bg: '#ec4899', text: '#ffffff' }, // Pink
    { bg: '#06b6d4', text: '#ffffff' }, // Cyan
    { bg: '#f97316', text: '#ffffff' }, // Orange
    { bg: '#84cc16', text: '#ffffff' }, // Lime
    { bg: '#6366f1', text: '#ffffff' }, // Indigo
    { bg: '#d946ef', text: '#ffffff' }, // Fuchsia
    { bg: '#14b8a6', text: '#ffffff' }, // Teal
];

export const getPlayerColor = (index: number) => {
    return PLAYER_AVATAR_COLORS[index % PLAYER_AVATAR_COLORS.length];
};

export const getPlayerInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};