import { DEFAULT_UCI_ELO_MIN, strengthFor } from './strength';

type Pending = { resolve: (move: string | null) => void; cancelled: boolean };

/** Thin UCI wrapper around the Stockfish WASM worker served from public/engine. */
export class StockfishEngine {
  private worker: Worker;
  private ready: Promise<void>;
  private pending: Pending | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private readyWaiters: (() => void)[] = [];
  private generation = 0;
  uciEloMin = DEFAULT_UCI_ELO_MIN;

  constructor() {
    this.worker = new Worker(`${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`);
    this.worker.onmessage = (e: MessageEvent) => this.onLine(String(e.data));
    this.ready = new Promise<void>((resolve) => {
      const onUciOk = (e: MessageEvent) => {
        if (String(e.data).startsWith('uciok')) {
          this.worker.removeEventListener('message', onUciOk);
          resolve();
        }
      };
      this.worker.addEventListener('message', onUciOk);
    });
    this.send('uci');
  }

  private send(cmd: string) {
    this.worker.postMessage(cmd);
  }

  private onLine(line: string) {
    if (line.startsWith('option name UCI_Elo')) {
      const min = /\bmin (\d+)/.exec(line);
      if (min) this.uciEloMin = Number(min[1]);
    } else if (line.startsWith('readyok')) {
      this.readyWaiters.shift()?.();
    } else if (line.startsWith('bestmove')) {
      const p = this.pending;
      this.pending = null;
      if (!p) return;
      const move = line.split(/\s+/)[1];
      p.resolve(p.cancelled || !move || move === '(none)' ? null : move);
    }
  }

  private isReady(): Promise<void> {
    return new Promise((resolve) => {
      this.readyWaiters.push(resolve);
      this.send('isready');
    });
  }

  async newGame() {
    this.cancel();
    await this.ready;
    this.send('ucinewgame');
    await this.isReady();
  }

  /** Abandons in-flight and queued searches; their promises resolve to null. */
  cancel() {
    this.generation++;
    if (this.pending) {
      this.pending.cancelled = true;
      this.send('stop');
    }
  }

  /** Returns the engine's move in UCI notation (e.g. "e2e4", "e7e8q"), or null if cancelled. */
  bestMove(fen: string, elo: number): Promise<string | null> {
    const generation = this.generation;
    const run = async () => {
      await this.ready;
      if (generation !== this.generation) return null;
      const s = strengthFor(elo, this.uciEloMin);
      this.send(`setoption name UCI_LimitStrength value ${s.limitStrength}`);
      if (s.limitStrength) {
        this.send(`setoption name UCI_Elo value ${s.uciElo}`);
        this.send('setoption name Skill Level value 20');
      } else {
        this.send(`setoption name Skill Level value ${s.skillLevel}`);
      }
      await this.isReady();
      if (generation !== this.generation) return null;
      this.send(`position fen ${fen}`);
      return new Promise<string | null>((resolve) => {
        this.pending = { resolve, cancelled: false };
        const limits = [`movetime ${s.movetimeMs}`];
        if (s.depth) limits.push(`depth ${s.depth}`);
        this.send(`go ${limits.join(' ')}`);
      });
    };
    const result = this.queue.then(run, run);
    this.queue = result;
    return result;
  }

  dispose() {
    this.worker.terminate();
  }
}
