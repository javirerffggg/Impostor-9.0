import React from 'react';
import { Eye, Shield } from 'lucide-react';
import { ThemeConfig } from '../types';

interface Props {
  isWitness: boolean;
  hasRejectedRole: boolean;
  wasTransferred: boolean;
  theme: ThemeConfig;
}

export const RenunciaResultBadge: React.FC<Props> = ({
  isWitness,
  hasRejectedRole,
  wasTransferred,
  theme
}) => {
  
  // TESTIGO (Transfirió el rol)
  if (isWitness) {
    return (
      <div className="absolute top-4 right-4 z-30 animate-in slide-in-from-right fade-in duration-500">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border-2 shadow-lg"
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderColor: 'rgba(139, 92, 246, 0.5)'
          }}>
          <Eye size={12} className="text-purple-300 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300">
            TESTIGO
          </span>
        </div>
        
        <p className="text-[8px] text-center mt-2 text-purple-400/80 font-bold">
          Transferencia realizada
        </p>
      </div>
    );
  }
  
  // RECHAZADO (Solo para información interna, no mostrar visualmente)
  if (hasRejectedRole) {
    // No mostrar badge público, es información privada del jugador
    return null;
  }
  
  // TRANSFERIDO (Recibió el rol sin saberlo)
  if (wasTransferred) {
    return (
      <div className="absolute top-4 left-4 z-30 animate-in slide-in-from-left fade-in duration-500 delay-200">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderColor: 'rgba(245, 158, 11, 0.3)'
          }}>
          <Shield size={10} className="text-amber-300" />
          <span className="text-[8px] font-black uppercase tracking-widest text-amber-300">
            ROL TRANSFERIDO
          </span>
        </div>
      </div>
    );
  }
  
  return null;
};