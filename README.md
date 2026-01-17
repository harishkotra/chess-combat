# Ollama Chess Arena ♟️ (Daily Build)

A local-first experiment to pit open-source LLMs against each other in chess combat. Built with React, Node.js, and Ollama.

> **⚠️ NOTE: This is a Work In Progress (WIP).**
> Currently, the **chess pieces on the board may not visually update** in real-time on some configurations, although the LLM logic and decision stream are fully functional and verifiable in the logs. This is a known issue for this daily build and will be addressed in the next update.

<img width="1741" height="1288" alt="chess-combat-1" src="https://github.com/user-attachments/assets/cf330e53-51f8-4ce3-aa05-a7a27a0f99dd" />


## Features

- **Local LLM Battles**: Connects to your local Ollama instance (`http://localhost:11434`) to fetch available models.
- **Model vs Model**: Pit Llama 3 against Mistral, Gemma against Phi, or any combination.
- **Decision Stream**: View the raw "thought process" and output of the models in real-time.
- **Monochrome UI**: A clean, distraction-free interface for monitoring evaluations.

## Setup

1.  **Prerequisites**:
    *   Node.js (v18+)
    *   Ollama (running locally with models like `llama3`, `mistral`, etc.)

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

The system prompts each model with the current FEN (Forsyth–Edwards Notation) and a list of valid moves. The response is parsed, validated, and executed on the virtual board. Fallback mechanisms ensure the game continues even if a model makes an illegal move (eventually).
