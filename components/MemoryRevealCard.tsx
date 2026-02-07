import React, { useState, useEffect } from 'react';
import { GamePlayer, MemoryModeConfig, ThemeConfig } from '../types';
import { Brain, Clock, Eye, EyeOff } from 'lucide-react';

interface Props {
    player: GamePlayer;
    memoryConfig: MemoryModeConfig;
    theme: ThemeConfig;
    onMemorized: (viewTime: number) => void;
}

export const MemoryRevealCard: React.FC<Props> = ({
    player,
    memoryConfig,
    theme,
    onMemorized
}) => {
    const [step, setStep] = useState<'hold' | 'reveal' | 'done'>('hold');
    const [timeLeft, setTimeLeft] = useState(memoryConfig.displayTime);
    const [isHolding, setIsHolding] = useState(false);
    
    // Words to show: If impostor, use specific distractors; otherwise use player specific set (includes correct word)
    const wordsToShow = player.memoryWords || [];
    const correctIndex = player.memoryCorrectIndex ?? -1;

    useEffect(() => {
        let interval: number;
        
        if (step === 'reveal') {
            interval = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setStep('done');
                            onMemorized(memoryConfig.displayTime * 1000);
                        }, 500);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [step, memoryConfig.displayTime, onMemorized]);

    const handleHoldStart = () => {
        setIsHolding(true);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleHoldEnd = () => {
        setIsHolding(false);
    };

    // Auto-trigger reveal after short hold (simulating "Tap to Reveal" but keeping hold UI consistency)
    useEffect(() => {
        let timeout: number;
        if (isHolding && step === 'hold') {
            timeout = window.setTimeout(() => {
                setStep('reveal');
                if (navigator.vibrate) navigator.vibrate([50, 50]);
            }, 800);
        }
        return () => clearTimeout(timeout);
    }, [isHolding, step]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative p-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
            
            {step === 'hold' && (
                <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
                        <Brain size={80} style={{ color: theme.accent }} className="relative z-10" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-center mb-4 uppercase" style={{ color: theme.text }}>
                        Modo Memoria
                    </h2>
                    
                    <p className="text-sm text-center mb-10 opacity-70 leading-relaxed max-w-xs" style={{ color: theme.sub }}>
                        Verás {wordsToShow.length} palabras durante {memoryConfig.displayTime} segundos.
                        <br/>Memoriza la correcta.
                    </p>

                    <button
                        onPointerDown={handleHoldStart}
                        onPointerUp={handleHoldEnd}
                        onPointerLeave={handleHoldEnd}
                        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isHolding ? 'scale-90 bg-white/10 border-pink-500' : 'border-white/20'}`}
                        style={{ borderColor: isHolding ? theme.accent : undefined }}
                    >
                        <Eye size={32} className={`transition-all ${isHolding ? 'scale-110 opacity-100' : 'opacity-50'}`} style={{ color: theme.text }} />
                    </button>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: theme.text }}>
                        {isHolding ? 'ACCEDIENDO...' : 'MANTÉN PARA REVELAR'}
                    </p>
                </div>
            )}

            {step === 'reveal' && (
                <div className="w-full max-w-sm flex flex-col h-full justify-between py-8 animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <Clock size={16} className={timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'} />
                            <span className={`text-2xl font-black tabular-nums ${timeLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-center" style={{ color: theme.sub }}>
                            {player.isImp ? 'MEMORIZA PARA DISIMULAR' : 'MEMORIZA LA PALABRA CLAVE'}
                        </p>
                    </div>

                    {/* Word Grid */}
                    <div className="flex-1 flex flex-col justify-center gap-3 my-4">
                        {wordsToShow.map((word, index) => {
                            const isCorrect = index === correctIndex;
                            // Intensity determines visibility of highlight
                            // 0 = invisible, 1 = obvious
                            const showHighlight = !player.isImp && isCorrect;
                            
                            // Visual logic for highlighting based on intensity
                            let borderStyle = 'transparent';
                            let bgStyle = theme.cardBg;
                            
                            if (showHighlight && memoryConfig.highlightIntensity > 0) {
                                // Subtle to Strong gradient
                                const alpha = Math.floor(memoryConfig.highlightIntensity * 255).toString(16).padStart(2, '0');
                                borderStyle = `${theme.accent}${alpha}`; // Use accent color with opacity
                                if (memoryConfig.highlightIntensity > 0.6) {
                                    bgStyle = `${theme.accent}15`;
                                }
                            }

                            return (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border-2 transition-all flex items-center justify-between backdrop-blur-md"
                                    style={{
                                        backgroundColor: bgStyle,
                                        borderColor: borderStyle === 'transparent' ? theme.border : borderStyle,
                                        transform: showHighlight && memoryConfig.highlightIntensity > 0.8 ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <span className="text-xl font-bold uppercase tracking-wide" style={{ color: theme.text }}>
                                        {word}
                                    </span>
                                    {showHighlight && memoryConfig.highlightIntensity > 0.7 && (
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Warning for Impostor */}
                    {player.isImp && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center animate-pulse">
                            <p className="text-[10px] font-bold text-red-400 uppercase leading-tight">
                                ⚠️ NINGUNA ES LA CORRECTA
                            </p>
                        </div>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-4">
                        <div 
                            className="h-full transition-all duration-1000 ease-linear"
                            style={{ 
                                width: `${(timeLeft / memoryConfig.displayTime) * 100}%`,
                                backgroundColor: timeLeft <= 3 ? '#ef4444' : theme.accent 
                            }} 
                        />
                    </div>
                </div>
            )}

            {step === 'done' && (
                <div className="flex items-center justify-center animate-in fade-in duration-300">
                    <Brain size={48} className="animate-bounce" style={{ color: theme.text }} />
                </div>
            )}
        </div>
    );
};