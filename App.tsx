
import React, { useState, useEffect, useRef } from 'react';
import { Background } from './components/Background';
import { PartyNotification } from './components/PartyNotification';
import { ArchitectCuration } from './components/ArchitectCuration';
import { CardShuffle } from './components/CardShuffle';
import { THEMES, PLAYER_COLORS } from './constants';
import { ThemeName } from './types';
import { getPartyMessage, getBatteryLevel } from './utils/partyLogic';
import { useGameState } from './hooks/useGameState';

// --- NEW VIEW IMPORTS ---
import { SetupView } from './components/views/SetupView';
import { RevealingView } from './components/views/RevealingView';
import { ResultsView } from './components/views/ResultsView';
import { SettingsDrawer } from './components/SettingsDrawer';
import { CategorySelector } from './components/CategorySelector';
import { Manual } from './components/Manual';

function App() {
    // -- State from Custom Hook --
    const { 
        gameState, setGameState, savedPlayers, architectOptions, architectRegenCount,
        actions 
    } = useGameState();

    // -- UI State --
    const [themeName, setThemeName] = useState<ThemeName>('luminous');
    const theme = THEMES[themeName];
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
    const promptTimeoutRef = useRef<number | null>(null);
    const [hydrationTimer, setHydrationTimer] = useState(0);

    // -- Audio System --
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const debugTapTimerRef = useRef<number | null>(null);
    const [debugTapCount, setDebugTapCount] = useState(0);

    const currentPlayerColor = PLAYER_COLORS[gameState.currentPlayerIndex % PLAYER_COLORS.length];

    // -- Effects --

    // Audio Initialization & Playback Logic
    useEffect(() => {
        const initAudio = () => {
            if (!audioRef.current) {
                // Configuración automática del archivo de audio
                audioRef.current = new Audio('/background.mp3');
                audioRef.current.loop = true;
                audioRef.current.volume = 0.15; // Volumen ambiental sutil
                
                audioRef.current.onerror = () => {
                    console.warn("No se encontró background.mp3 en la carpeta public.");
                    actions.updateSettings({ soundEnabled: false });
                };
            }

            if (gameState.settings.soundEnabled && audioRef.current.paused) {
                audioRef.current.play().catch(e => {
                    // Los navegadores bloquean el autoplay hasta que hay interacción
                    console.debug("Esperando interacción para reproducir audio...");
                });
            }
        };

        const handleInteraction = () => {
            initAudio();
            // Una vez inicializado, limpiamos los listeners para no saturar
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        // Escuchar la primera interacción del usuario para iniciar el audio
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    // Reacción al cambio de ajustes de sonido
    useEffect(() => {
        if (audioRef.current) {
            if (gameState.settings.soundEnabled) {
                audioRef.current.play().catch(() => {});
            } else {
                audioRef.current.pause();
            }
        }
    }, [gameState.settings.soundEnabled]);

    // Battery
    useEffect(() => {
        const fetchBattery = async () => {
            const level = await getBatteryLevel();
            setBatteryLevel(level);
        };
        fetchBattery();
        const interval = setInterval(fetchBattery, 60000);
        return () => clearInterval(interval);
    }, []);

    // Periodic Party Prompts
    const triggerPartyMessage = (phase: 'setup' | 'revealing' | 'discussion' | 'results', winState?: 'civil' | 'impostor' | 'troll') => {
        if (!gameState.settings.partyMode) return;
        if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);

        const msg = getPartyMessage(phase, gameState, batteryLevel, winState);
        setGameState(prev => ({ ...prev, currentDrinkingPrompt: msg }));

        promptTimeoutRef.current = window.setTimeout(() => {
            setGameState(prev => ({ ...prev, currentDrinkingPrompt: "" }));
        }, 8000);
    };

    useEffect(() => {
        if (!gameState.settings.partyMode) return;
        const interval = setInterval(() => {
            if (gameState.phase === 'setup') {
                 triggerPartyMessage(gameState.phase);
                 if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        }, 120000);
        return () => clearInterval(interval);
    }, [gameState.settings.partyMode, gameState.phase, batteryLevel, gameState.partyState.intensity]);

    useEffect(() => {
        let interval: number;
        if (gameState.partyState.isHydrationLocked && hydrationTimer > 0) {
            interval = window.setInterval(() => setHydrationTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
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

    const handleNextPlayer = (viewTime: number) => {
        if (isExiting) return;

        // 1. Guardar tiempo de visualización
        setGameState(prev => {
            const newData = [...prev.gameData];
            if (newData[prev.currentPlayerIndex]) newData[prev.currentPlayerIndex].viewTime = viewTime;
            return { ...prev, gameData: newData };
        });

        // 2. Trigger Party Mode si procede
        if (gameState.settings.partyMode && gameState.currentPlayerIndex < gameState.players.length - 1) {
             triggerPartyMessage('revealing');
        }

        const nextIndex = gameState.currentPlayerIndex + 1;
        const isLast = nextIndex >= gameState.players.length;

        // 3. Animación de salida de la carta actual
        setIsExiting(true);

        setTimeout(() => {
            if (isLast) {
                // Fin del juego: Ir a resultados
                setGameState(prev => ({ ...prev, phase: 'results', currentDrinkingPrompt: "" }));
                if (gameState.settings.partyMode) setTimeout(() => triggerPartyMessage('discussion'), 500);
                setIsExiting(false);
            } else if (gameState.settings.passPhoneMode) {
                // MODO PASES ACTIVADO: Mostrar pantalla "Pasa el teléfono"
                setTransitionName(gameState.players[nextIndex].name);
                setIsExiting(false); 

                setTimeout(() => {
                    setIsExiting(true); 
                    setTimeout(() => {
                        setTransitionName(null);
                        setGameState(prev => ({ ...prev, currentPlayerIndex: nextIndex }));
                        setIsExiting(false); 
                    }, 300);
                }, 2000);
            } else {
                // MODO PASES DESACTIVADO: Transición directa
                setTransitionName(null);
                setGameState(prev => ({ ...prev, currentPlayerIndex: nextIndex }));
                setIsExiting(false);
            }
        }, 300);
    };

    const handleBackToSetup = () => {
        setIsPixelating(true);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => {
            setGameState(prev => ({...prev, phase: 'setup', currentDrinkingPrompt: ""}));
            setIsPixelating(false);
        }, 400); // Velocidad duplicada para respuesta inmediata
    };

    const handleReplay = () => {
        setIsPixelating(true);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => handleStartGame(), 400); // Velocidad duplicada para respuesta inmediata
    };

    const handleTitleTap = () => {
        if (gameState.debugState.isEnabled) return;
        if (debugTapTimerRef.current) clearTimeout(debugTapTimerRef.current);
        
        setDebugTapCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 50, 50, 200]);
                setGameState(prev => ({ ...prev, debugState: { ...prev.debugState, isEnabled: true } }));
                return 0;
            }
            return newCount;
        });
        debugTapTimerRef.current = window.setTimeout(() => setDebugTapCount(0), 800);
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
            <Background 
                theme={theme} 
                phase={gameState.phase} 
                isTroll={gameState.isTrollEvent} 
                activeColor={currentPlayerColor} 
                isParty={gameState.settings.partyMode}
            />
            
            {/* Shuffling Animation Transition */}
            {isShuffling && (
                <CardShuffle 
                    players={gameState.players} 
                    theme={theme} 
                    onComplete={handleShuffleComplete} 
                />
            )}

            {/* Global Overlays */}
            {gameState.settings.partyMode && gameState.currentDrinkingPrompt && (
                <div className="absolute top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                     <PartyNotification prompt={gameState.currentDrinkingPrompt} theme={theme} />
                </div>
            )}

            {/* View Routing */}
            {gameState.phase === 'setup' && (
                <SetupView 
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
                    onTitleTap={handleTitleTap}
                    theme={theme}
                    isPixelating={isPixelating}
                    hydrationTimer={hydrationTimer}
                    onHydrationUnlock={handleHydrationUnlock}
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

            {gameState.phase === 'revealing' && !isShuffling && (
                <RevealingView 
                    gameState={gameState}
                    theme={theme}
                    currentPlayerColor={currentPlayerColor}
                    onNextPlayer={handleNextPlayer}
                    onOracleConfirm={actions.handleOracleConfirm}
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
            
            {/* Common UI Components */}
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

            <Manual 
                isOpen={howToPlayOpen}
                onClose={() => setHowToPlayOpen(false)}
                theme={theme}
            />
            
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
            `}</style>
        </div>
    );
}

export default App;
