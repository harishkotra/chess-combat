
import { useRef } from "react";

const PIECES = {
    'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
};

// Helper to parse FEN into a 2D array
const parseFen = (fen) => {
    if (!fen) return Array(8).fill(Array(8).fill(null));
    const [board] = fen.split(' ');
    const rows = board.split('/');
    return rows.map(row => {
        let squares = [];
        for (let char of row) {
            if (isNaN(char)) {
                squares.push(char);
            } else {
                for (let i = 0; i < parseInt(char); i++) {
                    squares.push(null);
                }
            }
        }
        return squares;
    });
};

export default function BattleBoard({ fen, lastMove, turn, whiteModel, blackModel }) {
    const boardState = parseFen(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    return (
        <div className="relative">
            <div className="mono-panel p-2 relative">
                {/* Top Player (Black) */}
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-t-lg border-b border-zinc-800 mb-0.5">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white bg-black border border-zinc-700">
                            B
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${turn === 'Black' ? 'text-white' : 'text-zinc-500'}`}>
                                {blackModel ? `${blackModel} (Black)` : "Black Player"}
                            </div>
                        </div>
                    </div>
                    {turn === 'Black' && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Thinking</span>
                        </div>
                    )}
                </div>

                <div className="p-0.5 bg-zinc-800">
                    <div className="grid grid-cols-8 grid-rows-8 w-[580px] h-[580px] border border-zinc-700">
                        {boardState.map((row, rowIndex) => (
                            row.map((piece, colIndex) => {
                                const isDark = (rowIndex + colIndex) % 2 === 1;
                                const squareColor = isDark ? 'bg-zinc-600' : 'bg-zinc-300';

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`${squareColor} flex items-center justify-center relative`}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        {piece && PIECES[piece] && (
                                            <img
                                                src={PIECES[piece]}
                                                alt={piece}
                                                className="w-[90%] h-[90%] object-contain select-none pointer-events-none"
                                            />
                                        )}
                                        {/* Rank & File labels for first row/col */}
                                        {colIndex === 0 && (
                                            <span className={`absolute top-0.5 left-0.5 text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                {8 - rowIndex}
                                            </span>
                                        )}
                                        {rowIndex === 7 && (
                                            <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                {String.fromCharCode(97 + colIndex)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Bottom Player (White) */}
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-b-lg border-t border-zinc-800 mt-0.5">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-black bg-white border border-zinc-300">
                            W
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${turn === 'White' ? 'text-white' : 'text-zinc-500'}`}>
                                {whiteModel ? `${whiteModel} (White)` : "White Player"}
                            </div>
                        </div>
                    </div>
                    {turn === 'White' && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Thinking</span>
                        </div>
                    )}
                </div>

                {/* Debug FEN (Functional element, kept small) */}
                {/* <div className="text-[9px] text-zinc-700 font-mono mt-1 text-center select-all truncate px-4 opacity-50 hover:opacity-100 transition-opacity">
                    FEN: {fen}
                </div> */}

                {lastMove && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none group z-10">
                        <div className="bg-zinc-900 text-white px-4 py-2 rounded font-mono text-xl font-bold border border-zinc-700 shadow-xl">
                            {lastMove.san}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
