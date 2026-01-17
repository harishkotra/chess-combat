import { Chessboard } from "react-chessboard";

export default function BattleBoard({ fen, lastMove, turn }) {
    return (
        <div className="relative">
            <div className="mono-panel p-2 relative">
                {/* Top Player (Black) */}
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-t-lg border-b border-zinc-800 mb-0.5">
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white bg-black border border-zinc-700`}>
                            B
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${turn === 'Black' ? 'text-white' : 'text-zinc-500'}`}>Black Player</div>
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
                    <Chessboard
                        id="BasicBoard"
                        key={fen}
                        position={fen}
                        boardWidth={580}
                        customDarkSquareStyle={{ backgroundColor: '#52525b' }} // Zinc 600
                        customLightSquareStyle={{ backgroundColor: '#d4d4d8' }} // Zinc 300
                        arePiecesDraggable={false}
                        animationDuration={0}
                    />
                </div>

                {/* Bottom Player (White) */}
                <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-b-lg border-t border-zinc-800 mt-0.5">
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-black bg-white border border-zinc-300`}>
                            W
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${turn === 'White' ? 'text-white' : 'text-zinc-500'}`}>White Player</div>
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
                <div className="text-[9px] text-zinc-700 font-mono mt-1 text-center select-all truncate px-4 opacity-50 hover:opacity-100 transition-opacity">
                    FEN: {fen}
                </div>

                {lastMove && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none group">
                        <div className="bg-zinc-900 text-white px-4 py-2 rounded font-mono text-xl font-bold border border-zinc-700 shadow-xl">
                            {lastMove.san}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
