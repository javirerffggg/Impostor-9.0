
import React, { useState, useEffect } from 'react';
import { Player, ThemeConfig } from '../types';
import { Layers, Zap, Shield, Cpu } from 'lucide-react';

interface CardShuffleProps {
    players: Player[];
    theme: ThemeConfig;
    onComplete: () => void;
    duration?: number;
}

type ShufflePhase = 'birth' | 'vortex' | 'synthesis' | 'deal' | 'launch';

export const CardShuffle: React.FC<CardShuffleProps> = ({ 
    players, 
    theme, 
    onComplete,
    duration = 3800 
}) => {
    const [phase, setPhase] = useState<ShufflePhase>('birth');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timings = {
            birth: 600,
            vortex: 1400,
            synthesis: 800,
            deal: 1000
        };

        const timer = setInterval(() => {
            setProgress(p => Math.min(p + 1, 100));
        }, duration / 100);

        const birthT = setTimeout(() => setPhase('vortex'), timings.birth);
        const vortexT = setTimeout(() => setPhase('synthesis'), timings.birth + timings.vortex);
        const synthT = setTimeout(() => setPhase('deal'), timings.birth + timings.vortex + timings.synthesis);
        const completeT = setTimeout(() => {
            setPhase('launch');
            setTimeout(onComplete, 400);
        }, duration);

        return () => {
            clearInterval(timer);
            clearTimeout(birthT);
            clearTimeout(vortexT);
            clearTimeout(synthT);
            clearTimeout(completeT);
        };
    }, [duration, onComplete]);

    const getCardStyle = (index: number, total: number): React.CSSProperties => {
        const angle = (index / total) * Math.PI * 2;
        const stagger = index * 40;
        
        switch (phase) {
            case 'birth':
                return {
                    transform: `translate3d(0, 0, -500px) rotateX(90deg) scale(0)`,
                    opacity: 0,
                    filter: 'blur(20px)'
                };

            case 'vortex': {
                const radius = 180;
                const tx = Math.cos(angle + (progress * 0.1)) * radius;
                const ty = Math.sin(angle + (progress * 0.1)) * radius;
                const tz = Math.sin(progress * 0.05 + index) * 100;
                return {
                    transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateZ(${angle + progress}rad) rotateY(10deg)`,
                    opacity: 1,
                    filter: 'blur(0px)',
                    transitionDelay: `${stagger}ms`,
                    zIndex: Math.floor(tz + 500)
                };
            }

            case 'synthesis':
                return {
                    transform: `translate3d(0, 0, 0) rotateY(${index * 15}deg) rotateZ(${index * 5}deg) scale(0.85)`,
                    opacity: 1,
                    filter: `drop-shadow(0 0 20px ${theme.accent}40)`,
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                };

            case 'deal':
                return {
                    transform: `translate3d(${index * 2}px, ${index * -2}px, ${index * 10}px) rotateX(0deg) scale(1)`,
                    opacity: index === 0 ? 1 : 0.4,
                    zIndex: total - index
                };
            
            case 'launch':
                return {
                    transform: `translate3d(0, 0, 1000px) scale(2)`,
                    opacity: 0,
                    filter: 'blur(40px)'
                };

            default:
                return {};
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none overflow-hidden bg-[#020202]/90 backdrop-blur-md" style={{ perspective: '1200px' }}>
            
            {/* Background Quantum Vortex */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="w-[150vw] h-[150vw] rounded-full opacity-20 animate-spin-slow"
                    style={{ 
                        background: `conic-gradient(from 0deg, transparent, ${theme.accent}, transparent, ${theme.accent}, transparent)`,
                        filter: 'blur(100px)'
                    }} 
                />
            </div>

            {/* HUD Overlay */}
            <div className="absolute top-1/4 w-full flex flex-col items-center gap-4 z-50">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md animate-pulse">
                    <Cpu size={14} className="text-white/60" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
                        Protocolo Infinitum: {progress}%
                    </span>
                </div>
                <div className="h-0.5 w-48 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-300 ease-out"
                        style={{ width: `${progress}%`, boxShadow: `0 0 15px ${theme.accent}` }}
                    />
                </div>
            </div>

            {/* The Cards */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                {players.map((player, idx) => (
                    <div
                        key={player.id}
                        className="absolute transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) will-change-transform"
                        style={{
                            width: '260px',
                            height: '360px',
                            ...getCardStyle(idx, players.length)
                        }}
                    >
                        <div 
                            className="w-full h-full rounded-[2.5rem] border-2 relative overflow-hidden backdrop-blur-2xl flex flex-col items-center justify-center p-8 shadow-2xl"
                            style={{
                                backgroundColor: theme.cardBg,
                                borderColor: `${theme.accent}40`,
                                boxShadow: `0 20px 60px -15px ${theme.accent}30`
                            }}
                        >
                            {/* Scanning Glint Effect */}
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-30 animate-shimmer-sweep" 
                                 style={{ background: 'linear-gradient(110deg, transparent 40%, #ffffff 50%, transparent 60%)', backgroundSize: '200% 100%' }} 
                            />

                            {/* Hex Pattern Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                 style={{ 
                                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 1l10.392 6v12L12 25l-10.392-6V7L12 1z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
                                     backgroundSize: '30px'
                                 }} 
                            />

                            {phase === 'vortex' || phase === 'birth' ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <Shield size={60} style={{ color: theme.accent }} strokeWidth={1} className="relative z-20" />
                                    </div>
                                    <div className="w-16 h-0.5 rounded-full bg-white/20" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                                    <div 
                                        className="w-20 h-20 rounded-full border-2 flex items-center justify-center relative group" 
                                        style={{ borderColor: theme.accent }}
                                    >
                                        <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20" />
                                        <span className="text-3xl font-black" style={{ color: theme.text }}>{player.name.charAt(0)}</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.text }}>
                                            {player.name}
                                        </h3>
                                        <p style={{ color: theme.accent }} className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Sincronizado</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes shimmer-sweep {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-shimmer-sweep {
                    animation: shimmer-sweep 3s infinite linear;
                }
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .will-change-transform {
                    will-change: transform, opacity, filter;
                }
            `}</style>
        </div>
    );
};
