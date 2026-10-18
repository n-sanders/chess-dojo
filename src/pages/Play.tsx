import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import StrengthSlider from '../components/StrengthSlider';
import { useEngine } from '../engine/useEngine';
import { applyUci, formatMoves, gameStatus, lastMoveOf, tryMove } from '../chessUtils';
import { useStoredState } from '../storage';

type Color = 'w' | 'b';

export default function Play() {
  const engine = useEngine();
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [userColor, setUserColor] = useStoredState<Color>('dojo:play:color', 'w');
  const [elo, setElo] = useStoredState('dojo:elo', 1500);
  const [orientation, setOrientation] = useState<'white' | 'black'>(
    userColor === 'w' ? 'white' : 'black',
  );
  const [thinking, setThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const eloRef = useRef(elo);
  eloRef.current = elo;

  const game = gameRef.current;
  const status = gameStatus(game);
  const engineColor: Color = userColor === 'w' ? 'b' : 'w';

  useEffect(() => {
    if (!engine || game.isGameOver() || game.turn() !== engineColor) return;
    let alive = true;
    setThinking(true);
    engine.bestMove(game.fen(), eloRef.current).then((uci) => {
      if (!alive || !uci) return;
      applyUci(game, uci);
      setFen(game.fen());
      setThinking(false);
    });
    return () => {
      alive = false;
      engine.cancel();
      setThinking(false);
    };
  }, [engine, fen, engineColor, game]);

  const onMove = (from: string, to: string) => {
    if (game.turn() !== userColor || game.isGameOver()) return false;
    const move = tryMove(game, from, to);
    if (!move) return false;
    setFen(game.fen());
    return true;
  };

  const newGame = (color: Color = userColor) => {
    game.reset();
    setUserColor(color);
    setOrientation(color === 'w' ? 'white' : 'black');
    engine?.newGame();
    setFen(game.fen());
  };

  const undo = () => {
    game.undo();
    if (game.turn() !== userColor) game.undo();
    setFen(game.fen());
  };

  const copyPgn = async () => {
    await navigator.clipboard.writeText(game.pgn());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="board-layout">
      <Board
        fen={fen}
        orientation={orientation}
        movable={!status && game.turn() === userColor ? userColor : null}
        lastMove={lastMoveOf(game)}
        onMove={onMove}
      />
      <div className="side">
        <StrengthSlider elo={elo} onChange={setElo} uciEloMin={engine?.uciEloMin} />
        <div className="panel">
          <div className="row">
            <button className="primary" onClick={() => newGame('w')}>
              New game as White
            </button>
            <button className="primary" onClick={() => newGame('b')}>
              New game as Black
            </button>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button onClick={undo} disabled={game.history().length === 0}>
              Undo
            </button>
            <button onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
              Flip board
            </button>
            <button onClick={copyPgn} disabled={game.history().length === 0}>
              {copied ? 'Copied!' : 'Copy PGN'}
            </button>
          </div>
        </div>
        <div className="panel">
          <div className="status">
            {status ??
              (!engine
                ? 'Loading Stockfish…'
                : thinking
                  ? 'Stockfish is thinking…'
                  : game.turn() === userColor
                    ? 'Your move'
                    : '')}
          </div>
          <div className="moves">{formatMoves(game.history()) || <span className="muted">No moves yet</span>}</div>
        </div>
      </div>
    </section>
  );
}
