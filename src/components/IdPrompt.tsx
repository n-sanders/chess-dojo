import { useState } from 'react';
import type { Prompt } from '../openings/drillMachine';

type Props = {
  prompt: Prompt;
  context: string;
  onAnswer: (picked: string) => void;
};

const TITLES: Record<Prompt['kind'], string> = {
  white: "Name White's opening",
  defense: 'Name your defense',
  variation: 'Name this line',
};

export default function IdPrompt({ prompt, context, onAnswer }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === prompt.answer;

  const pick = (choice: string) => {
    if (picked) return;
    setPicked(choice);
    if (choice === prompt.answer) setTimeout(() => onAnswer(choice), 700);
  };

  return (
    <div className="panel prompt-card" role="region" aria-label={TITLES[prompt.kind]}>
      <h3>{TITLES[prompt.kind]}</h3>
      <div className="muted">{context}</div>
      <div className="choices">
        {prompt.choices.map((choice) => {
          let cls = '';
          if (picked && choice === prompt.answer) cls = 'correct';
          else if (picked === choice) cls = 'wrong';
          return (
            <button key={choice} className={cls} onClick={() => pick(choice)} disabled={!!picked && !cls}>
              {choice}
            </button>
          );
        })}
      </div>
      {picked && !correct && (
        <div className="row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <span>
            It's <strong>{prompt.answer}</strong>.
          </span>
          <button className="primary" onClick={() => onAnswer(picked)} autoFocus>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
