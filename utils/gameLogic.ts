
import { CATEGORIES_DATA } from '../categories';
import { GamePlayer, Player, InfinityVault, TrollScenario, CategoryData, MatchLog, SelectionTelemetry, OracleSetupData, GameState, RenunciaData, MagistradoData } from '../types';
import { assignPartyRoles } from './partyLogic';
import { generateMemoryWords } from './memoryWordGenerator';

// MODULOS IMPORTADOS
import { shuffleArray } from './utils/helpers';
import { getVault, createNewVault } from './core/vault';
import { calculateParanoiaScore, detectLinearPattern } from './core/paranoia';
import { calculateInfinitumWeight, applySynergyFactor, getDebugPlayerStats } from './core/infinitum';
import { selectAlcalde } from './protocols/magistrado';
import { calculateRenunciaProbability, applyRenunciaDecision } from './protocols/renuncia';
import { runVocalisProtocol } from './protocols/vocalis';
import { calculateArchitectTrigger } from './protocols/architect';
import { selectLexiconWord, generateSmartHint, generateVanguardHints, generateArchitectOptions } from './lexicon/wordSelection';

interface GameConfig {
    players: Player[];
    impostorCount: number;
    useHintMode: boolean;
    useTrollMode: boolean;
    useArchitectMode: boolean;
    useOracleMode: boolean;
    useVanguardiaMode: boolean;
    useNexusMode: boolean;
    useRenunciaMode: boolean;
    useMagistradoMode: boolean;
    selectedCats: string[];
    history: GameState['history'];
    debugOverrides?: {
        forceTroll: TrollScenario | null;
        forceArchitect: boolean;
        forceRenuncia?: boolean;
    }
    isPartyMode?: boolean;
    memoryModeConfig?: GameState['settings']['memoryModeConfig'];
}

export const generateGameData = (config: GameConfig): { 
    players: GamePlayer[]; 
    isTrollEvent: boolean;
    trollScenario: TrollScenario | null;
    isArchitectTriggered: boolean; 
    designatedStarter: string; 
    newHistory: GameState['history'];
    oracleSetup?: OracleSetupData;
    renunciaData?: RenunciaData;
    magistradoData?: MagistradoData;
    wordPair: CategoryData;
} => {
    const { players, impostorCount, useHintMode, useTrollMode, useArchitectMode, useOracleMode, useVanguardiaMode, useNexusMode, useRenunciaMode, useMagistradoMode, selectedCats, history, debugOverrides, isPartyMode, memoryModeConfig } = config;
    
    const currentRound = history.roundCounter + 1;
    const availableCategories = selectedCats.length > 0 ? selectedCats : Object.keys(CATEGORIES_DATA);

    let isTrollEvent = false;
    let trollScenario: TrollScenario | null = null;

    if (debugOverrides?.forceTroll) {
        isTrollEvent = true;
        trollScenario = debugOverrides.forceTroll;
    }

    const pastImpostorIds = history.pastImpostorIds || [];
    const paranoiaLevel = calculateParanoiaScore(pastImpostorIds, players, currentRound);
    
    let coolingRounds = history.coolingDownRounds || 0;
    const coolingFactor = coolingRounds > 0 ? (1 - (coolingRounds * 0.25)) : 1.0;

    let breakProtocolType: 'pandora' | 'mirror' | 'blind' | 'leteo' | null = null;
    let leteoGrade: 0 | 1 | 2 | 3 = 0;
    let entropyLevel = 0;
    
    if (!isTrollEvent && paranoiaLevel > 70 && coolingRounds === 0) {
        const roll = Math.random() * 100;
        
        if (roll < 40) {
            breakProtocolType = 'leteo';
            const hasLinearPattern = detectLinearPattern(pastImpostorIds, players);
            if (paranoiaLevel > 90) {
                leteoGrade = 3; 
                entropyLevel = 1.0;
            } else if (hasLinearPattern) {
                leteoGrade = 2;
                entropyLevel = 0.6;
            } else {
                leteoGrade = 1;
                entropyLevel = 0.3;
            }
        } else if (useTrollMode && roll < 65) {
            breakProtocolType = 'pandora';
            isTrollEvent = true;
        } else if (roll < 90) {
            breakProtocolType = 'mirror';
        } else {
            breakProtocolType = 'blind';
        }
    }

    if (isTrollEvent) {
        if (!trollScenario) { 
            const roll = Math.random() * 100;
            if (roll < 70) trollScenario = 'espejo_total';
            else if (roll < 90) trollScenario = 'civil_solitario';
            else trollScenario = 'falsa_alarma';
        }

        const catName = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const catDataList = CATEGORIES_DATA[catName];
        const basePair = catDataList[Math.floor(Math.random() * catDataList.length)];
        const noiseIndex = Math.floor(Math.random() * players.length);

        const generateBabylonHint = (playerIndex: number): string => {
            if (!useHintMode) return "ERES EL IMPOSTOR";
            if (playerIndex === noiseIndex) {
                const otherCats = Object.keys(CATEGORIES_DATA).filter(c => c !== catName);
                const noiseCat = otherCats[Math.floor(Math.random() * otherCats.length)];
                const noisePair = CATEGORIES_DATA[noiseCat][0];
                const noiseHint = noisePair.hints ? noisePair.hints[0] : (noisePair.hint || "RUIDO");
                return `PISTA: ${noiseHint} (RUIDO)`;
            }
            const randomRelatedPair = catDataList[Math.floor(Math.random() * catDataList.length)];
            return Math.random() > 0.5 ? `PISTA: ${catName}` : `PISTA: ${generateSmartHint(randomRelatedPair)}`;
        };

        let trollPlayers: GamePlayer[] = [];
        if (trollScenario === 'espejo_total') {
            trollPlayers = players.map((p, idx) => ({ ...p, role: 'Impostor', word: generateBabylonHint(idx), realWord: basePair.civ, isImp: true, category: catName, areScore: 0, impostorProbability: 100, viewTime: 0 }));
        } else if (trollScenario === 'civil_solitario') {
            const civilIndex = Math.floor(Math.random() * players.length);
            trollPlayers = players.map((p, idx) => ({ ...p, role: idx === civilIndex ? 'Civil' : 'Impostor', word: idx === civilIndex ? basePair.civ : generateBabylonHint(idx), realWord: basePair.civ, isImp: idx !== civilIndex, category: catName, areScore: 0, impostorProbability: idx === civilIndex ? 0 : 100, viewTime: 0 }));
        } else {
            trollPlayers = players.map(p => ({ ...p, role: 'Civil', word: basePair.civ, realWord: basePair.civ, isImp: false, category: catName, areScore: 0, impostorProbability: 0, viewTime: 0 }));
        }

        const vocalisStarter = runVocalisProtocol(players, history, false);
        const newStartingPlayers = [vocalisStarter.id, ...history.lastStartingPlayers].slice(0, 10);

        if (isPartyMode) {
            trollPlayers = assignPartyRoles(trollPlayers, history, history.playerStats);
        }

        const newLog: MatchLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            round: currentRound,
            category: catName,
            word: basePair.civ,
            impostors: trollPlayers.filter(p => p.isImp).map(p => p.name),
            civilians: trollPlayers.filter(p => !p.isImp).map(p => p.name),
            isTroll: true,
            trollScenario: trollScenario,
            paranoiaLevel: 0,
            breakProtocol: null,
            architect: null,
            leteoGrade: 0,
            entropyLevel: 0,
            affectsINFINITUM: false
        };
        const currentLogs = history.matchLogs || [];
        const updatedLogs = [newLog, ...currentLogs].slice(0, 100);

        return { 
            players: trollPlayers, isTrollEvent: true, trollScenario: trollScenario, isArchitectTriggered: false, designatedStarter: vocalisStarter.name,
            newHistory: { 
                ...history, 
                roundCounter: currentRound, 
                lastTrollRound: currentRound, 
                lastStartingPlayers: newStartingPlayers,
                playerStats: history.playerStats,
                pastImpostorIds: history.pastImpostorIds || [],
                paranoiaLevel: 0,
                coolingDownRounds: 2,
                lastBreakProtocol: breakProtocolType || 'manual',
                matchLogs: updatedLogs
            },
            wordPair: basePair
        };
    }

    // 🆕 SELECCIÓN EXHAUSTIVA DE PALABRA
    const { categoryName: catName, wordPair, updatedHistory: historyWithWordTracking } = selectLexiconWord(selectedCats, history);
    
    // 🆕 Usar el historial actualizado en lugar del original para los siguientes pasos
    const workingHistory = historyWithWordTracking;
    
    const currentStats = { ...workingHistory.playerStats };
    const shuffledPlayers = shuffleArray(players);

    let calculationStats: Record<string, InfinityVault> = currentStats;
    
    if (breakProtocolType === 'leteo' && leteoGrade > 0) {
        calculationStats = JSON.parse(JSON.stringify(currentStats));
        if (leteoGrade >= 1) { 
            Object.values(calculationStats).forEach(v => { v.sequenceAnalytics.roleSequence = []; });
        }
        if (leteoGrade >= 2) {
            const allStreaks = Object.values(calculationStats).map(v => v.metrics.civilStreak);
            const avgStreak = allStreaks.reduce((a, b) => a + b, 0) / (allStreaks.length || 1);
            Object.values(calculationStats).forEach(v => { v.metrics.civilStreak = avgStreak; });
        }
    }

    let totalEstimatedWeight = 0;
    shuffledPlayers.forEach(p => {
        const key = p.name.trim().toLowerCase();
        const vault = getVault(key, calculationStats);
        totalEstimatedWeight += calculateInfinitumWeight(p, vault, catName, currentRound, coolingFactor, 0, 0); 
    });
    const avgWeight = totalEstimatedWeight / (shuffledPlayers.length || 1);

    const playerWeights: { player: Player, weight: number, vault: InfinityVault, telemetry: SelectionTelemetry }[] = [];
    
    shuffledPlayers.forEach(p => {
        const key = p.name.trim().toLowerCase();
        const vault = getVault(key, calculationStats);
        let weight = 0;

        if (breakProtocolType === 'blind') {
            weight = 100;
        } else {
            weight = (vault.metrics.totalSessions === 0) 
                ? 100 
                : calculateInfinitumWeight(p, vault, catName, currentRound, coolingFactor, avgWeight, entropyLevel);
        }
        
        playerWeights.push({ 
            player: p, 
            weight, 
            vault: getVault(key, currentStats),
            telemetry: {
                playerId: p.id,
                playerName: p.name,
                baseWeight: weight,
                paranoiaAdjustment: 0,
                synergyPenalty: 0,
                finalWeight: weight,
                probabilityPercent: 0
            } 
        });
    });

    if (breakProtocolType === 'mirror') {
        playerWeights.sort((a, b) => a.weight - b.weight); 
        playerWeights[0].weight = 999999; 
    }

    // Filter duplicates if any
    const uniqueCandidates = playerWeights.filter((v, i, a) => a.findIndex(t => (t.player.id === v.player.id)) === i);

    const selectedImpostors: Player[] = [];
    const selectedKeys: string[] = []; 
    const telemetryData: SelectionTelemetry[] = [];

    for (let i = 0; i < impostorCount; i++) {
        let availableCandidates = uniqueCandidates.filter(pw => !selectedKeys.includes(pw.player.name.trim().toLowerCase()));
        if (availableCandidates.length === 0) break;

        if (i > 0) {
            availableCandidates = availableCandidates.map(pw => {
                const newWeight = applySynergyFactor(pw.weight, pw.vault, selectedKeys, players.length);
                pw.telemetry.synergyPenalty = pw.weight - newWeight;
                return { ...pw, weight: newWeight };
            });
        }

        const totalWeight = availableCandidates.reduce((sum, pw) => sum + pw.weight, 0);
        
        // SAFEGUARD: If total weight is 0 or NaN, fallback to equal distribution
        if (totalWeight <= 0 || isNaN(totalWeight)) {
            console.warn('Infinitum: Total weight is invalid. Fallback to equal distribution.');
            availableCandidates.forEach(pw => {
                pw.weight = 100;
                pw.telemetry.finalWeight = 100;
                pw.telemetry.probabilityPercent = (100 / availableCandidates.length);
            });
        } else {
            availableCandidates.forEach(pw => {
                pw.telemetry.finalWeight = pw.weight;
                pw.telemetry.probabilityPercent = (pw.weight / totalWeight) * 100;
            });
        }
        
        availableCandidates.forEach(pw => {
            if (!telemetryData.find(t => t.playerId === pw.player.id)) {
                telemetryData.push(pw.telemetry);
            }
        });

        // Recalculate total weight after safeguard to ensure it's valid for selection
        const safeTotalWeight = availableCandidates.reduce((sum, pw) => sum + pw.weight, 0);
        let randomTicket = Math.random() * safeTotalWeight;
        let selectedIndex = -1;

        for (let j = 0; j < availableCandidates.length; j++) {
            randomTicket -= availableCandidates[j].weight;
            if (randomTicket <= 0) {
                selectedIndex = j;
                break;
            }
        }
        if (selectedIndex === -1) selectedIndex = availableCandidates.length - 1;

        const chosen = availableCandidates[selectedIndex];
        selectedImpostors.push(chosen.player);
        selectedKeys.push(chosen.player.name.trim().toLowerCase());
    }

    const newPlayerStats = { ...currentStats };
    const newPastImpostorIds = [...pastImpostorIds];

    players.forEach(p => {
        const key = p.name.trim().toLowerCase();
        const originalVault = getVault(key, newPlayerStats);
        const isImp = selectedKeys.includes(key);
        const vault: InfinityVault = JSON.parse(JSON.stringify(originalVault));

        vault.metrics.totalSessions += 1;
        
        if (vault.metrics.quarantineRounds > 0) {
            vault.metrics.quarantineRounds -= 1;
        }

        if (isImp) {
            vault.metrics.civilStreak = 0;
            newPastImpostorIds.unshift(p.id); 
            vault.metrics.quarantineRounds = breakProtocolType ? 4 : 2;
        } else {
            if (vault.metrics.quarantineRounds === 0) {
                vault.metrics.civilStreak += 1;
            }
        }

        const currentImpostorCount = (vault.metrics.impostorRatio * (vault.metrics.totalSessions - 1)) + (isImp ? 1 : 0);
        vault.metrics.impostorRatio = currentImpostorCount / vault.metrics.totalSessions;

        if (!vault.categoryDNA[catName]) {
            vault.categoryDNA[catName] = { timesAsImpostor: 0, lastTimeAsImpostor: 0, affinityScore: 1 };
        }
        if (isImp) {
            vault.categoryDNA[catName].timesAsImpostor += 1;
            vault.categoryDNA[catName].lastTimeAsImpostor = Date.now();
        }

        vault.sequenceAnalytics.roleSequence.unshift(isImp);
        if (vault.sequenceAnalytics.roleSequence.length > 20) {
            vault.sequenceAnalytics.roleSequence.pop();
        }
        if (isImp) {
            vault.sequenceAnalytics.lastImpostorPartners = selectedKeys.filter(k => k !== key);
        }
        newPlayerStats[key] = vault;
    });

    let magistradoData: MagistradoData | undefined;
    let alcaldePlayer: Player | null = null;

    if (useMagistradoMode && players.length >= 6) {
        alcaldePlayer = selectAlcalde(players, selectedImpostors.map(i => i.id), newPlayerStats);
        
        if (alcaldePlayer) {
            magistradoData = {
                alcaldePlayerId: alcaldePlayer.id,
                alcaldePlayerName: alcaldePlayer.name,
                sessionStartTime: Date.now(),
                telemetry: {
                    wasRevealed: false
                }
            };
            
            const alcaldeKey = alcaldePlayer.name.trim().toLowerCase();
            const alcaldeVault = getVault(alcaldeKey, newPlayerStats);
            alcaldeVault.metrics.timesAsAlcalde = (alcaldeVault.metrics.timesAsAlcalde || 0) + 1;
            newPlayerStats[alcaldeKey] = alcaldeVault;
        }
    }

    const newHistoryWords = [wordPair.civ, ...workingHistory.lastWords].slice(0, 15);
    const newHistoryCategories = [catName, ...workingHistory.lastCategories].slice(0, 3);
    const newGlobalWordUsage = { ...workingHistory.globalWordUsage };
    newGlobalWordUsage[wordPair.civ] = (newGlobalWordUsage[wordPair.civ] || 0) + 1;

    let isArchitectTriggered = false;
    let architectId: string | undefined;

    if (debugOverrides?.forceArchitect) {
        if (players.length > 0) {
            const firstPlayer = players[0];
            const firstPlayerKey = firstPlayer.name.trim().toLowerCase();
            if (!selectedKeys.includes(firstPlayerKey)) {
                isArchitectTriggered = true;
                architectId = firstPlayer.id;
            }
        }
    } else if (useArchitectMode && players.length > 0) {
        const firstPlayer = players[0];
        const firstPlayerKey = firstPlayer.name.trim().toLowerCase();
        if (!selectedKeys.includes(firstPlayerKey)) {
            const vault = newPlayerStats[firstPlayerKey];
            const streak = vault?.metrics?.civilStreak || 0;
            if (calculateArchitectTrigger(history, streak)) {
                isArchitectTriggered = true;
                architectId = firstPlayer.id;
            }
        }
    }

    let oracleId: string | undefined;
    let oracleSetup: OracleSetupData | undefined;
    
    if (useOracleMode && useHintMode && players.length > 2) {
        let firstImpIndex = -1;
        
        for (let i = 0; i < players.length; i++) {
            const key = players[i].name.trim().toLowerCase();
            if (selectedKeys.includes(key)) {
                firstImpIndex = i;
                break; 
            }
        }

        if (firstImpIndex > 0) {
            const potentialOracles = players.slice(0, firstImpIndex).filter(p => p.id !== architectId && p.id !== alcaldePlayer?.id);
            
            if (potentialOracles.length > 0) {
                const oracleWeights = potentialOracles.map(p => {
                    const key = p.name.trim().toLowerCase();
                    const vault = getVault(key, newPlayerStats);
                    return {
                        player: p,
                        weight: Math.max(1, vault.metrics.civilStreak)
                    };
                });
                
                const totalWeight = oracleWeights.reduce((sum, w) => sum + w.weight, 0);
                let ticket = Math.random() * totalWeight;
                let chosenOracle: Player | undefined;
                
                for (const item of oracleWeights) {
                    ticket -= item.weight;
                    if (ticket <= 0) {
                        chosenOracle = item.player;
                        break;
                    }
                }
                
                if (!chosenOracle && oracleWeights.length > 0) chosenOracle = oracleWeights[0].player;

                if (chosenOracle) {
                    oracleId = chosenOracle.id;
                    
                    const hints = wordPair.hints && wordPair.hints.length >= 3 
                        ? wordPair.hints.slice(0, 3) 
                        : shuffleArray([...(wordPair.hints || []), wordPair.hint || "Sin Pista", "RUIDO"]).slice(0, 3);

                    oracleSetup = {
                        oraclePlayerId: oracleId,
                        availableHints: hints,
                        civilWord: wordPair.civ
                    };
                }
            }
        }
    }

    const vocalisStarter = runVocalisProtocol(players, history, false, architectId);
    const newStartingPlayers = [vocalisStarter.id, ...history.lastStartingPlayers].slice(0, 10);

    let gamePlayers: GamePlayer[] = players.map(p => {
        const key = p.name.trim().toLowerCase();
        const isImp = selectedKeys.includes(key);
        const weightObj = playerWeights.find(pw => pw.player.name.trim().toLowerCase() === key);
        const rawWeight = weightObj ? weightObj.weight : 0;
        const probability = uniqueCandidates.reduce((sum, c) => sum + c.weight, 0) > 0 
            ? (rawWeight / uniqueCandidates.reduce((sum, c) => sum + c.weight, 0)) * 100 
            : 0;
        const isOracle = p.id === oracleId;
        const isArchitect = p.id === architectId;
        const isAlcalde = p.id === alcaldePlayer?.id;

        let isVanguardia = false;
        if (useVanguardiaMode && useHintMode && isImp) {
            if (p.id === vocalisStarter.id) {
                isVanguardia = true;
            }
        }

        let displayWord = wordPair.civ;
        if (isImp) {
            if (isVanguardia) {
                 displayWord = generateVanguardHints(wordPair);
            } else {
                 const hint = generateSmartHint(wordPair);
                 displayWord = useHintMode ? `PISTA: ${hint}` : "ERES EL IMPOSTOR";
            }
        }

        let memoryWords: string[] | undefined;
        let memoryCorrectIndex: number | undefined;

        if (memoryModeConfig && memoryModeConfig.enabled) {
            const memResult = generateMemoryWords(
                catName,
                wordPair.civ,
                isImp,
                memoryModeConfig.difficulty,
                memoryModeConfig.wordCount
            );
            memoryWords = memResult.displayWords;
            memoryCorrectIndex = memResult.correctIndex;
        }

        return {
            id: p.id,
            name: p.name,
            role: isImp ? 'Impostor' : 'Civil',
            word: displayWord,
            realWord: wordPair.civ,
            isImp: isImp,
            category: catName,
            areScore: rawWeight,
            impostorProbability: probability,
            viewTime: 0,
            isOracle: isOracle,
            isVanguardia: isVanguardia,
            isArchitect: isArchitect,
            isAlcalde: isAlcalde,
            memoryWords: memoryWords,
            memoryCorrectIndex: memoryCorrectIndex
        };
    });

    if (useNexusMode && impostorCount > 1) {
        const impostorNames = gamePlayers.filter(p => p.isImp).map(p => p.name);
        gamePlayers.forEach(p => {
            if (p.isImp) {
                p.nexusPartners = impostorNames.filter(name => name !== p.name);
            }
        });
    }

    let renunciaData: RenunciaData | undefined;
    let renunciaTelemetry: any | undefined;

    const shouldTryRenuncia = (
        (useRenunciaMode || debugOverrides?.forceRenuncia) &&
        impostorCount >= 2 &&
        players.length >= 4 &&
        !isTrollEvent &&
        selectedImpostors.length >= 2
    );

    if (shouldTryRenuncia) {
        const eligibleCandidates = selectedImpostors.filter(impostor => {
            const impostorIndex = players.findIndex(p => p.id === impostor.id);
            if (impostorIndex === -1) return false;
            
            const civiliansBeforeCount = players.slice(0, impostorIndex).filter(p => {
                const key = p.name.trim().toLowerCase();
                return !selectedKeys.includes(key); 
            }).length;
            
            return civiliansBeforeCount >= 2;
        });
        
        if (eligibleCandidates.length > 0) {
            const candidateIndex = Math.floor(Math.random() * eligibleCandidates.length);
            const candidate = eligibleCandidates[candidateIndex];
            
            const { probability, telemetry } = calculateRenunciaProbability(
                candidate,
                currentRound,
                newPlayerStats,
                history
            );
            
            renunciaTelemetry = telemetry;
            
            const roll = Math.random();
            if (debugOverrides?.forceRenuncia || roll < probability) {
                renunciaData = {
                    candidatePlayerId: candidate.id,
                    originalImpostorIds: selectedImpostors.map(imp => imp.id),
                    decision: 'pending',
                    timestamp: Date.now(),
                    hasSeenInitialRole: false 
                };
            }
        }
    }

    if (newPastImpostorIds.length > 20) newPastImpostorIds.length = 20;
    
    const lastBartenders = history.lastBartenders || [];
    let newBartenderId: string | null = null;
    
    if (isPartyMode) {
        gamePlayers = assignPartyRoles(gamePlayers, history, newPlayerStats);
        const bartender = gamePlayers.find(p => p.partyRole === 'bartender');
        if (bartender) newBartenderId = bartender.id;
    }
    
    const newLastBartenders = newBartenderId 
        ? [newBartenderId, ...lastBartenders].slice(0, 10) 
        : lastBartenders;

    const newLog: MatchLog = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        round: currentRound,
        category: catName,
        word: wordPair.civ,
        impostors: gamePlayers.filter(p => p.isImp).map(p => p.name),
        civilians: gamePlayers.filter(p => !p.isImp).map(p => p.name),
        isTroll: false,
        trollScenario: null,
        paranoiaLevel: breakProtocolType ? 0 : paranoiaLevel,
        breakProtocol: breakProtocolType,
        architect: architectId ? players.find(p => p.id === architectId)?.name || "Unknown" : null,
        oracle: oracleId ? players.find(p => p.id === oracleId)?.name || "Unknown" : null,
        leteoGrade: leteoGrade,
        entropyLevel: entropyLevel,
        telemetry: telemetryData,
        renunciaTriggered: !!renunciaData,
        renunciaTelemetry: renunciaTelemetry ? {
            finalProbability: renunciaTelemetry.finalProb,
            karmaBonus: renunciaTelemetry.vectorKarma,
            sessionBonus: renunciaTelemetry.vectorSession,
            failureBonus: renunciaTelemetry.vectorFailure,
            candidateStreak: renunciaTelemetry.candidateStreak
        } : undefined,
        magistrado: alcaldePlayer?.name
    };
    const currentLogs = history.matchLogs || [];
    const updatedLogs = [newLog, ...currentLogs].slice(0, 100);

    const finalCoolingRounds = (breakProtocolType === 'leteo' && leteoGrade === 3) 
        ? 4 
        : (breakProtocolType ? 3 : Math.max(0, coolingRounds - 1));

    return { 
        players: gamePlayers, 
        isTrollEvent: isTrollEvent, 
        trollScenario: trollScenario,
        isArchitectTriggered: isArchitectTriggered,
        designatedStarter: vocalisStarter.name,
        oracleSetup: oracleSetup, 
        renunciaData: renunciaData, 
        magistradoData: magistradoData,
        newHistory: {
            roundCounter: currentRound, 
            lastWords: newHistoryWords,
            lastCategories: newHistoryCategories,
            globalWordUsage: newGlobalWordUsage,
            categoryExhaustion: workingHistory.categoryExhaustion, 
            playerStats: newPlayerStats,
            lastTrollRound: isTrollEvent ? currentRound : workingHistory.lastTrollRound,
            lastArchitectRound: isArchitectTriggered ? currentRound : workingHistory.lastArchitectRound,
            lastStartingPlayers: newStartingPlayers,
            lastBartenders: newLastBartenders, 
            pastImpostorIds: newPastImpostorIds,
            paranoiaLevel: breakProtocolType ? 0 : paranoiaLevel, 
            coolingDownRounds: finalCoolingRounds,
            lastBreakProtocol: breakProtocolType,
            matchLogs: updatedLogs,
            lastLeteoRound: breakProtocolType === 'leteo' ? currentRound : workingHistory.lastLeteoRound
        },
        wordPair
    };
};