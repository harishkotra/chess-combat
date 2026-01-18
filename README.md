# Ollama Chess Arena ♟️

A local-first experiment to pit open-source LLMs against each other in chess combat. Built with React, Node.js, and Ollama.

## Features

- **Local LLM Battles**: Connects to your local Ollama instance (`http://localhost:11434`) to fetch available models.
- **Perpetual Play Mode**: Games automatically restart after completion, allowing for endless "God Mode" simulations.
- **Grandmaster Logic**: Optimized prompts providing PGN history and strategic guidance ("Play to Win", "Avoid Repetition") to smaller models.
- **Robust Error Handling**:
    - **Move Validation**: Fuzzy matching extracts legal moves even from hallucinating models.
    - **Timeout Protection**: 30s strict timeouts prevent hangs.
    - **Retry Logic**: Adaptive retries explicitly forbid invalid moves.
- **Decision Stream**: View the raw "thought process", retry attempts, and errors in real-time.
- **Live Metrics**: Tracks Wins, Losses, and Draws across the session.
- **Detailed Game Analysis**: Explicitly identifies Draw reasons (Threefold Repetition, Stalemate, 50-move rule).
- **Monochrome UI**: A clean, distraction-free interface built with Tailwind v4.

## Setup

1.  **Prerequisites**:
    *   Node.js (v18+)
    *   Ollama (running locally with models like `llama3`, `mistral`, `gemma2`, etc.)

2.  **Install Dependencies**:
    ```bash
    # Server
    cd server
    npm install

    # Client
    cd client
    npm install
    ```

3.  **Run Application**:
    *   Start the server: `cd server && node index.js`
    *   Start the client: `cd client && npm run dev`
    *   Open `http://localhost:5173`

## How it works

The system prompts each model with the current FEN (Forsyth–Edwards Notation), a visual ASCII representation of the board, and the last 6 moves (PGN). The prompt is engineered to encourage aggressive play and reduce "lazy draws". The response is parsed, validated against `chess.js`, and executed on the virtual board.

If a model attempts an illegal move, the system feeds the error back into the prompt ("Invalid Move: Nf6. Choose from: e5, d5...") and retries up to 10 times before forfeiting the turn. This allows even smaller models (8B-12B) to complete valid games.

#### Screenshots

![chess-combat-1](https://github.com/user-attachments/assets/c382dde2-b960-43f3-a28f-ee9786e88d0b)

<img width="1741" height="1288" alt="chess-combat-1" src="https://github.com/user-attachments/assets/fb8d9a16-c567-46bd-9979-2fefaaf63f17" />

<img width="1816" height="1243" alt="chess-2" src="https://github.com/user-attachments/assets/70ccb9a0-b7f1-4efb-a95c-1d51eeffc28c" />

<img width="1041" height="445" alt="chess-3" src="https://github.com/user-attachments/assets/5a3ed881-ceab-4753-866c-36da33efebf7" />

<img width="736" height="1202" alt="chess-4" src="https://github.com/user-attachments/assets/dc70aa39-bd4e-4166-b5a8-f68dcb5494a3" />

<img width="1019" height="1089" alt="chess-5" src="https://github.com/user-attachments/assets/9d3beb69-d8d7-4e25-996f-84f866c3ca1f" />


