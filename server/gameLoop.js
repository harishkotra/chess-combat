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
            logs: this.logs
        };
    }

    broadcast() {
        this.io.emit('gameState', this.getState());
    }

    async start(config) {
        if (this.active) return;
        this.config = config;
        this.active = true;
        this.logs = [];
        this.addLog('info', 'Game Started', config);

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
                this.start(this.config);
            }, 5000);
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

        const maxAttempts = 3;
        let movePlayed = false;

        for (let i = 0; i < maxAttempts; i++) {
            if (!this.active) break;

            const { move: moveSan, raw } = await this.ollama.generateMove(
                model,
                this.chess.fen(),
                this.chess.pgn(),
                colorName,
                validMovesStr // Pass valid moves to Ollama Client
            );

            if (moveSan) {
                try {
                    const result = this.chess.move(moveSan);
                    if (result) {
                        movePlayed = true;
                        const newFen = this.chess.fen();
                        this.addLog('move', `${colorName} plays ${moveSan}`, { raw, model, fen: newFen });
                        this.addLog('info', `FEN DEBUG: ${newFen}`); // Explicit debug log
                        console.log(`${colorName} played: ${moveSan}`);
                        console.log(`FEN AFTER: ${newFen}`);
                        break;
                    }
                } catch (e) {
                    this.addLog('error', `Invalid Move: ${moveSan}`, { raw, attempt: i + 1 });
                    console.warn(`Invalid move from ${model}: "${moveSan}"`);
                }
            } else {
                this.addLog('error', `Failed to generate move`, { raw, attempt: i + 1 });
            }
        }

        if (!movePlayed && this.active) {
            console.error(`${colorName} failed. Random move.`);
            const randMove = getRandomMove();
            this.chess.move(randMove);
            this.addLog('info', `${colorName} fallback to Random: ${randMove}`);
        }

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
            result = 'Draw';
            this.gameStats.draws++;
        } else {
            result = 'Game Over';
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
