
import { GameState, PartyIntensity, GamePlayer, SocialRole, Player, InfinityVault } from '../types';

// --- CONFIGURATION ---
const INTENSITY_THRESHOLDS = {
    aperitivo: 2, // Rounds 1-2
    hora_punta: 6, // Rounds 3-6
    after_hours: 10, // Rounds 7+
};

const BARTENDER_WEIGHTS = {
    LAST_ROUND: 0.001,
    TWO_ROUNDS_AGO: 0.1,
    THREE_ROUNDS_AGO: 0.3,
    NEVER: 3.0
};

// --- CORE: INTENSITY CALCULATOR ---
export const calculatePartyIntensity = (round: number): PartyIntensity => {
    const hour = new Date().getHours();
    
    // Protocolo RESACA: Safety check for late hours
    if (hour >= 4 && hour < 11) return 'resaca';

    if (round <= INTENSITY_THRESHOLDS.aperitivo) return 'aperitivo';
    if (round <= INTENSITY_THRESHOLDS.hora_punta) return 'hora_punta';
    return 'after_hours';
};

// --- HELPER: INFINITY VAULT ACCESS ---
const getVault = (uid: string, stats: Record<string, InfinityVault>): InfinityVault | null => {
    return stats[uid] || null;
};

// --- CORE: ROLE ASSIGNMENT (v2.0) ---
export const assignPartyRoles = (
    players: GamePlayer[], 
    history: GameState['history'],
    playerStats: Record<string, InfinityVault>
): GamePlayer[] => {
    
    // 1. SELECT BARTENDER (Weighted to avoid repetition)
    const lastBartenders = history.lastBartenders || [];
    
    const bartenderWeights = players.map(p => {
        let weight = 100;
        const lastBartenderRound = lastBartenders.indexOf(p.id);
        
        if (lastBartenderRound === 0) weight *= BARTENDER_WEIGHTS.LAST_ROUND; 
        else if (lastBartenderRound === 1) weight *= BARTENDER_WEIGHTS.TWO_ROUNDS_AGO;
        else if (lastBartenderRound === 2) weight *= BARTENDER_WEIGHTS.THREE_ROUNDS_AGO;
        else if (lastBartenderRound === -1) weight *= BARTENDER_WEIGHTS.NEVER; 
        
        return { player: p, weight };
    });
    
    const totalWeight = bartenderWeights.reduce((sum, w) => sum + w.weight, 0);
    let ticket = Math.random() * totalWeight;
    let bartenderId = players[0].id; // Fallback
    
    for (const item of bartenderWeights) {
        ticket -= item.weight;
        if (ticket <= 0) {
            bartenderId = item.player.id;
            break;
        }
    }

    // Small groups: Only Bartender
    if (players.length < 4) {
        return players.map((p) => ({
            ...p,
            partyRole: p.id === bartenderId ? 'bartender' : 'civil'
        }));
    }

    // 2. SELECT SPECIAL ROLES (VIP, ALGUACIL, BUFÓN)
    let vipId = "";
    let alguacilId = "";
    let bufonId = "";

    const availableForRoles = players.filter(p => p.id !== bartenderId);

    // VIP: Highest Impostor Ratio (The "Winner")
    const vipCandidates = [...availableForRoles].sort((a, b) => {
        const vA = getVault(a.name.trim().toLowerCase(), playerStats);
        const vB = getVault(b.name.trim().toLowerCase(), playerStats);
        return (vB?.metrics.impostorRatio || 0) - (vA?.metrics.impostorRatio || 0);
    });
    if (vipCandidates.length > 0) vipId = vipCandidates[0].id;

    // ALGUACIL: Highest Civil Streak (The "Vigilante")
    const alguacilCandidates = availableForRoles.filter(p => p.id !== vipId).sort((a, b) => {
        const vA = getVault(a.name.trim().toLowerCase(), playerStats);
        const vB = getVault(b.name.trim().toLowerCase(), playerStats);
        return (vB?.metrics.civilStreak || 0) - (vA?.metrics.civilStreak || 0);
    });
    if (alguacilCandidates.length > 0) alguacilId = alguacilCandidates[0].id;

    // BUFON: Random remainder
    const bufonCandidates = availableForRoles.filter(p => p.id !== vipId && p.id !== alguacilId);
    if (bufonCandidates.length > 0) {
        bufonId = bufonCandidates[Math.floor(Math.random() * bufonCandidates.length)].id;
    }
    
    return players.map((p) => {
        let role: SocialRole = 'civil';
        if (p.id === bartenderId) role = 'bartender';
        else if (p.id === vipId) role = 'vip';
        else if (p.id === alguacilId) role = 'alguacil';
        else if (p.id === bufonId) role = 'bufon';
        
        return { ...p, partyRole: role };
    });
};

// --- CORE: PUNISHMENT ALGORITHM (v2.0) ---
// Calculates who deserves to drink based on stats and BEHAVIOR
const getTargetPlayer = (gameState: GameState): string => {
    // Calculate Average View Time for current round (exclude 0s)
    const allViewTimes = gameState.gameData.map(p => p.viewTime || 0).filter(t => t > 0);
    
    // Prevent division by zero if all view times are 0
    const avgViewTime = allViewTimes.length > 0 
        ? Math.max(allViewTimes.reduce((a, b) => a + b, 0) / allViewTimes.length, 1) // Minimum 1ms
        : 1000;

    const candidates = gameState.gameData.map(p => {
        let score = 0;
        const vault = gameState.history.playerStats[p.name.trim().toLowerCase()];
        
        // Factor 1: Global Impostor Ratio (Punish winners)
        if (vault) score += vault.metrics.impostorRatio * 30;
        
        // Factor 2: Civil Streak (Punish campers)
        if (vault) score += vault.metrics.civilStreak * 2;
        
        // Factor 3: View Time Deviation (Punish weird behavior)
        const viewTime = p.viewTime || 0;
        if (viewTime > 0 && avgViewTime > 0) {
            // Normalize deviation. e.g. 50% deviation = 0.5
            const deviation = Math.abs(viewTime - avgViewTime) / avgViewTime;
            // Cap it so extreme outliers don't break the logic, but give significant points (up to 20)
            score += Math.min(deviation, 2.0) * 15; 
        } else {
            // Fallback entropy if no view time data
            score += Math.random() * 10; 
        }

        return { name: p.name, score };
    });

    if (candidates.length === 0) {
        return gameState.players[0]?.name || "alguien";
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].name;
};

// --- PROMPT GENERATION ---

export const getBatteryLevel = async (): Promise<number> => {
    // Battery Status API: Available in Chrome, Edge (deprecated in Firefox)
    if ('getBattery' in navigator) {
        try {
            // @ts-ignore
            const battery = await navigator.getBattery();
            return Math.round(battery.level * 100);
        } catch (e) {
            return 100;
        }
    }
    return 100;
};

const injectVariables = (template: string, gameState: GameState, battery: number): string => {
    let result = template;
    const now = new Date();
    const timeString = now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

    // {TARGET} - The algorithmically chosen victim
    if (result.includes("{TARGET}")) {
        result = result.replace(/{TARGET}/g, getTargetPlayer(gameState));
    }

    // {RANDOM_PLAYER}
    if (result.includes("{RANDOM_PLAYER}")) {
        const randomP = gameState.players[Math.floor(Math.random() * gameState.players.length)];
        result = result.replace(/{RANDOM_PLAYER}/g, randomP ? randomP.name : "alguien");
    }

    // {CURRENT_PLAYER}
    if (result.includes("{CURRENT_PLAYER}")) {
        const currentP = gameState.players[gameState.currentPlayerIndex];
        result = result.replace(/{CURRENT_PLAYER}/g, currentP ? currentP.name : "el jugador actual");
    }

    // {PLAYER_1}
    if (result.includes("{PLAYER_1}")) {
        const firstPlayer = gameState.players[0];
        result = result.replace(/{PLAYER_1}/g, firstPlayer ? firstPlayer.name : "el primer jugador");
    }

    // {BARTENDER}
    if (result.includes("{BARTENDER}")) {
        const barman = gameState.gameData.find(p => p.partyRole === 'bartender');
        result = result.replace(/{BARTENDER}/g, barman ? barman.name : "el Bartender");
    }

    // {IMPOSTOR} - Only available if gameData exists
    if (result.includes("{IMPOSTOR}")) {
        const impostors = gameState.gameData.filter(p => p.isImp);
        const impName = impostors.length > 0 ? impostors[0].name : "El Impostor";
        result = result.replace(/{IMPOSTOR}/g, impName);
    }
    
    // {ARCHITECT}
    if (result.includes("{ARCHITECT}")) {
        const architect = gameState.gameData.find(p => p.isArchitect);
        result = result.replace(/{ARCHITECT}/g, architect ? architect.name : "El Arquitecto");
    }

    // {BATTERY}
    result = result.replace(/{BATTERY}/g, battery.toString());

    // {TIME}
    result = result.replace(/{TIME}/g, timeString);

    return result;
};

const PROMPTS = {
    aperitivo: [
        "CALIBRACIÓN: {TARGET}, tienes cara de sed. Inicia el protocolo con un trago corto.",
        "ROMPHIELO: {RANDOM_PLAYER}, cuenta un chiste malo o bebe un trago.",
        "DATOS: {PLAYER_1}, eres el primero en la lista. Bebe por liderazgo.",
        "Batería al {BATTERY}%. Si tienes menos energía que el móvil, bebe un trago.",
        "MODO CALENTAMIENTO: {BARTENDER}, manda un trago a quien veas más sobrio.",
    ],
    hora_punta: [
        "KARMA: {TARGET} lleva demasiado tiempo siendo inocente. El sistema exige un sacrificio etílico.",
        "DUELO TÁCTICO: {RANDOM_PLAYER} elige a un rival. El primero en parpadear bebe 2 tragos.",
        "BARTENDER: {BARTENDER} elige a la persona más sospechosa. Esa persona bebe.",
        "Silencio incómodo detectado. El último en hablar bebe.",
        "Atención: Si llevas ropa blanca, el sistema te ha marcado. Bebe un trago.",
        "INMUNIDAD VIP: El VIP puede mandar un trago a quien quiera. Si no hay VIP, beben todos.",
    ],
    after_hours: [
        "CAOS TOTAL: {TARGET}, vacía tu vaso. El sistema no admite discusiones.",
        "MÍMICA: {CURRENT_PLAYER}, debes describir tu palabra solo con gestos. Si hablas, bebes doble.",
        "CADENA: {RANDOM_PLAYER} bebe. El jugador a su derecha también. Y el siguiente...",
        "BORRACHERA VISUAL: Si puedes leer esto sin cerrar un ojo, bebe un trago.",
        "El Bartender ({BARTENDER}) es la ley. Si dice que bebas, bebes.",
        "BUFÓN: El Bufón debe contar una historia vergonzosa o todos beben un trago por pena.",
    ],
    resaca: [
        "PROTOCOLO SEGURIDAD: Todos beben un trago de AGUA. Ahora.",
        "Silencio. Bajad el volumen. {RANDOM_PLAYER}, susurra tu defensa.",
        "La luz molesta. El primero en quejarse del brillo, bebe agua.",
    ]
};

const TRIBUNAL_SENTENCES = {
    impostorWin: "INFILTRACIÓN PERFECTA. Los civiles son degradados. Brindis de la Vergüenza (3 tragos).",
    civilWin: "CAZADO. {IMPOSTOR}, has fallado al sistema. Termina tu bebida y pide perdón.",
    troll: "PROTOCOLO GARRAFÓN. Nadie es inocente. Barra libre de sospechas: todos beben.",
    architectWin: "El Arquitecto ha diseñado vuestra derrota. {BARTENDER}, sírvele un trago de victoria.",
    civilArchitectWin: "El Arquitecto {ARCHITECT} ha decodificado la conspiración. Los impostores pagan tributo (2 tragos)."
};

export const getPartyMessage = (
    phase: 'setup' | 'revealing' | 'discussion' | 'results', 
    gameState: GameState, 
    battery: number,
    winState?: 'civil' | 'impostor' | 'troll'
): string => {
    const intensity = gameState.partyState.intensity;

    // TRIBUNAL DE CASTIGOS (Resultados)
    if (phase === 'results' && winState) {
        let template = "";
        if (winState === 'troll') {
            template = TRIBUNAL_SENTENCES.troll;
        } else if (winState === 'civil') {
            // Check for Civil Architect Victory
            const architect = gameState.gameData.find(p => p.isArchitect);
            if (architect && !architect.isImp) {
                template = TRIBUNAL_SENTENCES.civilArchitectWin;
            } else {
                template = TRIBUNAL_SENTENCES.civilWin;
            }
        } else {
            // Impostor Win
            const architect = gameState.gameData.find(p => p.isArchitect);
            if (architect && architect.isImp) {
                 template = TRIBUNAL_SENTENCES.architectWin;
            } else {
                 template = TRIBUNAL_SENTENCES.impostorWin;
            }
        }

        return injectVariables(template, gameState, battery);
    }

    // EVENTOS FLASH-CRASH (Durante el juego)
    if (phase === 'revealing' || phase === 'setup') {
        const pool = PROMPTS[intensity];
        if (!pool || pool.length === 0) return "";
        const template = pool[Math.floor(Math.random() * pool.length)];
        return injectVariables(template, gameState, battery);
    }

    return "";
};