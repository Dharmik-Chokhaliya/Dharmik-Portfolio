import {
  Snake,
  Food,
  PowerUp,
  Vector2,
  GAME_CONFIG,
  distance
} from '../../../shared/types';

/**
 * Bot AI - Behavior Tree Based Snake Bot
 * 
 * Priority:
 * 1. Avoid danger (other snake heads/bodies)
 * 2. Collect nearby food
 * 3. Collect power-ups
 * 4. Wander randomly (avoiding walls)
 */
export class BotAI {
  private snake: Snake;
  private targetDirection: number;
  private lastDecisionTime: number = 0;
  private wanderAngle: number = 0;
  private wanderChangeTime: number = 0;
  
  // Behavior weights
  private readonly DANGER_RADIUS = 150;
  private readonly FOOD_SEARCH_RADIUS = 300;
  private readonly POWERUP_SEARCH_RADIUS = 400;
  private readonly WALL_AVOID_DISTANCE = 200;
  
  constructor(snake: Snake) {
    this.snake = snake;
    this.targetDirection = snake.direction;
  }
  
  update(
    allSnakes: Snake[],
    foods: Map<string, Food>,
    powerUps: Map<string, PowerUp>,
    worldSize: { width: number; height: number }
  ): { direction: number; isBoosting: boolean } {
    const now = Date.now();
    
    // Only make decisions at set intervals
    if (now - this.lastDecisionTime < GAME_CONFIG.BOT_DECISION_INTERVAL) {
      return { direction: this.targetDirection, isBoosting: false };
    }
    this.lastDecisionTime = now;
    
    if (!this.snake.isAlive || this.snake.segments.length === 0) {
      return { direction: this.targetDirection, isBoosting: false };
    }
    
    const head = this.snake.segments[0].position;
    let isBoosting = false;
    
    // 1. CHECK FOR DANGER
    const dangerDirection = this.checkDanger(head, allSnakes);
    if (dangerDirection !== null) {
      this.targetDirection = dangerDirection;
      isBoosting = this.snake.segments.length > 15; // Boost to escape if big enough
      return { direction: this.targetDirection, isBoosting };
    }
    
    // 2. FIND POWER-UP
    const powerUpTarget = this.findNearestPowerUp(head, powerUps);
    if (powerUpTarget) {
      this.targetDirection = this.getDirectionTo(head, powerUpTarget);
      isBoosting = distance(head, powerUpTarget) < 100;
      return { direction: this.targetDirection, isBoosting };
    }
    
    // 3. FIND FOOD
    const foodTarget = this.findBestFood(head, foods);
    if (foodTarget) {
      this.targetDirection = this.getDirectionTo(head, foodTarget);
      const foodDist = distance(head, foodTarget);
      isBoosting = foodDist < 100 && this.snake.segments.length > 12;
      return { direction: this.targetDirection, isBoosting };
    }
    
    // 4. WANDER (avoiding walls)
    this.targetDirection = this.wander(head, worldSize, now);
    
    return { direction: this.targetDirection, isBoosting: false };
  }
  
  private checkDanger(head: Vector2, allSnakes: Snake[]): number | null {
    let closestDanger: Vector2 | null = null;
    let closestDist = Infinity;
    
    for (const other of allSnakes) {
      if (other.id === this.snake.id || !other.isAlive) continue;
      
      // Check other snake's head (could collide)
      const otherHead = other.segments[0]?.position;
      if (otherHead) {
        const dist = distance(head, otherHead);
        if (dist < this.DANGER_RADIUS && dist < closestDist) {
          closestDist = dist;
          closestDanger = otherHead;
        }
      }
      
      // Check other snake's body segments
      for (let i = 0; i < Math.min(other.segments.length, 30); i++) {
        const segment = other.segments[i];
        const dist = distance(head, segment.position);
        if (dist < this.DANGER_RADIUS * 0.7 && dist < closestDist) {
          closestDist = dist;
          closestDanger = segment.position;
        }
      }
    }
    
    if (closestDanger) {
      // Move away from danger
      const awayAngle = Math.atan2(
        head.y - closestDanger.y,
        head.x - closestDanger.x
      );
      // Add some randomness to avoid predictable movement
      return awayAngle + (Math.random() - 0.5) * 0.5;
    }
    
    return null;
  }
  
  private findNearestPowerUp(head: Vector2, powerUps: Map<string, PowerUp>): Vector2 | null {
    let nearest: Vector2 | null = null;
    let nearestDist = this.POWERUP_SEARCH_RADIUS;
    
    for (const powerUp of powerUps.values()) {
      const dist = distance(head, powerUp.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = powerUp.position;
      }
    }
    
    return nearest;
  }
  
  private findBestFood(head: Vector2, foods: Map<string, Food>): Vector2 | null {
    let bestFood: Food | null = null;
    let bestScore = -Infinity;
    
    for (const food of foods.values()) {
      const dist = distance(head, food.position);
      if (dist > this.FOOD_SEARCH_RADIUS) continue;
      
      // Score based on value and distance (prefer closer, higher value)
      const score = food.value / (dist + 1) * 100;
      
      // Bonus for snake_remains (higher value)
      const bonus = food.type === 'snake_remains' ? 2 : 1;
      
      if (score * bonus > bestScore) {
        bestScore = score * bonus;
        bestFood = food;
      }
    }
    
    return bestFood?.position ?? null;
  }
  
  private wander(head: Vector2, worldSize: { width: number; height: number }, now: number): number {
    // Change wander direction periodically
    if (now - this.wanderChangeTime > 2000 + Math.random() * 3000) {
      this.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.5;
      this.wanderChangeTime = now;
    }
    
    let direction = this.targetDirection + (Math.random() - 0.5) * 0.1;
    
    // Avoid walls
    const wallMargin = this.WALL_AVOID_DISTANCE;
    
    // Too close to left wall
    if (head.x < wallMargin) {
      direction = this.smoothTurn(direction, 0); // Turn right
    }
    // Too close to right wall
    else if (head.x > worldSize.width - wallMargin) {
      direction = this.smoothTurn(direction, Math.PI); // Turn left
    }
    // Too close to top wall
    if (head.y < wallMargin) {
      direction = this.smoothTurn(direction, Math.PI / 2); // Turn down
    }
    // Too close to bottom wall
    else if (head.y > worldSize.height - wallMargin) {
      direction = this.smoothTurn(direction, -Math.PI / 2); // Turn up
    }
    
    return direction;
  }
  
  private smoothTurn(current: number, target: number): number {
    // Smoothly turn towards target direction
    const diff = this.normalizeAngle(target - current);
    return current + diff * 0.3;
  }
  
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }
  
  private getDirectionTo(from: Vector2, to: Vector2): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
}
