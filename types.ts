
export type ThemeName = 'midnight' | 'obsidian' | 'solar' | 'cyber' | 'bond' | 'turing' | 'illojuan' | 'material' | 'zenith' | 'protocol' | 'ethereal' | 'terminal84' | 'soft' | 'noir' | 'paper' | 'space' | 'nightclub' | 'aura' | 'luminous' | 'silk_soul' | 'nebula_dream' | 'crystal_garden' | 'aurora_borealis' | 'liquid_gold' | 'luminescent_ocean' | 'zen_sunset';

export interface ThemeConfig {
    name: string;
    bg: string;
    cardBg: string;
    accent: string;
    text: string;
    sub: string;
    radius: string; // Tailwind class equivalent or CSS value
    font: string;
    border: string;
    particleType: 'circle' | 'binary' | 'rain' | 'aura' | 'silk' | 'stardust' | 'foliage' | 'aurora' | 'goldleaf' | 'plankton' | 'ember';
    // Optional extended properties for premium themes
    particleColor?: string | string[];
    particleCount?: number;
    particleSpeed?: number;
    blur?: string;
    shadow?: string;
    pulseInterval?: number;
}

export interface Player {
    id: string;
    name: string;
}

export type SocialRole = 'bartender' | 'vip' | 'alguacil' | 'bufon' | 'civil';

export interface GamePlayer extends Player {
    role: 'Civil' | 'Impostor';
    word: string; // What they see on the card
    realWord: string; // The actual civil word (for results)
    isImp: boolean;
    category: string;
    areScore: number; // Represents the INFINITUM weight for this round
    impostorProbability: number; // The calculated % chance they had to be selected
    viewTime: number; // Milliseconds spent looking at the card
    isArchitect?: boolean; // v5.0 Flag
    isOracle?: boolean; // v7.0 Protocolo ORÁCULO
    isVanguardia?: boolean; // v8.0 Protocolo VANGUARDIA
    oracleTriggered?: boolean; // v7.0 If true, the hint they see was chosen by Oracle
    partyRole?: SocialRole; // v4.0 BACCHUS
    nexusPartners?: string[]; // v6.5 Protocolo NEXUS (Names of other impostors)
}

// --- PROTOCOL INFINITUM STRUCTURES ---

export interface CategoryDNA {
    timesAsImpostor: number;
    lastTimeAsImpostor: number; // Timestamp
    affinityScore: number;
}

export interface SequenceAnalytics {
    lastImpostorPartners: string[]; // IDs of partners in last imp game
    roleSequence: boolean[]; // True = Impostor, False = Civil (Last 20 games)
    averageWaitTime: number;
}

export interface InfinityVault {
    uid: string;
    metrics: {
        totalSessions: number;
        impostorRatio: number;
        civilStreak: number;
        totalImpostorWins: number; // Placeholder for future logic
        quarantineRounds: number; // v6.1: Post-Paranoia Lockdown
    };
    categoryDNA: Record<string, CategoryDNA>;
    sequenceAnalytics: SequenceAnalytics;
}

export interface SelectionTelemetry {
    playerId: string;
    playerName: string;
    baseWeight: number;
    paranoiaAdjustment: number; // Future use
    synergyPenalty: number;
    finalWeight: number;
    probabilityPercent: number;
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
}

export type TrollScenario = 'espejo_total' | 'civil_solitario' | 'falsa_alarma';

export interface DebugState {
    isEnabled: boolean;
    forceTroll: TrollScenario | null;
    forceArchitect: boolean;
}

export type PartyIntensity = 'aperitivo' | 'hora_punta' | 'after_hours' | 'resaca';

export interface PartyState {
    intensity: PartyIntensity;
    consecutiveHardcoreRounds: number; // To trigger water break
    isHydrationLocked: boolean; // Safety lock
}

export interface CuratedCollection {
    id: string;
    name: string;
    description: string;
    vibe: string;
    categories: string[];
    icon: string; // Lucide icon name
}

export interface GameState {
    phase: 'setup' | 'architect' | 'revealing' | 'discussion' | 'results';
    players: Player[];
    gameData: GamePlayer[];
    impostorCount: number;
    currentPlayerIndex: number;
    startingPlayer: string;
    isTrollEvent: boolean;
    trollScenario: TrollScenario | null;
    isArchitectRound: boolean; // v5.0 Flag 
    history: {
        roundCounter: number; 
        lastWords: string[]; // Session Exclusion (Last 15)
        lastCategories: string[]; // Omniscient Filter (Last 3)
        globalWordUsage: Record<string, number>; // Vital Penalty (Lexicon Engine)
        playerStats: Record<string, InfinityVault>; // The Infinity Vault (Infinitum Engine)
        lastTrollRound: number; 
        lastArchitectRound: number; // MDE v5.0 Tracking
        lastStartingPlayers: string[]; // VOCALIS: Oratory Fatigue Tracking
        
        // v6.1 Paranoia Engine
        pastImpostorIds: string[]; // Track actual impostor IDs for pattern detection
        paranoiaLevel: number; // 0-100%
        coolingDownRounds: number; // 3, 2, 1, 0 (Rebote Post-Crisis)
        lastBreakProtocol: string | null; // For Debug/Logging
        
        // v6.3 LETEO Protocol
        lastLeteoRound?: number;
        
        // v6.2 Black Box Logs
        matchLogs: MatchLog[]; 
    };
    settings: {
        hintMode: boolean;
        trollMode: boolean;
        partyMode: boolean;
        architectMode: boolean; 
        oracleMode: boolean; // v7.0 Protocolo ORÁCULO
        vanguardiaMode: boolean; // v8.0 Protocolo VANGUARDIA
        nexusMode: boolean; // v6.5 Protocolo NEXUS
        passPhoneMode: boolean; // v9.0 Protocolo TRANSICIÓN
        shuffleEnabled: boolean; // v10.0 Protocolo BARAJADO
        revealMethod: 'hold' | 'swipe'; // v9.0 Reveal method
        swipeSensitivity: 'low' | 'medium' | 'high'; // v9.0 Swipe Sensitivity
        hapticFeedback: boolean; // v9.0 Haptic feedback setting
        soundEnabled: boolean;
        selectedCategories: string[];
    };
    debugState: DebugState; // PROTOCOL CENTINELA
    partyState: PartyState; // v4.0 BACCHUS
    currentDrinkingPrompt: string;
    theme: ThemeName;
}

export interface CategoryData {
    civ: string;
    imp: string;
    hints: string[]; // Protocol LEXICON support for dynamic hints
    hint?: string; // Legacy support
}
