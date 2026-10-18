import phase1 from '../../opening-identification/phase-1.json';
import { buildTree, type OpeningTree, type PhaseGroup } from './openingTree';

export type Phase = { id: string; label: string; tree: OpeningTree };

export const PHASES: Phase[] = [
  { id: 'phase-1', label: 'Phase 1 — core 1.e4 / 1.d4 lines', tree: buildTree(phase1 as PhaseGroup[]) },
];
