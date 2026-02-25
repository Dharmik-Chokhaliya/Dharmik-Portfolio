import { io, type Socket } from 'socket.io-client';
import { SerializedGameState, LeaderboardEntry, SnakeSkin } from '../../../shared/types';

export class SocketClient {
  private socket: Socket | null = null;
  
  // Event callbacks
  public onGameState: ((state: SerializedGameState) => void) | null = null;
  public onLeaderboard: ((entries: LeaderboardEntry[]) => void) | null = null;
  public onJoined: ((data: { playerId: string; worldSize: { width: number; height: number } }) => void) | null = null;
  public onDied: ((data: { killerId: string | null; killerName: string | null; score: number }) => void) | null = null;
  public onPowerUp: ((data: { type: string; duration: number }) => void) | null = null;

  async connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
      });

      // Game events
      this.socket.on('game:state', (state: SerializedGameState) => {
        this.onGameState?.(state);
      });

      this.socket.on('game:leaderboard', (entries: LeaderboardEntry[]) => {
        this.onLeaderboard?.(entries);
      });

      this.socket.on('game:joined', (data: { playerId: string; worldSize: { width: number; height: number } }) => {
        this.onJoined?.(data);
      });

      this.socket.on('player:died', (data: { killerId: string | null; killerName: string | null; score: number }) => {
        this.onDied?.(data);
      });

      this.socket.on('player:powerup', (data: { type: string; duration: number }) => {
        this.onPowerUp?.(data);
      });
    });
  }

  joinGame(name: string, skin?: SnakeSkin): void {
    this.socket?.emit('player:join', { name, skin });
  }

  sendInput(direction: number, isBoosting: boolean): void {
    this.socket?.emit('player:input', { direction, isBoosting });
  }

  respawn(name: string, skin?: SnakeSkin): void {
    this.socket?.emit('player:respawn', { name, skin });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
