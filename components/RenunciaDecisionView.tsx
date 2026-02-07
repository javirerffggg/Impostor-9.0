
import React, { useState } from 'react';
import { GamePlayer, ThemeConfig, RenunciaDecision } from '../types';
import { Shield, X, Users, AlertTriangle, Eye, Clock } from 'lucide-react';

interface Props {
  candidatePlayer: GamePlayer;
  otherPlayers: GamePlayer[];
  theme: ThemeConfig;
  canTransfer: boolean;
  onDecision: (decision: RenunciaDecision) => void;
}

export const RenunciaDecisionView: React.FC<Props> = ({
  candidatePlayer,
  otherPlayers,
  theme,
  canTransfer,
  onDecision
}) => {
  const [selectedOption, setSelectedOption] = useState<RenunciaDecision | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelect = (decision: RenunciaDecision) => {
    setSelectedOption(decision);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onDecision(selectedOption);
    }
  };

  const handleCancel = () => {
    setSelectedOption(null);
    setShowConfirmation(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 relative overflow-y-auto pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* Protocol Header */}
      <div className="relative z-10 text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-top duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 mb-3 sm:mb-4"
          style={{
            backgroundColor: `${theme.accent}15`,
            borderColor: `${theme.accent}50`
          }}>
          <Eye size={16} className="text-purple-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]"
            style={{ color: theme.accent }}>
            PROTOCOLO RENUNCIA
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-2 sm:mb-3 leading-tight px-4"
          style={{ color: theme.text }}>
          {candidatePlayer.name}
        </h1>
        
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest opacity-70"
          style={{ color: theme.sub }}>
          Has sido elegido como Impostor
        </p>
      </div>

      {/* Warning Box - IMPROVED CONTRAST */}
      <div className="relative z-10 w-full max-w-md mb-6 sm:mb-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-xl border-2 animate-in fade-in zoom-in duration-500 delay-200"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.25)', // Increased opacity
          borderColor: 'rgba(245, 158, 11, 0.6)', // Much more visible
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)' // Glow effect
        }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5 animate-pulse drop-shadow-lg" />
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-black text-amber-200 mb-1.5 sm:mb-2 uppercase tracking-wide drop-shadow-md">
              Decisión Crítica
            </p>
            <p className="text-[11px] sm:text-xs leading-relaxed text-amber-50 font-medium">
              Esta decisión es <strong className="text-amber-100">irreversible</strong> y afectará el desarrollo de la partida. 
              Elige con cuidado antes de confirmar.
            </p>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      {!showConfirmation ? (
        <div className="relative z-10 w-full max-w-md space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          
          {/* OPTION A: ACCEPT */}
          <button
            onClick={() => handleSelect('accept')}
            className="w-full group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <Shield size={20} className="sm:w-6 sm:h-6 text-green-400" />
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wide mb-1"
                    style={{ color: theme.text }}>
                    Aceptar Destino
                  </h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed opacity-70"
                    style={{ color: theme.sub }}>
                    Asume tu rol como Impostor y continúa la misión. La partida procede normalmente.
                  </p>
                </div>
              </div>
            </div>
          </button>

          {/* OPTION B: REJECT */}
          <button
            onClick={() => handleSelect('reject')}
            className="w-full group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <X size={20} className="sm:w-6 sm:h-6 text-red-400" />
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wide mb-1"
                    style={{ color: theme.text }}>
                    Rechazar Rol
                  </h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed opacity-70 mb-2"
                    style={{ color: theme.sub }}>
                    Conviértete en Civil. Tu plaza de impostor queda vacante.
                  </p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={10} className="text-red-400 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase leading-tight">
                      El grupo jugará con menos impostores
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* OPTION C: TRANSFER */}
          <button
            onClick={() => handleSelect('transfer')}
            disabled={!canTransfer}
            className="w-full group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                  <Users size={20} className="sm:w-6 sm:h-6 text-purple-400" />
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wide mb-1"
                    style={{ color: theme.text }}>
                    Transferir Rol
                  </h3>
                  <p className="text-[11px] sm:text-xs leading-relaxed opacity-70 mb-2"
                    style={{ color: theme.sub }}>
                    Pasa tu destino al jugador con más Karma. NO sabrás quién es.
                  </p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Eye size={10} className="text-purple-400 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-purple-400 uppercase leading-tight">
                      Transferirás tu rol sin saber a quién
                    </span>
                  </div>
                  
                  {!canTransfer && (
                    <p className="text-[9px] sm:text-[10px] text-red-400 mt-2 font-bold leading-tight">
                      No hay jugadores elegibles que aún no hayan visto su rol
                    </p>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
      ) : (
        // CONFIRMATION SCREEN
        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2"
            style={{
              backgroundColor: `${theme.cardBg}dd`,
              borderColor: theme.border
            }}>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-4"
                style={{
                  backgroundColor: selectedOption === 'accept' ? 'rgba(16, 185, 129, 0.2)' :
                                   selectedOption === 'reject' ? 'rgba(239, 68, 68, 0.2)' :
                                   'rgba(139, 92, 246, 0.2)'
                }}>
                {selectedOption === 'accept' && <Shield size={28} className="sm:w-8 sm:h-8 text-green-400" />}
                {selectedOption === 'reject' && <X size={28} className="sm:w-8 sm:h-8 text-red-400" />}
                {selectedOption === 'transfer' && <Users size={28} className="sm:w-8 sm:h-8 text-purple-400" />}
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black uppercase mb-2"
                style={{ color: theme.text }}>
                ¿Estás Seguro?
              </h2>
              
              <p className="text-xs sm:text-sm opacity-70 px-4"
                style={{ color: theme.sub }}>
                {selectedOption === 'accept' && 'Continuarás como Impostor'}
                {selectedOption === 'reject' && 'Serás Civil, el grupo tendrá menos impostores'}
                {selectedOption === 'transfer' && 'Transferirás tu rol. No sabrás quién es el nuevo impostor.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-widest transition-all active:scale-95"
                style={{
                  backgroundColor: theme.border,
                  color: theme.text
                }}>
                Volver
              </button>
              
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-widest transition-all active:scale-95 shadow-lg"
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff'
                }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Indicator */}
      <div className="relative z-10 mt-6 sm:mt-8 flex items-center gap-2 opacity-50">
        <Clock size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: theme.sub }} />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          style={{ color: theme.sub }}>
          Sin Límite de Tiempo
        </span>
      </div>
    </div>
  );
};
