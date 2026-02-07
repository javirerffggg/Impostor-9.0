
import React from 'react';
import { GamePlayer, ThemeConfig, PartyIntensity } from '../types';
import { Shield, Skull, Eye, Beer, Network, AlertCircle, Check } from 'lucide-react';

interface RoleContentProps {
    player: GamePlayer;
    theme: ThemeConfig;
    color: string;
    isParty?: boolean;
    isHighIntensity?: boolean;
    isOracleSelectionMade?: boolean;
    oracleOptions?: string[];
    isTransmitting?: boolean;
    onOracleOptionSelect?: (hint: string) => void;
}

export const RoleContent: React.FC<RoleContentProps> = ({
    player,
    theme,
    color,
    isParty,
    isHighIntensity,
    isOracleSelectionMade,
    oracleOptions,
    isTransmitting,
    onOracleOptionSelect
}) => {
    const getFontSize = (text: string) => {
        const len = text.length;
        if (len > 35) return '0.9rem'; 
        if (len > 25) return '1.1rem'; 
        if (len > 18) return '1.3rem';
        if (len > 12) return '1.5rem';
        if (len > 8)  return '1.9rem'; 
        if (len > 5)  return '2.4rem'; 
        return '3.0rem';               
    };

    return (
        <div className="flex flex-col items-center h-full animate-in fade-in duration-200">
            {/* TOP SECTION: Role & Icon */}
            <div className="flex-none flex flex-col items-center justify-center gap-2 w-full pt-1">
                {player.isImp ? (
                    <div className="relative flex items-center justify-center mb-1">
                        <div className="absolute w-28 h-28 bg-red-600/30 rounded-full blur-xl animate-pulse" />
                        <div className="absolute w-24 h-24 rounded-full border border-red-500/30 border-dashed opacity-60 animate-spin-glitch" />
                        <div className="absolute w-16 h-16 bg-red-500/20 rounded-full blur-md mix-blend-screen animate-imp-aura-pulse" />
                        <Skull size={48} className="text-red-500 relative z-10 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-impostor-shake" />
                    </div>
                ) : player.isOracle ? (
                    <div className="relative flex items-center justify-center mb-1">
                        <div className="absolute w-28 h-28 bg-violet-600/30 rounded-full blur-xl animate-pulse" />
                        <div className="absolute w-24 h-24 rounded-full border border-violet-500/30 border-dashed opacity-60 animate-[spin_10s_linear_infinite]" />
                        <Eye size={48} className="text-violet-400 relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                    </div>
                ) : (
                    <div className="relative flex items-center justify-center mb-1">
                        <div className="absolute w-28 h-28 bg-green-600/30 rounded-full blur-xl animate-pulse" />
                        <div className="absolute w-24 h-24 rounded-full border border-green-500/30 border-dashed opacity-60 animate-[spin_12s_linear_infinite_reverse]" />
                        <div className="absolute w-16 h-16 bg-green-500/20 rounded-full blur-md mix-blend-screen animate-imp-aura-pulse" />
                        <Shield size={48} className="text-green-500 relative z-10 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    </div>
                )}

                <h3 className={`text-xl font-black uppercase tracking-widest ${player.isImp ? 'text-red-500 glitch-text-anim' : (player.isOracle ? 'text-violet-400' : 'text-green-500')}`} data-text={player.isOracle ? 'ORÁCULO' : player.role}>
                    {player.isOracle ? 'ORÁCULO' : player.role}
                </h3>

                {player.isVanguardia && (
                    <div className="mt-2 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <p className="text-xs text-white font-black uppercase tracking-wide text-center max-w-[240px] leading-tight drop-shadow-md bg-red-600/20 p-2 rounded border border-red-500/50">
                            Te toca comenzar a hablar, tienes una pista adicional
                        </p>
                    </div>
                )}

                {isParty && player.partyRole && player.partyRole !== 'civil' && (
                    <div className="bg-pink-500/20 border border-pink-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse mb-1">
                        <Beer size={10} className="text-pink-400" />
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">
                            ROL: {player.partyRole}
                        </span>
                    </div>
                )}

                {!player.isImp && (
                    <p style={{ color: theme.sub }} className="text-xs font-black uppercase tracking-[0.2em]">
                        CATEGORÍA: {player.category}
                    </p>
                )}

                <div className={`w-2/3 h-px my-2 ${player.isImp ? 'bg-red-500/50 animate-pulse' : (player.isOracle ? 'bg-violet-500/50' : 'bg-white/20')}`} />
            </div>

            {/* MIDDLE SECTION: Word */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 overflow-visible my-auto mb-8 relative">
                {player.isOracle && !isOracleSelectionMade && !isTransmitting ? (
                    <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                        <p className="text-[9px] font-black uppercase tracking-widest text-center text-violet-300 mb-1">
                            Elige la pista del Impostor
                        </p>
                        <div className="bg-black/20 p-2 rounded mb-2 border border-white/10">
                            <p className="text-[10px] text-center text-white/50 mb-1">PALABRA CIVIL</p>
                            <p className="text-xl font-black text-center text-white">{player.realWord}</p>
                        </div>
                        <div className="grid gap-2 relative z-50">
                            {oracleOptions?.map((opt, i) => (
                                <button
                                    key={i}
                                    onPointerDown={(e) => { e.stopPropagation(); onOracleOptionSelect?.(opt); }}
                                    className="bg-violet-500/20 border border-violet-500/50 py-3 rounded active:scale-95 transition-all text-sm font-bold text-violet-100 uppercase tracking-wide cursor-pointer"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : isTransmitting ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-black text-violet-400 tracking-widest animate-pulse">TRANSMITIENDO...</p>
                    </div>
                ) : (
                    <>
                        <p 
                            style={{ 
                                fontSize: getFontSize(player.word),
                                lineHeight: '1.15',
                                background: player.isImp 
                                    ? 'linear-gradient(180deg, #ffffff 0%, #ff3333 40%, #500000 100%)' 
                                    : (player.isOracle 
                                        ? 'linear-gradient(180deg, #ffffff 0%, #a78bfa 100%)' 
                                        : `linear-gradient(180deg, ${theme.text} 0%, ${color} 100%)`),
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                maxHeight: '100%',
                                width: '100%',
                                maxWidth: '100%',
                                display: '-webkit-box',
                                WebkitLineClamp: 5, 
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                hyphens: 'auto'
                            }}
                            className={`font-black leading-tight text-center uppercase ${player.isImp || (isParty && isHighIntensity) ? 'glitch-text-anim' : ''}`}
                            data-text={player.word}
                        >
                            {player.word}
                        </p>

                        {player.isImp && player.nexusPartners && player.nexusPartners.length > 0 && (
                            <div className="mt-6 w-full bg-black/40 border border-red-500/50 rounded-xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <div className="flex items-center gap-2 mb-2 border-b border-red-500/20 pb-2">
                                    <Network size={14} className="text-red-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">NEXUS ACTIVA</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {player.nexusPartners.map((partnerName, idx) => (
                                        <span key={idx} className="text-sm font-black text-white bg-red-600/80 px-3 py-1 rounded shadow-sm uppercase tracking-wider">
                                            {partnerName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {player.isImp && player.oracleTriggered && (
                            <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded animate-pulse">
                                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                <p className="text-[9px] font-bold text-amber-500 leading-tight uppercase">PISTA FILTRADA POR EL ORÁCULO</p>
                            </div>
                        )}

                        {player.isOracle && isOracleSelectionMade && (
                            <div className="mt-2 flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded">
                                <Check size={12} className="text-violet-500" />
                                <p className="text-[9px] font-bold text-violet-400 uppercase">Destino Manipulado</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
