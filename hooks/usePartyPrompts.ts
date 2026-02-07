
import { useEffect, useRef } from 'react';
import { GameState } from '../types';
import { getPartyMessage, getBatteryLevel } from '../utils/partyLogic';

export const usePartyPrompts = (
    gameState: GameState,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    batteryLevel: number,
    setBatteryLevel: (level: number) => void
) => {
    const promptTimeoutRef = useRef<number | null>(null);

    // Battery Monitor
    useEffect(() => {
        const fetchBattery = async () => {
            const level = await getBatteryLevel();
            setBatteryLevel(level);
        };
        fetchBattery();
        const interval = setInterval(fetchBattery, 60000);
        return () => clearInterval(interval);
    }, [setBatteryLevel]);

    const triggerPartyMessage = (phase: 'setup' | 'revealing' | 'discussion' | 'results', winState?: 'civil' | 'impostor' | 'troll') => {
        if (!gameState.settings.partyMode) return;
        if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);

        const msg = getPartyMessage(phase, gameState, batteryLevel, winState);
        setGameState(prev => ({ ...prev, currentDrinkingPrompt: msg }));

        promptTimeoutRef.current = window.setTimeout(() => {
            setGameState(prev => ({ ...prev, currentDrinkingPrompt: "" }));
        }, 8000);
    };

    // Periodic Prompts
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

    return { triggerPartyMessage };
};
