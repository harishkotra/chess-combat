const axios = require('axios');

class OllamaClient {
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }

    async listModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`);
            return response.data.models.map(m => m.name);
        } catch (error) {
            console.error('Error fetching models:', error.message);
            return [];
        }
    }

    async generateMove(model, fen, history, color, validMoves, attempt = 1) {
        // Helper to visualize board for the LLM
        const getAsciiBoard = (fen) => {
            const [board] = fen.split(' ');
            let ascii = "  +-----------------+\n";
            const rows = board.split('/');
            rows.forEach((row, i) => {
                let line = `\n${8 - i} |`;
                for (let char of row) {
                    if (isNaN(char)) {
                        line += ` ${char}`;
                    } else {
                        line += " .".repeat(parseInt(char));
                    }
                }
                ascii += line + " |\n";
            });
            ascii += "  +-----------------+\n    a b c d e f g h";
            return ascii;
        };

        // Limit history to last 6 moves to avoid clutter but give context
        const shortHistory = history ? history.split(' ').slice(-12).join(' ') : 'None';

        let prompt = `You are a Grandmaster Chess Engine playing as ${color}.
        
CURRENT BOARD STATE:
${getAsciiBoard(fen)}

FEN: ${fen}
PREVIOUS MOVES: ... ${shortHistory}
VALID LEGAL MOVES (Comma Separated): ${validMoves}

YOUR GOAL: 
Play aggressively and strategically to WIN. Do NOT settle for a draw.

STRATEGY GUIDELINES:
1. AVOID REPEATING MOVES. Constant repetition leads to a draw.
2. DEVELOP pieces to the center.
3. ATTACK opponent weaknesses.
4. If you have moved a piece recently, try to move a DIFFERENT piece to improve your position unless you are under check.

YOUR TASK:
1. Analyze the board and identifying the Best Move from the VALID LEGAL MOVES list.
2. Provide a brief rationale explaining why this move helps you WIN.

RESPONSE FORMAT:
Reasoning first (brief), then the move on the last line.
Example:
The pawn capture opens the file for the rook.
MOVE: exd5

BEGIN THINKING:`;

        // If retrying, nudge the model
        if (attempt > 1) {
            prompt += `\n\nPREVIOUS ATTEMPT FAILED. YOU MUST CHOOSE A MOVE FROM THIS LIST: ${validMoves}. FORMAT EXACTLY AS 'MOVE: <move>'.`;
        }

        console.log(`[DEBUG] Prompt for ${model} (Attempt ${attempt}):\n${prompt}\n----------------`);

        try {
            // Increase diff for retries to break loops
            const temp = attempt > 1 ? 0.4 : 0.1;

            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: temp,
                    num_predict: 500
                }
            }, { timeout: 30000 });

            const raw = response.data.response.trim();

            // Separation of thought and move
            const lines = raw.split('\n');
            let moveLine = lines[lines.length - 1]; // Assume last line has move

            // 1. Regex Match (Strict)
            // Matches "MOVE: e4", "Move: e4", "move: e4"
            const moveMatch = raw.match(/MOVE:\s*([a-zA-Z0-9+#=-]+)/i) ||
                raw.match(/\b([KQNBR]?[a-h]?[1-8]?x?[a-h][1-8](?:=[KQNBR])?[+#]?)\b\s*$/);

            let move = moveMatch ? moveMatch[1] : null;
            let thought = raw.replace(moveMatch ? moveMatch[0] : '', '').trim();

            // 2. Fallback: Check last line if it looks like a move
            if (!move && lines.length > 0) {
                const potentialMove = lines.pop().trim().replace(/[.,;:]/g, '');
                // Basic heuristic for algebraic notation length
                if (potentialMove.length >= 2 && potentialMove.length < 8) {
                    move = potentialMove;
                    thought = lines.join('\n').trim();
                }
            }

            // 3. Fuzzy Match: Check if any valid move exists in the raw output (Prioritize end of string)
            if (!move || !validMoves.includes(move)) {
                // If the "strict" move we found isn't valid, let's look for *any* valid move in the text
                const validMoveList = validMoves.split(', ');
                let foundMove = null;
                let lastIndex = -1;

                for (const validMove of validMoveList) {
                    // Look for word boundary to avoid partial matches (e.g. matching 'a4' inside 'Na4')
                    const regex = new RegExp(`\\b${validMove.replace('+', '\\+')}\\b`, 'i');
                    const match = raw.match(regex);
                    if (match) {
                        // We want the LAST occurrence of a valid move, as LLMs usually conclude with the move
                        if (match.index > lastIndex) {
                            lastIndex = match.index;
                            foundMove = validMove;
                        }
                    }
                }

                if (foundMove) {
                    move = foundMove;
                    // Keep the whole raw text as thought context
                    thought = raw;
                }
            }

            // Cleanup
            if (move) move = move.replace(/[.,;:]/g, '');

            return { move, raw, thought };
        } catch (error) {
            console.error(`Error generating move with ${model}:`, error.message);
            // Return raw output in error for debugging
            let errorMsg = error.message;
            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Timeout (30s limit exceeded)';
            } else if (error.response) {
                errorMsg = JSON.stringify(error.response.data);
            }
            return { move: null, raw: `Error: ${errorMsg}`, thought: "Network or Parsing Error" };
        }
    }
}

module.exports = { OllamaClient };
