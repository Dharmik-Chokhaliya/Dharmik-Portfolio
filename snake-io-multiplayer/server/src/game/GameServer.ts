import {
  Snake,
  Food,
  PowerUp,
  SerializedGameState,
  LeaderboardEntry,
  Vector2,
  GAME_CONFIG,
  generateId,
  distance,
  PowerUpType,
  ActivePowerUp,
  SnakeSkin,
  SKIN_COLORS,
  SKIN_PATTERNS,
  randomColor
} from '../../../shared/types';
import { BotManager } from './BotManager';

interface Player {
  id: string;
  name: string;
  snake: Snake;
  activePowerUps: ActivePowerUp[];
  lastInput: { direction: number; isBoosting: boolean };
  isBot: boolean;
}

export class GameServer {
  private static instance: GameServer;
  
  private players: Map<string, Player> = new Map();
  private foods: Map<string, Food> = new Map();
  private powerUps: Map<string, PowerUp> = new Map();
  private tick: number = 0;
  private gameLoop: NodeJS.Timeout | null = null;
  private powerUpSpawnTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private botManager: BotManager | null = null;
  
  private readonly worldSize = {
    width: GAME_CONFIG.WORLD_WIDTH,
    height: GAME_CONFIG.WORLD_HEIGHT
  };

  private constructor() {}

  static getInstance(): GameServer {
    if (!GameServer.instance) {
      GameServer.instance = new GameServer();
    }
    return GameServer.instance;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.spawnInitialFood();
    
    // Initialize bot manager
    this.botManager = new BotManager(
      (id, name, skin, isBot) => this.addPlayer(id, name, skin, isBot),
      (id) => this.removePlayer(id),
      () => Array.from(this.players.values()).map(p => p.snake),
      () => this.foods,
      () => this.powerUps,
      () => this.worldSize,
      (id, dir, boost) => this.updatePlayerInput(id, dir, boost)
    );
    this.botManager.initialize();
    
    // Main game loop (20 Hz)
    const tickInterval = 1000 / GAME_CONFIG.SERVER_TICK_RATE;
    this.gameLoop = setInterval(() => this.update(), tickInterval);
    
    // Power-up spawning
    this.powerUpSpawnTimer = setInterval(
      () => this.spawnPowerUp(),
      GAME_CONFIG.POWERUP_SPAWN_INTERVAL
    );
    
    console.log('🎮 Game loop started');
  }

  stop(): void {
    this.isRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.powerUpSpawnTimer) {
      clearInterval(this.powerUpSpawnTimer);
      this.powerUpSpawnTimer = null;
    }
    console.log('🛑 Game loop stopped');
  }

  // ============ PLAYER MANAGEMENT ============

  addPlayer(id: string, name: string, skin?: SnakeSkin, isBot: boolean = false): Snake {
    const spawnPos = this.getRandomSpawnPosition();
    
    // Use provided skin or generate random one
    const actualSkin: SnakeSkin = skin ?? {
      pattern: SKIN_PATTERNS[Math.floor(Math.random() * SKIN_PATTERNS.length)],
      colorIndex: Math.floor(Math.random() * SKIN_COLORS.length)
    };
    
    const colorData = SKIN_COLORS[actualSkin.colorIndex] ?? SKIN_COLORS[0];
    
    const snake: Snake = {
      id,
      name: name.substring(0, 15) || `Player${id.substring(0, 4)}`,
      segments: this.createInitialSegments(spawnPos),
      direction: Math.random() * Math.PI * 2,
      speed: GAME_CONFIG.INITIAL_SNAKE_SPEED,
      color: colorData.primary,
      gradientColor: colorData.secondary,
      score: 0,
      isAlive: true,
      isBoosting: false,
      skin: actualSkin,
      isBot
    };
    
    const player: Player = {
      id,
      name: snake.name,
      snake,
      activePowerUps: [],
      lastInput: { direction: snake.direction, isBoosting: false },
      isBot
    };
    
    this.players.set(id, player);
    console.log(`✅ ${isBot ? 'Bot' : 'Player'} joined: ${snake.name} (${id})`);
    
    return snake;
  }

  removePlayer(id: string): void {
    const player = this.players.get(id);
    if (player) {
      // Drop food where snake was (yem bırakma)
      this.dropSnakeAsFood(player.snake);
      this.players.delete(id);
      console.log(`❌ Player left: ${player.name} (${id})`);
    }
  }

  updatePlayerInput(id: string, direction: number, isBoosting: boolean): void {
    const player = this.players.get(id);
    if (player && player.snake.isAlive) {
      player.lastInput = { direction, isBoosting };
    }
  }

  respawnPlayer(id: string, name: string, skin?: SnakeSkin): Snake | null {
    const player = this.players.get(id);
    if (!player) return null;
    
    const spawnPos = this.getRandomSpawnPosition();
    
    // Update skin if provided
    if (skin) {
      player.snake.skin = skin;
      const colorData = SKIN_COLORS[skin.colorIndex] ?? SKIN_COLORS[0];
      player.snake.color = colorData.primary;
      player.snake.gradientColor = colorData.secondary;
    }
    
    player.snake.segments = this.createInitialSegments(spawnPos);
    player.snake.direction = Math.random() * Math.PI * 2;
    player.snake.score = 0;
    player.snake.isAlive = true;
    player.snake.isBoosting = false;
    player.snake.name = name.substring(0, 15) || player.name;
    player.activePowerUps = [];
    
    console.log(`🔄 Player respawned: ${player.snake.name}`);
    return player.snake;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  // ============ GAME UPDATE ============

  private update(): void {
    this.tick++;
    
    // Update bot AI
    if (this.botManager) {
      this.botManager.update();
    }
    
    
    // Update all snakes
    for (const player of this.players.values()) {
      if (!player.snake.isAlive) continue;
      
      // Apply input
      // Apply input with turn speed limit (prevent 180 degree turns)
      const targetDir = player.lastInput.direction;
      const currentDir = player.snake.direction;
      
      // Calculate strict difference
      let diff = targetDir - currentDir;
      
      // Normalize to -PI to +PI
      while (diff <= -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      // Limit turn speed (e.g., 0.15 radians per tick)
      const TURN_SPEED = Math.PI / 8;
      
      if (Math.abs(diff) < TURN_SPEED) {
        player.snake.direction = targetDir;
      } else {
        // Move towards target
        player.snake.direction += Math.sign(diff) * TURN_SPEED;
      }
      
      // Normalize direction
      player.snake.direction = (player.snake.direction + Math.PI * 2) % (Math.PI * 2);

      player.snake.isBoosting = player.lastInput.isBoosting;
      
      // Update power-ups
      this.updatePlayerPowerUps(player);
      
      // Move snake
      this.moveSnake(player);
      
      // Check food collision
      this.checkFoodCollision(player);
      
      // Check power-up collision
      this.checkPowerUpCollision(player);
    }
    
    // Check snake collisions (after all movement)
    this.checkSnakeCollisions();
    
    // Maintain food count
    this.maintainFoodCount();
  }

  private moveSnake(player: Player): void {
    const snake = player.snake;
    const head = snake.segments[0];
    
    // Calculate speed (with boost and power-ups)
    let speed = snake.speed;
    if (snake.isBoosting && snake.segments.length > 3) {
      speed *= GAME_CONFIG.BOOST_SPEED_MULTIPLIER;
      
      // Lose segments while boosting (unless has shield)
      if (!this.hasActivePowerUp(player, 'shield')) {
        if (this.tick % 5 === 0 && snake.segments.length > 3) {
          const lostSegment = snake.segments.pop()!;
          // Drop small food
          this.spawnFoodAt(lostSegment.position, 1, 'normal');
        }
      }
    }
    
    // Speed boost power-up
    if (this.hasActivePowerUp(player, 'speed')) {
      speed *= 1.5;
    }
    
    // Calculate new head position
    const newHead: Vector2 = {
      x: head.position.x + Math.cos(snake.direction) * speed,
      y: head.position.y + Math.sin(snake.direction) * speed
    };
    
    // World wrapping
    newHead.x = ((newHead.x % this.worldSize.width) + this.worldSize.width) % this.worldSize.width;
    newHead.y = ((newHead.y % this.worldSize.height) + this.worldSize.height) % this.worldSize.height;
    
    // Move segments (follow the leader)
    for (let i = snake.segments.length - 1; i > 0; i--) {
      const segment = snake.segments[i];
      const target = snake.segments[i - 1];
      
      const dx = target.position.x - segment.position.x;
      const dy = target.position.y - segment.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > GAME_CONFIG.SNAKE_SEGMENT_SPACING) {
        const ratio = GAME_CONFIG.SNAKE_SEGMENT_SPACING / dist;
        segment.position.x = target.position.x - dx * ratio;
        segment.position.y = target.position.y - dy * ratio;
      }
    }
    
    // Update head position
    head.position = newHead;
  }

  private checkFoodCollision(player: Player): void {
    const snake = player.snake;
    const head = snake.segments[0];
    const collectRadius = GAME_CONFIG.HEAD_COLLISION_RADIUS + 
      (this.hasActivePowerUp(player, 'magnet') ? 50 : 0);
    
    for (const [foodId, food] of this.foods) {
      const dist = distance(head.position, food.position);
      
      // Magnet effect - pull food towards snake
      if (this.hasActivePowerUp(player, 'magnet') && dist < 100) {
        const dx = head.position.x - food.position.x;
        const dy = head.position.y - food.position.y;
        const magnetSpeed = 3;
        food.position.x += (dx / dist) * magnetSpeed;
        food.position.y += (dy / dist) * magnetSpeed;
      }
      
      if (dist < collectRadius + food.radius) {
        // Eat food
        snake.score += food.value;
        
        // Grow snake
        const lastSegment = snake.segments[snake.segments.length - 1];
        snake.segments.push({
          position: { ...lastSegment.position },
          radius: GAME_CONFIG.SNAKE_SEGMENT_RADIUS
        });
        
        this.foods.delete(foodId);
      }
    }
  }

  private checkPowerUpCollision(player: Player): void {
    const snake = player.snake;
    const head = snake.segments[0];
    
    for (const [powerUpId, powerUp] of this.powerUps) {
      const dist = distance(head.position, powerUp.position);
      
      if (dist < GAME_CONFIG.HEAD_COLLISION_RADIUS + powerUp.radius) {
        // Collect power-up
        player.activePowerUps.push({
          type: powerUp.type,
          expiresAt: Date.now() + powerUp.duration
        });
        
        this.powerUps.delete(powerUpId);
        console.log(`⚡ ${player.name} collected ${powerUp.type}`);
      }
    }
  }

  private checkSnakeCollisions(): void {
    const playersArray = Array.from(this.players.values());
    
    for (const player of playersArray) {
      if (!player.snake.isAlive) continue;
      
      // Skip if has shield
      if (this.hasActivePowerUp(player, 'shield')) continue;
      
      const head = player.snake.segments[0];
      
      for (const other of playersArray) {
        if (!other.snake.isAlive) continue;
        if (player.id === other.id) continue;
        
        // Check collision with ALL segments of other snake (skip head-to-head for 3 segments)
        const startIndex = 3; // Skip first 3 segments to avoid head-to-head instant death
        
        for (let i = startIndex; i < other.snake.segments.length; i++) {
          const segment = other.snake.segments[i];
          const dist = distance(head.position, segment.position);
          
          if (dist < GAME_CONFIG.HEAD_COLLISION_RADIUS + segment.radius * 0.8) {
            // Death!
            this.killPlayer(player, other);
            break;
          }
        }
        
        if (!player.snake.isAlive) break;
      }
    }
  }

  private killPlayer(player: Player, killer: Player): void {
    player.snake.isAlive = false;
    
    // Drop snake as food
    this.dropSnakeAsFood(player.snake);
    
    // Award killer
    killer.snake.score += Math.floor(player.snake.score * 0.5);
    
    console.log(`💀 ${player.name} killed by ${killer.name}`);
  }

  // ============ SPAWNING ============

  private getRandomSpawnPosition(): Vector2 {
    const margin = 200;
    return {
      x: margin + Math.random() * (this.worldSize.width - margin * 2),
      y: margin + Math.random() * (this.worldSize.height - margin * 2)
    };
  }

  private createInitialSegments(startPos: Vector2): Snake['segments'] {
    const segments: Snake['segments'] = [];
    const direction = Math.random() * Math.PI * 2;
    
    for (let i = 0; i < GAME_CONFIG.INITIAL_SNAKE_LENGTH; i++) {
      segments.push({
        position: {
          x: startPos.x - Math.cos(direction) * i * GAME_CONFIG.SNAKE_SEGMENT_SPACING,
          y: startPos.y - Math.sin(direction) * i * GAME_CONFIG.SNAKE_SEGMENT_SPACING
        },
        radius: GAME_CONFIG.SNAKE_SEGMENT_RADIUS
      });
    }
    
    return segments;
  }

  private spawnInitialFood(): void {
    for (let i = 0; i < GAME_CONFIG.FOOD_COUNT; i++) {
      this.spawnFood();
    }
    console.log(`🍎 Spawned ${GAME_CONFIG.FOOD_COUNT} food items`);
  }

  private spawnFood(): void {
    const position = this.getRandomSpawnPosition();
    const radius = GAME_CONFIG.FOOD_RADIUS_MIN + 
      Math.random() * (GAME_CONFIG.FOOD_RADIUS_MAX - GAME_CONFIG.FOOD_RADIUS_MIN);
    const value = GAME_CONFIG.FOOD_VALUE_MIN + 
      Math.floor(Math.random() * (GAME_CONFIG.FOOD_VALUE_MAX - GAME_CONFIG.FOOD_VALUE_MIN + 1));
    
    this.spawnFoodAt(position, value, 'normal', radius);
  }

  private spawnFoodAt(position: Vector2, value: number, type: Food['type'], radius?: number): void {
    const id = generateId();
    const food: Food = {
      id,
      position: { ...position },
      radius: radius ?? (GAME_CONFIG.FOOD_RADIUS_MIN + Math.random() * 5),
      color: randomColor(),
      value,
      type
    };
    this.foods.set(id, food);
  }

  private maintainFoodCount(): void {
    const deficit = GAME_CONFIG.FOOD_COUNT - this.foods.size;
    for (let i = 0; i < Math.min(deficit, 10); i++) {
      this.spawnFood();
    }
  }

  private dropSnakeAsFood(snake: Snake): void {
    // Drop food at each segment position
    const dropRate = 3; // Every 3rd segment
    for (let i = 0; i < snake.segments.length; i += dropRate) {
      const segment = snake.segments[i];
      const value = GAME_CONFIG.FOOD_VALUE_MAX * GAME_CONFIG.SNAKE_REMAINS_VALUE_MULTIPLIER;
      this.spawnFoodAt(segment.position, value, 'snake_remains', 10);
    }
  }

  private spawnPowerUp(): void {
    if (this.powerUps.size >= GAME_CONFIG.POWERUP_MAX_COUNT) return;
    
    const types: PowerUpType[] = ['shield', 'speed', 'magnet', 'slow_others'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const id = generateId();
    const powerUp: PowerUp = {
      id,
      position: this.getRandomSpawnPosition(),
      type,
      duration: GAME_CONFIG.POWERUP_DURATIONS[type],
      radius: GAME_CONFIG.POWERUP_RADIUS
    };
    
    this.powerUps.set(id, powerUp);
    console.log(`⚡ Spawned ${type} power-up`);
  }

  // ============ POWER-UP HELPERS ============

  private updatePlayerPowerUps(player: Player): void {
    const now = Date.now();
    player.activePowerUps = player.activePowerUps.filter(p => p.expiresAt > now);
    
    // Apply slow_others effect
    if (this.hasActivePowerUp(player, 'slow_others')) {
      for (const other of this.players.values()) {
        if (other.id !== player.id && other.snake.isAlive) {
          other.snake.speed = GAME_CONFIG.INITIAL_SNAKE_SPEED * 0.5;
        }
      }
    } else {
      // Reset other players' speed
      for (const other of this.players.values()) {
        if (!this.isSlowedByOther(other)) {
          other.snake.speed = GAME_CONFIG.INITIAL_SNAKE_SPEED;
        }
      }
    }
  }

  private hasActivePowerUp(player: Player, type: PowerUpType): boolean {
    return player.activePowerUps.some(p => p.type === type);
  }

  private isSlowedByOther(player: Player): boolean {
    for (const other of this.players.values()) {
      if (other.id !== player.id && this.hasActivePowerUp(other, 'slow_others')) {
        return true;
      }
    }
    return false;
  }

  // ============ STATE ============

  getGameState(): SerializedGameState {
    const players: [string, Snake][] = [];
    for (const player of this.players.values()) {
      players.push([player.id, player.snake]);
    }
    
    return {
      players,
      foods: Array.from(this.foods.entries()),
      powerUps: Array.from(this.powerUps.entries()),
      worldSize: this.worldSize,
      tick: this.tick
    };
  }

  getLeaderboard(): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    
    for (const player of this.players.values()) {
      entries.push({
        id: player.id,
        name: player.snake.name,
        score: player.snake.score,
        length: player.snake.segments.length
      });
    }
    
    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, GAME_CONFIG.LEADERBOARD_SIZE);
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }
}
