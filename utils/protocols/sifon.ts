import { GamePlayer, CategoryData, SifonData, SifonDecision } from '../../types';

/**
 * PROTOCOLO SIFÓN
 * Dilema del prisionero asimétrico entre impostores.
 *
 * Tres caminos:
 *  - sifon:     El activo obtiene 2 pistas. Sus aliados quedan a ciegas.
 *               Los civiles que revelan DESPUÉS reciben una notificación
 *               de filtración con las pistas exactas (equilibrio de suma cero).
 *  - silence:   El activo opera sin pistas. El resto no se ve afectado.
 *  - integrity: El activo conserva su pista estándar y el dilema
 *               se propaga al siguiente impostor elegible (cascada).
 */

/**
 * Devuelve el id del próximo impostor candidato a activar el Sifón.
 * El Último impostor del orden de revelación NUNCA es candidato
 * (regla del "Excluido Final": siempre hay al menos un aliado
 *  que puede ser sifonado para que el dilema sea real).
 */
export const getNextSifonCandidate = (
    players: GamePlayer[],
    currentIndex: number
): string | null => {
    const impostorIndices = players
        .map((p, idx) => (p.isImp ? idx : -1))
        .filter(idx => idx !== -1);

    // Necesitamos al menos 2 impostores para que el dilema sea válido
    if (impostorIndices.length < 2) return null;

    const lastImpostorIndex = impostorIndices[impostorIndices.length - 1];

    for (let i = currentIndex + 1; i < players.length; i++) {
        if (players[i].isImp && i !== lastImpostorIndex) {
            return players[i].id;
        }
    }
    return null;
};

export const applySifonDecision = (
    decision: SifonDecision,
    gameData: GamePlayer[],
    sifonData: SifonData,
    wordPair: CategoryData
): { updatedGameData: GamePlayer[]; updatedSifonData: SifonData } => {

    // Clonar para no mutar el estado original
    const updatedSifonData: SifonData = {
        ...sifonData,
        leakedHints: [...sifonData.leakedHints],
        siphonedImpostorsIds: [...sifonData.siphonedImpostorsIds],
        decision,
        timestamp: Date.now()
    };
    let updatedGameData = [...gameData];

    const activeImpIndex = updatedGameData.findIndex(
        p => p.id === sifonData.activePlayerId
    );

    // Guardia: si el activo no existe, salida segura sin modificar nada
    if (activeImpIndex === -1) {
        console.error('[SIFON] activePlayerId no encontrado en gameData:', sifonData.activePlayerId);
        return { updatedGameData, updatedSifonData };
    }

    if (decision === 'sifon') {
        // --- CONSOLIDACIÓN TOTAL ---
        // El sifonador recibe hasta 2 pistas; sus aliados quedan a ciegas.
        // Los civiles que aún no han revelado reciben la filtración.
        const hints = wordPair.hints ?? [];
        const hint1 = hints[0] ?? wordPair.hint ?? 'Pista 1';
        const hint2 = hints[1] ?? 'Pista Secundaria';

        updatedSifonData.leakedHints = [hint1, hint2];

        updatedGameData = updatedGameData.map((p, index) => {
            if (p.id === sifonData.activePlayerId) {
                return { ...p, word: `PISTAS: 1) ${hint1} | 2) ${hint2}`, isSiphoner: true };
            }
            if (p.isImp) {
                // Aliado impostor: queda sifonado (a ciegas)
                updatedSifonData.siphonedImpostorsIds.push(p.id);
                return { ...p, word: 'SIN PISTA \u2014 SIFONADO', isSiphoned: true };
            }
            if (!p.isImp && index > activeImpIndex) {
                // Civil que aún no ha visto su carta: recibe la filtración
                return { ...p, leakedSifonHints: [hint1, hint2] };
            }
            return p;
        });
    } else if (decision === 'silence') {
        // --- SILENCIO ABSOLUTO ---
        // El activo opera sin pistas. El resto no cambia.
        updatedGameData = updatedGameData.map(p => {
            if (p.id === sifonData.activePlayerId) {
                return { ...p, word: 'MODO FANTASMA \u2014 SIN PISTAS' };
            }
            return p;
        });
    } else if (decision === 'integrity') {
        // --- INTEGRIDAD EN CASCADA ---
        // El activo conserva su pista estándar.
        // El dilema se propaga al siguiente impostor elegible.
        const nextCandidateId = getNextSifonCandidate(updatedGameData, activeImpIndex);
        if (nextCandidateId) {
            updatedSifonData.activePlayerId = nextCandidateId;
            updatedSifonData.decision = 'pending';
        }
        // Si no hay siguiente candidato (todos pasaron la cascada),
        // el Sifón se resuelve sin efecto — el juego continúa normalmente.
    }

    // Eliminar ids duplicados en siphonedImpostorsIds (por si hubo mutación previa)
    updatedSifonData.siphonedImpostorsIds = [
        ...new Set(updatedSifonData.siphonedImpostorsIds)
    ];

    return { updatedGameData, updatedSifonData };
};
