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
    avatarIdx?: number;
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
    isAlcalde?: boolean;
    nexusPartners?: string[];
    isWitness?: boolean;
    hasRejectedImpRole?: boolean;
    wasTransferred?: boolean;
    memoryWords?: string[];
    memoryCorrectIndex?: number;
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
    impostors: string[];
    civilians: string[];
    isTroll: boolean;
    trollScenario: string | null;
    paranoiaLevel: number;
    breakProtocol: string | null;
    architect: string | null;
    oracle?: string | null;
    leteoGrade?: 0 | 1 | 2 | 3;
    entropyLevel?: number;
    telemetry?: SelectionTelemetry[];
    affectsINFINITUM?: boolean;
    renunciaTriggered?: boolean;
    renunciaDecision?: RenunciaDecision;
    renunciaWitness?: string;
    renunciaTelemetry?: {
        finalProbability: number;
        karmaBonus: number;
        sessionBonus: number;
        failureBonus: number;
        candidateStreak: number;
    };
    magistrado?: string;
    categorySelectionTelemetry?: {
        candidateCategories: string[];
        weights: Record<string, number>;
        finalProbabilities: Record<string, number>;
        selectionReason: string;
    };
    exhaustionWarning?: 'none' | 'medium' | 'high' | 'critical';
    categoryExhaustionRate?: number;
}

export type TrollScenario = 'espejo_total' | 'civil_solitario' | 'falsa_alarma';

export type MemoryDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface MemoryModeConfig {
    enabled: boolean;
    difficulty: MemoryDifficulty;
    displayTime: number;
    wordCount: number;
    highlightIntensity: number;
}

export interface CategoryExhaustionData {
    usedWords: string[];
    totalWords: number;
    lastReset: number;
    cycleCount: number;
}

export interface CategoryUsageStats {
    totalTimesSelected: number;
    lastSelectedRound: number;
    averageWordsPerSelection: number;
    exhaustionRate: number;
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
        categoryExhaustion?: Record<string, CategoryExhaustionData>;
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
        rotationIndex?: number;
        temporaryBlacklist?: Record<string, number>;
        explorerDeck?: string[];
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
        impostorEffects: boolean;
        revealMethod: 'hold' | 'swipe';
        swipeSensitivity: 'low' | 'medium' | 'high';
        holdRevealSpeed: 'low' | 'medium' | 'high';
        hapticFeedback: boolean;
        soundEnabled: boolean;
        selectedCategories: string[];
        renunciaMode: boolean;
        protocolMagistrado: boolean;
        magistradoMinPlayers: number;
        memoryModeConfig: MemoryModeConfig;
        categoryRepetitionAvoidance: 'none' | 'soft' | 'medium' | 'hard';
        rareCategoryBoost: boolean;
        rotationMode?: boolean;
        favoriteCategories?: string[];
        explorerMode?: boolean;
        /** Permite revisar la carta en pantalla de resultados */
        allowReReveal: boolean;
        /** Modo rendimiento optimizado para hardware mid-range (e.g. OnePlus 9) */
        performanceMode: boolean;
    };
    debugState: {
        isEnabled: boolean;
        forceTroll: TrollScenario | null;
        forceArchitect: boolean;
        forceRenuncia?: boolean;
        godModeAssignments?: Record<string, string>;
        easterEggUnlocked?: boolean;
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
    magistradoData?: MagistradoData;
}

export interface CategoryPreset {
    id: string;
    name: string;
    emoji: string;
    categories: string[];
    createdAt: number;
}
