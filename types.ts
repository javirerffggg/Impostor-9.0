

export interface SelectionTelemetry {
    playerId: string;
    playerName: string;
    baseWeight: number;
    paranoiaAdjustment: number;
    synergyPenalty: number;
    finalWeight: number;
    probabilityPercent: number;
}

export type RenunciaDecision = 'pending' | 'accept' | 'reject' | 'transfer';

export interface ThemeConfig {
    name: string;
    bg: string;
    cardBg: string;
    accent: string;
    text: string;
    sub: string;
    radius: string;
    font: string;
    border: string;
    particleType: 'aura' | 'silk' | 'stardust' | 'foliage' | 'aurora' | 'goldleaf' | 'plankton' | 'ember' | 'circle' | 'binary' | 'rain';
    blur?: string;
    shadow?: string;
    particleColor?: string | string[];
    particleCount?: number;
    particleSpeed?: number;
    pulseInterval?: number;
}

export type ThemeName = 'aura' | 'luminous' | 'silk_soul' | 'nebula_dream' | 'crystal_garden' | 'aurora_borealis' | 'liquid_gold' | 'luminescent_ocean' | 'zen_sunset' | 'midnight' | 'bond' | 'turing' | 'solar' | 'illojuan' | 'obsidian' | 'cyber' | 'material' | 'zenith' | 'protocol' | 'ethereal' | 'terminal84' | 'soft' | 'noir' | 'paper' | 'space' | 'nightclub';

export interface CuratedCollection {
    id: string;
    name: string;
    description: string;
    vibe: string;
    icon: string;
    categories: string[];
}

export interface Player {
    id: string;
    name: string;
}

export type SocialRole = 'civil' | 'bartender' | 'vip' | 'alguacil' | 'bufon';

export interface GamePlayer extends Player {
    role: 'Impostor' | 'Civil';
    word: string;
    realWord: string;
    isImp: boolean;
    category: string;
    areScore: number;
    impostorProbability: number;
    viewTime: number;
    isOracle?: boolean;
    isVanguardia?: boolean;
    oracleChosen?: boolean;
    oracleTriggered?: boolean;
    partyRole?: SocialRole;
    isArchitect?: boolean;
    isAlcalde?: boolean; // ✨ NUEVO: Protocolo Magistrado
    nexusPartners?: string[];
    isWitness?: boolean;
    hasRejectedImpRole?: boolean;
    wasTransferred?: boolean;
    // v9.0 Memory Mode
    memoryWords?: string[];
    memoryCorrectIndex?: number; // -1 for impostors
}

export type PartyIntensity = 'aperitivo' | 'hora_punta' | 'after_hours' | 'resaca';

export interface InfinityVault {
    uid: string;
    metrics: {
        totalSessions: number;
        impostorRatio: number;
        civilStreak: number;
        totalImpostorWins: number;
        quarantineRounds: number;
        // ✨ NUEVO: Stats Magistrado
        timesAsAlcalde?: number;
        alcaldeWinRate?: number;
    };
    categoryDNA: Record<string, { timesAsImpostor: number; lastTimeAsImpostor: number; affinityScore: number }>;
    sequenceAnalytics: {
        lastImpostorPartners: string[];
        roleSequence: boolean[];
        averageWaitTime: number;
    };
}

export interface CategoryData {
    civ: string;
    imp: string;
    hints?: string[];
    hint?: string;
}

export interface OracleSetupData {
    oraclePlayerId: string;
    availableHints: string[];
    civilWord: string;
}

export interface RenunciaData {
    candidatePlayerId: string;
    originalImpostorIds: string[];
    decision: RenunciaDecision;
    timestamp: number;
    witnessPlayerId?: string;
    transferredToId?: string;
    hasSeenInitialRole?: boolean;
}

// ✨ NUEVO: Datos de la sesión de Magistrado
export interface MagistradoData {
    alcaldePlayerId: string;
    alcaldePlayerName: string;
    sessionStartTime: number;
    telemetry?: {
        wasRevealed: boolean;
    };
}

export interface MatchLog {
    id: string;
    timestamp: number;
    round: number;
    category: string;
    word: string;
    impostors: string[]; // Names
    civilians: string[]; // Names
    isTroll: boolean;
    trollScenario: string | null;
    paranoiaLevel: number;
    breakProtocol: string | null;
    architect: string | null;
    oracle?: string | null; // v7.0
    leteoGrade?: 0 | 1 | 2 | 3; // v6.3 LETEO Protocol
    entropyLevel?: number;      // v6.3 LETEO Protocol
    telemetry?: SelectionTelemetry[]; // v6.4 Debugging
    affectsINFINITUM?: boolean; // v11.0: If false, stats are not updated (Troll events)
    // v12.0 RENUNCIA Logging
    renunciaTriggered?: boolean;      
    renunciaDecision?: RenunciaDecision; 
    renunciaWitness?: string;         
    
    // v12.1 RENUNCIA v2.0 Telemetry
    renunciaTelemetry?: {
        finalProbability: number;
        karmaBonus: number;
        sessionBonus: number;
        failureBonus: number;
        candidateStreak: number;
    };
    magistrado?: string; // Name of Alcalde
    
    // v12.3: Telemetría de Selección de Categoría
    categorySelectionTelemetry?: {
        candidateCategories: string[];
        weights: Record<string, number>;
        finalProbabilities: Record<string, number>;
        selectionReason: string;
    };
    
    // v12.5: Alertas de Agotamiento
    exhaustionWarning?: 'none' | 'medium' | 'high' | 'critical';
    categoryExhaustionRate?: number;
}

export type TrollScenario = 'espejo_total' | 'civil_solitario' | 'falsa_alarma';

export type MemoryDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface MemoryModeConfig {
    enabled: boolean;
    difficulty: MemoryDifficulty;
    displayTime: number; // Seconds
    wordCount: number; // Words to show
    highlightIntensity: number; // 0-1
}

export interface CategoryExhaustionData {
    usedWords: string[];        // Palabras ya jugadas
    totalWords: number;          // Total de palabras en esa categoría
    lastReset: number;           // Timestamp del último reset
    cycleCount: number;          // Cuántas veces se ha completado el ciclo
}

// ✨ NUEVO: Estadísticas de uso por categoría
export interface CategoryUsageStats {
    totalTimesSelected: number;        // Veces que salió la categoría
    lastSelectedRound: number;         // Última ronda que salió
    averageWordsPerSelection: number;  // Promedio de palabras vistas
    exhaustionRate: number;            // % de palabras ya usadas (0-1)
}

export interface GameState {
    phase: 'setup' | 'revealing' | 'architect' | 'oracle' | 'discussion' | 'results';
    players: Player[];
    gameData: GamePlayer[];
    impostorCount: number;
    currentPlayerIndex: number;
    startingPlayer: string;
    isTrollEvent: boolean;
    trollScenario: TrollScenario | null;
    isArchitectRound: boolean;
    history: {
        roundCounter: number;
        lastWords: string[];
        lastCategories: string[];
        globalWordUsage: Record<string, number>;
        // ✨ NUEVO: Tracking persistente de palabras usadas por categoría
        categoryExhaustion?: Record<string, CategoryExhaustionData>;
        // ✨ NUEVO: Tracking de uso de categorías
        categoryUsageStats?: Record<string, CategoryUsageStats>;
        
        playerStats: Record<string, InfinityVault>;
        lastTrollRound: number;
        lastArchitectRound: number;
        lastStartingPlayers: string[];
        lastBartenders: string[];
        pastImpostorIds: string[];
        paranoiaLevel: number;
        coolingDownRounds: number;
        lastBreakProtocol: string | null;
        matchLogs: MatchLog[];
        lastLeteoRound?: number;
        
        // v12.3 Rotation Mode State
        rotationIndex?: number;

        // ✨ NUEVO: Gestión de Blacklist y Modo Explorador
        temporaryBlacklist?: Record<string, number>; // Categoría -> Rondas restantes
        explorerDeck?: string[]; // Categorías ya jugadas en el ciclo actual
    };
    settings: {
        hintMode: boolean;
        trollMode: boolean;
        partyMode: boolean;
        architectMode: boolean;
        oracleMode: boolean;
        vanguardiaMode: boolean;
        nexusMode: boolean;
        passPhoneMode: boolean;
        shuffleEnabled: boolean;
        impostorEffects: boolean; // ✨ NUEVO: Control de FX Impostor
        revealMethod: 'hold' | 'swipe';
        swipeSensitivity: 'low' | 'medium' | 'high';
        hapticFeedback: boolean;
        soundEnabled: boolean;
        selectedCategories: string[];
        renunciaMode: boolean;
        protocolMagistrado: boolean; // ✨ NUEVO
        magistradoMinPlayers: number; 
        memoryModeConfig: MemoryModeConfig; // v9.0 Memory Mode
        // ✨ NUEVO: Ajustes de selección de categorías
        categoryRepetitionAvoidance: 'none' | 'soft' | 'medium' | 'hard';
        rareCategoryBoost: boolean;
        rotationMode?: boolean; // v12.3: Modo Rotación secuencial
        
        // ✨ NUEVO v12.4
        favoriteCategories?: string[]; // Lista de favoritos (2x peso)
        explorerMode?: boolean; // Modo Explorador (deck de cartas)
    };
    debugState: {
        isEnabled: boolean;
        forceTroll: TrollScenario | null;
        forceArchitect: boolean;
        forceRenuncia?: boolean;
        godModeAssignments?: Record<string, string>; // ✨ NUEVO: Asignación manual
        easterEggUnlocked?: boolean; // ✨ NUEVO
    };
    partyState: {
        intensity: PartyIntensity;
        consecutiveHardcoreRounds: number;
        isHydrationLocked: boolean;
    };
    currentDrinkingPrompt: string;
    theme: ThemeName;
    oracleSetup?: OracleSetupData;
    renunciaData?: RenunciaData;
    magistradoData?: MagistradoData; // ✨ NUEVO
}

// ✨ NUEVO: Interfaz para presets de categorías
export interface CategoryPreset {
    id: string;
    name: string;
    emoji: string;
    categories: string[];
    createdAt: number;
}