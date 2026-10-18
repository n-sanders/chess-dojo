import { Chess } from 'chess.js';
import { defaultPieces } from 'react-chessboard';

type Props = {
  fen: string;
  lastMove?: { from: string; to: string } | null;
  /** Rendered width in CSS pixels; the image scales to its container when omitted. */
  size?: number;
  title?: string;
};

const SQ = 45;
const LIGHT = '#f0d9b5';
const DARK = '#b58863';
const FILES = 'abcdefgh';

/** Board coordinates (White at the bottom) of a square's top-left corner. */
function corner(square: string): { x: number; y: number } {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  return { x: file * SQ, y: (8 - rank) * SQ };
}

function center(square: string): { x: number; y: number } {
  const { x, y } = corner(square);
  return { x: x + SQ / 2, y: y + SQ / 2 };
}

function MoveArrow({ from, to }: { from: string; to: string }) {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const head = 14;
  const tipX = b.x - ux * 6;
  const tipY = b.y - uy * 6;
  const baseX = tipX - ux * head;
  const baseY = tipY - uy * head;
  const px = -uy * (head * 0.6);
  const py = ux * (head * 0.6);
  return (
    <g opacity={0.8} pointerEvents="none">
      <line
        x1={a.x + ux * 8}
        y1={a.y + uy * 8}
        x2={baseX}
        y2={baseY}
        stroke="#2f7d32"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <polygon points={`${tipX},${tipY} ${baseX + px},${baseY + py} ${baseX - px},${baseY - py}`} fill="#2f7d32" />
    </g>
  );
}

export default function BoardDiagram({ fen, lastMove, size, title }: Props) {
  const board = new Chess(fen).board();
  const squares = [];
  const pieces = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = `${FILES[col]}${8 - row}`;
      const light = (row + col) % 2 === 0;
      const highlighted = lastMove && (square === lastMove.from || square === lastMove.to);
      squares.push(
        <rect key={square} x={col * SQ} y={row * SQ} width={SQ} height={SQ} fill={light ? LIGHT : DARK} />,
      );
      if (highlighted) {
        squares.push(
          <rect
            key={`${square}-hl`}
            x={col * SQ}
            y={row * SQ}
            width={SQ}
            height={SQ}
            fill="rgba(255, 220, 80, 0.5)"
          />,
        );
      }
      const piece = board[row][col];
      if (piece) {
        const Piece = defaultPieces[`${piece.color}${piece.type.toUpperCase()}`];
        pieces.push(
          <svg key={square} x={col * SQ} y={row * SQ} width={SQ} height={SQ}>
            <Piece />
          </svg>,
        );
      }
    }
  }

  const coords = [];
  for (let i = 0; i < 8; i++) {
    coords.push(
      <text key={`f${i}`} x={i * SQ + SQ - 3} y={8 * SQ - 3} textAnchor="end" fill={i % 2 === 0 ? LIGHT : DARK}>
        {FILES[i]}
      </text>,
      <text key={`r${i}`} x={3} y={i * SQ + 11} fill={i % 2 === 0 ? DARK : LIGHT}>
        {8 - i}
      </text>,
    );
  }

  return (
    <svg
      className="board-diagram"
      viewBox={`0 0 ${8 * SQ} ${8 * SQ}`}
      width={size ?? '100%'}
      role="img"
      aria-label={title ?? 'Chess position'}
    >
      {title && <title>{title}</title>}
      {squares}
      <g fontSize={10} fontWeight={600} fontFamily="system-ui, sans-serif">
        {coords}
      </g>
      {pieces}
      {lastMove && <MoveArrow from={lastMove.from} to={lastMove.to} />}
    </svg>
  );
}
