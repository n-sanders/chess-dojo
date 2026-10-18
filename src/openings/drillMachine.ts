import type { BookNode, OpeningTree } from './openingTree';

export type Rng = () => number;

export type PromptKind = 'white' | 'defense' | 'variation';

export type Prompt = {
  kind: PromptKind;
  answer: string;
  choices: string[];
};

export type PromptResult = {
  kind: PromptKind;
  answer: string;
  picked: string;
  correct: boolean;
};

export type Distractors = Record<PromptKind, string[]>;

export type DrillOptions = {
  askVariation: boolean;
  distractors: Distractors;
};

export type DrillState = {
  /** SAN history of the game, White first. */
  moves: string[];
  /** Path from the root's first child to the current book node. */
  path: BookNode[];
  phase: 'book' | 'free' | 'outOfBook';
  prompts: Prompt[];
  results: PromptResult[];
  endHandled: boolean;
  /** Set when phase is 'outOfBook', e.g. "2...d6". */
  outOfBookMove?: string;
};

export const CHOICE_COUNT = 4;

/** Deterministic PRNG for tests and reproducible drills. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normalizeSan = (san: string) => san.replace(/[+#!?]+$/, '');

function currentNode(tree: OpeningTree, state: DrillState): BookNode {
  return state.path[state.path.length - 1] ?? tree.root;
}

/** Names reachable below a node for a given tag, used to make distractors close relatives. */
function namesBelow(node: BookNode, pick: (n: BookNode) => string | undefined): string[] {
  const out = new Set<string>();
  const visit = (n: BookNode) => {
    const name = pick(n);
    if (name) out.add(name);
    n.children.forEach(visit);
  };
  visit(node);
  return [...out];
}

function buildChoices(answer: string, tiers: string[][], rng: Rng): string[] {
  const picked = new Set<string>([answer]);
  for (const tier of tiers) {
    for (const name of shuffle(tier, rng)) {
      if (picked.size >= CHOICE_COUNT) break;
      picked.add(name);
    }
  }
  return shuffle([...picked], rng);
}

function makePrompt(
  kind: PromptKind,
  answer: string,
  tree: OpeningTree,
  state: DrillState,
  opts: DrillOptions,
  rng: Rng,
): Prompt {
  let tiers: string[][];
  if (kind === 'white') {
    tiers = [tree.whiteNames, opts.distractors.white];
  } else if (kind === 'defense') {
    const whiteNode = state.path[0];
    tiers = [
      whiteNode ? namesBelow(whiteNode, (n) => n.defenseName) : [],
      tree.defenseNames,
      opts.distractors.defense,
    ];
  } else {
    const defenseNode = state.path[1];
    tiers = [
      defenseNode ? namesBelow(defenseNode, (n) => n.end?.nextName) : [],
      tree.variationNames,
      opts.distractors.variation,
    ];
  }
  return { kind, answer, choices: buildChoices(answer, tiers, rng) };
}

/** Advances the book phase until the user needs to act (answer a prompt or play Black). */
function settle(tree: OpeningTree, state: DrillState, opts: DrillOptions, rng: Rng): DrillState {
  let s = state;
  for (;;) {
    if (s.prompts.length > 0 || s.phase !== 'book') return s;

    const node = currentNode(tree, s);
    if (node.end) {
      const { name, nextName } = node.end;
      if (!s.endHandled && opts.askVariation && nextName !== name) {
        return {
          ...s,
          endHandled: true,
          prompts: [makePrompt('variation', nextName, tree, s, opts, rng)],
        };
      }
      return { ...s, endHandled: true, phase: 'free' };
    }

    const whiteToMove = s.moves.length % 2 === 0;
    if (!whiteToMove) return s;
    if (node.children.length === 0) return { ...s, phase: 'free' };

    const child = node.children[Math.floor(rng() * node.children.length)];
    s = { ...s, moves: [...s.moves, child.san], path: [...s.path, child] };
    if (child.whiteName) {
      s = { ...s, prompts: [makePrompt('white', child.whiteName, tree, s, opts, rng)] };
    }
  }
}

export function startDrill(tree: OpeningTree, opts: DrillOptions, rng: Rng): DrillState {
  const initial: DrillState = {
    moves: [],
    path: [],
    phase: 'book',
    prompts: [],
    results: [],
    endHandled: false,
  };
  return settle(tree, initial, opts, rng);
}

/** Black's move from the user. In free play it is only recorded; the UI drives Stockfish. */
export function playBlack(
  tree: OpeningTree,
  state: DrillState,
  san: string,
  opts: DrillOptions,
  rng: Rng,
): DrillState {
  const moves = [...state.moves, san];
  if (state.phase !== 'book') return { ...state, moves };
  if (state.prompts.length > 0 || state.moves.length % 2 === 0) {
    throw new Error('Not Black to move in the book phase');
  }

  const node = currentNode(tree, state);
  const child = node.children.find((c) => normalizeSan(c.san) === normalizeSan(san));
  if (!child) {
    const moveNo = Math.ceil(moves.length / 2);
    return { ...state, moves, phase: 'outOfBook', outOfBookMove: `${moveNo}...${san}` };
  }

  let s: DrillState = { ...state, moves, path: [...state.path, child] };
  if (child.defenseName) {
    s = { ...s, prompts: [makePrompt('defense', child.defenseName, tree, s, opts, rng)] };
  }
  return settle(tree, s, opts, rng);
}

export function answerPrompt(
  tree: OpeningTree,
  state: DrillState,
  picked: string,
  opts: DrillOptions,
  rng: Rng,
): DrillState {
  const [prompt, ...rest] = state.prompts;
  if (!prompt) return state;
  const result: PromptResult = {
    kind: prompt.kind,
    answer: prompt.answer,
    picked,
    correct: picked === prompt.answer,
  };
  return settle(tree, { ...state, prompts: rest, results: [...state.results, result] }, opts, rng);
}

/** After going out of book, the user may keep playing the same game against Stockfish. */
export function continueFreePlay(state: DrillState): DrillState {
  return { ...state, phase: 'free' };
}

/** Engine (White) move during free play. */
export function recordEngineMove(state: DrillState, san: string): DrillState {
  return { ...state, moves: [...state.moves, san] };
}
