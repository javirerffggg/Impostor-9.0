



import { useState, useEffect, useCallback } from 'react';
import { 
    GameState, 
    Player, 
    ThemeName, 
    CategoryData, 
    RenunciaDecision 
} from '../types';
import { DEFAULT_PLAYERS, CURATED_COLLECTIONS, GAME_LIMITS } from '../constants';
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
    impostorEffects: true, // Default to true
    revealMethod: 'hold',
    swipeSensitivity: 'medium',
    holdRevealSpeed: 'medium', // Default smoothness
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
    // ✨ NUEVO: Ajustes de selección de categorías
    categoryRepetitionAvoidance: 'medium',
    rareCategoryBoost: false,
    rotationMode: false,
    favoriteCategories: [],
    explorerMode: false
};

const STORAGE_KEY_HISTORY = 'impostor_game_history_v2';
const STORAGE_KEY_SETTINGS = 'impostor_settings_persist_v1';
const STORAGE_KEY_SESSION = 'impostor_session_state_v1';

// --- SAFE STORAGE HELPER ---
const safeLocalStorageSet = (key: string, value: any): boolean => {
    try {
        const serialized = JSON.stringify(value);
        
        // Check size before saving (5MB limit typical)
        const sizeInBytes = new Blob([serialized]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 4.5) { // Leave 0.5MB buffer
            console.warn(`Data too large (${sizeInMB.toFixed(2)}MB). Compressing...`);
            
            // Trim old match logs if history is too big
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
            // Try clearing old data
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
            // Basic validation to ensure it has required fields
            if (parsed && typeof parsed === 'object') {
                return {
                    ...parsed,
                    // Ensure new fields exist if loading old history
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
        categoryExhaustion: {}, // New Exhaustion System
        categoryUsageStats: {}, // Usage Stats
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
            // Deep merge to ensure new settings keys are present
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                memoryModeConfig: {
                    ...DEFAULT_SETTINGS.memoryModeConfig,
                    ...(parsed.memoryModeConfig || {})
                },
                favoriteCategories: parsed.favoriteCategories || [],
                explorerMode: parsed.explorerMode || false
            };
        }
    } catch (e) {
        console.error("Error loading game settings:", e);
    }
    return DEFAULT_SETTINGS;
};

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
    
    // Usar Date.now() también para defaults para asegurar IDs únicos
    return {
        players: DEFAULT_PLAYERS.map((name) => ({ 
            id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
            name 
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
    // Load saved players from local storage
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

    // Save players effect
    useEffect(() => {
        localStorage.setItem('impostor_saved_players', JSON.stringify(savedPlayers));
    }, [savedPlayers]);

    // Save history effect (Persistence) - USING SAFE STORAGE
    useEffect(() => {
        safeLocalStorageSet(STORAGE_KEY_HISTORY, gameState.history);
    }, [gameState.history]);

    // Save settings effect (Persistence) - USING SAFE STORAGE
    useEffect(() => {
        safeLocalStorageSet(STORAGE_KEY_SETTINGS, gameState.settings);
    }, [gameState.settings]);

    // Save active session state (Persistence) - USING SAFE STORAGE
    useEffect(() => {
        const sessionData = {
            players: gameState.players,
            impostorCount: gameState.impostorCount
        };
        safeLocalStorageSet(STORAGE_KEY_SESSION, sessionData);
    }, [gameState.players, gameState.impostorCount]);

    // Actions

    const addPlayer = useCallback((name: string) => {
        if (!name.trim()) return;
        
        // NEW: Validate player limit
        if (gameState.players.length >= GAME_LIMITS.MAX_PLAYERS) {
            console.warn(`Cannot add more than ${GAME_LIMITS.MAX_PLAYERS} players`);
            return;
        }

        setGameState(prev => ({
            ...prev,
            players: [...prev.players, { id: Date.now().toString(), name: name.trim() }]
        }));
    }, [gameState.players.length]);

    const removePlayer = useCallback((id: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
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

    // ✨ NUEVO: Gestión de Favoritos
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

    // ✨ NUEVO: Gestión de Blacklist Temporal
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
        // Usar functional update para acceder a estado más reciente
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
                // ✨ NUEVO: Pasar ajustes completos de categoría
                categorySettings: {
                    repetitionAvoidance: prev.settings.categoryRepetitionAvoidance,
                    rareBoost: prev.settings.rareCategoryBoost,
                    rotationMode: prev.settings.rotationMode,
                    favorites: prev.settings.favoriteCategories || [],
                    explorerMode: prev.settings.explorerMode || false
                }
            });

            // Update local refs (side effects are tricky inside setGameState, but these are for immediate UI sync)
            setCurrentWordPair(result.wordPair);

            // Handle Architect
            if (result.isArchitectTriggered) {
                const options = generateArchitectOptions(prev.settings.selectedCategories);
                setArchitectOptions(options);
                setArchitectRegenCount(0);
                
                // Adjust current player index to the architect
                const architectIndex = result.players.findIndex(p => p.isArchitect);
                
                return {
                    ...prev,
                    phase: 'architect',
                    gameData: result.players, // Initial assignment
                    isTrollEvent: result.isTrollEvent,
                    trollScenario: result.trollScenario,
                    isArchitectRound: true,
                    startingPlayer: result.designatedStarter,
                    currentPlayerIndex: architectIndex !== -1 ? architectIndex : 0,
                    history: result.newHistory,
                    partyState: { ...prev.partyState, intensity: calculatePartyIntensity(result.newHistory.roundCounter) },
                    oracleSetup: result.oracleSetup,
                    renunciaData: result.renunciaData,
                    magistradoData: result.magistradoData
                };
            }

            // Standard Start
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
        // Need current settings for regeneration, access via prev state in a real component or ref, 
        // here using dependency on gameState.settings is acceptable if this function is recreated on setting change
        // OR pass settings as arg. For simplicity, we use dependencies here as it's triggered by user.
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
                    // Update Impostor
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

            // ✅ Actualizar oracleSetup si existe con la nueva palabra
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
                phase: updatedOracleSetup ? 'oracle' : 'revealing',
                currentPlayerIndex: 0
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
                        oracleTriggered: true // For UI feedback
                    };
                }
                return p;
            });

            return {
                ...prev,
                gameData: newGameData,
                phase: 'revealing',
                currentPlayerIndex: 0,
                oracleSetup: undefined // Clear setup so we don't loop back
            };
        });
    }, []);

    const handleOracleConfirm = useCallback((hint: string) => {
        handleOracleSelection(hint);
    }, [handleOracleSelection]);

    const handleRenunciaDecision = useCallback((decision: RenunciaDecision) => {
        if (!gameState.renunciaData || !currentWordPair) return;

        // Find candidate's position in reveal order
        const candidateRevealIndex = gameState.gameData.findIndex(
            p => p.id === gameState.renunciaData!.candidatePlayerId
        );

        // Apply Logic
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

        // Update MatchLog with decision
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