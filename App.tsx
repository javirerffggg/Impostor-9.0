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
const SetupView = lazy(() => import('./components/views/SetupView').then(m => ({ default: m.SetupView })));
const RevealingView = lazy(() => import('./components/views/RevealingView').then(m => ({ default: m.RevealingView })));
const ResultsView = lazy(() => import('./components/views/ResultsView').then(m => ({ default: m.ResultsView })));
const OracleSelectionView = lazy(() => import('./components/views/OracleSelectionView').then(m => ({ default: m.OracleSelectionView })));

// Konami code as a module-level constant (never changes, no need to be inside component)
const KONAMI_CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];

function App() {
    const { 
        gameState, setGameState, savedPlayers, architectOptions, architectRegenCount,
        actions 
    } = useGameState();

    const [themeName, setThemeName] = useState<ThemeName>(() => {
        try { return (localStorage.getItem('impostor_theme_v1') as ThemeName) || 'luminous'; }
        catch { return 'luminous'; }
    });

    const [volume, setVolume] = useState<number>(() => {
        try { return parseFloat(localStorage.getItem('impostor_volume_v1') || '0.15'); }
        catch { return 0.15; }
    });

    const theme = useMemo(() => getTheme(themeName), [themeName]);

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

    const [isExiting, setIsExiting] = useState(false);
    const [isPixelating, setIsPixelating] = useState(false);
    const [transitionName, setTransitionName] = useState<string | null>(null);

    const [batteryLevel, setBatteryLevel] = useState(100);
    const [hydrationTimer, setHydrationTimer] = useState(0);
    const [showMagistradoAnnouncement, setShowMagistradoAnnouncement] = useState(false);

    useAudioSystem(gameState.settings.soundEnabled, volume, actions.updateSettings);
    const { triggerPartyMessage } = usePartyPrompts(gameState, setGameState, batteryLevel, setBatteryLevel);

    const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
    const [konamiActivated, setKonamiActivated] = useState(false);

    // -- KONAMI CODE LISTENER --
    useEffect(() => {
        if (konamiActivated) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            setKonamiSequence(prev => {
                const newSeq = [...prev, e.code].slice(-10);
                if (JSON.stringify(newSeq) === JSON.stringify(KONAMI_CODE)) {
                    setKonamiActivated(true);
                    setGameState(prev => ({
                        ...prev,
                        debugState: { ...prev.debugState, isEnabled: true, easterEggUnlocked: true }
                    }));
                    confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 }, colors: ['#ff0000','#00ff00','#0000ff','#ffff00'] });
                    if (navigator.vibrate) navigator.vibrate([100,50,100,50,200]);
                    setTimeout(() => alert('🎮 KONAMI CODE ACTIVATED!\n\nModo Centinela Legendary desbloqueado.'), 100);
                    return [];
                }
                return newSeq;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [konamiActivated]);

    // Persist theme
    useEffect(() => { localStorage.setItem('impostor_theme_v1', themeName); }, [themeName]);

    // Persist volume
    useEffect(() => { localStorage.setItem('impostor_volume_v1', String(volume)); }, [volume]);

    // Hydration timer countdown
    useEffect(() => {
        let interval: number | undefined;
        if (gameState.partyState.isHydrationLocked && hydrationTimer > 0) {
            interval = window.setInterval(() => setHydrationTimer(prev => prev - 1), 1000);
        }
        return () => { if (interval !== undefined) clearInterval(interval); };
    }, [gameState.partyState.isHydrationLocked, hydrationTimer]);

    const [pendingGameResult, setPendingGameResult] = useState<any>(null);

    const handleStartGame = () => {
        if (gameState.players.length < 3) return;
        if (gameState.settings.shuffleEnabled) {
            setIsShuffling(true);
            const result = actions.runGameGeneration();
            setPendingGameResult(result);
        } else {
            const result = actions.runGameGeneration();
            if (result && result.hydrationTimer > 0) setHydrationTimer(result.hydrationTimer);
            setIsExiting(false);
            setIsPixelating(false);
            setTransitionName(null);
            if (gameState.settings.partyMode) setTimeout(() => triggerPartyMessage('revealing'), 300);
        }
    };

    const handleShuffleComplete = () => {
        setIsShuffling(false);
        // Guard: only apply if there's a valid pending result
        if (pendingGameResult && pendingGameResult.hydrationTimer > 0) {
            setHydrationTimer(pendingGameResult.hydrationTimer);
        }
        setPendingGameResult(null);
        setIsExiting(false);
        setIsPixelating(false);
        setTransitionName(null);
        if (gameState.settings.partyMode) setTimeout(() => triggerPartyMessage('revealing'), 300);
    };

    const handleNextPlayer = useCallback((viewTime: number) => {
        if (isExiting) return;
        setIsExiting(true);

        setGameState(prev => {
            const newData = [...prev.gameData];
            if (newData[prev.currentPlayerIndex]) newData[prev.currentPlayerIndex].viewTime = viewTime;
            const nextIndex = prev.currentPlayerIndex + 1;
            if (prev.settings.partyMode && nextIndex < prev.players.length) {
                setTimeout(() => triggerPartyMessage('revealing'), 50);
            }
            return { ...prev, gameData: newData };
        });

        setTimeout(() => {
            setGameState(prev => {
                const nextIndex = prev.currentPlayerIndex + 1;
                const isLast = nextIndex >= prev.players.length;

                if (isLast) {
                    if (prev.magistradoData) {
                        setShowMagistradoAnnouncement(true);
                        setIsExiting(false);
                        return prev;
                    } else {
                        setIsExiting(false);
                        if (prev.settings.partyMode) setTimeout(() => triggerPartyMessage('discussion'), 500);
                        return { ...prev, phase: 'results', currentDrinkingPrompt: '' };
                    }
                }

                if (prev.settings.passPhoneMode) {
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
                    return prev;
                }

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
            setGameState(prev => ({ ...prev, phase: 'setup', currentDrinkingPrompt: '' }));
            setIsPixelating(false);
        }, 400);
    };

    const handleReplay = () => {
        setIsPixelating(true);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => {
            // Read fresh state inside timeout to avoid stale closure
            setGameState(prev => {
                if (prev.players.length < 3) return prev;
                return prev; // runGameGeneration called below with the hook
            });
            handleStartGame();
        }, 400);
    };

    const handleHydrationUnlock = () => {
        setGameState(prev => ({ ...prev, partyState: { ...prev.partyState, isHydrationLocked: false } }));
    };

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

            <Suspense fallback={null}>
                {isShuffling && (
                    <CardShuffle
                        players={gameState.players}
                        theme={theme}
                        onComplete={handleShuffleComplete}
                    />
                )}
            </Suspense>

            {gameState.settings.partyMode && gameState.currentDrinkingPrompt && (
                <div className="absolute top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                    <Suspense fallback={null}>
                        <PartyNotification prompt={gameState.currentDrinkingPrompt} theme={theme} />
                    </Suspense>
                </div>
            )}

            {showMagistradoAnnouncement && gameState.magistradoData && (
                <Suspense fallback={null}>
                    <MagistradoAnnouncement
                        alcaldeName={gameState.magistradoData.alcaldePlayerName}
                        theme={theme}
                        onContinue={() => {
                            setShowMagistradoAnnouncement(false);
                            setGameState(prev => ({ ...prev, phase: 'results', currentDrinkingPrompt: '' }));
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
                            } catch { alert('Error al importar estado'); }
                        }}
                        onResetStats={() => {
                            setGameState(prev => ({
                                ...prev,
                                history: { ...prev.history, playerStats: {}, matchLogs: [] }
                            }));
                        }}
                        onSimulateRound={() => {
                            setGameState(prev => ({
                                ...prev,
                                history: { ...prev.history, roundCounter: prev.history.roundCounter + 1 }
                            }));
                        }}
                    />
                </Suspense>
            )}

            {/* Main View Area */}
            <Suspense fallback={<LoadingSpinner theme={theme} />}>
                {gameState.phase === 'setup' && (
                    <SetupView
                        gameState={gameState}
                        setGameState={setGameState}
                        savedPlayers={savedPlayers}
                        onAddPlayer={actions.addPlayer}
                        onRemovePlayer={actions.removePlayer}
                        onSaveToBank={actions.saveToBank}
                        onDeleteFromBank={actions.deleteFromBank}
                        onUpdateSettings={actions.updateSettings}
                        onStartGame={handleStartGame}
                        onOpenSettings={() => setSettingsOpen(true)}
                        onOpenCategories={() => setCategoriesOpen(true)}
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
                    <OracleSelectionView
                        oraclePlayerId={gameState.oracleSetup.oraclePlayerId}
                        players={gameState.gameData}
                        availableHints={gameState.oracleSetup.availableHints}
                        civilWord={gameState.oracleSetup.civilWord}
                        theme={theme}
                        onHintSelected={actions.handleOracleSelection}
                    />
                )}

                {gameState.phase === 'revealing' && !isShuffling && (
                    <RevealingView
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
                    <ResultsView
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
        </div>
    );
}

export default App;
