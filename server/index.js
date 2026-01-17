const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GameLoop } = require('./gameLoop');
const { OllamaClient } = require('./ollamaClient');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const ollama = new OllamaClient();
const gameLoop = new GameLoop(io, ollama);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('gameState', gameLoop.getState());
    // Also emit models list on connection so client knows what's available
    ollama.listModels().then(models => socket.emit('modelsList', models));

    socket.on('startGame', async (config) => {
        console.log('Starting game with:', config);
        await gameLoop.start(config);
    });

    socket.on('stopGame', () => {
        console.log('Stopping game');
        gameLoop.stop();
    });
    
    socket.on('getModels', async () => {
        const models = await ollama.listModels();
        socket.emit('modelsList', models);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
