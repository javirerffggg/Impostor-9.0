


import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { THEMES, PLAYER_COLORS, getTheme } from './constants';
import { ThemeName } from './types';
import { useGameState } from './hooks/useGameState';
import { useAudioSystem } from './hooks/useAudioSystem';
import { usePartyPrompts } from './hooks/usePartyPrompts';
// @ts-ignore
import confetti from 'canvas-confetti';
import { LoadingSpinner } from './components/LoadingSpinner';

// --- LAZY IMPORTS FOR AGGRESSIVE CODE SPLITTING ---
const Background = lazy(() => import('./components/Background').then(m => ({ default: m.Background })));
const PartyNotification = lazy(() => import('./components/PartyNotification').then(m => ({ default: m.PartyNotification })));
const ArchitectCuration = lazy(() => import('./components/ArchitectCuration').then(m => ({ default: m.ArchitectCuration })));
const CardShuffle = lazy(() => import('./components/CardShuffle').then(m => ({ default: m.CardShuffle })));
const DebugConsole = lazy(() => import('./components/DebugConsole').then(m => ({ default: m.DebugConsole })));
const MagistradoAnnouncement = lazy(() => import('./components/MagistradoAnnouncement').then(m => ({ default: m.MagistradoAnnouncement })));
const SettingsDrawer = lazy(() => import('./components/SettingsDrawer').then(m => ({ default: m.SettingsDrawer })));
const CategorySelector = lazy(() => import('./components/CategorySelector').then(m => ({ default: m.CategorySelector })));
const ManualView = lazy(() => import('./components/manual/ManualView').then(m => ({ default: m.ManualView })));

// Views map for cleaner render logic
const VIEW_COMPONENTS = {
    setup: lazy(() => import('./components/views/SetupView').then(m => ({ default: m.SetupView }))),
    revealing: lazy(() => import('./components/views/RevealingView').then(m => ({ default: m.RevealingView }))),
    results: lazy(() => import('./components/views/ResultsView').then(m => ({ default: m.ResultsView }))),
    architect: lazy(() => import('./components/ArchitectCuration').then(m => ({ default: m.ArchitectCuration }))), // Handled specifically but kept for consistency
    oracle: lazy(() => import('./components/views/OracleSelectionView').then(m => ({ default: m.OracleSelectionView })))
};

function App() {
    // -- State from Custom Hook --
    const { 
        gameState, setGameState, savedPlayers, architectOptions, architectRegenCount,
        actions 
    } = useGameState();

    // -- UI State --
    const [themeName, setThemeName] = useState<ThemeName>(() => {
        try {
            const savedTheme = localStorage.getItem('impostor_theme_v1');
            return (savedTheme as ThemeName) || 'luminous';
        } catch (e) {
            return 'luminous';
        }
    });

    // Memoize heavy objects using helper
    const theme = useMemo(() => getTheme(themeName), [themeName]);
    
    // Updated color logic to use stored avatarIdx if present
    const currentPlayerColor = useMemo(() => {
        const player = gameState.gameData[gameState.currentPlayerIndex] || gameState.players[gameState.currentPlayerIndex];
        if (player && player.avatarIdx !== undefined) {
            return PLAYER_COLORS[player.avatarIdx % PLAYER_COLORS.length];
        }
        return PLAYER_COLORS[gameState.currentPlayerIndex % PLAYER_COLORS.length];
    }, [gameState.currentPlayerIndex, gameState.gameData, gameState.players]);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [howToPlayOpen, setHowToPlayOpen] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    
    // UI Transitions
    const [isExiting, setIsExiting] = useState(false); 
    const [isPixelating, setIsPixelating] = useState(false);
    const [transitionName, setTransitionName] = useState<string | null>(null);
    
    // -- Party Mode --
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [hydrationTimer, setHydrationTimer] = useState(0);

    // -- Magistrado State --
    const [showMagistradoAnnouncement, setShowMagistradoAnnouncement] = useState(false);

    // -- Audio & Prompts Hooks --
    const [volume, setVolume] = useState(0.15); // Default Volume 15%
    useAudioSystem(gameState.settings.soundEnabled, volume, actions.updateSettings);
    const { triggerPartyMessage } = usePartyPrompts(gameState, setGameState, batteryLevel, setBatteryLevel);

    // -- KONAMI CODE LISTENER --
    const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
    const [konamiActivated, setKonamiActivated] = useState(false);
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    useEffect(() => {
        if (konamiActivated) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (konamiActivated) return;

            setKonamiSequence(prev => {
                // Use code instead of key for better cross-layout support
                const newSeq = [...prev, e.code].slice(-10); 
                
                // Comprobar si coincide con Konami Code
                if (JSON.stringify(newSeq) === JSON.stringify(KONAMI_CODE)) {
                    setKonamiActivated(true);
                    // Activar debug con easter egg especial
                    setGameState(prev => ({
                        ...prev,
                        debugState: { 
                            ...prev.debugState, 
                            isEnabled: true,
                            easterEggUnlocked: true 
                        }
                    }));
                    
                    // Efecto especial único
                    confetti({
                        particleCount: 200,
                        spread: 160,
                        origin: { y: 0.5 },
                        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
                    });
                    
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
                    
                    setTimeout(() => {
                        alert('🎮 KONAMI CODE ACTIVATED!\n\nModo Centinela Legendary desbloqueado.');
                    }, 100);
                    
                    return [];
                }
                
                return newSeq;
            });
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [konamiActivated]);

    // -- Effects --

    // Persist Theme
    useEffect(() => {
        localStorage.setItem('impostor_theme_v1', themeName);
    }, [themeName]);

    // Hydration Timer
    useEffect(() => {
        let interval: number | undefined;
        if (gameState.partyState.isHydrationLocked && hydrationTimer > 0) {
            interval = window.setInterval(() => setHydrationTimer(prev => prev - 1), 1000);
        }
        return () => {
            if (interval !== undefined) clearInterval(interval);
        };
    }, [gameState.partyState.isHydrationLocked, hydrationTimer]);

    // -- Handlers --

    const [pendingGameResult, setPendingGameResult] = useState<any>(null);

    const handleStartGame = () => {
        if (gameState.players.length < 3) return;

        if (gameState.settings.shuffleEnabled) {
            // Inicia la animación de barajado
            setIsShuffling(true);
            
            // Generamos los datos pero no cambiamos la fase todavía visualmente
            const result = actions.runGameGeneration();
            setPendingGameResult(result);
        } else {
            // Generación instantánea sin animación
            const result = actions.runGameGeneration();
            if (result && result.hydrationTimer > 0) {
                setHydrationTimer(result.hydrationTimer);
            }
            
            setIsExiting(false);
            setIsPixelating(false);
            setTransitionName(null);

            if (gameState.settings.partyMode) {
                setTimeout(() => triggerPartyMessage('revealing'), 300);
            }
        }
    };

    const handleShuffleComplete = () => {
        setIsShuffling(false);
        if (pendingGameResult && pendingGameResult.hydrationTimer > 0) {
            setHydrationTimer(pendingGameResult.hydrationTimer);
        }
        setPendingGameResult(null);

        // Si es una ronda de arquitecto, useGameState ya puso la fase en 'architect'.
        // Si no, ya la puso en 'revealing'. Al terminar el shuffle simplemente permitimos que se vea.
        setIsExiting(false);
        setIsPixelating(false);
        setTransitionName(null);

        if (gameState.settings.partyMode) {
            setTimeout(() => triggerPartyMessage('revealing'), 300);
        }
    };

    const handleNextPlayer = useCallback((viewTime: number) => {
        if (isExiting) return;

        setIsExiting(true);

        // Functional update to avoid race conditions
        setGameState(prev => {
            const newData = [...prev.gameData];
            if (newData[prev.currentPlayerIndex]) {
                newData[prev.currentPlayerIndex].viewTime = viewTime;
            }
            
            const nextIndex = prev.currentPlayerIndex + 1;
            
            // Trigger party mode inside update context to ensure correctness
            if (prev.settings.partyMode && nextIndex < prev.players.length) {
                 setTimeout(() => triggerPartyMessage('revealing'), 50);
            }
            
            return { ...prev, gameData: newData };
        });

        // Continue transition logic
        setTimeout(() => {
            setGameState(prev => {
                const nextIndex = prev.currentPlayerIndex + 1;
                const isLast = nextIndex >= prev.players.length;

                if (isLast) {
                    // Fin del juego o paso a Magistrado
                    if (prev.magistradoData) {
                        setShowMagistradoAnnouncement(true);
                        setIsExiting(false);
                        return prev; // Do not change phase yet, modal handles it
                    } else {
                        setIsExiting(false);
                        if (prev.settings.partyMode) setTimeout(() => triggerPartyMessage('discussion'), 500);
                        return { 
                            ...prev, 
                            phase: 'results', 
                            currentDrinkingPrompt: "" 
                        };
                    }
                } 
                
                if (prev.settings.passPhoneMode) {
                    // MODO PASES ACTIVADO: Mostrar pantalla "Pasa el teléfono"
                    setTransitionName(prev.players[nextIndex].name);
                    setIsExiting(false); 

                    setTimeout(() => {
                        setIsExiting(true); 
                        setTimeout(() => {
                            setTransitionName(null);
                            setGameState(p => ({ ...p, currentPlayerIndex: nextIndex }));
                            setIsExiting(false); 
                        }, 300);
                    }, 2000);
                    
                    return prev; // Don't update index yet
                } 
                
                // MODO PASES DESACTIVADO: Transición directa
                setTransitionName(null);
                setIsExiting(false);
                return { ...prev, currentPlayerIndex: nextIndex };
            });
        }, 300);
    }, [isExiting, triggerPartyMessage]);

    const handleBackToSetup = () => {
        setIsPixelating(true);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => {
            setGameState(prev => ({...prev, phase: 'setup', currentDrinkingPrompt: ""}));
            setIsPixelating(false);
        }, 400); 
    };

    const handleReplay = () => {
        setIsPixelating(true);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => handleStartGame(), 400); 
    };

    const handleHydrationUnlock = () => {
        setGameState(prev => ({ ...prev, partyState: { ...prev.partyState, isHydrationLocked: false } }));
    };

    // Determine current view component
    const CurrentViewComponent = VIEW_COMPONENTS[gameState.phase as keyof typeof VIEW_COMPONENTS];

    return (
        <div 
            style={{ 
                backgroundColor: theme.bg, 
                color: theme.text,
                '--aura-border-gradient': themeName === 'aura' 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' 
                    : (themeName === 'luminous' ? 'linear-gradient(135deg, rgba(0,0,0,0.1), transparent)' : 'none')
            } as React.CSSProperties}
            className={`w-full h-full relative overflow-hidden transition-colors duration-700 ${(themeName === 'aura' || themeName === 'luminous') ? 'aura-mode' : ''}`}
        >
            <Suspense fallback={<LoadingSpinner theme={theme} />}>
                <Background 
                    theme={theme} 
                    phase={gameState.phase} 
                    isTroll={gameState.isTrollEvent} 
                    activeColor={currentPlayerColor} 
                    isParty={gameState.settings.partyMode}
                />
            </Suspense>
            
            {/* Shuffling Animation Transition */}
            <Suspense fallback={null}>
                {isShuffling && (
                    <CardShuffle 
                        players={gameState.players} 
                        theme={theme} 
                        onComplete={handleShuffleComplete} 
                    />
                )}
            </Suspense>

            {/* Global Overlays */}
            {gameState.settings.partyMode && gameState.currentDrinkingPrompt && (
                <div className="absolute top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                     <Suspense fallback={null}>
                        <PartyNotification prompt={gameState.currentDrinkingPrompt} theme={theme} />
                     </Suspense>
                </div>
            )}

            {/* ✨ MAGISTRADO ANNOUNCEMENT */}
            {showMagistradoAnnouncement && gameState.magistradoData && (
                <Suspense fallback={null}>
                    <MagistradoAnnouncement
                        alcaldeName={gameState.magistradoData.alcaldePlayerName}
                        theme={theme}
                        onContinue={() => {
                            setShowMagistradoAnnouncement(false);
                            setGameState(prev => ({ ...prev, phase: 'results', currentDrinkingPrompt: "" }));
                            if (gameState.settings.partyMode) setTimeout(() => triggerPartyMessage('discussion'), 500);
                        }}
                    />
                </Suspense>
            )}

            {gameState.debugState.isEnabled && (
                <Suspense fallback={null}>
                    <DebugConsole
                        gameState={gameState}
                        theme={theme}
                        onClose={() => setGameState(prev => ({ ...prev, debugState: { ...prev.debugState, isEnabled: false } }))}
                        onForceTroll={(scenario) => setGameState(prev => ({ ...prev, debugState: { ...prev.debugState, forceTroll: scenario } }))}
                        onForceArchitect={(force) => setGameState(prev => ({ ...prev, debugState: { ...prev.debugState, forceArchitect: force } }))}
                        onForceRenuncia={(force) => setGameState(prev => ({ ...prev, debugState: { ...prev.debugState, forceRenuncia: force } }))}
                        onExportState={() => {
                            const state = JSON.stringify(gameState, null, 2);
                            const blob = new Blob([state], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `impostor-state-${Date.now()}.json`;
                            a.click();
                        }}
                        onImportState={(stateStr) => {
                            try {
                                const imported = JSON.parse(stateStr);
                                setGameState(imported);
                                alert('Estado importado correctamente');
                            } catch (e) {
                                alert('Error al importar estado');
                            }
                        }}
                        onResetStats={() => {
                            setGameState(prev => ({
                                ...prev,
                                history: {
                                    ...prev.history,
                                    playerStats: {},
                                    matchLogs: []
                                }
                            }));
                        }}
                        onSimulateRound={() => {
                            setGameState(prev => ({
                                ...prev,
                                history: {
                                    ...prev.history,
                                    roundCounter: prev.history.roundCounter + 1
                                }
                            }));
                        }}
                    />
                </Suspense>
            )}

            {/* Main View Area */}
            <Suspense fallback={<LoadingSpinner theme={theme} />}>
                {gameState.phase === 'setup' && (
                    <VIEW_COMPONENTS.setup 
                        gameState={gameState}
                        setGameState={setGameState}
                        savedPlayers={savedPlayers}
                        onAddPlayer={actions.addPlayer}
                        onRemovePlayer={actions.removePlayer}
                        onSaveToBank={actions.saveToBank}
                        onDeleteFromBank={actions.deleteFromBank}
                        onToggleCategory={actions.toggleCategory}
                        onToggleAllCategories={actions.toggleAllCategories}
                        onUpdateSettings={actions.updateSettings}
                        onStartGame={handleStartGame}
                        onOpenSettings={() => setSettingsOpen(true)}
                        onOpenCategories={() => setCategoriesOpen(true)}
                        onTitleTap={() => {}}
                        theme={theme}
                        isPixelating={isPixelating}
                        hydrationTimer={hydrationTimer}
                        onHydrationUnlock={handleHydrationUnlock}
                        onCyclePlayerColor={actions.cyclePlayerColor}
                    />
                )}
                
                {gameState.phase === 'architect' && architectOptions && !isShuffling && (
                    <ArchitectCuration 
                        architect={gameState.gameData[gameState.currentPlayerIndex]}
                        currentOptions={architectOptions}
                        onRegenerate={actions.handleArchitectRegenerate}
                        onConfirm={actions.handleArchitectConfirm}
                        regenCount={architectRegenCount}
                        theme={theme}
                    />
                )}

                {gameState.phase === 'oracle' && gameState.oracleSetup && !isShuffling && (
                    <VIEW_COMPONENTS.oracle 
                        oraclePlayerId={gameState.oracleSetup.oraclePlayerId}
                        players={gameState.gameData}
                        availableHints={gameState.oracleSetup.availableHints}
                        civilWord={gameState.oracleSetup.civilWord}
                        theme={theme}
                        onHintSelected={actions.handleOracleSelection}
                    />
                )}

                {gameState.phase === 'revealing' && !isShuffling && (
                    <VIEW_COMPONENTS.revealing 
                        gameState={gameState}
                        theme={theme}
                        currentPlayerColor={currentPlayerColor}
                        onNextPlayer={handleNextPlayer}
                        onOracleConfirm={actions.handleOracleConfirm}
                        onRenunciaDecision={actions.handleRenunciaDecision}
                        onRenunciaRoleSeen={actions.handleRenunciaRoleSeen}
                        isExiting={isExiting}
                        transitionName={transitionName}
                    />
                )}
                
                {gameState.phase === 'results' && (
                    <VIEW_COMPONENTS.results 
                        gameState={gameState} 
                        theme={theme} 
                        onBack={handleBackToSetup} 
                        onReplay={handleReplay} 
                    />
                )}
            </Suspense>
            
            {/* Drawers / Modals */}
            <Suspense fallback={null}>
                <SettingsDrawer 
                    isOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    theme={theme}
                    themeName={themeName}
                    setThemeName={setThemeName}
                    gameState={gameState}
                    onUpdateSettings={actions.updateSettings}
                    onOpenHowToPlay={() => setHowToPlayOpen(true)}
                    onBackToHome={() => { setSettingsOpen(false); handleBackToSetup(); }}
                    volume={volume}
                    setVolume={setVolume}
                />

                <CategorySelector 
                    isOpen={categoriesOpen}
                    onClose={() => setCategoriesOpen(false)}
                    selectedCategories={gameState.settings.selectedCategories}
                    onToggleCategory={actions.toggleCategory}
                    onToggleCollection={actions.toggleCollection}
                    onToggleAll={actions.toggleAllCategories}
                    theme={theme}
                />

                <ManualView
                    isOpen={howToPlayOpen}
                    onClose={() => setHowToPlayOpen(false)}
                    theme={theme}
                />
            </Suspense>
            
            {/* Global CSS */}
            <style>{`
                /* Premium styles are now handled dynamically in IdentityCard.tsx to ensure correct gradient behavior */
                .aura-mode .premium-border {
                    transition: all 0.5s ease;
                }

                @keyframes particle-flow { 0% { background-position: 0 0; } 100% { background-position: 20px 20px; } }
                @keyframes echo-pulse { 0% { box-shadow: 0 0 0 0px currentColor; opacity: 1; transform: scale(1.2); } 70% { box-shadow: 0 0 0 10px transparent; opacity: 1; transform: scale(1); } 100% { box-shadow: 0 0 0 0 transparent; opacity: 1; transform: scale(1); } }
                @keyframes dissolve { 0% { filter: blur(0px) brightness(1); opacity: 1; transform: scale(1); } 50% { filter: blur(4px) brightness(1.5); opacity: 0.8; transform: scale(1.02); } 100% { filter: blur(20px) brightness(5); opacity: 0; transform: scale(1.1); } }
                .animate-dissolve { animation: dissolve 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
                @keyframes aura-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes aura-pulse { 0%, 100% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                @keyframes scan { 0% { top: -100%; } 100% { top: 200%; } }
                @keyframes scan_1s_infinite_linear { 0% { top: 0%; } 100% { top: 100%; } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes equalizer { 0% { height: 10%; } 100% { height: 90%; } }
                
                @keyframes shake {
                    0%, 100% { transform: translate(0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 0); }
                    20%, 40%, 60%, 80% { transform: translate(2px, 0); }
                }

                .gold-glow {
                    color: #FFD700;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3);
                }
            `}</style>
        </div>
    );
}

export default App;
