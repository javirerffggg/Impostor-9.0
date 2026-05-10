import React, { useState } from 'react';
import { GamePlayer, ThemeConfig, SifonDecision } from '../types';
import { Network, Ghost, ShieldCheck, Zap } from 'lucide-react';

interface Props {
    player: GamePlayer;
    theme: ThemeConfig;
    onDecision: (decision: SifonDecision) => void;
}

/**
 * SifonDecisionView
 * Intercepta la pantalla cuando el impostor activo tiene el Sifón pendiente.
 * Estética: cian/violeta tecnológico sobre negro, glassmorphism por capas.
 */
export const SifonDecisionView: React.FC<Props> = ({ player, theme, onDecision }) => {
    const [selected, setSelected] = useState<SifonDecision | null>(null);

    const handleSelect = (decision: SifonDecision) => {
        if (selected !== null) return; // evitar doble-tap
        setSelected(decision);
        if (navigator.vibrate) navigator.vibrate([50, 100, 200]);
        // Pequeño delay para que la animación de selección sea visible
        setTimeout(() => onDecision(decision), 900);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500"
            style={{
                background: 'rgba(0,0,0,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            {/* Fondo etéreo cian/violeta */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(6,182,212,0.18) 0%, rgba(76,29,149,0.22) 55%, transparent 100%)',
                    opacity: 0.9,
                }}
            />
            {/* Ruido sutil de textura */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                    backgroundSize: '180px 180px',
                }}
            />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                {/* Icónico */}
                <div className="relative mb-6 flex items-center justify-center">
                    <div
                        className="absolute w-20 h-20 rounded-full blur-2xl animate-pulse"
                        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), rgba(76,29,149,0.4))' }}
                    />
                    <Zap
                        size={44}
                        strokeWidth={1.5}
                        style={{ color: '#67e8f9', filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.8))' }}
                    />
                </div>

                {/* Título */}
                <h2
                    className="text-3xl text-center mb-1"
                    style={{
                        fontWeight: 100,
                        color: '#cffafe',
                        letterSpacing: '0.12em',
                        textShadow: '0 0 24px rgba(6,182,212,0.5)',
                        fontFamily: theme.font,
                    }}
                >
                    PROTOCOLO SIFÓN
                </h2>
                <p
                    className="text-[10px] text-center mb-2 uppercase tracking-[0.25em]"
                    style={{ color: 'rgba(103,232,249,0.5)' }}
                >
                    Consolidación de Datos • {player.name}
                </p>

                {/* Separador */}
                <div
                    className="w-24 h-px mb-8"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)' }}
                />

                {/* OPCIONES */}
                <div className="w-full space-y-3">

                    {/* SIFON — Cian/Violeta */}
                    <button
                        onClick={() => handleSelect('sifon')}
                        disabled={selected !== null}
                        className="w-full relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-500"
                        style={{
                            border: selected === 'sifon'
                                ? '1px solid rgba(6,182,212,0.9)'
                                : '1px solid rgba(6,182,212,0.2)',
                            background: selected === 'sifon'
                                ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(76,29,149,0.25))'
                                : 'rgba(0,0,0,0.4)',
                            boxShadow: selected === 'sifon'
                                ? '0 0 32px rgba(6,182,212,0.35), inset 0 0 20px rgba(6,182,212,0.08)'
                                : 'none',
                            transform: selected === 'sifon' ? 'scale(1.03)' : 'scale(1)',
                            opacity: selected !== null && selected !== 'sifon' ? 0.4 : 1,
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <Network
                                size={22}
                                strokeWidth={1.5}
                                style={{ color: selected === 'sifon' ? '#67e8f9' : 'rgba(6,182,212,0.6)', flexShrink: 0, marginTop: 2 }}
                            />
                            <div>
                                <h3
                                    className="font-bold uppercase tracking-widest text-xs mb-1.5"
                                    style={{ color: selected === 'sifon' ? '#cffafe' : 'rgba(207,250,254,0.7)' }}
                                >
                                    Consolidación Total
                                </h3>
                                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(103,232,249,0.55)' }}>
                                    Recibes 2 pistas. Tus aliados quedan a ciegas.
                                    Los civiles detectan la filtración.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* SILENCIO — Matte Black */}
                    <button
                        onClick={() => handleSelect('silence')}
                        disabled={selected !== null}
                        className="w-full rounded-2xl p-5 text-left transition-all duration-500"
                        style={{
                            border: selected === 'silence'
                                ? '1px solid rgba(156,163,175,0.6)'
                                : '1px solid rgba(75,85,99,0.3)',
                            background: selected === 'silence'
                                ? 'rgba(17,17,17,0.95)'
                                : 'rgba(0,0,0,0.6)',
                            boxShadow: selected === 'silence'
                                ? '0 0 24px rgba(0,0,0,0.8)'
                                : 'none',
                            transform: selected === 'silence' ? 'scale(1.03)' : 'scale(1)',
                            opacity: selected !== null && selected !== 'silence' ? 0.4 : 1,
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <Ghost
                                size={22}
                                strokeWidth={1.5}
                                style={{ color: selected === 'silence' ? 'rgba(209,213,219,0.9)' : 'rgba(75,85,99,0.7)', flexShrink: 0, marginTop: 2 }}
                            />
                            <div>
                                <h3
                                    className="font-bold uppercase tracking-widest text-xs mb-1.5"
                                    style={{ color: selected === 'silence' ? 'rgba(243,244,246,0.9)' : 'rgba(156,163,175,0.6)' }}
                                >
                                    Silencio Absoluto
                                </h3>
                                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(107,114,128,0.8)' }}>
                                    Sin pistas. Sin rastro.
                                    Tus aliados conservan sus datos.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* INTEGRIDAD — Glassmorphism */}
                    <button
                        onClick={() => handleSelect('integrity')}
                        disabled={selected !== null}
                        className="w-full rounded-2xl p-5 text-left transition-all duration-500"
                        style={{
                            border: selected === 'integrity'
                                ? '1px solid rgba(255,255,255,0.45)'
                                : '1px solid rgba(255,255,255,0.08)',
                            background: selected === 'integrity'
                                ? 'rgba(255,255,255,0.15)'
                                : 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            boxShadow: selected === 'integrity'
                                ? '0 0 24px rgba(255,255,255,0.1)'
                                : 'none',
                            transform: selected === 'integrity' ? 'scale(1.03)' : 'scale(1)',
                            opacity: selected !== null && selected !== 'integrity' ? 0.4 : 1,
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <ShieldCheck
                                size={22}
                                strokeWidth={1.5}
                                style={{ color: selected === 'integrity' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)', flexShrink: 0, marginTop: 2 }}
                            />
                            <div>
                                <h3
                                    className="font-bold uppercase tracking-widest text-xs mb-1.5"
                                    style={{ color: selected === 'integrity' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)' }}
                                >
                                    Integridad (Estándar)
                                </h3>
                                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    1 pista normal. El dilema se propaga
                                    al siguiente aliado elegible.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer discreto */}
                <p
                    className="mt-8 text-[9px] text-center uppercase tracking-[0.3em]"
                    style={{ color: 'rgba(103,232,249,0.25)' }}
                >
                    Solo tú puedes ver esta pantalla
                </p>
            </div>
        </div>
    );
};
