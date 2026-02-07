import React, { useEffect, useState } from 'react';
import { Crown, Gavel, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types';

interface Props {
    alcaldeName: string;
    theme: ThemeConfig;
    onContinue: () => void;
}

export const MagistradoAnnouncement: React.FC<Props> = ({
    alcaldeName,
    theme,
    onContinue
}) => {
    const [phase, setPhase] = useState<'fanfare' | 'main'>('fanfare');
    
    useEffect(() => {
        // Transición automática después de 2s
        const timer = setTimeout(() => setPhase('main'), 2000);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-700"
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
            
            {phase === 'fanfare' ? (
                // Fase 1: Fanfare dramática
                <div className="text-center animate-in zoom-in duration-500">
                    <Crown 
                        size={100} 
                        className="mx-auto mb-4 animate-bounce"
                        style={{ 
                            color: '#FFD700',
                            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
                        }} 
                    />
                    <div 
                        className="text-5xl sm:text-7xl font-black uppercase tracking-wider"
                        style={{ 
                            color: '#FFD700',
                            textShadow: '0 0 40px rgba(255, 215, 0, 0.8)'
                        }}>
                        Habemus
                    </div>
                </div>
            ) : (
                // Fase 2: Revelación y explicación
                <div className="max-w-lg w-full text-center space-y-6 animate-in slide-in-from-bottom duration-500">
                    {/* Título */}
                    <div>
                        <div 
                            className="text-4xl sm:text-6xl font-black uppercase tracking-widest mb-3"
                            style={{ 
                                color: '#FFD700',
                                textShadow: '0 0 30px rgba(255, 215, 0, 0.7)'
                            }}>
                            Magistratum
                        </div>
                        <div 
                            className="h-1 w-48 mx-auto rounded-full"
                            style={{ backgroundColor: '#FFD700' }} 
                        />
                    </div>
                    
                    {/* Nombre del Alcalde */}
                    <div className="py-6 px-8 rounded-xl border-2"
                        style={{
                            backgroundColor: `${theme.cardBg}cc`,
                            borderColor: '#FFD700',
                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
                        }}>
                        <div className="text-xs sm:text-sm uppercase tracking-wider opacity-70 mb-2"
                            style={{ color: '#FFD700' }}>
                            Alcalde de la Sesión
                        </div>
                        <div className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-3"
                            style={{ color: theme.text }}>
                            <Crown size={28} style={{ color: '#FFD700' }} />
                            {alcaldeName}
                            <Crown size={28} style={{ color: '#FFD700' }} />
                        </div>
                    </div>
                    
                    {/* Explicación */}
                    <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3 p-4 rounded-xl border"
                            style={{ 
                                backgroundColor: `${theme.accent}15`,
                                borderColor: `${theme.border}`
                            }}>
                            <Gavel size={24} className="shrink-0 mt-0.5" style={{ color: '#FFD700' }} />
                            <div>
                                <div className="font-bold text-sm" style={{ color: theme.text }}>
                                    Voto de Calidad
                                </div>
                                <div className="text-xs opacity-80 mt-1" style={{ color: theme.sub }}>
                                    En caso de empate en la votación, su voto cuenta doble. Su autoridad es absoluta.
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 rounded-xl border"
                            style={{ 
                                backgroundColor: `${theme.accent}15`,
                                borderColor: `${theme.border}`
                            }}>
                            <Sparkles size={24} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                            <div>
                                <div className="font-bold text-sm" style={{ color: theme.text }}>
                                    Civil Confirmado
                                </div>
                                <div className="text-xs opacity-80 mt-1" style={{ color: theme.sub }}>
                                    El sistema garantiza que NO es impostor. Es 100% de confianza.
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Advertencia */}
                    <div className="text-xs italic opacity-70 p-3 rounded-lg border text-center"
                        style={{ 
                            color: theme.sub,
                            borderColor: `${theme.border}80`
                        }}>
                        ⚠️ Los impostores intentarán manipular al Alcalde.<br/>
                        Lidera el debate con sabiduría.
                    </div>
                    
                    {/* Botón */}
                    <button
                        onClick={onContinue}
                        className="w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            backgroundColor: '#FFD700',
                            color: '#000',
                            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)'
                        }}>
                        Comenzar la Sesión
                    </button>
                </div>
            )}
        </div>
    );
};