import { describe, expect, it } from 'vitest';
import phase1 from '../../opening-identification/phase-1.json';
import { buildTree, parseLine, type BookNode, type PhaseGroup } from './openingTree';

const tree = buildTree(phase1 as PhaseGroup[]);

function walk(...sans: string[]): BookNode {
  let node = tree.root;
  for (const san of sans) {
    const next = node.children.find((c) => c.san === san);
    if (!next) throw new Error(`no node for ${san} after ${node.san}`);
    node = next;
  }
  return node;
}

describe('parseLine', () => {
  it('strips move numbers and normalises SAN', () => {
    expect(parseLine('1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4')).toEqual([
      'e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4',
    ]);
  });

  it('rejects illegal moves', () => {
    expect(() => parseLine('1.e4 e5 2.Ke3 Ke6 3.Kf9')).toThrow(/Illegal/);
  });
});

describe('buildTree with phase-1', () => {
  it('has the two White first moves', () => {
    expect(tree.root.children.map((c) => [c.san, c.whiteName])).toEqual([
      ['e4', "King's Pawn"],
      ['d4', "Queen's Pawn"],
    ]);
  });

  it('merges shared prefixes', () => {
    expect(walk('e4').children.map((c) => c.san)).toEqual(['e5', 'c5', 'e6', 'c6', 'd5', 'd6']);
    expect(walk('e4', 'e5', 'Nf3', 'Nc6').children.map((c) => c.san)).toEqual(['Bc4', 'Bb5', 'd4']);
    expect(walk('e4', 'c5', 'Nf3').children.map((c) => c.san)).toEqual(['d6', 'Nc6']);
  });

  it('tags defense names on Black replies', () => {
    expect(walk('e4', 'c5').defenseName).toBe('Sicilian Defense');
    expect(walk('d4', 'Nf6').defenseName).toBe('Indian Defense');
  });

  it('marks endpoints with nextName', () => {
    expect(walk('e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4').end?.nextName).toBe('Open Sicilian');
    expect(walk('e4', 'e5', 'Nf3', 'Nc6', 'Bb5').end?.nextName).toBe('Ruy Lopez');
    expect(walk('d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7').end?.nextName).toBe("King's Indian");
    expect(walk('e4', 'c5', 'Nf3').end).toBeUndefined();
  });

  it('collects name pools', () => {
    expect(tree.defenseNames).toContain('Pirc Defense');
    expect(tree.variationNames).toContain('London System');
  });

  it('validates the moves count', () => {
    const bad: PhaseGroup[] = [
      {
        whiteFirst: "King's Pawn",
        whiteMove: 'e4',
        branches: [{ blackReply: '1...e5', name: 'x', mainLine: '1.e4 e5 2.Nf3', nextName: 'y', moves: 3 }],
      },
    ];
    expect(() => buildTree(bad)).toThrow(/expected 3/);
  });
});
