import React, { useState } from 'react';
import { GamePlayer, ThemeConfig } from '../../types';
import { Eye, Check, AlertTriangle } from 'lucide-react';

interface Props {
    oraclePlayerId: string;
    players: GamePlayer[];
    availableHints: string[];
    civilWord: string;
    theme: ThemeConfig;
    onHintSelected: (selectedHint: string) => void;
}

export const OracleSelectionView: React.FC<Props> = ({ 
    oraclePlayerId, 
    players,
    availableHints, 
    civilWord, 
    theme, 
    onHintSelected 
}) => {
    const [selectedHint, setSelectedHint] = useState<string | null>(null);
    const oraclePlayer = players.find(p => p.id === oraclePlayerId);

    if (!oraclePlayer) return null;

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] relative z-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-4 animate-pulse">
                    <Eye size={16} className="text-violet-400" />
                    <span className="text-xs font-black text-violet-400 uppercase tracking-widest">
                        PROTOCOLO ORÁCULO
                    </span>
                </div>
                
                <h1 className="text-3xl font-black mb-2 uppercase leading-tight" style={{ color: theme.text }}>
                    {oraclePlayer.name}
                </h1>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60" style={{ color: theme.sub }}>
                    Eres el Oráculo
                </p>
                
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1" style={{ color: theme.sub }}>La palabra civil es</p>
                    <p className="text-2xl font-black uppercase" style={{ color: theme.text }}>{civilWord}</p>
                </div>
            </div>

            {/* Warning */}
            <div className="w-full max-w-sm mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: theme.text }}>
                    Elige la pista que recibirá el Impostor. 
                    <br/><span className="text-amber-400 font-bold">El impostor sabrá que su pista fue elegida manualmente.</span>
                </p>
            </div>

            {/* Hint Selection */}
            <div className="w-full max-w-sm space-y-3 mb-8">
                {availableHints.map((hint, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedHint(hint)}
                        className={`w-full p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                            selectedHint === hint 
                                ? 'scale-[1.02] shadow-xl' 
                                : 'hover:scale-[1.01] opacity-80 hover:opacity-100'
                        }`}
                        style={{
                            backgroundColor: selectedHint === hint 
                                ? `${theme.accent}20` 
                                : theme.cardBg,
                            borderColor: selectedHint === hint 
                                ? theme.accent 
                                : theme.border
                        }}
                    >
                         {selectedHint === hint && (
                            <div className="absolute inset-0 bg-white/5 animate-pulse" />
                        )}
                        
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.text }}>
                                {hint}
                            </span>
                            <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selectedHint === hint ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                                style={{ backgroundColor: theme.accent }}
                            >
                                <Check size={14} className="text-white" strokeWidth={4} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Confirm Button */}
            <div className="w-full max-w-sm mt-auto pb-8">
                <button
                    disabled={!selectedHint}
                    onClick={() => selectedHint && onHintSelected(selectedHint)}
                    className="w-full py-4 rounded-full font-black uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
                    style={{
                        backgroundColor: theme.accent,
                        color: '#ffffff',
                        boxShadow: selectedHint ? `0 10px 30px -10px ${theme.accent}60` : 'none'
                    }}
                >
                    {selectedHint ? 'CONFIRMAR DESTINO' : 'SELECCIONA UNA PISTA'}
                </button>
            </div>
        </div>
    );
};