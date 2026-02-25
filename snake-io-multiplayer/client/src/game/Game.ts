import { SocketClient } from '../network/SocketClient';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { Input } from './Input';
import {
  Snake,
  Food,
  PowerUp,
  SerializedGameState,
  LeaderboardEntry,
  GAME_CONFIG,
  SnakeSkin
} from '../../../shared/types';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  private socket: SocketClient;
  private renderer: Renderer;
  private camera: Camera;
  private input: Input;
  
  private playerId: string | null = null;
  private worldSize: { width: number; height: number } = {
    width: GAME_CONFIG.WORLD_WIDTH,
    height: GAME_CONFIG.WORLD_HEIGHT
  };
  
  // Game state
  private players: Map<string, Snake> = new Map();
  private foods: Map<string, Food> = new Map();
  private powerUps: Map<string, PowerUp> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  
  // Callbacks
  public onDeath: ((score: number, length: number) => void) | null = null;
  public onRespawn: (() => void) | null = null;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.socket = new SocketClient();
    this.camera = new Camera(this.worldSize);
    this.renderer = new Renderer(this.ctx, this.camera);
    this.input = new Input(this.canvas);
    
    this.setupCanvas();
    this.setupSocketHandlers();
    
    // Handle window resize
    window.addEventListener('resize', () => this.setupCanvas());
  }

  private setupCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.updateViewport(this.canvas.width, this.canvas.height);
  }

  private setupSocketHandlers(): void {
    this.socket.onGameState = (state: SerializedGameState) => {
      
      // Update local state
      this.players.clear();
      for (const [id, snake] of state.players) {
        this.players.set(id, snake);
      }
      
      this.foods.clear();
      for (const [id, food] of state.foods) {
        this.foods.set(id, food);
      }
      
      this.powerUps.clear();
      for (const [id, powerUp] of state.powerUps) {
        this.powerUps.set(id, powerUp);
      }
      
      this.worldSize = state.worldSize;
    };

    this.socket.onLeaderboard = (entries: LeaderboardEntry[]) => {
      this.leaderboard = entries;
      this.updateLeaderboardUI();
    };

    this.socket.onJoined = (data: { playerId: string; worldSize: { width: number; height: number } }) => {
      this.playerId = data.playerId;
      this.worldSize = data.worldSize;
      this.camera.updateWorldSize(this.worldSize);
    };

    this.socket.onDied = (data: { score: number }) => {
      const player = this.players.get(this.playerId!);
      const length = player?.segments.length ?? 0;
      this.onDeath?.(data.score, length);
    };
  }

  async connect(serverUrl: string): Promise<void> {
    await this.socket.connect(serverUrl);
  }

  joinGame(playerName: string, skin?: SnakeSkin): void {
    this.socket.joinGame(playerName, skin);
  }

  respawn(playerName: string, skin?: SnakeSkin): void {
    this.socket.respawn(playerName, skin);
    this.onRespawn?.();
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.socket.disconnect();
  }

  private gameLoop(): void {
    if (!this.isRunning || this.isPaused) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    try {
      this.update(deltaTime);
      this.render();
    } catch (e) {
      console.error('Game loop error:', e);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(_deltaTime: number): void {
    // Get current player
    const player = this.playerId ? this.players.get(this.playerId) : null;
    
    if (player && player.isAlive) {
      // Get input and send to server
      const direction = this.input.getDirection(this.camera);
      const isBoosting = this.input.isBoosting();
      
      this.socket.sendInput(direction, isBoosting);
      
      // Update camera to follow player
      const head = player.segments[0];
      this.camera.follow(head.position);
    }
    
    // Update stats UI
    this.updateStatsUI(player);
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // Draw grid background
    this.renderer.drawGrid(this.worldSize);
    
    // Draw world border
    this.renderer.drawWorldBorder(this.worldSize);
    
    // Draw foods
    for (const food of this.foods.values()) {
      this.renderer.drawFood(food);
    }
    
    // Draw power-ups
    for (const powerUp of this.powerUps.values()) {
      this.renderer.drawPowerUp(powerUp);
    }
    
    // Draw all snakes (other players first, then current player on top)
    const currentPlayer = this.playerId ? this.players.get(this.playerId) : null;
    
    for (const snake of this.players.values()) {
      if (snake.id !== this.playerId && snake.isAlive) {
        this.renderer.drawSnake(snake, false);
      }
    }
    
    // Draw current player last (on top)
    if (currentPlayer && currentPlayer.isAlive) {
      this.renderer.drawSnake(currentPlayer, true);
    }
    
    // Reset camera transform
    this.camera.reset(this.ctx);
    
    // Draw touch indicator (mobile only)
    const touchPos = this.input.getTouchPosition();
    if (touchPos) {
      this.renderer.drawTouchIndicator(touchPos);
    }

    // Draw minimap
    this.drawMinimap(currentPlayer);
  }

  private drawMinimap(player: Snake | null | undefined): void {
    const minimapCanvas = document.getElementById('minimap') as HTMLCanvasElement;
    if (!minimapCanvas) return;
    
    const mctx = minimapCanvas.getContext('2d');
    if (!mctx) return;
    
    const mw = minimapCanvas.width;
    const mh = minimapCanvas.height;
    
    // Clear
    mctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    mctx.fillRect(0, 0, mw, mh);
    
    // Scale factors
    const sx = mw / this.worldSize.width;
    const sy = mh / this.worldSize.height;
    
    // Draw foods as tiny dots
    mctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    for (const food of this.foods.values()) {
      mctx.beginPath();
      mctx.arc(food.position.x * sx, food.position.y * sy, 1, 0, Math.PI * 2);
      mctx.fill();
    }
    
    // Draw other players
    mctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const snake of this.players.values()) {
      if (snake.id !== this.playerId && snake.isAlive) {
        const head = snake.segments[0];
        mctx.beginPath();
        mctx.arc(head.position.x * sx, head.position.y * sy, 2, 0, Math.PI * 2);
        mctx.fill();
      }
    }
    
    // Draw current player
    if (player && player.isAlive) {
      const head = player.segments[0];
      mctx.fillStyle = '#00d9ff';
      mctx.beginPath();
      mctx.arc(head.position.x * sx, head.position.y * sy, 3, 0, Math.PI * 2);
      mctx.fill();
    }
    
    // Draw viewport rectangle
    if (player && player.isAlive) {
      const viewRect = this.camera.getViewport();
      mctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      mctx.lineWidth = 1;
      mctx.strokeRect(
        viewRect.x * sx,
        viewRect.y * sy,
        viewRect.width * sx,
        viewRect.height * sy
      );
    }
  }

  private updateLeaderboardUI(): void {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    
    list.innerHTML = this.leaderboard
      .map((entry, index) => {
        const isCurrentPlayer = entry.id === this.playerId;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        return `<li class="${isCurrentPlayer ? 'current-player' : ''}">
          <span>${medal} ${entry.name}</span>
          <span>${entry.score}</span>
        </li>`;
      })
      .join('');
  }

  private updateStatsUI(player: Snake | null | undefined): void {
    const scoreEl = document.getElementById('currentScore');
    const lengthEl = document.getElementById('currentLength');
    
    if (scoreEl && player) {
      scoreEl.textContent = player.score.toString();
    }
    if (lengthEl && player) {
      lengthEl.textContent = player.segments.length.toString();
    }
  }
}
