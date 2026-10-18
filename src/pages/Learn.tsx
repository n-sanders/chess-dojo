import { Chess } from 'chess.js';
import phase1 from '../../opening-identification/phase-1.json';
import BoardDiagram from '../components/BoardDiagram';
import { familyIntros, firstMoveIntros, lineLessons, sources } from '../data/openingLessons';
import { parseLine, type PhaseBranch, type PhaseGroup } from '../openings/openingTree';

type Step = { label: string; fen: string; from: string; to: string; caption: string };
type Family = { name: string; branches: PhaseBranch[] };

const groups = phase1 as PhaseGroup[];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function familiesOf(group: PhaseGroup): Family[] {
  const families: Family[] = [];
  for (const branch of group.branches) {
    const existing = families.find((f) => f.name === branch.name);
    if (existing) existing.branches.push(branch);
    else families.push({ name: branch.name, branches: [branch] });
  }
  return families;
}

function stepsFor(branch: PhaseBranch): Step[] {
  const captions = lineLessons[branch.nextName]?.steps ?? [];
  const game = new Chess();
  return parseLine(branch.mainLine).map((san, i) => {
    const move = game.move(san);
    const number = Math.floor(i / 2) + 1;
    return {
      label: i % 2 === 0 ? `${number}.${san}` : `${number}...${san}`,
      fen: game.fen(),
      from: move.from,
      to: move.to,
      caption: captions[i] ?? '',
    };
  });
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function LineSection({ branch, showFamily }: { branch: PhaseBranch; showFamily: boolean }) {
  const lesson = lineLessons[branch.nextName];
  const steps = stepsFor(branch);
  const final = steps[steps.length - 1];
  return (
    <article className="lesson panel" id={slug(branch.nextName)}>
      <header className="lesson-head">
        <div>
          <h3>{branch.nextName}</h3>
          <div className="moves">{branch.mainLine}</div>
          <div className="muted lesson-names">
            Drill names: {showFamily ? `${branch.name} → ` : ''}
            {branch.nextName}
          </div>
        </div>
        <div className="lesson-final">
          <BoardDiagram fen={final.fen} lastMove={final} title={`${branch.nextName} after ${final.label}`} />
        </div>
      </header>

      {lesson && (
        <>
          <h4>History</h4>
          <Paragraphs text={lesson.history} />
          <h4>Why play it</h4>
          <ul>
            {lesson.ideas.map((idea, i) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
          <div className="callout">
            <strong>How to recognise it:</strong> {lesson.identify}
          </div>
        </>
      )}

      <h4>Step by step</h4>
      <ol className="step-grid">
        {steps.map((step) => (
          <li key={step.label} className="step-card">
            <BoardDiagram fen={step.fen} lastMove={step} title={`Position after ${step.label}`} />
            <div className="step-label">{step.label}</div>
            <p>{step.caption}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function Learn() {
  return (
    <section className="learn">
      <div className="panel learn-intro">
        <h2>Learn the Phase 1 openings</h2>
        <p className="muted">
          Every line the Opening Drill asks you to name, one move at a time. Each section covers where the opening
          comes from, why players choose it, and how to tell it apart from its neighbours.
        </p>
        <nav className="toc" aria-label="Openings">
          {groups.map((group) => (
            <div key={group.whiteFirst}>
              <a href={`#${slug(group.whiteFirst)}`} onClick={jump(slug(group.whiteFirst))}>
                <strong>
                  1.{group.whiteMove} – {group.whiteFirst}
                </strong>
              </a>
              <ul>
                {familiesOf(group).map((family) => (
                  <li key={family.name}>
                    {family.branches.length === 1 && family.branches[0].nextName === family.name ? (
                      <a href={`#${slug(family.name)}`} onClick={jump(slug(family.name))}>
                        {family.name}
                      </a>
                    ) : (
                      <>
                        <a href={`#${slug(`family-${family.name}`)}`} onClick={jump(slug(`family-${family.name}`))}>
                          {family.name}
                        </a>
                        <ul>
                          {family.branches.map((b) => (
                            <li key={b.nextName}>
                              <a href={`#${slug(b.nextName)}`} onClick={jump(slug(b.nextName))}>
                                {b.nextName}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {groups.map((group) => (
        <section key={group.whiteFirst} className="learn-group">
          <h2 id={slug(group.whiteFirst)}>
            1.{group.whiteMove} – {group.whiteFirst}
          </h2>
          <Paragraphs text={firstMoveIntros[group.whiteFirst] ?? ''} />

          {familiesOf(group).map((family) => {
            const single = family.branches.length === 1 && family.branches[0].nextName === family.name;
            if (single) return <LineSection key={family.name} branch={family.branches[0]} showFamily={false} />;
            return (
              <section key={family.name} className="learn-family">
                <h2 className="family-title" id={slug(`family-${family.name}`)}>
                  {family.name}
                </h2>
                <Paragraphs text={familyIntros[family.name] ?? ''} />
                {family.branches.map((b) => (
                  <LineSection key={b.nextName} branch={b} showFamily />
                ))}
              </section>
            );
          })}
        </section>
      ))}

      <div className="panel">
        <h4>Sources</h4>
        <ul className="sources">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The app uses hash routing, so plain `#id` links would change the route instead of scrolling. */
function jump(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}
