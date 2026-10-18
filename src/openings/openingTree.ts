import { Chess } from 'chess.js';

export type PhaseBranch = {
  blackReply: string;
  name: string;
  mainLine: string;
  nextName: string;
  moves: number;
};

export type PhaseGroup = {
  whiteFirst: string;
  whiteMove: string;
  branches: PhaseBranch[];
};

export type BookNode = {
  /** SAN exactly as chess.js produces it; empty for the root. */
  san: string;
  ply: number;
  children: BookNode[];
  /** Set on ply-1 nodes (e.g. "King's Pawn"). */
  whiteName?: string;
  /** Set on ply-2 nodes (e.g. "Sicilian Defense"). */
  defenseName?: string;
  /** Set where a mainLine finishes. */
  end?: { name: string; nextName: string };
};

export type OpeningTree = {
  root: BookNode;
  whiteNames: string[];
  defenseNames: string[];
  variationNames: string[];
};

const stripMoveNumber = (token: string) => token.replace(/^\d+\.(\.\.)?/, '');

/** "1.e4 c5 2.Nf3" -> ["e4", "c5", "Nf3"] validated and normalised through chess.js. */
export function parseLine(mainLine: string): string[] {
  const game = new Chess();
  const tokens = mainLine
    .trim()
    .split(/\s+/)
    .map(stripMoveNumber)
    .filter((t) => t.length > 0);
  return tokens.map((token) => {
    try {
      return game.move(token).san;
    } catch {
      throw new Error(`Illegal move "${token}" in line "${mainLine}"`);
    }
  });
}

function childFor(node: BookNode, san: string): BookNode {
  let child = node.children.find((c) => c.san === san);
  if (!child) {
    child = { san, ply: node.ply + 1, children: [] };
    node.children.push(child);
  }
  return child;
}

export function buildTree(groups: PhaseGroup[]): OpeningTree {
  const root: BookNode = { san: '', ply: 0, children: [] };
  const whiteNames = new Set<string>();
  const defenseNames = new Set<string>();
  const variationNames = new Set<string>();

  for (const group of groups) {
    whiteNames.add(group.whiteFirst);
    for (const branch of group.branches) {
      const sans = parseLine(branch.mainLine);
      const reply = stripMoveNumber(branch.blackReply);
      if (sans[0] !== group.whiteMove) {
        throw new Error(`"${branch.mainLine}" does not start with ${group.whiteMove}`);
      }
      if (sans[1] !== reply) {
        throw new Error(`"${branch.mainLine}" does not match blackReply ${branch.blackReply}`);
      }
      if (Math.ceil(sans.length / 2) !== branch.moves) {
        throw new Error(`"${branch.mainLine}" has ${Math.ceil(sans.length / 2)} moves, expected ${branch.moves}`);
      }

      let node = root;
      for (const san of sans) {
        node = childFor(node, san);
        if (node.ply === 1) node.whiteName = group.whiteFirst;
        if (node.ply === 2) node.defenseName = branch.name;
      }
      node.end = { name: branch.name, nextName: branch.nextName };
      defenseNames.add(branch.name);
      variationNames.add(branch.nextName);
    }
  }

  return {
    root,
    whiteNames: [...whiteNames],
    defenseNames: [...defenseNames],
    variationNames: [...variationNames],
  };
}
