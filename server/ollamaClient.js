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

    async generateMove(model, fen, history, color, validMoves) {
        const prompt = `You are playing Chess as ${color}.
Current FEN: ${fen}
VALID LEGAL MOVES (Choose one from this list): [${validMoves}]

Goal: Select the single best move from the VALID LEGAL MOVES list.
DO NOT invent moves. DO NOT use moves not in the list.

Output ONLY the move (SAN).
Example: "e4"
YOUR MOVE:`;

        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 10
                }
            });

            const raw = response.data.response.trim();

            // Parsing Logic
            let move = raw
                .replace(/^\d+\.+/, '') // "1."
                .replace(/^Move:\s*/i, '')
                .replace(/\*\*/g, '')
                .replace(/['"`]/g, '')
                .replace(/[\[\]]/g, '') // Remove brackets if they copy the list format
                .trim();

            // Clean punctuation
            move = move.split(/\s+/)[0].replace(/[.,;:]$/, '');

            return { move, raw };
        } catch (error) {
            console.error(`Error generating move with ${model}:`, error.message);
            return { move: null, raw: `Error: ${error.message}` };
        }
    }
}

module.exports = { OllamaClient };
