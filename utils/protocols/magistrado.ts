
import { Player, InfinityVault } from '../../types';
import { getVault } from '../core/vault';

export const selectAlcalde = (
    players: Player[], 
    impostorIds: string[], 
    stats: Record<string, InfinityVault>
): Player | null => {
    const civilPlayers = players.filter(p => !impostorIds.includes(p.id));
    
    if (civilPlayers.length === 0) return null;
    if (civilPlayers.length === 1) return civilPlayers[0];

    const weights = civilPlayers.map(player => {
        const key = player.name.trim().toLowerCase();
        const vault = getVault(key, stats);
        const timesAsAlcalde = vault.metrics.timesAsAlcalde || 0;
        return Math.max(10, 100 / (timesAsAlcalde + 1));
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < civilPlayers.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return civilPlayers[i];
        }
    }
    
    return civilPlayers[civilPlayers.length - 1];
};
