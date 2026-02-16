
import React, { useState } from 'react';
import { ThemeConfig, Player } from '../types';
import { X, Search, UserPlus, Trash2, Check, Database, AlertCircle } from 'lucide-react';
import { getPlayerColor, getPlayerInitials } from '../utils/playerHelpers';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    savedPlayers: string[];
    currentPlayers: Player[];
    onAddPlayer: (name: string) => void;
    onRemoveFromBank: (name: string) => void;
    theme: ThemeConfig;
}

export const PlayerBank: React.FC<Props> = ({
    isOpen,
    onClose,
    savedPlayers,
    currentPlayers,
    onAddPlayer,
    onRemoveFromBank,
    theme
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredPlayers = savedPlayers.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isPlayerInGame = (name: string) => {
        return currentPlayers.some(p => p.name.toLowerCase() === name.toLowerCase());
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div 
                className="relative w-full max-w-md h-[80vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                style={{ 
                    backgroundColor: theme.bg, 
                    borderColor: theme.border 
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b shrink-0"
                    style={{ borderColor: theme.border, backgroundColor: `${theme.cardBg}F0` }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <Database size={20} style={{ color: theme.accent }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wide" style={{ color: theme.text }}>
                                Banco de Agentes
                            </h2>
                            <p className="text-[10px] font-bold opacity-60" style={{ color: theme.sub }}>
                                {savedPlayers.length} perfiles guardados
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 transition-colors"
                        style={{ color: theme.text }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
                    <div className="relative group">
                        <Search 
                            size={16} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white"
                            style={{ color: theme.sub }} 
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar agente..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-bold transition-all border bg-black/20 focus:bg-black/30"
                            style={{ 
                                color: theme.text,
                                borderColor: theme.border
                            }}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {filteredPlayers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
                            <Database size={48} strokeWidth={1} className="mb-4 opacity-30" style={{ color: theme.text }} />
                            <p className="text-sm font-bold" style={{ color: theme.text }}>
                                {searchQuery ? 'Sin resultados' : 'El banco está vacío'}
                            </p>
                            <p className="text-[10px] mt-2 max-w-[200px]" style={{ color: theme.sub }}>
                                Guarda jugadores desde la pantalla principal para verlos aquí.
                            </p>
                        </div>
                    ) : (
                        filteredPlayers.map((name, idx) => {
                            const inGame = isPlayerInGame(name);
                            const isDeleting = confirmDelete === name;
                            const avatarColor = getPlayerColor(idx);

                            return (
                                <div 
                                    key={name}
                                    className="group flex items-center justify-between p-2 pl-3 rounded-xl border transition-all hover:border-white/20 hover:bg-white/5"
                                    style={{ 
                                        backgroundColor: theme.cardBg,
                                        borderColor: isDeleting ? '#ef4444' : theme.border
                                    }}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-sm"
                                            style={{ 
                                                backgroundColor: avatarColor.bg, 
                                                color: avatarColor.text 
                                            }}
                                        >
                                            {getPlayerInitials(name)}
                                        </div>
                                        <span className="font-bold text-sm truncate" style={{ color: theme.text }}>
                                            {name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {isDeleting ? (
                                            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                                                <span className="text-[10px] font-bold text-red-400 uppercase mr-1">¿Borrar?</span>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <X size={14} className="text-white" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onRemoveFromBank(name);
                                                        setConfirmDelete(null);
                                                    }}
                                                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
                                                    title="Confirmar"
                                                >
                                                    <Trash2 size={14} className="text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setConfirmDelete(name)}
                                                    className="p-2.5 rounded-lg opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all text-white/30"
                                                    title="Eliminar del banco"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                
                                                <button
                                                    onClick={() => !inGame && onAddPlayer(name)}
                                                    disabled={inGame}
                                                    className={`
                                                        px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all
                                                        ${inGame 
                                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                                                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 shadow-sm'
                                                        }
                                                    `}
                                                >
                                                    {inGame ? (
                                                        <>
                                                            <Check size={14} strokeWidth={3} />
                                                            <span className="hidden sm:inline">En juego</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus size={14} />
                                                            <span>Añadir</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Footer Info */}
                <div className="p-3 bg-black/20 border-t flex justify-center" style={{ borderColor: theme.border }}>
                    <p className="text-[10px] opacity-40 text-center" style={{ color: theme.sub }}>
                        Los jugadores guardados se mantienen entre sesiones
                    </p>
                </div>
            </div>
        </div>
    );
};
