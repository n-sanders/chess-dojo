import { describeStrength, ELO_STEP, MAX_ELO, MIN_ELO } from '../engine/strength';

type Props = {
  elo: number;
  onChange: (elo: number) => void;
  uciEloMin?: number;
};

export default function StrengthSlider({ elo, onChange, uciEloMin }: Props) {
  return (
    <div className="slider panel">
      <span className="muted">Stockfish strength (adjustable any time)</span>
      <span className="elo">~Elo {elo}</span>
      <input
        type="range"
        min={MIN_ELO}
        max={MAX_ELO}
        step={ELO_STEP}
        value={elo}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Stockfish Elo"
      />
      <span className="muted">{describeStrength(elo, uciEloMin)}</span>
    </div>
  );
}
