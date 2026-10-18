import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import IdPrompt from '../components/IdPrompt';
import StrengthSlider from '../components/StrengthSlider';
import distractors from '../data/distractors.json';
import { useEngine } from '../engine/useEngine';
import { applyUci, formatMoves, gameStatus, lastMoveOf, tryMove } from '../chessUtils';
import {
  answerPrompt,
  continueFreePlay,
  playBlack,
  recordEngineMove,
  startDrill,
  type DrillOptions,
  type DrillState,
  type PromptResult,
} from '../openings/drillMachine';
import { PHASES } from '../openings/phases';
import { readJson, useStoredState, writeJson } from '../storage';

type NameStats = Record<string, { correct: number; attempts: number }>;
type RecentDrill = { at: string; phase: string; line: string; correct: number; total: number; outOfBook?: string };

const STATS_KEY = 'dojo:drill:stats';
const RECENT_KEY = 'dojo:drill:recent';
const RECENT_LIMIT = 15;
const rng = Math.random;

function replay(moves: string[]): Chess {
  const game = new Chess();
  for (const san of moves) game.move(san);
  return game;
}

function promptContext(state: DrillState): string {
  const kind = state.prompts[0]?.kind;
  if (kind === 'white') return `White played ${formatMoves(state.moves)}`;
  if (kind === 'defense') return `You replied ${formatMoves(state.moves)}`;
  return `Book line: ${formatMoves(state.moves)}`;
}

function recordStats(result: PromptResult) {
  const stats = readJson<NameStats>(STATS_KEY, {});
  const s = stats[result.answer] ?? { correct: 0, attempts: 0 };
  stats[result.answer] = { correct: s.correct + (result.correct ? 1 : 0), attempts: s.attempts + 1 };
  writeJson(STATS_KEY, stats);
}

export default function Drill() {
  const engine = useEngine();
  const [phaseId, setPhaseId] = useStoredState('dojo:drill:phase', PHASES[0].id);
  const phase = PHASES.find((p) => p.id === phaseId) ?? PHASES[0];
  const tree = phase.tree;
  const [askVariation, setAskVariation] = useStoredState('dojo:drill:askVariation', true);
  const [elo, setElo] = useStoredState('dojo:elo', 1500);
  const eloRef = useRef(elo);
  eloRef.current = elo;

  const opts: DrillOptions = useMemo(() => ({ askVariation, distractors }), [askVariation]);
  const [drill, setDrill] = useState<DrillState>(() => startDrill(tree, opts, rng));
  const [drillId, setDrillId] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [stats, setStats] = useState<NameStats>(() => readJson(STATS_KEY, {}));
  const [recent, setRecent] = useState<RecentDrill[]>(() => readJson(RECENT_KEY, []));
  const loggedDrill = useRef(-1);

  const game = useMemo(() => replay(drill.moves), [drill.moves]);
  const status = gameStatus(game);
  const prompt = drill.prompts[0];
  const whiteToMove = game.turn() === 'w';

  const newDrill = () => {
    engine?.newGame();
    setDrill(startDrill(tree, opts, rng));
    setDrillId((n) => n + 1);
  };

  const selectPhase = (id: string) => {
    const next = PHASES.find((p) => p.id === id) ?? PHASES[0];
    setPhaseId(next.id);
    engine?.newGame();
    setDrill(startDrill(next.tree, opts, rng));
    setDrillId((n) => n + 1);
  };

  // Free play: Stockfish answers as White.
  useEffect(() => {
    if (!engine || drill.phase !== 'free' || !whiteToMove || game.isGameOver()) return;
    let alive = true;
    setThinking(true);
    engine.bestMove(game.fen(), eloRef.current).then((uci) => {
      if (!alive || !uci) return;
      const copy = new Chess(game.fen());
      const move = applyUci(copy, uci);
      setThinking(false);
      if (move) setDrill((d) => recordEngineMove(d, move.san));
    });
    return () => {
      alive = false;
      engine.cancel();
      setThinking(false);
    };
  }, [engine, drill.phase, whiteToMove, game]);

  // Log the drill once the book phase is over.
  useEffect(() => {
    if (drill.phase === 'book' || loggedDrill.current === drillId) return;
    loggedDrill.current = drillId;
    const entry: RecentDrill = {
      at: new Date().toISOString(),
      phase: phase.id,
      line: formatMoves(drill.moves),
      correct: drill.results.filter((r) => r.correct).length,
      total: drill.results.length,
      outOfBook: drill.outOfBookMove,
    };
    const next = [entry, ...readJson<RecentDrill[]>(RECENT_KEY, [])].slice(0, RECENT_LIMIT);
    writeJson(RECENT_KEY, next);
    setRecent(next);
  }, [drill, drillId, phase.id]);

  const onMove = (from: string, to: string) => {
    if (prompt || whiteToMove || drill.phase === 'outOfBook' || status) return false;
    const copy = new Chess(game.fen());
    const move = tryMove(copy, from, to);
    if (!move) return false;
    setDrill((d) => playBlack(tree, d, move.san, opts, rng));
    return true;
  };

  const onAnswer = (picked: string) => {
    const p = drill.prompts[0];
    if (!p) return;
    recordStats({ kind: p.kind, answer: p.answer, picked, correct: picked === p.answer });
    setStats(readJson(STATS_KEY, {}));
    setDrill((d) => answerPrompt(tree, d, picked, opts, rng));
  };

  const score = drill.results.filter((r) => r.correct).length;
  const weakest = Object.entries(stats)
    .map(([name, s]) => ({ name, ...s, pct: s.correct / s.attempts }))
    .sort((a, b) => a.pct - b.pct || b.attempts - a.attempts)
    .slice(0, 8);

  let statusText: string;
  if (status) statusText = status;
  else if (drill.phase === 'book') statusText = prompt ? 'Identify the opening' : 'Book phase — your move as Black';
  else if (drill.phase === 'outOfBook') statusText = 'Drill stopped';
  else if (!engine) statusText = 'Loading Stockfish…';
  else statusText = thinking ? 'Stockfish is thinking…' : whiteToMove ? '' : 'Free play — your move';

  return (
    <section className="board-layout">
      <Board
        fen={game.fen()}
        orientation="black"
        movable={!prompt && !whiteToMove && drill.phase !== 'outOfBook' && !status ? 'b' : null}
        lastMove={lastMoveOf(game)}
        onMove={onMove}
      />

      <div className="side">
        {prompt && (
          <IdPrompt
            key={`${drillId}-${drill.results.length}`}
            prompt={prompt}
            context={promptContext(drill)}
            onAnswer={onAnswer}
          />
        )}
        {drill.phase === 'outOfBook' && (
          <div className="banner">
            <strong>{drill.outOfBookMove}</strong> is outside {phase.label.split(' — ')[0]}. Drill stopped.
            <div className="row" style={{ marginTop: 10 }}>
              <button onClick={() => setDrill(continueFreePlay)}>Keep playing vs Stockfish</button>
              <button className="primary" onClick={newDrill}>
                New drill
              </button>
            </div>
          </div>
        )}
        {drill.phase === 'free' && drill.endHandled && (
          <div className="banner info">
            Book line complete ({score}/{drill.results.length} correct). Free play vs Stockfish now.
          </div>
        )}

        <div className="panel">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="status">{statusText}</span>
            <button className="primary" onClick={newDrill}>
              New drill
            </button>
          </div>
          <div className="moves" style={{ marginTop: 8 }}>
            {formatMoves(drill.moves) || <span className="muted">Waiting for White…</span>}
          </div>
        </div>

        <div className="panel">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Identified</strong>
            <span>
              {score} / {drill.results.length}
            </span>
          </div>
          <ul className="id-log" style={{ marginTop: 8 }}>
            {drill.results.map((r, i) => (
              <li key={i} className={r.correct ? 'ok' : 'miss'}>
                {r.answer}
                {!r.correct && <span className="muted"> (you said {r.picked})</span>}
              </li>
            ))}
            {drill.results.length === 0 && <li className="muted">Nothing yet</li>}
          </ul>
        </div>

        <StrengthSlider elo={elo} onChange={setElo} uciEloMin={engine?.uciEloMin} />

        <div className="panel">
          <div className="row">
            <select value={phaseId} onChange={(e) => selectPhase(e.target.value)} aria-label="Opening phase">
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <label className="toggle">
              <input type="checkbox" checked={askVariation} onChange={(e) => setAskVariation(e.target.checked)} />
              Ask variation names
            </label>
          </div>
        </div>

        <div className="panel">
          <strong>Weakest openings</strong>
          {weakest.length === 0 ? (
            <p className="muted">Stats appear after your first answers.</p>
          ) : (
            <table className="stats" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="num">Correct</th>
                  <th className="num">%</th>
                </tr>
              </thead>
              <tbody>
                {weakest.map((w) => (
                  <tr key={w.name}>
                    <td>{w.name}</td>
                    <td className="num">
                      {w.correct}/{w.attempts}
                    </td>
                    <td className="num">{Math.round(w.pct * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {recent.length > 0 && (
          <div className="panel">
            <strong>Recent drills</strong>
            <ul className="id-log" style={{ marginTop: 8 }}>
              {recent.slice(0, 5).map((r) => (
                <li key={r.at} className={r.total > 0 && r.correct === r.total ? 'ok' : 'miss'}>
                  {r.line} <span className="muted">({r.correct}/{r.total}{r.outOfBook ? `, out at ${r.outOfBook}` : ''})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
