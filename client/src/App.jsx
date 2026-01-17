import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import BattleBoard from './components/BattleBoard';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import MoveLog from './components/MoveLog';

const socket = io('http://localhost:3000');

function App() {
  const [gameState, setGameState] = useState(null);
  const [models, setModels] = useState([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('getModels');
    });

    socket.on('gameState', (state) => {
      setGameState(state);
      setActive(state.active);
    });

    socket.on('modelsList', (list) => {
      setModels(list);
    });

    return () => {
      socket.off('gameState');
      socket.off('modelsList');
    };
  }, []);

  const handleStart = (whiteModel, blackModel) => {
    socket.emit('startGame', { whiteModel, blackModel });
  };

  const handleStop = () => {
    socket.emit('stopGame');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-20 selection:bg-zinc-700 selection:text-white">

      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white text-black p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Ollama Chess Arena
              </h1>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Local LLM Eval // Daily Build</p>
            </div>
          </div>

          <div className={`mt-4 md:mt-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-2 ${active ? "bg-zinc-100 text-black border-zinc-100" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>
            <span className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-zinc-600"}`}></span>
            {active ? "Simulation Active" : "Ready"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Board (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {gameState && (
            <>
              <div className="flex justify-center">
                <BattleBoard
                  fen={gameState.fen}
                  lastMove={gameState.lastMove}
                  turn={gameState.turn}
                />
              </div>
              <MoveLog logs={gameState.logs || []} />
            </>
          )}
        </div>

        {/* Right: Controls & Stats (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ControlPanel
            models={models}
            active={active}
            onStart={handleStart}
            onStop={handleStop}
          />
          {gameState && <StatsPanel stats={gameState.stats} />}
        </div>
      </main>
    </div>
  );
}

export default App;
