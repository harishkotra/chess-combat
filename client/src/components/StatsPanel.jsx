export default function StatsPanel({ stats }) {
    const { whiteWins, blackWins, draws, games } = stats;

    return (
        <div className="mono-panel p-6 flex flex-col h-[400px]">
            <h2 className="text-sm font-bold mb-6 text-zinc-100 uppercase tracking-widest flex items-center gap-3 border-b border-zinc-800 pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Metrics
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="border border-zinc-800 p-3 rounded bg-zinc-950 flex flex-col items-center justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">White</div>
                    <div className="text-2xl font-bold text-white font-mono">{whiteWins}</div>
                </div>
                <div className="border border-zinc-800 p-3 rounded bg-zinc-950 flex flex-col items-center justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Draws</div>
                    <div className="text-2xl font-bold text-zinc-400 font-mono">{draws}</div>
                </div>
                <div className="border border-zinc-800 p-3 rounded bg-zinc-950 flex flex-col items-center justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Black</div>
                    <div className="text-2xl font-bold text-white font-mono">{blackWins}</div>
                </div>
            </div>

            <h3 className="text-[10px] font-bold mb-3 uppercase text-zinc-500 tracking-wider">
                Recent Matches
            </h3>

            <div className="flex-1 overflow-y-auto w-full pr-1 custom-scrollbar">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-zinc-500 uppercase font-bold bg-zinc-900 sticky top-0">
                        <tr>
                            <th className="px-2 py-2 border-b border-zinc-800">White</th>
                            <th className="px-2 py-2 border-b border-zinc-800">Black</th>
                            <th className="px-2 py-2 border-b border-zinc-800 text-right">Res</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 font-mono">
                        {games.length === 0 ? (
                            <tr><td colSpan="3" className="text-center py-8 text-zinc-600 italic">No Data</td></tr>
                        ) : (
                            games.slice().reverse().map((g) => (
                                <tr key={g.id} className="hover:bg-zinc-800 transition-colors">
                                    <td className="px-2 py-2 text-zinc-300 truncate max-w-[80px]">
                                        {g.white}
                                    </td>
                                    <td className="px-2 py-2 text-zinc-300 truncate max-w-[80px]">
                                        {g.black}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${g.result.includes("White") ? "bg-zinc-100 text-black border-zinc-200" : g.result.includes("Black") ? "bg-black text-white border-zinc-700" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                                            {g.result === 'Draw' ? 'DRAW' : g.result.includes("White") ? 'W' : 'B'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
