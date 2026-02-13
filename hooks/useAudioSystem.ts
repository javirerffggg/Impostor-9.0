
import { useEffect, useRef } from 'react';

export const useAudioSystem = (
    soundEnabled: boolean, 
    volume: number, 
    updateSettings: (s: { soundEnabled: boolean }) => void
) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const tryFormats = async () => {
            // Prevent multiple initializations
            if (audioRef.current) return;

            const formats = [
                '/background.mp3',
                '/background.ogg',
                '/background.m4a'
            ];
            
            let audioInstance: HTMLAudioElement | null = null;

            for (const format of formats) {
                try {
                    const audio = new Audio(format);
                    // Try to fetch/buffer to see if it exists/works
                    // We don't play here yet, just check validity
                    audio.volume = 0; // Start silent for fade-in
                    audio.loop = true;
                    
                    // Simple check if the browser can play this type
                    if (audio.canPlayType(format.endsWith('mp3') ? 'audio/mpeg' : 
                                         format.endsWith('ogg') ? 'audio/ogg' : 'audio/mp4') === '') {
                        continue;
                    }

                    audioInstance = audio;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (audioInstance) {
                audioRef.current = audioInstance;
                
                // If sound is already enabled, start playing
                if (soundEnabled) {
                    playWithFadeIn();
                }
            } else {
                console.warn("No se encontró ningún formato de audio soportado");
                updateSettings({ soundEnabled: false });
            }
        };

        const playWithFadeIn = () => {
            if (!audioRef.current) return;

            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Fade In Logic
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                    
                    audioRef.current!.volume = 0;
                    const targetVolume = volume; // Use current prop volume
                    
                    fadeIntervalRef.current = window.setInterval(() => {
                        if (audioRef.current && audioRef.current.volume < targetVolume) {
                            // Increment volume gently
                            const newVol = Math.min(audioRef.current.volume + 0.01, targetVolume);
                            audioRef.current.volume = newVol;
                        } else {
                            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                        }
                    }, 50);
                }).catch(() => {
                    // Auto-play policy prevented playback
                    // We accept this silent failure until user interaction
                });
            }
        };

        const handleInteraction = () => {
            // Initialize if not already done
            if (!audioRef.current) {
                tryFormats();
            } else if (soundEnabled && audioRef.current.paused) {
                playWithFadeIn();
            }

            // Cleanup listeners after first interaction
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []); // Run once on mount to set up listeners

    // React to settings change (Play/Pause)
    useEffect(() => {
        if (audioRef.current) {
            if (soundEnabled) {
                // If starting from paused, try to fade in
                if (audioRef.current.paused) {
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {});
                    }
                    
                    // Reset volume logic for fade in
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                    audioRef.current.volume = 0;
                    
                    fadeIntervalRef.current = window.setInterval(() => {
                        if (audioRef.current && audioRef.current.volume < volume) {
                            audioRef.current.volume = Math.min(audioRef.current.volume + 0.01, volume);
                        } else {
                            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                        }
                    }, 50);
                }
            } else {
                audioRef.current.pause();
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            }
        }
    }, [soundEnabled]);

    // React to volume slider change
    useEffect(() => {
        if (audioRef.current) {
            // Cancel any active fade-in if the user manually adjusts volume
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return { audioRef };
};