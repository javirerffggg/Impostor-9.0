import { useState, useEffect, useCallback } from 'react';
import { 
    GameState, 
    Player, 
    ThemeName, 
    CategoryData, 
    RenunciaDecision 
} from '../types';
import { DEFAULT_PLAYERS, CURATED_COLLECTIONS, GAME_LIMITS, PLAYER_COLORS } from '../constants';
import { generateGameData } from '../utils/gameLogic';
import { 
    generateArchitectOptions,
    generateSmartHint,
    generateVanguardHints
} from '../utils/lexicon/wordSelection';
import { applyRenunciaDecision } from '../utils/protocols/renuncia';
import { CATEGORIES_DATA } from '../categories';
import { calculatePartyIntensity } from '../utils/partyLogic';
import { shuffleArray } from '../utils/utils/helpers';

const DEFAULT_SETTINGS: GameState['settings'] = {
    hintMode: false,
    trollMode: false,
    partyMode: false,
    architectMode: false,
    oracleMode: false,
    vanguardiaMode: false,
    nexusMode: false,
    passPhoneMode: false,
    shuffleEnabled: false,
    impostorEffects: true,
    revealMethod: 'hold',
    swipeSensitivity: 'medium',
    holdRevealSpeed: 'medium',
    hapticFeedback: true,
    soundEnabled: true,
    selectedCategories: [],
    renunciaMode: false,
    protocolMagistrado: false,
    magistradoMinPlayers: 6,
    memoryModeConfig: {
        enabled: false,
        difficulty: 'normal',
        displayTime: 10,
        wordCount: 5,
        highlightIntensity: 0.5
    },
    categoryRepetitionAvoidance: 'medium',
    rareCategoryBoost: false,
    rotationMode: false,
    favoriteCategories: [],
    explorerMode: false,
    allowReReveal: false,
    performanceMode: false,
};

const STORAGE_KEY_HISTORY = 'impostor_game_history_v2';
const STORAGE_KEY_SETTINGS = 'impostor_settings_persist_v1';
const STORAGE_KEY_SESSION = 'impostor_session_state_v1';

// --- SAFE STORAGE HELPER ---
const safeLocalStorageSet = (key: string, value: any): boolean => {
    try {
        const serialized = JSON.stringify(value);
        const sizeInBytes = new Blob([serialized]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 4.5) {
            console.warn(`Data too large (${sizeInMB.toFixed(2)}MB). Compressing...`);
            const parsed = JSON.parse(serialized);
            if (parsed.matchLogs && parsed.matchLogs.length > 50) {
                parsed.matchLogs = parsed.matchLogs.slice(0, 50);
                localStorage.setItem(key, JSON.stringify(parsed));
                return true;
            }
        }
        
        localStorage.setItem(key, serialized);
        return true;
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            try {
                const oldKeys = ['impostor_game_history_v1', 'old_cache_key'];
                oldKeys.forEach(k => localStorage.removeItem(k));
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                console.warn('⚠️ Almacenamiento lleno. Algunas estadísticas no se guardarán.');
                return false;
            }
        }
        console.error('Storage error:', e);
        return false;
    }
};

const getInitialHistory = (): GameState['history'] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
                return {
                    ...parsed,
                    categoryExhaustion: parsed.categoryExhaustion || {},
                    categoryUsageStats: parsed.categoryUsageStats || {},
                    rotationIndex: parsed.rotationIndex || 0,
                    temporaryBlacklist: parsed.temporaryBlacklist || {},
                    explorerDeck: parsed.explorerDeck || []
                };
            }
        }
    } catch (e) {
        console.error("Error loading game history:", e);
    }

    return {
        roundCounter: 0,
        lastWords: [],
        lastCategories: [],
        globalWordUsage: {},
        categoryExhaustion: {},
        categoryUsageStats: {},
        playerStats: {},
        lastTrollRound: 0,
        lastArchitectRound: 0,
        lastStartingPlayers: [],
        pastImpostorIds: [],
        lastBartenders: [],
        paranoiaLevel: 0,
        coolingDownRounds: 0,
        lastBreakProtocol: null,
        matchLogs: [],
        rotationIndex: 0,
        temporaryBlacklist: {},
        explorerDeck: []
    };
};

const getInitialSettings = (): GameState['settings'] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                memoryModeConfig: {
                    ...DEFAULT_SETTINGS.memoryModeConfig,
                    ...(parsed.memoryModeConfig || {})
                },
                favoriteCategories: parsed.favoriteCategories || [],
                explorerMode: parsed.explorerMode ?? false,
                allowReReveal: parsed.allowReReveal ?? false,
                performanceMode: parsed.performanceMode ?? false,
            };
        }
    } catch (e) {
        console.error("Error loading game settings:", e);
    }
    return DEFAULT_SETTINGS;
};

// Apply/remove perf mode attribute on <html> on startup
(function applyPerfModeOnBoot() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.performanceMode === true) {
                document.documentElement.setAttribute('data-perf', 'low');
            }
        }
    } catch {
        // silent
    }
})();

const getInitialSession = (): { players: Player[], impostorCount: number } => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SESSION);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0 && typeof parsed.impostorCount === 'number') {
                return {
                    players: parsed.players,
                    impostorCount: parsed.impostorCount
                };
            }
        }
    } catch (e) {
        console.error("Error loading session state:", e);
    }
    
    return {
        players: DEFAULT_PLAYERS.map((name, index) => ({ 
            id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
            name,
            avatarIdx: index
        })),
        impostorCount: 1
    };
};

const sessionInit = getInitialSession();

const INITIAL_STATE: GameState = {
    phase: 'setup',
    players: sessionInit.players,
    gameData: [],
    impostorCount: sessionInit.impostorCount,
    currentPlayerIndex: 0,
    startingPlayer: "",
    isTrollEvent: false,
    trollScenario: null,
    isArchitectRound: false,
    history: getInitialHistory(),
    settings: getInitialSettings(),
    debugState: { 
        isEnabled: false, 
        forceTroll: null, 
        forceArchitect: false,
        godModeAssignments: {}
    },
    partyState: { intensity: 'aperitivo', consecutiveHardcoreRounds: 0, isHydrationLocked: false },
    currentDrinkingPrompt: "",
    theme: 'luminous'
};

export const useGameState = () => {
    const [savedPlayers, setSavedPlayers] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('impostor_saved_players') || '[]');
        } catch {
            return [];
        }
    });

    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [architectOptions, setArchitectOptions] = useState<[ { categoryName: string, wordPair: CategoryData }, { categoryName: string, wordPair: CategoryData } ] | null>(null);
    const [architectRegenCount, setArchitectRegenCount] = useState(0);
    const [currentWordPair, setCurrentWordPair] = useState<CategoryData | null>(null);

    useEffect(() => {
        localStorage.setItem('impostor_saved_players', JSON.stringify(savedPlayers));
    }, [savedPlayers]);

    useEffect(() => {
        safeLocalStorageSet(STORAGE_KEY_HISTORY, gameState.history);
    }, [gameState.history]);

    useEffect(() => {
        safeLocalStorageSet(STORAGE_KEY_SETTINGS, gameState.settings);
    }, [gameState.settings]);

    useEffect(() => {
        const sessionData = {
            players: gameState.players,
            impostorCount: gameState.impostorCount
        };
        safeLocalStorageSet(STORAGE_KEY_SESSION, sessionData);
    }, [gameState.players, gameState.impostorCount]);

    useEffect(() => {
        if (gameState.settings.performanceMode) {
            document.documentElement.setAttribute('data-perf', 'low');
        } else {
            document.documentElement.removeAttribute('data-perf');
        }
    }, [gameState.settings.performanceMode]);

    const addPlayer = useCallback((name: string) => {
        if (!name.trim()) return;
        if (gameState.players.length >= GAME_LIMITS.MAX_PLAYERS) {
            console.warn(`Cannot add more than ${GAME_LIMITS.MAX_PLAYERS} players`);
            return;
        }
        setGameState(prev => {
            const nextAvatarIdx = (prev.players.length) % 12;
            return {
                ...prev,
                players: [...prev.players, { 
                    id: Date.now().toString(), 
                    name: name.trim(),
                    avatarIdx: nextAvatarIdx
                }]
            };
        });
    }, [gameState.players.length]);

    const removePlayer = useCallback((id: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
        }));
    }, []);

    const cyclePlayerColor = useCallback((id: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => {
                if (p.id === id) {
                    const currentIdx = p.avatarIdx ?? 0;
                    return { ...p, avatarIdx: (currentIdx + 1) % 12 };
                }
                return p;
            })
        }));
    }, []);

    const saveToBank = useCallback((name: string) => {
        if (!name.trim() || savedPlayers.includes(name.trim())) return;
        setSavedPlayers(prev => [...prev, name.trim()]);
    }, [savedPlayers]);

    const deleteFromBank = useCallback((name: string) => {
        setSavedPlayers(prev => prev.filter(p => p !== name));
    }, []);

    const updateSettings = useCallback((newSettings: Partial<GameState['settings']>) => {
        setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    const toggleCategory = useCallback((cat: string) => {
        setGameState(prev => {
            const current = prev.settings.selectedCategories;
            const exists = current.includes(cat);
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    selectedCategories: exists 
                        ? current.filter(c => c !== cat)
                        : [...current, cat]
                }
            };
        });
    }, []);

    const toggleFavoriteCategory = useCallback((cat: string) => {
        setGameState(prev => {
            const current = prev.settings.favoriteCategories || [];
            const exists = current.includes(cat);
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    favoriteCategories: exists
                        ? current.filter(c => c !== cat)
                        : [...current, cat]
                }
            };
        });
    }, []);

    const blockCategoryTemporarily = useCallback((cat: string, rounds: number = 5) => {
        setGameState(prev => ({
            ...prev,
            history: {
                ...prev.history,
                temporaryBlacklist: {
                    ...prev.history.temporaryBlacklist,
                    [cat]: rounds
                }
            }
        }));
    }, []);

    const toggleCollection = useCallback((colId: string) => {
        setGameState(prev => {
            const collection = CURATED_COLLECTIONS.find(c => c.id === colId);
            if (!collection) return prev;
            const current = prev.settings.selectedCategories;
            const allIn = collection.categories.every(c => current.includes(c));
            let newCats: string[];
            if (allIn) {
                newCats = current.filter(c => !collection.categories.includes(c));
            } else {
                newCats = [...new Set([...current, ...collection.categories])];
            }
            return {
                ...prev,
                settings: { ...prev.settings, selectedCategories: newCats }
            };
        });
    }, []);

    const toggleAllCategories = useCallback(() => {
        setGameState(prev => {
            const allCats = Object.keys(CATEGORIES_DATA);
            const current = prev.settings.selectedCategories;
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    selectedCategories: current.length === allCats.length ? [] : allCats
                }
            };
        });
    }, []);

    const runGameGeneration = useCallback(() => {
        setGameState(prev => {
            const result = generateGameData({
                players: prev.players,
                impostorCount: prev.impostorCount,
                useHintMode: prev.settings.hintMode,
                useTrollMode: prev.settings.trollMode,
                useArchitectMode: prev.settings.architectMode,
                useOracleMode: prev.settings.oracleMode,
                useVanguardiaMode: prev.settings.vanguardiaMode,
                useNexusMode: prev.settings.nexusMode,
                useRenunciaMode: prev.settings.renunciaMode,
                useMagistradoMode: prev.settings.protocolMagistrado,
                selectedCats: prev.settings.selectedCategories,
                history: prev.history,
                debugOverrides: prev.debugState.isEnabled ? {
                    forceTroll: prev.debugState.forceTroll,
                    forceArchitect: prev.debugState.forceArchitect
                } : undefined,
                isPartyMode: prev.settings.partyMode,
                memoryModeConfig: prev.settings.memoryModeConfig,
                categorySettings: {
                    repetitionAvoidance: prev.settings.categoryRepetitionAvoidance,
                    rareBoost: prev.settings.rareCategoryBoost,
                    rotationMode: prev.settings.rotationMode,
                    favorites: prev.settings.favoriteCategories || [],
                    explorerMode: prev.settings.explorerMode || false
                }
            });

            setCurrentWordPair(result.wordPair);

            if (result.isArchitectTriggered) {
                const options = generateArchitectOptions(prev.settings.selectedCategories);
                setArchitectOptions(options);
                setArchitectRegenCount(0);
                // Architect goes directly into 'revealing' at index 0.
                // The ArchitectBloomGate in RevealingView intercepts their card
                // and shows the selection screen after a hold gesture.
                return {
                    ...prev,
                    phase: result.oracleSetup ? 'oracle' : 'revealing',
                    gameData: result.players,
                    isTrollEvent: result.isTrollEvent,
                    trollScenario: result.trollScenario,
                    isArchitectRound: true,
                    startingPlayer: result.designatedStarter,
                    currentPlayerIndex: 0,
                    history: result.newHistory,
                    partyState: { ...prev.partyState, intensity: calculatePartyIntensity(result.newHistory.roundCounter) },
                    oracleSetup: result.oracleSetup,
                    renunciaData: result.renunciaData,
                    magistradoData: result.magistradoData
                };
            }

            return {
                ...prev,
                phase: result.oracleSetup ? 'oracle' : 'revealing',
                gameData: result.players,
                isTrollEvent: result.isTrollEvent,
                trollScenario: result.trollScenario,
                isArchitectRound: false,
                startingPlayer: result.designatedStarter,
                currentPlayerIndex: 0,
                history: result.newHistory,
                partyState: { ...prev.partyState, intensity: calculatePartyIntensity(result.newHistory.roundCounter) },
                oracleSetup: result.oracleSetup,
                renunciaData: result.renunciaData,
                magistradoData: result.magistradoData
            };
        });

        return { hydrationTimer: 0 }; 
    }, []);

    const handleArchitectRegenerate = useCallback(() => {
        if (architectRegenCount >= 3) return;
        const newOptions = generateArchitectOptions(gameState.settings.selectedCategories);
        setArchitectOptions(newOptions);
        setArchitectRegenCount(prev => prev + 1);
    }, [architectRegenCount, gameState.settings.selectedCategories]);

    const handleArchitectConfirm = useCallback((selection: { categoryName: string, wordPair: CategoryData }) => {
        setCurrentWordPair(selection.wordPair);
        setGameState(prev => {
            const newGameData = prev.gameData.map(p => {
                if (!p.isImp) {
                    return { 
                        ...p, 
                        realWord: selection.wordPair.civ, 
                        word: selection.wordPair.civ, 
                        category: selection.categoryName 
                    };
                } else {
                    let newWord = "ERES EL IMPOSTOR";
                    if (prev.settings.hintMode) {
                        if (p.isVanguardia) {
                            newWord = generateVanguardHints(selection.wordPair);
                        } else {
                             newWord = `PISTA: ${generateSmartHint(selection.wordPair)}`;
                        }
                    }
                    return { 
                        ...p, 
                        realWord: selection.wordPair.civ, 
                        word: newWord, 
                        category: selection.categoryName 
                    };
                }
            });

            let updatedOracleSetup = prev.oracleSetup;
            if (updatedOracleSetup) {
                const hints = selection.wordPair.hints && selection.wordPair.hints.length >= 3 
                    ? selection.wordPair.hints.slice(0, 3) 
                    : shuffleArray([
                        ...(selection.wordPair.hints || []), 
                        selection.wordPair.hint || "Sin Pista", 
                        "RUIDO"
                    ]).slice(0, 3);

                updatedOracleSetup = {
                    ...updatedOracleSetup,
                    availableHints: hints,
                    civilWord: selection.wordPair.civ 
                };
            }

            return {
                ...prev,
                gameData: newGameData,
                oracleSetup: updatedOracleSetup,
                // After confirming, advance to next player (index 1) so the
                // Architect's own card turn is not repeated.
                phase: updatedOracleSetup ? 'oracle' : 'revealing',
                currentPlayerIndex: 1
            };
        });
    }, []);

    const handleOracleSelection = useCallback((selectedHint: string) => {
        setGameState(prev => {
            const newGameData = prev.gameData.map(p => {
                if (p.isImp) {
                    return {
                        ...p,
                        word: `PISTA: ${selectedHint}`,
                        oracleChosen: true,
                        oracleTriggered: true
                    };
                }
                return p;
            });

            return {
                ...prev,
                gameData: newGameData,
                phase: 'revealing',
                currentPlayerIndex: 0,
                oracleSetup: undefined
            };
        });
    }, []);

    const handleOracleConfirm = useCallback((hint: string) => {
        handleOracleSelection(hint);
    }, [handleOracleSelection]);

    const handleRenunciaDecision = useCallback((decision: RenunciaDecision) => {
        if (!gameState.renunciaData || !currentWordPair) return;

        const candidateRevealIndex = gameState.gameData.findIndex(
            p => p.id === gameState.renunciaData!.candidatePlayerId
        );

        const result = applyRenunciaDecision(
            decision,
            gameState.gameData,
            gameState.renunciaData,
            currentWordPair,
            gameState.history.playerStats,
            gameState.settings.hintMode,
            candidateRevealIndex,
            gameState.gameData.find(p => p.isArchitect)?.id,
            gameState.oracleSetup?.oraclePlayerId
        );

        setGameState(prev => {
            const updatedMatchLogs = [...prev.history.matchLogs];
            if (updatedMatchLogs.length > 0) {
                const latestLog = updatedMatchLogs[0];
                updatedMatchLogs[0] = {
                    ...latestLog,
                    renunciaDecision: result.updatedRenunciaData.decision,
                    renunciaWitness: result.updatedRenunciaData.witnessPlayerId 
                        ? result.updatedGameData.find(p => p.id === result.updatedRenunciaData.witnessPlayerId)?.name
                        : undefined
                };
            }

            return {
                ...prev,
                phase: 'revealing',
                gameData: result.updatedGameData,
                renunciaData: result.updatedRenunciaData,
                history: {
                    ...prev.history,
                    matchLogs: updatedMatchLogs
                }
            };
        });
    }, [gameState.renunciaData, gameState.gameData, gameState.history, gameState.settings.hintMode, gameState.oracleSetup, currentWordPair]);

    const handleRenunciaRoleSeen = useCallback(() => {
        setGameState(prev => {
            if (!prev.renunciaData) return prev;
            return {
                ...prev,
                renunciaData: {
                    ...prev.renunciaData,
                    hasSeenInitialRole: true
                }
            };
        });
    }, []);

    return {
        gameState,
        setGameState,
        savedPlayers,
        architectOptions,
        architectRegenCount,
        actions: {
            updateSettings,
            addPlayer,
            removePlayer,
            cyclePlayerColor,
            saveToBank,
            deleteFromBank,
            toggleCategory,
            toggleFavoriteCategory,
            blockCategoryTemporarily,
            toggleCollection,
            toggleAllCategories,
            runGameGeneration,
            handleArchitectConfirm,
            handleArchitectRegenerate,
            setArchitectRegenCount,
            handleOracleConfirm,
            handleOracleSelection,
            handleRenunciaDecision,
            handleRenunciaRoleSeen
        }
    };
};
