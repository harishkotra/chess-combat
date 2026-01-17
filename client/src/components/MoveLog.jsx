import { useEffect, useRef } from "react";

export default function MoveLog({ logs }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="mono-panel p-6 h-[250px] flex flex-col mt-6">
            <h3 className="text-[10px] font-bold mb-3 uppercase text-zinc-500 tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                System Log
            </h3>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 font-mono text-[10px]">
                {logs.length === 0 ? (
                    <div className="text-zinc-700 italic px-2">Ready...</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="border-l border-zinc-800 pl-3 py-0.5 hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-600">{log.timestamp}</span>
                                <span className={`uppercase font-bold ${log.type === 'move' ? 'text-zinc-200' :
                                        log.type === 'error' ? 'text-red-400' :
                                            'text-zinc-500'
                                    }`}>
                                    {log.type}
                                </span>
                                <span className="text-zinc-400">
                                    {log.message}
                                </span>
                            </div>
                            {log.details && log.details.raw && (
                                <div className="mt-0.5 ml-14 text-zinc-600 truncate max-w-lg">
                                    RAW: "{log.details.raw}"
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
