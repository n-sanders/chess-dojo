import { describe, expect, it } from 'vitest';
import phase1 from '../../opening-identification/phase-1.json';
import { parseLine, type PhaseGroup } from '../openings/openingTree';
import { familyIntros, firstMoveIntros, lineLessons } from './openingLessons';

const groups = phase1 as PhaseGroup[];
const branches = groups.flatMap((g) => g.branches);

describe('opening lessons', () => {
  it.each(groups.map((g) => g.whiteFirst))('has a first-move intro for %s', (name) => {
    expect(firstMoveIntros[name]).toBeTruthy();
  });

  it.each(branches.map((b) => [b.nextName, b] as const))('has a full lesson for %s', (_, branch) => {
    const lesson = lineLessons[branch.nextName];
    expect(lesson, `missing lesson for ${branch.nextName}`).toBeDefined();
    expect(lesson.history).toBeTruthy();
    expect(lesson.ideas.length).toBeGreaterThan(0);
    expect(lesson.identify).toBeTruthy();
    expect(lesson.steps).toHaveLength(parseLine(branch.mainLine).length);
    for (const step of lesson.steps) expect(step).toBeTruthy();
  });

  it('has an intro for every family that is not covered by its own line lesson', () => {
    const families = new Set(branches.map((b) => b.name));
    for (const family of families) {
      const members = branches.filter((b) => b.name === family);
      const coveredByLine = members.length === 1 && members[0].nextName === family;
      if (!coveredByLine) expect(familyIntros[family], `missing intro for ${family}`).toBeTruthy();
    }
  });
});
