import { useState } from "react";

export default function ControlPanel({ models, active, onStart, onStop }) {
    const [white, setWhite] = useState("");
    const [black, setBlack] = useState("");

    const handleStart = () => {
        if (white && black) onStart(white, black);
    };

    return (
        <div className="mono-panel p-6">
            <h2 className="text-sm font-bold mb-6 text-zinc-100 uppercase tracking-widest flex items-center gap-3 border-b border-zinc-800 pb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Setup
            </h2>

            <div className="space-y-6">
                {/* White Model config */}
                <div>
                    <label className="flex justify-between items-center text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                        <span>White Player</span>
                        <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded border border-white">P1</span>
                    </label>
                    <div className="relative group">
                        <select
                            className="w-full mono-input p-3 appearance-none hover:border-zinc-600 transition-colors cursor-pointer text-sm"
                            value={white}
                            onChange={(e) => setWhite(e.target.value)}
                            disabled={active}
                        >
                            <option value="">Select Local Model...</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Black Model config */}
                <div>
                    <label className="flex justify-between items-center text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                        <span>Black Player</span>
                        <span className="text-[10px] bg-black border border-zinc-700 text-white px-1.5 py-0.5 rounded">P2</span>
                    </label>
                    <div className="relative group">
                        <select
                            className="w-full mono-input p-3 appearance-none hover:border-zinc-600 transition-colors cursor-pointer text-sm"
                            value={black}
                            onChange={(e) => setBlack(e.target.value)}
                            disabled={active}
                        >
                            <option value="">Select Local Model...</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                    {!active ? (
                        <button
                            className="w-full btn-mono py-3 rounded-md text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleStart}
                            disabled={!white || !black}
                        >
                            Initialize Battle
                        </button>
                    ) : (
                        <button
                            className="w-full btn-mono-danger py-3 rounded-md text-xs font-bold uppercase tracking-widest"
                            onClick={onStop}
                        >
                            Abort Simulation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
