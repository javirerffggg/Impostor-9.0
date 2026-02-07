import { useState, useEffect, useCallback } from 'react';
import { 
    GameState, 
    Player, 
    ThemeName, 
    CategoryData, 
    RenunciaDecision 
} from '../types';
import { DEFAULT_PLAYERS, CURATED_COLLECTIONS } from '../constants';
import { 
    generateGameData, 
    generateArchitectOptions, 
    applyRenunciaDecision,
    generateSmartHint,
    generateVanguardHints
} from '../utils/gameLogic';
import { CATEGORIES_DATA } from '../categories';
import { calculatePartyIntensity } from '../utils/partyLogic';

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
    revealMethod: 'hold',
    swipeSensitivity: 'medium',
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
    }
};

const INITIAL_STATE: GameState = {
    phase: 'setup',
    players: DEFAULT_PLAYERS.map((name, i) => ({ id: i.toString(), name })),
    gameData: [],
    impostorCount: 1,
    currentPlayerIndex: 0,
    startingPlayer: "",
    isTrollEvent: false,
    trollScenario: null,
    isArchitectRound: false,
    history: {
        roundCounter: 0,
        lastWords: [],
        lastCategories: [],
        globalWordUsage: {},
        playerStats: {},
        lastTrollRound: 0,
        lastArchitectRound: 0,
        lastStartingPlayers: [],
        pastImpostorIds: [],
        lastBartenders: [],
        paranoiaLevel: 0,
        coolingDownRounds: 0,
        lastBreakProtocol: null,
        matchLogs: []
    },
    settings: DEFAULT_SETTINGS,
    debugState: { isEnabled: false, forceTroll: null, forceArchitect: false },
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

    // Actions

    const addPlayer = useCallback((name: string) => {
        if (!name.trim()) return;
        setGameState(prev => ({
            ...prev,
            players: [...prev.players, { id: Date.now().toString(), name: name.trim() }]
        }));
    }, []);

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
        const result = generateGameData({
            players: gameState.players,
            impostorCount: gameState.impostorCount,
            useHintMode: gameState.settings.hintMode,
            useTrollMode: gameState.settings.trollMode,
            useArchitectMode: gameState.settings.architectMode,
            useOracleMode: gameState.settings.oracleMode,
            useVanguardiaMode: gameState.settings.vanguardiaMode,
            useNexusMode: gameState.settings.nexusMode,
            useRenunciaMode: gameState.settings.renunciaMode,
            useMagistradoMode: gameState.settings.protocolMagistrado,
            selectedCats: gameState.settings.selectedCategories,
            history: gameState.history,
            debugOverrides: gameState.debugState.isEnabled ? {
                forceTroll: gameState.debugState.forceTroll,
                forceArchitect: gameState.debugState.forceArchitect
            } : undefined,
            isPartyMode: gameState.settings.partyMode,
            memoryModeConfig: gameState.settings.memoryModeConfig
        });

        setCurrentWordPair(result.wordPair);

        // Handle Architect
        if (result.isArchitectTriggered) {
            const options = generateArchitectOptions(gameState.settings.selectedCategories);
            setArchitectOptions(options);
            setArchitectRegenCount(0);
            
            setGameState(prev => ({
                ...prev,
                phase: 'architect',
                gameData: result.players, // Initial assignment
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
            }));
            
            // Adjust current player index to the architect
            const architectIndex = result.players.findIndex(p => p.isArchitect);
            if (architectIndex !== -1) {
                 setGameState(prev => ({ ...prev, currentPlayerIndex: architectIndex }));
            }
            return;
        }

        // Standard Start
        setGameState(prev => ({
            ...prev,
            phase: prev.phase === 'oracle' ? 'oracle' : (result.oracleSetup ? 'oracle' : 'revealing'),
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
        }));

        if (result.oracleSetup) {
             setGameState(prev => ({ ...prev, phase: 'oracle' }));
        }

        return { hydrationTimer: 0 }; 
    }, [gameState.players, gameState.impostorCount, gameState.settings, gameState.history, gameState.debugState]);

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

            return {
                ...prev,
                gameData: newGameData,
                phase: prev.oracleSetup ? 'oracle' : 'revealing',
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