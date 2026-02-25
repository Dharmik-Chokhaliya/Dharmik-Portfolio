// ============================================
// SNAKE.IO MULTIPLAYER - SHARED TYPES
// ============================================

// === CORE TYPES ===

export interface Vector2 {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

// === PLAYER & SNAKE ===

export interface SnakeSegment {
  position: Vector2;
  radius: number;
}

export interface Snake {
  id: string;
  name: string;
  segments: SnakeSegment[];
  direction: number; // Radians (0 = right, PI/2 = down)
  speed: number;
  color: Color;
  gradientColor: Color; // Secondary color for gradient
  score: number;
  isAlive: boolean;
  isBoosting: boolean;
  skin: SnakeSkin;  // Skin pattern and color
  isBot: boolean;   // True if controlled by AI
}

// === FOOD & POWER-UPS ===

export type FoodType = 'normal' | 'bonus' | 'snake_remains';

// === SKIN SYSTEM ===

export type SkinPattern = 
  | 'solid'      // Düz renk
  | 'gradient'   // İki renk geçişi
  | 'striped'    // Çizgili
  | 'dotted'     // Benekli
  | 'neon'       // Parlak kenar
  | 'rainbow'    // Gökkuşağı
  | 'camo'       // Kamuflaj
  | 'galaxy';    // Galaksi efekti

export interface SkinColor {
  name: string;
  primary: Color;
  secondary: Color;
}

export const SKIN_COLORS: SkinColor[] = [
  { name: 'Kırmızı', primary: { r: 255, g: 59, b: 48 }, secondary: { r: 255, g: 149, b: 0 } },
  { name: 'Turuncu', primary: { r: 255, g: 149, b: 0 }, secondary: { r: 255, g: 204, b: 0 } },
  { name: 'Sarı', primary: { r: 255, g: 204, b: 0 }, secondary: { r: 255, g: 255, b: 102 } },
  { name: 'Yeşil', primary: { r: 52, g: 199, b: 89 }, secondary: { r: 102, g: 255, b: 153 } },
  { name: 'Turkuaz', primary: { r: 0, g: 199, b: 190 }, secondary: { r: 102, g: 255, b: 255 } },
  { name: 'Mavi', primary: { r: 0, g: 122, b: 255 }, secondary: { r: 102, g: 178, b: 255 } },
  { name: 'Mor', primary: { r: 175, g: 82, b: 222 }, secondary: { r: 218, g: 165, b: 255 } },
  { name: 'Pembe', primary: { r: 255, g: 45, b: 85 }, secondary: { r: 255, g: 153, b: 204 } },
  { name: 'Siyah', primary: { r: 44, g: 44, b: 46 }, secondary: { r: 99, g: 99, b: 102 } },
  { name: 'Beyaz', primary: { r: 242, g: 242, b: 247 }, secondary: { r: 199, g: 199, b: 204 } },
];

export const SKIN_PATTERNS: SkinPattern[] = [
  'solid', 'gradient', 'striped', 'dotted', 'neon', 'rainbow', 'camo', 'galaxy'
];

export interface SnakeSkin {
  pattern: SkinPattern;
  colorIndex: number;
}

// Bot names
export const BOT_NAMES = [
  'Slither', 'Viper', 'Cobra', 'Python', 'Anaconda', 
  'Rattler', 'Mamba', 'Taipan', 'Krait', 'Adder',
  'Serpent', 'Naga', 'Basilisk', 'Hydra', 'Ouroboros'
];

export interface Food {
  id: string;
  position: Vector2;
  radius: number;
  color: Color;
  value: number; // Score value
  type: FoodType;
}

export type PowerUpType = 'shield' | 'speed' | 'magnet' | 'slow_others';

export interface PowerUp {
  id: string;
  position: Vector2;
  type: PowerUpType;
  duration: number; // Milliseconds
  radius: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number; // Timestamp
}

// === GAME STATE ===

export interface GameState {
  players: Map<string, Snake>;
  foods: Map<string, Food>;
  powerUps: Map<string, PowerUp>;
  worldSize: { width: number; height: number };
  tick: number;
}

// Serializable version for network transfer
export interface SerializedGameState {
  players: [string, Snake][];
  foods: [string, Food][];
  powerUps: [string, PowerUp][];
  worldSize: { width: number; height: number };
  tick: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  length: number;
}

// === NETWORK EVENTS ===

// Client -> Server
export interface ClientEvents {
  'player:join': { name: string };
  'player:input': { direction: number; isBoosting: boolean };
  'player:respawn': { name: string };
}

// Server -> Client
export interface ServerEvents {
  'game:state': SerializedGameState;
  'game:joined': { playerId: string; worldSize: { width: number; height: number } };
  'game:leaderboard': LeaderboardEntry[];
  'player:died': { killerId: string | null; killerName: string | null; score: number };
  'player:powerup': { type: PowerUpType; duration: number };
}

// === GAME CONSTANTS ===

export const GAME_CONFIG = {
  // World
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 3000,
  
  // Tick rate
  SERVER_TICK_RATE: 30, // 30 Hz server updates
  CLIENT_RENDER_FPS: 60,
  
  // Snake
  INITIAL_SNAKE_LENGTH: 10,
  INITIAL_SNAKE_SPEED: 6,          // Increased from 3 to 6
  BOOST_SPEED_MULTIPLIER: 2.0,     // Increased from 1.8 to 2.0
  BOOST_SEGMENT_COST: 0.1, // Lose segments while boosting
  SNAKE_SEGMENT_RADIUS: 12,
  SNAKE_SEGMENT_SPACING: 8,
  
  // Food
  FOOD_COUNT: 300,
  FOOD_RADIUS_MIN: 5,
  FOOD_RADIUS_MAX: 12,
  FOOD_VALUE_MIN: 1,
  FOOD_VALUE_MAX: 5,
  SNAKE_REMAINS_VALUE_MULTIPLIER: 2,
  
  // Power-ups
  POWERUP_SPAWN_INTERVAL: 10000, // 10 seconds
  POWERUP_MAX_COUNT: 10,
  POWERUP_RADIUS: 20,
  POWERUP_DURATIONS: {
    shield: 5000,
    speed: 8000,
    magnet: 10000,
    slow_others: 6000,
  } as Record<PowerUpType, number>,
  
  // Collision
  HEAD_COLLISION_RADIUS: 15,
  BODY_COLLISION_CHECK_COUNT: 10, // Reduced from 20 for performance
  
  // Leaderboard
  LEADERBOARD_SIZE: 10,
  
  // Bots
  BOT_COUNT: 5, // Reduced from 8
  BOT_RESPAWN_DELAY: 3000, // 3 seconds after death
  BOT_DECISION_INTERVAL: 100, // ms between AI decisions
} as const;

// === UTILITY FUNCTIONS ===

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function randomColor(): Color {
  const hue = Math.random() * 360;
  const saturation = 70 + Math.random() * 30;
  const lightness = 50 + Math.random() * 20;
  
  // HSL to RGB conversion
  const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness / 100 - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (hue < 60) { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else { r = c; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function colorToRgb(color: Color): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function colorToRgba(color: Color, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector(a: Vector2, b: Vector2, t: number): Vector2 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}
