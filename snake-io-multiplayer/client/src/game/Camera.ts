import { Vector2 } from '../../../shared/types';

export class Camera {
  private x: number = 0;
  private y: number = 0;
  private viewWidth: number = 0;
  private viewHeight: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothing: number = 0.1;

  constructor(_worldSize: { width: number; height: number }) {
    // World size kept for potential future use (clamping)
  }

  updateViewport(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
  }

  updateWorldSize(_size: { width: number; height: number }): void {
    // Reserved for future world bounds clamping
  }

  follow(position: Vector2): void {
    this.targetX = position.x - this.viewWidth / 2;
    this.targetY = position.y - this.viewHeight / 2;
    
    // Smooth camera movement
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    
    // Clamp to world bounds (optional - for non-wrapping worlds)
    // this.x = Math.max(0, Math.min(this.worldWidth - this.viewWidth, this.x));
    // this.y = Math.max(0, Math.min(this.worldHeight - this.viewHeight, this.y));
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  reset(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  getViewport(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.viewWidth,
      height: this.viewHeight
    };
  }

  screenToWorld(screenX: number, screenY: number): Vector2 {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  worldToScreen(worldX: number, worldY: number): Vector2 {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  isVisible(position: Vector2, radius: number): boolean {
    return (
      position.x + radius > this.x &&
      position.x - radius < this.x + this.viewWidth &&
      position.y + radius > this.y &&
      position.y - radius < this.y + this.viewHeight
    );
  }
}
