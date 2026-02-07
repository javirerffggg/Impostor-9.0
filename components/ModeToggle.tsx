




import React from 'react';
import { ThemeConfig } from '../types';
import { ScanEye, Ghost, ShieldCheck, Network, Beer, Eye, Zap, Smartphone, UserMinus, Brain } from 'lucide-react';

interface Props {
    type: 'hint' | 'troll' | 'architect' | 'nexus' | 'party' | 'oracle' | 'vanguardia' | 'passPhone' | 'renuncia' | 'memory';
    isActive: boolean;
    isDisabled?: boolean;
    onClick: () => void;
    theme: ThemeConfig;
}

const CONFIG = {
    hint: { icon: ScanEye, label: "Pistas" },
    troll: { icon: Ghost, label: "Troll" },
    architect: { icon: ShieldCheck, label: "Arq." },
    nexus: { icon: Network, label: "Nexus" },
    party: { icon: Beer, label: "Fiesta" },
    oracle: { icon: Eye, label: "Oráculo" },
    vanguardia: { icon: Zap, label: "Vanguardia" },
    passPhone: { icon: Smartphone, label: "Pases" },
    renuncia: { icon: UserMinus, label: "Renuncia" },
    memory: { icon: Brain, label: "Memoria" }
};

export const ModeToggle: React.FC<Props> = ({ type, isActive, isDisabled, onClick, theme }) => {
    const { icon: Icon, label } = CONFIG[type];

    return (
        <button 
            onClick={onClick}
            disabled={isDisabled}
            style={{ 
                backgroundColor: isActive ? `${theme.accent}20` : 'transparent',
                borderColor: isActive ? theme.accent : theme.border,
                opacity: isDisabled ? 0.5 : 1
            }}
            className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 hover:bg-white/5 gap-3"
        >
            <div className="flex flex-col items-center gap-1">
                <Icon size={18} style={{ color: theme.text, opacity: isActive ? 1 : 0.5 }} />
                <span style={{ color: theme.text }} className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div 
                style={{ backgroundColor: isActive ? theme.accent : theme.border }}
                className="w-8 h-4 rounded-full relative transition-colors"
            >
                <div className={`w-2.5 h-2.5 bg-white shadow-sm rounded-full absolute top-0.5 transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
            </div>
        </button>
    );
};