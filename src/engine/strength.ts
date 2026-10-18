export const MIN_ELO = 800;
export const MAX_ELO = 3000;
export const ELO_STEP = 100;

/** Stockfish's calibrated UCI_Elo floor; updated from the engine's own option report at startup. */
export const DEFAULT_UCI_ELO_MIN = 1320;

export type StrengthSettings = {
  limitStrength: boolean;
  uciElo?: number;
  skillLevel?: number;
  depth?: number;
  movetimeMs: number;
};

/**
 * Below Stockfish's calibrated floor there is no official Elo, so these rows are rough,
 * hand-tuned labels: Skill Level 0 plus a shallow depth cap.
 */
const SUB_FLOOR_LADDER: { elo: number; depth: number }[] = [
  { elo: 800, depth: 1 },
  { elo: 900, depth: 2 },
  { elo: 1000, depth: 3 },
  { elo: 1100, depth: 4 },
  { elo: 1200, depth: 5 },
  { elo: 1300, depth: 6 },
];

export function clampElo(elo: number): number {
  return Math.min(MAX_ELO, Math.max(MIN_ELO, Math.round(elo / ELO_STEP) * ELO_STEP));
}

export function strengthFor(elo: number, uciEloMin = DEFAULT_UCI_ELO_MIN): StrengthSettings {
  const target = clampElo(elo);
  if (target >= uciEloMin) {
    return { limitStrength: true, uciElo: target, movetimeMs: 1000 };
  }
  const row =
    [...SUB_FLOOR_LADDER].reverse().find((r) => r.elo <= target) ?? SUB_FLOOR_LADDER[0];
  return { limitStrength: false, skillLevel: 0, depth: row.depth, movetimeMs: 300 };
}

export function describeStrength(elo: number, uciEloMin = DEFAULT_UCI_ELO_MIN): string {
  const s = strengthFor(elo, uciEloMin);
  return s.limitStrength
    ? `UCI_Elo ${s.uciElo} (Stockfish-calibrated)`
    : `Skill Level ${s.skillLevel}, depth ${s.depth} (rough estimate)`;
}
