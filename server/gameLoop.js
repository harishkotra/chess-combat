const { Chess } = require('chess.js');

class GameLoop {
    constructor(io, ollama) {
        this.io = io;
        this.ollama = ollama;
        this.chess = new Chess();
        this.active = false;
        this.config = { whiteModel: '', blackModel: '' };
        this.timeout = null;
        this.gameStats = {
            whiteWins: 0,
            blackWins: 0,
            draws: 0,
            games: []
        };
        this.logs = [];
    }

    addLog(type, message, details = null) {
        const log = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            type, // 'info', 'move', 'error', 'thought'
            message,
            details
        };
        this.logs.unshift(log);
        if (this.logs.length > 50) this.logs.pop();
        this.broadcast();
    }

    getState() {
        return {
            fen: this.chess.fen(),
            pgn: this.chess.pgn(),
            active: this.active,
            stats: this.gameStats,
            turn: this.chess.turn() === 'w' ? 'White' : 'Black',
            lastMove: this.chess.history({ verbose: true }).pop(),
            logs: this.logs,
            whiteModel: this.config.whiteModel,
            blackModel: this.config.blackModel
        };
    }

    broadcast() {
        this.io.emit('gameState', this.getState());
    }

    async start(config) {
        if (this.active) return;
        this.config = config;
        this.active = true;
        this.setupNewGame();
    }

    setupNewGame() {
        this.logs = []; // Optional: keep logs or clear. User implies continuous play.
        // Let's clear logs but keep the stats.
        this.addLog('info', 'Starting new game...', this.config);

        this.chess = new Chess();
        this.broadcast();
        this.runTurn();
    }

    stop() {
        this.active = false;
        if (this.timeout) clearTimeout(this.timeout);
        this.addLog('info', 'Game Stopped by User');
        this.broadcast();
    }

    async runTurn() {
        if (!this.active) return;

        if (this.chess.isGameOver()) {
            this.handleGameOver();
            this.timeout = setTimeout(() => {
                if (!this.active) return;
                this.addLog('info', 'Auto-restarting in 2s...');
                setTimeout(() => {
                    if (this.active) this.setupNewGame();
                }, 2000);
            }, 1000);
            return;
        }

        const turn = this.chess.turn();
        const model = turn === 'w' ? this.config.whiteModel : this.config.blackModel;
        const colorName = turn === 'w' ? 'White' : 'Black';

        console.log(`--- TURN: ${colorName} ---`);
        console.log(`FEN: ${this.chess.fen()}`);

        const moves = this.chess.moves();
        const validMovesStr = moves.join(', ');

        const getRandomMove = () => {
            return moves[Math.floor(Math.random() * moves.length)];
        };

        let movePlayed = false;
        let attempt = 0;

        // RETRY LOOP: Keep trying until the LLM provides a valid move.
        // We disabled random fallback per user request.
        while (!movePlayed && this.active) {
            attempt++;

            // Add a small delay for retries to avoid hammering the server in a tight loop if it fails fast
            if (attempt > 1) await new Promise(resolve => setTimeout(resolve, 500));

            const { move: moveSan, raw, thought } = await this.ollama.generateMove(
                model,
                this.chess.fen(),
                this.chess.pgn(),
                colorName,
                validMovesStr, // Pass valid moves to Ollama Client
                attempt // Pass attempt count for adaptive prompting
            );

            if (moveSan) {
                try {
                    const result = this.chess.move(moveSan);
                    if (result) {
                        movePlayed = true;
                        const newFen = this.chess.fen();
                        this.addLog('move', `${model} (${colorName}) plays ${moveSan}`, { raw, model, fen: newFen, thought });
                        //this.addLog('info', `FEN DEBUG: ${newFen}`); // Explicit debug log
                        console.log(`${colorName} played: ${moveSan}`);
                        console.log(`FEN AFTER: ${newFen}`);
                        break;
                    }
                } catch (e) {
                    this.addLog('error', `Invalid Move from ${model}: ${moveSan}`, { raw, attempt });
                    console.warn(`Invalid move from ${model} (Attempt ${attempt}): "${moveSan}"`);
                }
            } else {
                this.addLog('error', `Failed to generate move from ${model}`, { raw, attempt });
                console.warn(`Failed to generate move from ${model} (Attempt ${attempt}). Raw: ${raw}`);
            }
        }

        // Fallback logic REMOVED. 
        // If the loop exits without a move, it's because this.active became false (game stopped).

        this.broadcast();

        if (this.active) {
            this.timeout = setTimeout(() => this.runTurn(), 500);
        }
    }

    handleGameOver() {
        let result = '';
        if (this.chess.isCheckmate()) {
            const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
            result = `${winner} wins by checkmate`;
            if (winner === 'White') this.gameStats.whiteWins++;
            else this.gameStats.blackWins++;
        } else if (this.chess.isDraw()) {
            if (this.chess.isStalemate()) result = 'Draw (Stalemate)';
            else if (this.chess.isThreefoldRepetition()) result = 'Draw (Threefold Repetition)';
            else if (this.chess.isInsufficientMaterial()) result = 'Draw (Insufficient Material)';
            else if (this.chess.isDrawByFiftyMoves && this.chess.isDrawByFiftyMoves()) result = 'Draw (50-Move Rule)';
            else result = 'Draw';

            this.gameStats.draws++;
        } else {
            result = "Game Over";
        }

        this.addLog('info', `Game Over: ${result}`);

        this.gameStats.games.unshift({
            id: Date.now(),
            result,
            pgn: this.chess.pgn(),
            white: this.config.whiteModel,
            black: this.config.blackModel,
            date: new Date().toLocaleTimeString()
        });

        if (this.gameStats.games.length > 50) this.gameStats.games.pop();
        this.broadcast();
    }
}

module.exports = { GameLoop };
