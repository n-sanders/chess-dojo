import { useEffect, useState, type ReactNode } from 'react';
import { Chessboard } from 'react-chessboard';

type Props = {
  fen: string;
  orientation: 'white' | 'black';
  /** Side the user may move, or null to lock the board. */
  movable: 'w' | 'b' | null;
  lastMove?: { from: string; to: string } | null;
  onMove: (from: string, to: string) => boolean;
  children?: ReactNode;
};

const highlight = { background: 'rgba(255, 220, 80, 0.4)' };
const selectedStyle = { background: 'rgba(127, 166, 80, 0.6)' };

export default function Board({ fen, orientation, movable, lastMove, onMove, children }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setSelected(null), [fen, movable]);

  const squareStyles: Record<string, React.CSSProperties> = lastMove
    ? { [lastMove.from]: highlight, [lastMove.to]: highlight }
    : {};
  if (selected) squareStyles[selected] = selectedStyle;

  const onSquareClick = ({ piece, square }: { piece: { pieceType: string } | null; square: string }) => {
    if (!movable) return;
    const own = piece?.pieceType[0] === movable;
    if (selected && selected !== square) {
      if (onMove(selected, square)) return setSelected(null);
      return setSelected(own ? square : null);
    }
    setSelected(own && selected !== square ? square : null);
  };

  return (
    <div className="board-wrap">
      <Chessboard
        options={{
          id: 'dojo-board',
          position: fen,
          boardOrientation: orientation,
          allowDragging: movable !== null,
          canDragPiece: ({ piece }) => movable !== null && piece.pieceType[0] === movable,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare ? onMove(sourceSquare, targetSquare) : false,
          onSquareClick,
          squareStyles,
          animationDurationInMs: 200,
          darkSquareStyle: { backgroundColor: '#b58863' },
          lightSquareStyle: { backgroundColor: '#f0d9b5' },
        }}
      />
      {children}
    </div>
  );
}
