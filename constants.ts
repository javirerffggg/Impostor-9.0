
import { ThemeConfig, ThemeName, CuratedCollection } from './types';

export const GAME_LIMITS = {
    MIN_PLAYERS: 3,
    MAX_PLAYERS: 20,
    RECOMMENDED_MIN: 4,
    RECOMMENDED_MAX: 10,
    MIN_IMPOSTORS: 1,
    MAX_IMPOSTORS: 5
} as const;

export const THEMES: Record<ThemeName, ThemeConfig> = {
    aura: {
        name: "Aura Premium",
        bg: "#020202", // OLED Pure Black
        cardBg: "rgba(255, 255, 255, 0.03)", // Ultra subtle glass
        accent: "#00D1FF", // Azul Eléctrico (Primary Aura)
        text: "#FFFFFF",
        sub: "#9CA3AF", // Cool Gray
        radius: "1.5rem",
        font: "'Inter', sans-serif", // Tech Sans-Serif
        border: "rgba(255, 255, 255, 0.15)", // Base border
        particleType: 'aura'
    },
    luminous: {
        name: "Luminous Premium",
        bg: "#F8FAFC", // Slate 50 (Pure White feel)
        cardBg: "rgba(255, 255, 255, 0.6)", // High opacity frosted glass
        accent: "#F59E0B", // Golden Amber
        text: "#1E293B", // Slate 800
        sub: "#64748B", // Slate 500
        radius: "1.5rem",
        font: "'Inter', sans-serif",
        border: "rgba(0, 0, 0, 0.05)",
        particleType: 'aura'
    },
    silk_soul: {
        name: "Alma de Seda",
        bg: "linear-gradient(135deg, #FAFAFA 0%, #F5F3F0 25%, #EEEBE7 50%, #F8F6F3 75%, #FFFFFF 100%)",
        cardBg: "rgba(255, 255, 255, 0.65)",
        accent: "#D4C5B9",
        text: "#2C2C2C",
        sub: "#6B6B6B",
        radius: "36px",
        font: "'Cormorant Garamond', serif",
        border: "1px solid rgba(212, 197, 185, 0.3)",
        blur: "28px",
        shadow: "0 20px 60px rgba(44, 44, 44, 0.08), 0 8px 24px rgba(212, 197, 185, 0.12)",
        particleType: 'silk',
        particleColor: "rgba(212, 197, 185, 0.15)",
        particleCount: 35,
        particleSpeed: 0.3
    },
    nebula_dream: {
        name: "Nebulosa de Ensueño",
        bg: "radial-gradient(ellipse at top left, #E8D5F2 0%, #F5E6FF 20%, #FFE5EC 40%, #FFF0E5 60%, #E5F5FF 80%, #F0E5FF 100%)",
        cardBg: "rgba(245, 230, 255, 0.55)",
        accent: "#C9A0DC",
        text: "#5A4A6B",
        sub: "#9B8AAC",
        radius: "40px",
        font: "'Outfit', sans-serif",
        border: "1.5px solid rgba(201, 160, 220, 0.35)",
        blur: "32px",
        shadow: "0 24px 72px rgba(201, 160, 220, 0.25), 0 0 40px rgba(255, 229, 236, 0.3)",
        particleType: 'stardust',
        particleColor: ["rgba(201, 160, 220, 0.4)", "rgba(255, 192, 203, 0.3)", "rgba(173, 216, 230, 0.35)"],
        particleCount: 60,
        particleSpeed: 0.5
    },
    crystal_garden: {
        name: "Jardín de Cristal",
        bg: "linear-gradient(160deg, #0A3D2E 0%, #1A5D4A 25%, #2A7D6A 50%, #3A9D8A 75%, #E8F5F1 100%)",
        cardBg: "rgba(232, 245, 241, 0.58)",
        accent: "#A7F3D0",
        text: "#064E3B",
        sub: "#047857",
        radius: "34px",
        font: "'DM Serif Display', serif",
        border: "2px solid rgba(167, 243, 208, 0.4)",
        blur: "30px",
        shadow: "0 18px 56px rgba(10, 61, 46, 0.3), inset 0 1px 2px rgba(167, 243, 208, 0.2)",
        particleType: 'foliage',
        particleColor: "rgba(167, 243, 208, 0.25)",
        particleCount: 45,
        particleSpeed: 0.4
    },
    aurora_borealis: {
        name: "Aurora Boreal",
        bg: "linear-gradient(180deg, #0B1A2E 0%, #1A2F4E 20%, #2A4A7E 40%, #3A6AAE 60%, #5A8ACE 80%, #7AAAEE 100%)",
        cardBg: "rgba(42, 74, 126, 0.48)",
        accent: "#8B5CF6",
        text: "#E0F2FE",
        sub: "#BAE6FD",
        radius: "38px",
        font: "'Space Grotesk', sans-serif",
        border: "1px solid rgba(139, 92, 246, 0.5)",
        blur: "34px",
        shadow: "0 0 60px rgba(139, 92, 246, 0.4), 0 20px 40px rgba(11, 26, 46, 0.6)",
        particleType: 'aurora',
        particleColor: ["rgba(139, 92, 246, 0.6)", "rgba(96, 165, 250, 0.5)", "rgba(34, 211, 238, 0.45)"],
        particleCount: 25,
        particleSpeed: 0.7,
        pulseInterval: 3000
    },
    liquid_gold: {
        name: "Oro Líquido",
        bg: "radial-gradient(circle at center, #1A1A1A 0%, #0F0F0F 50%, #000000 100%)",
        cardBg: "rgba(26, 26, 26, 0.75)",
        accent: "#D4AF37",
        text: "#F5E6D3",
        sub: "#C9A87C",
        radius: "32px",
        font: "'Playfair Display', serif",
        border: "1.5px solid rgba(212, 175, 55, 0.5)",
        blur: "24px",
        shadow: "0 28px 80px rgba(212, 175, 55, 0.3), 0 12px 32px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(212, 175, 55, 0.15)",
        particleType: 'goldleaf',
        particleColor: "rgba(212, 175, 55, 0.5)",
        particleCount: 30,
        particleSpeed: 0.6
    },
    luminescent_ocean: {
        name: "Océano Luminiscente",
        bg: "linear-gradient(165deg, #001B3D 0%, #003666 30%, #005B99 60%, #00A5CF 90%, #00D4FF 100%)",
        cardBg: "rgba(0, 89, 153, 0.52)",
        accent: "#00FFFF",
        text: "#E0F7FF",
        sub: "#7DD3FC",
        radius: "36px",
        font: "'Inter', sans-serif",
        border: "2px solid rgba(0, 255, 255, 0.4)",
        blur: "36px",
        shadow: "0 0 50px rgba(0, 255, 255, 0.4), 0 22px 64px rgba(0, 27, 61, 0.7)",
        particleType: 'plankton',
        particleColor: "rgba(0, 255, 255, 0.5)",
        particleCount: 50,
        particleSpeed: 0.5
    },
    zen_sunset: {
        name: "Atardecer Zen",
        bg: "linear-gradient(180deg, #2D1B3D 0%, #5A3A5E 20%, #8A5A7E 40%, #BA7A9E 60%, #EA9ABE 80%, #FFBADD 100%)",
        cardBg: "rgba(138, 90, 126, 0.6)",
        accent: "#FF6B9D",
        text: "#FFF5F7",
        sub: "#FFD4E5",
        radius: "40px",
        font: "'Lora', serif",
        border: "1.5px solid rgba(255, 107, 157, 0.45)",
        blur: "28px",
        shadow: "0 20px 60px rgba(255, 107, 157, 0.35), 0 8px 24px rgba(45, 27, 61, 0.5)",
        particleType: 'ember',
        particleColor: ["rgba(255, 107, 157, 0.4)", "rgba(234, 154, 190, 0.35)", "rgba(255, 186, 221, 0.3)"],
        particleCount: 40,
        particleSpeed: 0.35
    },
    midnight: { 
        name: "Midnight", 
        bg: "#050508", 
        cardBg: "rgba(18, 18, 26, 0.7)", 
        accent: "#6366f1", 
        text: "#ffffff", 
        sub: "#94a3b8", 
        radius: "0rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(255,255,255,0.1)",
        particleType: 'circle'
    },
    bond: { 
        name: "007 Protocol", 
        bg: "#0a0a0a", 
        cardBg: "rgba(20, 20, 20, 0.8)", 
        accent: "#dc2626", 
        text: "#e5e5e5", 
        sub: "#525252", 
        radius: "0rem", 
        font: "'Playfair Display', serif", 
        border: "rgba(220,38,38,0.3)",
        particleType: 'circle'
    },
    turing: { 
        name: "Turing", 
        bg: "#050505", 
        cardBg: "rgba(15, 15, 15, 0.9)", 
        accent: "#22c55e", 
        text: "#22c55e", 
        sub: "#14532d", 
        radius: "0rem", 
        font: "'JetBrains Mono', monospace", 
        border: "rgba(34,197,94,0.4)",
        particleType: 'binary'
    },
    solar: { 
        name: "Solar", 
        bg: "#fffdf0", 
        cardBg: "rgba(255, 255, 255, 0.6)", 
        accent: "#d97706", 
        text: "#451a03", 
        sub: "#92400e", 
        radius: "3rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(217,119,6,0.15)",
        particleType: 'circle'
    },
    illojuan: { 
        name: "Andaluz", 
        bg: "#f0fdf4", 
        cardBg: "rgba(255, 255, 255, 0.7)", 
        accent: "#16a34a", 
        text: "#14532d", 
        sub: "#166534", 
        radius: "2rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(22,163,74,0.2)",
        particleType: 'circle'
    },
    obsidian: { 
        name: "Obsidian", 
        bg: "#080706", 
        cardBg: "rgba(18, 17, 15, 0.8)", 
        accent: "#f59e0b", 
        text: "#ffffff", 
        sub: "#a8a29e", 
        radius: "1.5rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(245,158,11,0.2)",
        particleType: 'circle'
    },
    cyber: { 
        name: "Night City", 
        bg: "#020205", 
        cardBg: "rgba(10, 10, 25, 0.7)", 
        accent: "#00ff9f", // Verde Neón
        text: "#fcee0a", // Amarillo Cyber
        sub: "#ff003c", // Rojo Magenta
        radius: "1rem", 
        font: "'JetBrains Mono', monospace", 
        border: "rgba(0, 255, 159, 0.4)",
        particleType: 'rain'
    },
    material: { 
        name: "Material You", 
        bg: "#f7f2fa", 
        cardBg: "rgba(234, 221, 255, 0.5)", 
        accent: "#6750a4", 
        text: "#1d1b20", 
        sub: "#49454f", 
        radius: "2.5rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(103, 80, 164, 0.15)",
        particleType: 'circle'
    },
    zenith: { 
        name: "Zenith Glass", 
        bg: "#020617", 
        cardBg: "rgba(30, 41, 59, 0.5)", 
        accent: "#38bdf8", 
        text: "#f8fafc", 
        sub: "#94a3b8", 
        radius: "2.5rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(56, 189, 248, 0.2)",
        particleType: 'circle'
    },
    protocol: { 
        name: "Crimson Protocol", 
        bg: "#0a0000", 
        cardBg: "rgba(20, 0, 0, 0.8)", 
        accent: "#ff0000", 
        text: "#ffcccc", 
        sub: "#660000", 
        radius: "0rem", 
        font: "'JetBrains Mono', monospace", 
        border: "rgba(255, 0, 0, 0.4)",
        particleType: 'rain'
    },
    ethereal: { 
        name: "Ethereal Gold", 
        bg: "#0f1115", 
        cardBg: "rgba(28, 30, 35, 0.6)", 
        accent: "#fbbf24", 
        text: "#ffffff", 
        sub: "#71717a", 
        radius: "1rem", 
        font: "'Playfair Display', serif", 
        border: "rgba(251, 191, 36, 0.15)",
        particleType: 'circle'
    },
    terminal84: { 
        name: "Terminal 1984", 
        bg: "#0d0d0d", 
        cardBg: "rgba(0, 20, 0, 0.9)", 
        accent: "#00ff41", 
        text: "#00ff41", 
        sub: "#003b00", 
        radius: "0rem", 
        font: "'JetBrains Mono', monospace", 
        border: "rgba(0, 255, 65, 0.5)",
        particleType: 'binary'
    },
    soft: { 
        name: "Neumorphic Soft", 
        bg: "#e0e5ec", 
        cardBg: "rgba(224, 229, 236, 0.6)", 
        accent: "#a3b1c6", 
        text: "#44475a", 
        sub: "#71717a", 
        radius: "3rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(255, 255, 255, 0.8)",
        particleType: 'circle'
    },
    noir: { 
        name: "Noir Detective", 
        bg: "#1a1a1a", 
        cardBg: "rgba(35, 35, 35, 0.8)", 
        accent: "#e5e5e5", 
        text: "#ffffff", 
        sub: "#525252", 
        radius: "0.25rem", 
        font: "'Playfair Display', serif", 
        border: "rgba(255, 255, 255, 0.1)",
        particleType: 'circle'
    },
    paper: { 
        name: "Expediente 1950", 
        bg: "#f2e8cf", // Color hueso/papel antiguo
        cardBg: "rgba(255, 255, 255, 0.4)", 
        accent: "#386641", // Verde militar oscuro
        text: "#1a1a1a", 
        sub: "#6a6a6a", 
        radius: "0.25rem", 
        font: "'Playfair Display', serif", 
        border: "rgba(0, 0, 0, 0.1)",
        particleType: 'circle'
    },
    space: { 
        name: "Deep Space", 
        bg: "#000000", 
        cardBg: "rgba(255, 255, 255, 0.05)", 
        accent: "#ffffff", 
        text: "#ffffff", 
        sub: "#4b5563", 
        radius: "3rem", 
        font: "'Inter', sans-serif", 
        border: "rgba(255, 255, 255, 0.2)",
        particleType: 'circle'
    },
    nightclub: {
        name: "Nightclub",
        bg: "#1a0033",
        cardBg: "rgba(26, 0, 51, 0.85)",
        accent: "#ff00ff", // Neon Fuchsia
        text: "#00ffff", // Cyan
        sub: "#d1d5db",
        radius: "1.5rem",
        font: "'Inter', sans-serif",
        border: "rgba(255, 0, 255, 0.5)",
        particleType: 'circle'
    }
};

export const getTheme = (name: ThemeName): ThemeConfig => {
    const theme = THEMES[name];
    if (!theme) return THEMES['luminous']; // Fallback
    
    // Ensure critical properties exist with fallbacks
    return {
        ...theme,
        cardBg: theme.cardBg || theme.bg,
        border: theme.border || 'rgba(255,255,255,0.1)',
        shadow: theme.shadow || 'none'
    };
};

export const PARTY_PROMPTS = {
    setup: [
        "¡Somos una multitud! {RANDOM_PLAYER}, bebe un trago para celebrar la reunión.",
        "Batería al {BATTERY}%. Si tienes menos energía que el móvil, bebe un trago.",
        "¡{PLAYER_1}, por ser el primero en la lista, bebe un trago!",
        "{PLAYER_NAME_LONGEST}, tu nombre es tan largo como tu sed. ¡Bebe un trago!",
        "Son más de las {TIME}. Todos los que tengan sueño, beben un trago.",
    ],
    revealing: [
        "Móvil entregado. {CURRENT_PLAYER}, si el que te ha pasado el móvil ha sonreído, bebe un trago.",
        "¡STOP! Antes de pasar el móvil, el último en decir 'Impostor' bebe un trago.",
        "Ve con cuidado. Si al ver tu carta has hecho una mueca, bebe un trago disimuladamente.",
        "¡Atención! {CURRENT_PLAYER}, si llevas algo rojo, bebe un trago antes de pasar el móvil.",
    ],
    discussion: [
        "{RANDOM_PLAYER}, sospecho de ti. Bebe un trago y sigue defendiéndote.",
        "¡Brindis! Todos los que crean que {RANDOM_PLAYER} es el impostor, beben un trago.",
        "Si {RANDOM_PLAYER} y {RANDOM_PLAYER} no se han mirado a los ojos en esta ronda, beben un trago.",
        "El jugador que lleve más tiempo sin ser Impostor, bebe un trago.",
        "Cualquier jugador que lleve zapatillas blancas, bebe un trago.",
        "El jugador que esté sentado a la derecha del dueño del móvil, bebe un trago.",
        "El jugador que haya enviado el último WhatsApp del grupo, bebe un trago.",
        "Si has dicho la palabra 'literal' o 'en plan' hoy, bebe un trago.",
    ],
    results: {
        impostorWin: "¡Infiltración total! El Impostor se ha reído en vuestra cara. Todos los civiles beben un trago.",
        civilWin: "Cazado. {IMPOSTOR}, tu cara te ha delatado. Bebe un trago de la derrota.",
        troll: "¡TRAICIÓN! Todos erais impostores. ¡Nadie es inocente, todos beben un trago!",
    }
};

export const DRINKING_PROMPTS = PARTY_PROMPTS.discussion; // Keep compatibility for now

export const DEFAULT_PLAYERS = ["Agente 1", "Agente 2", "Agente 3", "Agente 4"];

export const PLAYER_COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#d946ef", // Fuchsia
    "#14b8a6", // Teal
];

export const CURATED_COLLECTIONS: CuratedCollection[] = [
    {
        id: "impostor_original",
        name: "Impostor Original",
        description: "La experiencia esencial. Todas las categorías clásicas del juego.",
        vibe: "Variado, completo, desafiante.",
        icon: "Book",
        categories: [
            "Objetos cotidianos", "Personas famosas", "Comidas y bebidas", "Animales", 
            "Marcas y logotipos", "Colores y formas", "Países y ciudades", "Emociones y sentimientos", 
            "Aficiones y actividades", "Cultura de internet", "Cocina y gastronomía", 
            "Películas y series", "Música y bandas", "Profesiones", "Escuela y educación", 
            "Ciencia y tecnología", "Deportes", "Superhéroes", "Transporte", 
            "Videojuegos", "Clima y naturaleza"
        ]
    },
    {
        id: "spain",
        name: "Sabor de España",
        description: "Gastronomía y tradiciones locales.",
        vibe: "Cálido, tradicional, ideal para cenas.",
        icon: "Utensils",
        categories: ["Gastronomía Regional", "Cocina y Gastronomía", "Comidas y Bebidas", "Fiestas Populares"]
    },
    {
        id: "digital",
        name: "Invasión Digital",
        description: "Tecnología, internet y el mundo gaming.",
        vibe: "Moderno, frenético, para nativos digitales.",
        icon: "Zap",
        categories: ["Cultura de Internet", "Ciencia y Tecnología", "Tecnología del Mañana", "Mundo Gamer", "Videojuegos"]
    },
    {
        id: "redcarpet",
        name: "Alfombra Roja",
        description: "Famosos, pop, cine y series.",
        vibe: "Glamuroso, ruidoso, cultura popular.",
        icon: "Clapperboard",
        categories: ["Personas Famosas", "Iconos del Pop", "Películas y Series", "Series de Éxito", "Cine de Terror"]
    },
    {
        id: "global",
        name: "Aventura Global",
        description: "Viajes, países y monumentos.",
        vibe: "Aventurero, visual, transporta al grupo.",
        icon: "Compass",
        categories: ["Países y Ciudades", "Islas del Archipiélago", "Monumentos Nacionales", "Transporte"]
    },
    {
        id: "geek",
        name: "Mundo Geek",
        description: "Fantasía, nostalgia y héroes.",
        vibe: "Épico, nostálgico, referencias clásicas.",
        icon: "Gamepad2",
        categories: ["Superhéroes", "Universo Marvel/DC", "Dibujos Animados Retro", "Mitología Griega"]
    },
    {
        id: "lifestyle",
        name: "Lifestyle Premium",
        description: "Moda, lujo y vida nocturna.",
        vibe: "Elegante, exclusivo, perfecto para fiestas.",
        icon: "Diamond",
        categories: ["Marcas y Logotipos", "Moda (Inditex)", "Transporte de Lujo", "Vida Nocturna"]
    },
    {
        id: "academic",
        name: "El Taller del Sabio",
        description: "Academia, ciencia y filosofía.",
        vibe: "Intelectual, analítico, léxico preciso.",
        icon: "Book",
        categories: ["Escuela y Educación", "Filosofía", "Elementos Químicos", "Astronomía", "Cuerpo Humano (Órganos)"]
    },
    {
        id: "nature",
        name: "Esencia Natural",
        description: "Vida salvaje y entorno natural.",
        vibe: "Orgánico, salvaje, mundo físico.",
        icon: "Leaf",
        categories: ["Animales", "Clima y Naturaleza", "Clima Extremo"]
    },
    {
        id: "mind",
        name: "Mente y Alma",
        description: "Psicología, emociones y zodiaco.",
        vibe: "Introspectivo, abstracto, dificultad alta.",
        icon: "Brain",
        categories: ["Emociones y Sentimientos", "Emociones Complejas", "Filosofía", "Zodiaco"]
    },
    {
        id: "sports",
        name: "Arena Deportiva",
        description: "Competición y actividades físicas.",
        vibe: "Energético, dinámico, léxico deportivo.",
        icon: "Trophy",
        categories: ["Deportes", "Deportes de Raqueta", "Aficiones y Actividades"]
    },
    {
        id: "daily",
        name: "Vida Cotidiana",
        description: "Hogar, rutina y objetos comunes.",
        vibe: "Familiar, cercano, para principiantes.",
        icon: "Home",
        categories: ["Objetos Cotidianos", "Electrodomésticos Pequeños", "Papelería y Oficina", "Supermercados Locales"]
    }
];