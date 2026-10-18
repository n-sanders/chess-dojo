import { Chess, type Move } from 'chess.js';

/** Plays a user drag; promotions auto-queen. Returns null for illegal moves. */
export function tryMove(game: Chess, from: string, to: string): Move | null {
  try {
    return game.move({ from, to, promotion: 'q' });
  } catch {
    return null;
  }
}

export function applyUci(game: Chess, uci: string): Move | null {
  try {
    return game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  } catch {
    return null;
  }
}

export function gameStatus(game: Chess): string | null {
  if (game.isCheckmate()) return `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`;
  if (game.isStalemate()) return 'Draw by stalemate';
  if (game.isThreefoldRepetition()) return 'Draw by threefold repetition';
  if (game.isInsufficientMaterial()) return 'Draw by insufficient material';
  if (game.isDraw()) return 'Draw (50-move rule)';
  return null;
}

export function formatMoves(sans: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    parts.push(`${i / 2 + 1}.${sans[i]}${sans[i + 1] ? ` ${sans[i + 1]}` : ''}`);
  }
  return parts.join(' ');
}

export function lastMoveOf(game: Chess): { from: string; to: string } | null {
  const h = game.history({ verbose: true });
  const m = h[h.length - 1];
  return m ? { from: m.from, to: m.to } : null;
}
