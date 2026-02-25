import { BotAI } from './BotAI';
import {
  Snake,
  Food,
  PowerUp,
  GAME_CONFIG,
  BOT_NAMES,
  SKIN_COLORS,
  SKIN_PATTERNS,
  SnakeSkin,
  generateId
} from '../../../shared/types';

interface BotPlayer {
  id: string;
  snake: Snake;
  ai: BotAI;
  respawnTimer: NodeJS.Timeout | null;
}

export class BotManager {
  private bots: Map<string, BotPlayer> = new Map();
  private usedNames: Set<string> = new Set();
  private createSnakeCallback: (id: string, name: string, skin: SnakeSkin, isBot: boolean) => Snake;
  private removePlayerCallback: (id: string) => void;
  private getSnakesCallback: () => Snake[];
  private getFoodsCallback: () => Map<string, Food>;
  private getPowerUpsCallback: () => Map<string, PowerUp>;
  private getWorldSizeCallback: () => { width: number; height: number };
  private updateInputCallback: (id: string, direction: number, isBoosting: boolean) => void;
  
  constructor(
    createSnake: (id: string, name: string, skin: SnakeSkin, isBot: boolean) => Snake,
    removePlayer: (id: string) => void,
    getSnakes: () => Snake[],
    getFoods: () => Map<string, Food>,
    getPowerUps: () => Map<string, PowerUp>,
    getWorldSize: () => { width: number; height: number },
    updateInput: (id: string, direction: number, isBoosting: boolean) => void
  ) {
    this.createSnakeCallback = createSnake;
    this.removePlayerCallback = removePlayer;
    this.getSnakesCallback = getSnakes;
    this.getFoodsCallback = getFoods;
    this.getPowerUpsCallback = getPowerUps;
    this.getWorldSizeCallback = getWorldSize;
    this.updateInputCallback = updateInput;
  }

  initialize(): void {
    console.log(`🤖 Spawning ${GAME_CONFIG.BOT_COUNT} bots...`);
    
    for (let i = 0; i < GAME_CONFIG.BOT_COUNT; i++) {
      this.spawnBot();
    }
  }

  private getRandomBotName(): string {
    const availableNames = BOT_NAMES.filter(n => !this.usedNames.has(n));
    if (availableNames.length === 0) {
      return `Bot${Math.floor(Math.random() * 1000)}`;
    }
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    this.usedNames.add(name);
    return name;
  }

  private getRandomSkin(): SnakeSkin {
    return {
      pattern: SKIN_PATTERNS[Math.floor(Math.random() * SKIN_PATTERNS.length)],
      colorIndex: Math.floor(Math.random() * SKIN_COLORS.length)
    };
  }

  private spawnBot(): void {
    const id = `bot_${generateId()}`;
    const name = this.getRandomBotName();
    const skin = this.getRandomSkin();
    
    const snake = this.createSnakeCallback(id, name, skin, true);
    const ai = new BotAI(snake);
    
    const botPlayer: BotPlayer = {
      id,
      snake,
      ai,
      respawnTimer: null
    };
    
    this.bots.set(id, botPlayer);
    console.log(`🤖 Bot spawned: ${name}`);
  }

  update(): void {
    const allSnakes = this.getSnakesCallback();
    const foods = this.getFoodsCallback();
    const powerUps = this.getPowerUpsCallback();
    const worldSize = this.getWorldSizeCallback();
    
    for (const bot of this.bots.values()) {
      if (!bot.snake.isAlive) {
        // Schedule respawn if not already scheduled
        if (!bot.respawnTimer) {
          bot.respawnTimer = setTimeout(() => {
            this.respawnBot(bot.id);
          }, GAME_CONFIG.BOT_RESPAWN_DELAY);
        }
        continue;
      }
      
      // Get AI decision
      const decision = bot.ai.update(allSnakes, foods, powerUps, worldSize);
      
      // Send input to game server
      this.updateInputCallback(bot.id, decision.direction, decision.isBoosting);
    }
  }

  private respawnBot(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot) return;
    
    // Clear timer
    if (bot.respawnTimer) {
      clearTimeout(bot.respawnTimer);
      bot.respawnTimer = null;
    }
    
    // Remove old bot
    this.usedNames.delete(bot.snake.name);
    this.removePlayerCallback(bot.id);
    this.bots.delete(botId);
    
    // Spawn new bot
    this.spawnBot();
  }

  onBotDeath(botId: string): void {
    const bot = this.bots.get(botId);
    if (bot && !bot.respawnTimer) {
      bot.respawnTimer = setTimeout(() => {
        this.respawnBot(botId);
      }, GAME_CONFIG.BOT_RESPAWN_DELAY);
    }
  }

  getBotIds(): string[] {
    return Array.from(this.bots.keys());
  }

  isBot(id: string): boolean {
    return this.bots.has(id);
  }

  cleanup(): void {
    for (const bot of this.bots.values()) {
      if (bot.respawnTimer) {
        clearTimeout(bot.respawnTimer);
      }
    }
    this.bots.clear();
    this.usedNames.clear();
  }
}
