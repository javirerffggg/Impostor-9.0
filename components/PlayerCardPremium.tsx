import React, { useState } from 'react';
import { Player, ThemeConfig } from '../types';
import { X, ChevronUp, ChevronDown, Palette, TrendingUp, Crown, Shield } from 'lucide-react';
import { getPlayerColor } from '../utils/playerHelpers';

interface PlayerCardPremiumProps {
  player: Player;
  index: number;
  total: number;
  theme: ThemeConfig;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  isEditing: boolean;
  className?: string;
  stats?: { games: number; wins: number; civilStreak: number } | null;
  onCycleColor: (id: string) => void;
}

export const PlayerCardPremium: React.FC<PlayerCardPremiumProps> = ({
  player, index, total, theme, onRemove, onMove, isEditing, className, stats, onCycleColor
}) => {
  const [showStats, setShowStats] = useState(false);

  const colorIndex = player.avatarIdx !== undefined ? player.avatarIdx : index;
  const avatarColor = getPlayerColor(colorIndex);

  return (
    <div
      className={`relative group animate-in slide-in-from-left fade-in duration-300 ${className || ''}`}
      onMouseEnter={() => setShowStats(true)}
      onMouseLeave={() => setShowStats(false)}
    >
      <div
        className={`relative overflow-hidden rounded-xl p-2.5 transition-all duration-300 ${
          isEditing ? 'pr-1' : ''
        } hover:scale-[1.02]`}
        style={{
          backgroundColor: avatarColor.bg,
          boxShadow: `0 4px 12px -6px ${avatarColor.bg}80`,
          animationDelay: `${index * 50}ms`
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
        <div
          className="absolute -right-4 -top-4 w-20 h-20 opacity-5"
          style={{ background: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '10px 10px' }}
        />

        <div className="relative z-10 flex items-center gap-2 pl-1">
          {stats && !isEditing && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm shrink-0" />
          )}

          <span className="flex-1 font-bold text-xs leading-tight drop-shadow-sm line-clamp-1" style={{ color: 'white' }}>
            {player.name}
          </span>

          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onCycleColor(player.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/20 hover:bg-black/40 text-white transition-all active:scale-95"
                title="Cambiar Color"
              >
                <Palette size={14} strokeWidth={2.5} />
              </button>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(index, -1); }}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
                >
                  <ChevronUp size={16} strokeWidth={3} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(index, 1); }}
                  disabled={index === total - 1}
                  className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
                >
                  <ChevronDown size={16} strokeWidth={3} />
                </button>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(player.id); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-red-500/80 transition-all duration-200 shrink-0"
                style={{ color: 'white' }}
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(player.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-200 hover:bg-white/20 active:scale-90 shrink-0"
              style={{ color: 'white' }}
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {showStats && stats && !isEditing && (
          <div
            className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl backdrop-blur-2xl border z-50 animate-in slide-in-from-top-2 fade-in duration-200"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: avatarColor.bg,
              boxShadow: `0 10px 40px -10px ${avatarColor.bg}60`
            }}
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center mb-1"><TrendingUp size={12} style={{ color: theme.accent }} /></div>
                <p className="text-lg font-black" style={{ color: theme.text }}>{stats.games}</p>
                <p className="text-[8px] font-bold uppercase opacity-60" style={{ color: theme.sub }}>Partidas</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1"><Crown size={12} className="text-yellow-400" /></div>
                <p className="text-lg font-black" style={{ color: theme.text }}>{stats.wins}</p>
                <p className="text-[8px] font-bold uppercase opacity-60" style={{ color: theme.sub }}>Victorias</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1"><Shield size={12} className="text-green-400" /></div>
                <p className="text-lg font-black" style={{ color: theme.text }}>{stats.civilStreak}</p>
                <p className="text-[8px] font-bold uppercase opacity-60" style={{ color: theme.sub }}>Racha</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
