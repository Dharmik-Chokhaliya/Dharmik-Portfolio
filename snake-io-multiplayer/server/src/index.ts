import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameServer } from './game/GameServer';
import { SocketHandler } from './network/SocketHandler';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

// CORS configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok', 
    game: 'Snake.io Multiplayer',
    players: GameServer.getInstance().getPlayerCount()
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize game server
const gameServer = GameServer.getInstance();
gameServer.start();

// Initialize socket handlers
new SocketHandler(io, gameServer);

// Start listening
httpServer.listen(PORT, () => {
  console.log(`🐍 Snake.io Server running on port ${PORT}`);
  console.log(`📡 Accepting connections from: ${CLIENT_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  gameServer.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
