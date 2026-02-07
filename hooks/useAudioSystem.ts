
import { useEffect, useRef } from 'react';

export const useAudioSystem = (soundEnabled: boolean, updateSettings: (s: { soundEnabled: boolean }) => void) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioRef.current) {
                audioRef.current = new Audio('/background.mp3');
                audioRef.current.loop = true;
                audioRef.current.volume = 0.15;
                
                audioRef.current.onerror = () => {
                    console.warn("No se encontró background.mp3");
                    updateSettings({ soundEnabled: false });
                };
            }
        };

        const handleInteraction = () => {
            initAudio();
            if (audioRef.current && soundEnabled) {
                audioRef.current.play().catch(() => {});
            }
            // Cleanup listeners after first interaction
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        // Only add listeners if audio isn't initialized yet
        if (!audioRef.current) {
            window.addEventListener('click', handleInteraction);
            window.addEventListener('touchstart', handleInteraction);
            window.addEventListener('keydown', handleInteraction);
        }

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []); // Run once on mount

    // React to settings change
    useEffect(() => {
        if (audioRef.current) {
            if (soundEnabled) {
                audioRef.current.play().catch(() => {});
            } else {
                audioRef.current.pause();
            }
        }
    }, [soundEnabled]);

    return { audioRef };
};
