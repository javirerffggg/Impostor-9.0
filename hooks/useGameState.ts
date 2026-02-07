



import { useState, useEffect } from 'react';
import { GameState, Player, InfinityVault, TrollScenario, CategoryData, RenunciaDecision } from '../types';
import { DEFAULT_PLAYERS, CURATED_COLLECTIONS } from '../constants';
import { generateGameData, generateArchitectOptions, generateSmartHint, generateVanguardHints, applyRenunciaDecision } from '../utils/gameLogic';
import { calculatePartyIntensity } from '../utils/partyLogic';
import { CATEGORIES_DATA } from '../categories';

export const useGameState = () => {
    // -- State --
    const [gameState, setGameState] = useState<GameState>(() => {
        // Default History
        let loadedHistory: GameState['history'] = { 
            roundCounter: 0,
            lastWords: [],
            lastCategories: [],
            globalWordUsage: {},
            playerStats: {}, // Infinity Vault
            lastTrollRound: -10,
            lastArchitectRound: -999,
            lastStartingPlayers: [],
            lastBartenders: [], // v4.0 BACCHUS
            matchLogs: [], // v6.2
            pastImpostorIds: [],
            paranoiaLevel: 0,
            coolingDownRounds: 0,
            lastBreakProtocol: null
        };

        // Default Settings
        let loadedSettings: GameState['settings'] = {
            hintMode: false,
            trollMode: false,
            partyMode: false,
            architectMode: false,
            oracleMode: false,
            vanguardiaMode: false,
            nexusMode: false,
            passPhoneMode: false,
            shuffleEnabled: true,
            revealMethod: 'hold', 
            swipeSensitivity: 'medium',
            hapticFeedback: true,
            soundEnabled: true,
            selectedCategories: [],
            renunciaMode: false // v12.0
        };

        // Try to recover The Infinity Vault from LocalStorage
        try {
            const savedVault = localStorage.getItem('impostor_infinite_vault_v6');
            if (savedVault) {
                const parsed = JSON.parse(savedVault);
                if (parsed.playerStats) {
                    loadedHistory = {
                        ...loadedHistory,
                        ...parsed,
                        globalWordUsage: parsed.globalWordUsage || {},
                        lastCategories: parsed.lastCategories || [],
                        lastArchitectRound: parsed.lastArchitectRound || -999,
                        lastStartingPlayers: parsed.lastStartingPlayers || [],
                        lastBartenders: parsed.lastBartenders || [],
                        matchLogs: parsed.matchLogs || [],
                        pastImpostorIds: parsed.pastImpostorIds || [],
                        paranoiaLevel: parsed.paranoiaLevel || 0,
                        coolingDownRounds: parsed.coolingDownRounds || 0,
                        lastBreakProtocol: parsed.lastBreakProtocol || null
                    };
                }
            }
        } catch (e) {
            console.error("Protocol Infinitum: Memory Corrupted. Resetting Vault.", e);
        }

        // Try to recover Settings from LocalStorage
        try {
            const savedSettings = localStorage.getItem('impostor_settings_v2');
            if (savedSettings) {
                loadedSettings = { ...loadedSettings, ...JSON.parse(savedSettings) };
            }
        } catch (e) {
            console.error("Protocol Lexicon: Settings corrupted. Using defaults.", e);
        }

        return {
            phase: 'setup',
            players: DEFAULT_PLAYERS.map((name, i) => ({ id: i.toString(), name })),
            gameData: [],
            impostorCount: 1,
            currentPlayerIndex: 0,
            startingPlayer: "",
            isTrollEvent: false,
            trollScenario: null,
            isArchitectRound: false,
            history: loadedHistory,
            settings: loadedSettings,
            debugState: {
                isEnabled: false,
                forceTroll: null,
                forceArchitect: false
            },
            partyState: {
                intensity: 'aperitivo',
                consecutiveHardcoreRounds: 0,
                isHydrationLocked: false
            },
            currentDrinkingPrompt: "",
            theme: 'illojuan'
        };
    });

    const [savedPlayers, setSavedPlayers] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('impostor_saved_players');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [architectOptions, setArchitectOptions] = useState<[ { categoryName: string, wordPair: CategoryData }, { categoryName: string, wordPair: CategoryData } ] | null>(null);
    const [architectRegenCount, setArchitectRegenCount] = useState(0);
    const [currentWordPair, setCurrentWordPair] = useState<CategoryData | null>(null); // To support Renuncia logic

    // -- Persistence Effects --
    useEffect(() => {
        localStorage.setItem('impostor_saved_players', JSON.stringify(savedPlayers));
    }, [savedPlayers]);

    useEffect(() => {
        localStorage.setItem('impostor_infinite_vault_v6', JSON.stringify(gameState.history));
    }, [gameState.history]);

    useEffect(() => {
        localStorage.setItem('impostor_settings_v2', JSON.stringify(gameState.settings));
    }, [gameState.settings]);

    // -- Actions --

    const updateSettings = (newSettings: Partial<GameState['settings']>) => {
        setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    };

    const addPlayer = (name: string) => {
        if (!name.trim()) return;
        if (gameState.players.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) return;
        const newPlayer: Player = { id: Date.now().toString() + Math.random(), name: name.trim() };
        setGameState(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
    };

    const removePlayer = (id: string) => {
        setGameState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id) }));
    };

    const saveToBank = (name: string) => {
        if (!name.trim()) return;
        if (!savedPlayers.includes(name.trim())) {
            setSavedPlayers(prev => [...prev, name.trim()]);
        }
    };

    const deleteFromBank = (name: string) => {
        setSavedPlayers(prev => prev.filter(p => p !== name));
    };

    const toggleCategory = (cat: string) => {
        setGameState(prev => {
            const current = prev.settings.selectedCategories;
            const updated = current.includes(cat) 
                ? current.filter(c => c !== cat) 
                : [...current, cat];
            return { ...prev, settings: { ...prev.settings, selectedCategories: updated } };
        });
    };

    const toggleCollection = (collectionId: string) => {
        const collection = CURATED_COLLECTIONS.find(c => c.id === collectionId);
        if (!collection) return;

        setGameState(prev => {
            const currentCatsSet = new Set(prev.settings.selectedCategories);
            
            // Si TODAS las categorías de la colección ya están seleccionadas, las quitamos (Toggle OFF)
            // Si falta al menos una, las añadimos todas (Toggle ON)
            const allSelected = collection.categories.every(cat => currentCatsSet.has(cat));

            if (allSelected) {
                collection.categories.forEach(cat => currentCatsSet.delete(cat));
            } else {
                collection.categories.forEach(cat => currentCatsSet.add(cat));
            }

            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    selectedCategories: Array.from(currentCatsSet)
                }
            };
        });
    };

    const toggleAllCategories = () => {
        const allCats = Object.keys(CATEGORIES_DATA);
        const currentCount = gameState.settings.selectedCategories.length;
        const allSelected = currentCount === allCats.length;
        setGameState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                selectedCategories: allSelected ? [] : allCats
            }
        }));
    };

    const runGameGeneration = () => {
        const { players, isTrollEvent, trollScenario, isArchitectTriggered, newHistory, designatedStarter, oracleSetup, renunciaData, wordPair } = generateGameData({
            players: gameState.players,
            impostorCount: gameState.impostorCount,
            useHintMode: gameState.settings.hintMode,
            useTrollMode: gameState.settings.trollMode,
            useArchitectMode: gameState.settings.architectMode,
            useOracleMode: gameState.settings.oracleMode,
            useVanguardiaMode: gameState.settings.vanguardiaMode,
            useNexusMode: gameState.settings.nexusMode,
            useRenunciaMode: gameState.settings.renunciaMode,
            selectedCats: gameState.settings.selectedCategories,
            history: gameState.history,
            debugOverrides: gameState.debugState.isEnabled ? {
                forceTroll: gameState.debugState.forceTroll,
                forceArchitect: gameState.debugState.forceArchitect
            } : undefined,
            isPartyMode: gameState.settings.partyMode
        });

        setCurrentWordPair(wordPair || null);

        const cleanDebugState = {
            ...gameState.debugState,
            forceTroll: null,
            forceArchitect: false
        };

        // Bacchus Logic
        let newPartyState = { ...gameState.partyState };
        let hydrationTimer = 0;

        if (gameState.settings.partyMode) {
            const newIntensity = calculatePartyIntensity(newHistory.roundCounter);
            let consecutiveHardcore = newPartyState.consecutiveHardcoreRounds;
            
            if (newIntensity === 'after_hours') {
                consecutiveHardcore += 1;
            } else {
                consecutiveHardcore = 0;
            }

            if (consecutiveHardcore >= 4) {
                newPartyState.isHydrationLocked = true;
                consecutiveHardcore = 0;
                hydrationTimer = 20; 
            }

            newPartyState = {
                intensity: newIntensity,
                consecutiveHardcoreRounds: consecutiveHardcore,
                isHydrationLocked: newPartyState.isHydrationLocked
            };
        }

        if (isArchitectTriggered) {
            const firstCivilIndex = players.findIndex(p => !p.isImp);
            if (firstCivilIndex !== -1) {
                players[firstCivilIndex].isArchitect = true;
                const initialOptions = generateArchitectOptions(gameState.settings.selectedCategories);
                setArchitectOptions(initialOptions);
                setArchitectRegenCount(0);

                setGameState(prev => ({
                    ...prev,
                    phase: 'architect',
                    gameData: players,
                    isTrollEvent,
                    trollScenario,
                    isArchitectRound: true,
                    currentPlayerIndex: firstCivilIndex,
                    startingPlayer: designatedStarter,
                    history: newHistory as GameState['history'],
                    currentDrinkingPrompt: "",
                    debugState: cleanDebugState,
                    partyState: newPartyState
                }));
                return { hydrationTimer };
            }
        }

        // v7.0 PROTOCOLO ORÁCULO INTERCEPTION
        if (oracleSetup) {
             setGameState(prev => ({
                ...prev,
                phase: 'oracle', // New Phase
                gameData: players,
                isTrollEvent,
                trollScenario,
                isArchitectRound: false,
                currentPlayerIndex: 0,
                startingPlayer: designatedStarter,
                history: newHistory as GameState['history'],
                oracleSetup: oracleSetup,
                currentDrinkingPrompt: "",
                debugState: cleanDebugState,
                partyState: newPartyState,
                renunciaData: renunciaData // Store but don't show yet if Oracle is active
             }));
             return { hydrationTimer };
        }

        // v12.0 PROTOCOLO RENUNCIA
        if (renunciaData) {
            setGameState(prev => ({
                ...prev,
                phase: 'renuncia', // New Phase
                gameData: players,
                isTrollEvent,
                trollScenario,
                isArchitectRound: false,
                currentPlayerIndex: 0,
                startingPlayer: designatedStarter,
                history: newHistory as GameState['history'],
                renunciaData: renunciaData,
                currentDrinkingPrompt: "",
                debugState: cleanDebugState,
                partyState: newPartyState
            }));
            return { hydrationTimer };
        }

        setGameState(prev => ({
            ...prev,
            phase: 'revealing',
            gameData: players,
            isTrollEvent,
            trollScenario,
            isArchitectRound: false,
            currentPlayerIndex: 0,
            startingPlayer: designatedStarter,
            history: newHistory as GameState['history'], 
            currentDrinkingPrompt: "",
            debugState: cleanDebugState,
            partyState: newPartyState
        }));

        return { hydrationTimer };
    };

    const handleArchitectConfirm = (selection: { categoryName: string, wordPair: CategoryData }) => {
        const updatedGameData = gameState.gameData.map(p => {
            const hint = generateSmartHint(selection.wordPair);
            let displayWord = selection.wordPair.civ;
            
            if (p.isImp) {
                if (p.isVanguardia) {
                    displayWord = generateVanguardHints(selection.wordPair);
                } else {
                    displayWord = gameState.settings.hintMode ? `PISTA: ${hint}` : "ERES EL IMPOSTOR";
                }
            }

            return {
                ...p,
                word: displayWord,
                realWord: selection.wordPair.civ,
                category: selection.categoryName
            };
        });

        const updatedHistory = { ...gameState.history };
        updatedHistory.lastWords = [selection.wordPair.civ, ...updatedHistory.lastWords].slice(0, 15);
        updatedHistory.lastCategories = [selection.categoryName, ...updatedHistory.lastCategories].slice(0, 3);
        updatedHistory.globalWordUsage[selection.wordPair.civ] = (updatedHistory.globalWordUsage[selection.wordPair.civ] || 0) + 1;

        setGameState(prev => ({
            ...prev,
            phase: 'revealing',
            gameData: updatedGameData,
            history: updatedHistory,
        }));
    };

    const handleArchitectRegenerate = () => {
        if (architectRegenCount >= 3) return;
        setArchitectRegenCount(prev => prev + 1);
        const newOptions = generateArchitectOptions(gameState.settings.selectedCategories);
        setArchitectOptions(newOptions);
    };

    const handleOracleConfirm = (hint: string) => {
        setGameState(prev => {
            const updatedGameData = prev.gameData.map(p => {
                if (p.isImp) {
                    return {
                        ...p,
                        word: `PISTA: ${hint}`,
                        oracleTriggered: true
                    };
                }
                return p;
            });
            return {
                ...prev,
                gameData: updatedGameData
            };
        });
    };

    const handleOracleSelection = (selectedHint: string) => {
        setGameState(prev => {
            const updatedGameData = prev.gameData.map(p => {
                // Update all impostors with the chosen hint and mark them
                if (p.isImp) {
                    return {
                        ...p,
                        word: `PISTA: ${selectedHint}`,
                        oracleChosen: true
                    };
                }
                return p;
            });

            // If Renuncia was triggered (e.g., generated but Oracle happened first), transition to it now
            if (prev.renunciaData) {
                return {
                    ...prev,
                    phase: 'renuncia', 
                    gameData: updatedGameData
                };
            }

            return {
                ...prev,
                phase: 'revealing', // Move to reveal phase
                gameData: updatedGameData
            };
        });
    };

    const handleRenunciaDecision = (decision: RenunciaDecision) => {
        if (!gameState.renunciaData || !currentWordPair) return;

        // Apply Logic
        const result = applyRenunciaDecision(
            decision,
            gameState.gameData,
            gameState.renunciaData,
            currentWordPair,
            gameState.history.playerStats,
            gameState.settings.hintMode,
            gameState.gameData.find(p => p.isArchitect)?.id,
            gameState.oracleSetup?.oraclePlayerId
        );

        setGameState(prev => ({
            ...prev,
            phase: 'revealing',
            gameData: result.updatedGameData,
            renunciaData: result.updatedRenunciaData,
            impostorCount: result.actualImpostorCount
        }));
    };

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
            handleRenunciaDecision // Export new action
        }
    };
};