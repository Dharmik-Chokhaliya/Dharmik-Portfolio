import { Server, Socket } from 'socket.io';
import { GameServer } from '../game/GameServer';
import { GAME_CONFIG, SnakeSkin } from '../../../shared/types';

export class SocketHandler {
  private io: Server;
  private gameServer: GameServer;
  private broadcastInterval: NodeJS.Timeout | null = null;

  constructor(io: Server, gameServer: GameServer) {
    this.io = io;
    this.gameServer = gameServer;
    
    this.setupConnectionHandlers();
    this.startBroadcasting();
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      // Handle player join
      socket.on('player:join', (data: { name: string; skin?: SnakeSkin }) => {
        const snake = this.gameServer.addPlayer(socket.id, data.name, data.skin, false);
        
        socket.emit('game:joined', {
          playerId: socket.id,
          worldSize: {
            width: GAME_CONFIG.WORLD_WIDTH,
            height: GAME_CONFIG.WORLD_HEIGHT
          }
        });
        
        // Send initial state
        socket.emit('game:state', this.gameServer.getGameState());
        socket.emit('game:leaderboard', this.gameServer.getLeaderboard());
        
        console.log(`🎮 ${snake.name} joined the game`);
      });
      
      // Handle player input
      socket.on('player:input', (data: { direction: number; isBoosting: boolean }) => {
        this.gameServer.updatePlayerInput(socket.id, data.direction, data.isBoosting);
      });
      
      // Handle respawn
      socket.on('player:respawn', (data: { name: string; skin?: SnakeSkin }) => {
        const snake = this.gameServer.respawnPlayer(socket.id, data.name, data.skin);
        if (snake) {
          socket.emit('game:joined', {
            playerId: socket.id,
            worldSize: {
              width: GAME_CONFIG.WORLD_WIDTH,
              height: GAME_CONFIG.WORLD_HEIGHT
            }
          });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.gameServer.removePlayer(socket.id);
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  private startBroadcasting(): void {
    // Broadcast game state at server tick rate
    const interval = 1000 / GAME_CONFIG.SERVER_TICK_RATE;
    
    this.broadcastInterval = setInterval(() => {
      const state = this.gameServer.getGameState();
      const leaderboard = this.gameServer.getLeaderboard();
      
      // Broadcast to all clients
      this.io.emit('game:state', state);
      
      // Broadcast leaderboard less frequently (every 500ms)
      if (state.tick % 10 === 0) {
        this.io.emit('game:leaderboard', leaderboard);
      }
      
      // Check for dead players and notify them
      for (const [playerId, snake] of state.players) {
        if (!snake.isAlive) {
          const socket = this.io.sockets.sockets.get(playerId);
          if (socket) {
            socket.emit('player:died', {
              killerId: null,
              killerName: null,
              score: snake.score
            });
          }
        }
      }
    }, interval);
  }

  stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }
}
