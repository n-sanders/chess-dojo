import { describe, expect, it } from 'vitest';
import phase1 from '../../opening-identification/phase-1.json';
import distractors from '../data/distractors.json';
import { buildTree, type PhaseGroup } from './openingTree';
import {
  answerPrompt,
  CHOICE_COUNT,
  continueFreePlay,
  mulberry32,
  playBlack,
  startDrill,
  type DrillOptions,
  type DrillState,
  type Rng,
} from './drillMachine';

const tree = buildTree(phase1 as PhaseGroup[]);
const opts: DrillOptions = { askVariation: true, distractors };

/** Finds a seed whose random first White move is the one we want. */
function startWith(first: 'e4' | 'd4', o = opts): { state: DrillState; rng: Rng } {
  for (let seed = 1; seed < 1000; seed++) {
    const rng = mulberry32(seed);
    const state = startDrill(tree, o, rng);
    if (state.moves[0] === first) return { state, rng };
  }
  throw new Error('no seed found');
}

function answerCorrectly(state: DrillState, rng: Rng, o = opts): DrillState {
  return answerPrompt(tree, state, state.prompts[0].answer, o, rng);
}

describe('drill machine', () => {
  it('opens with a White move and a White-name prompt with 4 distinct choices', () => {
    const { state } = startWith('e4');
    expect(state.moves).toEqual(['e4']);
    expect(state.phase).toBe('book');
    const prompt = state.prompts[0];
    expect(prompt.kind).toBe('white');
    expect(prompt.answer).toBe("King's Pawn");
    expect(prompt.choices).toHaveLength(CHOICE_COUNT);
    expect(new Set(prompt.choices).size).toBe(CHOICE_COUNT);
    expect(prompt.choices).toContain("King's Pawn");
    expect(prompt.choices).toContain("Queen's Pawn");
  });

  it('runs the Open Sicilian flow end to end', () => {
    let { state, rng } = startWith('e4');
    state = answerCorrectly(state, rng);
    expect(state.prompts).toHaveLength(0);

    state = playBlack(tree, state, 'c5', opts, rng);
    expect(state.prompts[0]).toMatchObject({ kind: 'defense', answer: 'Sicilian Defense' });
    // White waits for the answer before replying.
    expect(state.moves).toEqual(['e4', 'c5']);
    expect(state.prompts[0].choices).toContain('Sicilian Defense');

    state = answerCorrectly(state, rng);
    expect(state.moves).toEqual(['e4', 'c5', 'Nf3']);

    state = playBlack(tree, state, 'd6', opts, rng);
    expect(state.moves.at(-1)).toBe('d4');
    state = playBlack(tree, state, 'cxd4', opts, rng);
    expect(state.moves.at(-1)).toBe('Nxd4');
    expect(state.prompts[0]).toMatchObject({ kind: 'variation', answer: 'Open Sicilian' });
    expect(state.prompts[0].choices).toContain('Rossolimo');

    state = answerPrompt(tree, state, 'Rossolimo', opts, rng);
    expect(state.phase).toBe('free');
    expect(state.results.map((r) => r.correct)).toEqual([true, true, false]);
  });

  it('goes out of book on an unknown first reply', () => {
    let { state, rng } = startWith('e4');
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'g6', opts, rng);
    expect(state.phase).toBe('outOfBook');
    expect(state.outOfBookMove).toBe('1...g6');
    expect(continueFreePlay(state).phase).toBe('free');
  });

  it('goes out of book mid-line', () => {
    let { state, rng } = startWith('e4');
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'e5', opts, rng);
    state = answerCorrectly(state, rng);
    expect(state.moves).toEqual(['e4', 'e5', 'Nf3']);
    state = playBlack(tree, state, 'd6', opts, rng);
    expect(state.phase).toBe('outOfBook');
    expect(state.outOfBookMove).toBe('2...d6');
  });

  it('picks White book moves only from lines consistent with history', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed < 60; seed++) {
      const rng = mulberry32(seed);
      let state = startDrill(tree, opts, rng);
      if (state.moves[0] !== 'e4') continue;
      state = answerCorrectly(state, rng);
      state = playBlack(tree, state, 'e5', opts, rng);
      state = answerCorrectly(state, rng);
      state = playBlack(tree, state, 'Nc6', opts, rng);
      const third = state.moves.at(-1)!;
      expect(['Bc4', 'Bb5', 'd4']).toContain(third);
      seen.add(third);
      expect(state.prompts[0].kind).toBe('variation');
    }
    expect(seen.size).toBe(3);
  });

  it('prompts the variation when the line ends on a Black move', () => {
    let { state, rng } = startWith('d4');
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'Nf6', opts, rng);
    state = answerCorrectly(state, rng);
    expect(state.moves.at(-1)).toBe('c4');
    state = playBlack(tree, state, 'e6', opts, rng);
    expect(state.moves.at(-1)).toBe('Nc3');
    state = playBlack(tree, state, 'Bb4', opts, rng);
    expect(state.prompts[0]).toMatchObject({ kind: 'variation', answer: 'Nimzo-Indian' });
    state = answerCorrectly(state, rng);
    expect(state.phase).toBe('free');
    expect(state.moves.length).toBe(6);
  });

  it('skips the variation prompt when nextName equals name', () => {
    let { state, rng } = startWith('e4');
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'd6', opts, rng);
    expect(state.prompts[0]).toMatchObject({ kind: 'defense', answer: 'Pirc Defense' });
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'Nf6', opts, rng);
    state = playBlack(tree, state, 'g6', opts, rng);
    expect(state.prompts).toHaveLength(0);
    expect(state.phase).toBe('free');
  });

  it('skips variation prompts when askVariation is off', () => {
    const off = { ...opts, askVariation: false };
    let { state, rng } = startWith('d4', off);
    state = answerCorrectly(state, rng, off);
    state = playBlack(tree, state, 'Nf6', off, rng);
    state = answerCorrectly(state, rng, off);
    state = playBlack(tree, state, 'g6', off, rng);
    state = playBlack(tree, state, 'Bg7', off, rng);
    expect(state.prompts).toHaveLength(0);
    expect(state.phase).toBe('free');
  });

  it('accepts SAN with check suffixes', () => {
    let { state, rng } = startWith('e4');
    state = answerCorrectly(state, rng);
    state = playBlack(tree, state, 'c5+', opts, rng);
    expect(state.phase).toBe('book');
  });
});
