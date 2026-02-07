
import { InfinityVault } from '../../types';

export const createNewVault = (uid: string): InfinityVault => ({
    uid,
    metrics: {
        totalSessions: 0,
        impostorRatio: 0,
        civilStreak: 0,
        totalImpostorWins: 0,
        quarantineRounds: 0,
        timesAsAlcalde: 0
    },
    categoryDNA: {},
    sequenceAnalytics: {
        lastImpostorPartners: [],
        roleSequence: [],
        averageWaitTime: 0
    }
});

export const getVault = (uid: string, stats: Record<string, InfinityVault>): InfinityVault => {
    return stats[uid] || createNewVault(uid);
};
