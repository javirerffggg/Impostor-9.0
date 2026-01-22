
import React from 'react';
import { ThemeConfig } from '../types';
import { X, Shield, Skull, Eye, Zap, Network, Beer, Gavel } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    theme: ThemeConfig;
}

export const Manual: React.FC<Props> = ({ isOpen, onClose, theme }) => {
    return (
        <div className={`fixed inset-0 z-[200] transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div style={{ backgroundColor: theme.bg }} className="absolute inset-0 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-white/10 shrink-0 bg-inherit z-10 shadow-xl">
                    <h2 style={{ color: theme.text }} className="text-2xl font-black italic tracking-tighter">MANUAL OPERATIVO</h2>
                    <button 
                        style={{ color: theme.text }} 
                        onClick={onClose}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8" style={{ color: theme.text }}>
                    
                    {/* Intro */}
                    <section className="space-y-2">
                        <p className="text-sm leading-relaxed opacity-80">
                            Bienvenido, agente. Estás ante el sistema de deducción social más avanzado. 
                            Tu objetivo depende de tu lealtad: descubrir al infiltrado o sabotear la misión sin ser detectado.
                        </p>
                    </section>

                    {/* Roles */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 border-b border-white/10 pb-2">Identidades</h3>
                        
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-green-500/10 rounded-lg shrink-0"><Shield className="text-green-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-green-400 uppercase">El Civil</h4>
                                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                                    Conoces la palabra secreta. Tu misión es detectar quién NO la sabe. 
                                    <br/><strong className="text-green-300">Estrategia:</strong> No seas demasiado obvio con tu descripción, o el Impostor adivinará la palabra.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-red-500/10 rounded-lg shrink-0"><Skull className="text-red-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-red-500 uppercase">El Impostor</h4>
                                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                                    No conoces la palabra secreta. Debes fingir que eres uno más.
                                    <br/><strong className="text-red-300">Objetivo:</strong> Sobrevivir a la votación o adivinar la palabra secreta al final si te atrapan.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Protocolos Especiales */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 border-b border-white/10 pb-2">Protocolos Avanzados</h3>
                        
                        <div className="grid gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye size={16} className="text-violet-400"/>
                                    <span className="font-bold text-sm text-violet-400">ORÁCULO</span>
                                </div>
                                <p className="text-xs opacity-70">
                                    Un civil elegido al azar verá pistas falsas destinadas al Impostor. 
                                    El Oráculo debe elegir qué pista verá el Impostor, manipulando así su coartada.
                                </p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={16} className="text-amber-400"/>
                                    <span className="font-bold text-sm text-amber-400">VANGUARDIA</span>
                                </div>
                                <p className="text-xs opacity-70">
                                    Si el jugador inicial es un Impostor, recibe una ventaja táctica: verá dos pistas relacionadas con la palabra secreta en lugar de "Eres el Impostor".
                                </p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Network size={16} className="text-cyan-400"/>
                                    <span className="font-bold text-sm text-cyan-400">NEXUS</span>
                                </div>
                                <p className="text-xs opacity-70">
                                    En partidas con múltiples impostores, el sistema Nexus les revelará la identidad de sus compañeros infiltrados.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Fases */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 border-b border-white/10 pb-2">Secuencia de Misión</h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm opacity-80 marker:text-accent font-mono">
                            <li><strong className="text-white">Fase de Identidad:</strong> Pasad el dispositivo. Mantén pulsado para ver tu rol y palabra.</li>
                            <li><strong className="text-white">Debate:</strong> El jugador designado comienza. Describid la palabra por turnos sin decirla explícitamente.</li>
                            <li><strong className="text-white">Juicio:</strong> Cuando el temporizador acabe (o decidáis parar), señalad al sospechoso a la de tres.</li>
                            <li><strong className="text-white">Resolución:</strong> Desbloquead el resultado final para ver quién mentía.</li>
                        </ol>
                    </section>

                    {/* Party Mode */}
                    <section className="space-y-4 pb-8">
                        <div className="flex items-center gap-2 mb-2 border-b border-pink-500/30 pb-2">
                            <Beer size={18} className="text-pink-500 animate-pulse"/>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">Modo Fiesta (Bacchus)</h3>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed">
                            El sistema gestionará el ritmo de la bebida. 
                            <br/><br/>
                            <span className="text-pink-300 font-bold">• Intensidad Variable:</span> Desde "Aperitivo" hasta "Resaca". El juego se vuelve más agresivo con las rondas.
                            <br/><span className="text-pink-300 font-bold">• El Bartender:</span> Un jugador tendrá el rol de Bartender cada ronda. Su palabra es ley.
                            <br/><span className="text-pink-300 font-bold">• Tribunal:</span> Al final de la ronda, los perdedores beben según la sentencia del sistema.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};
